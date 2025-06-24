/**
 * Hook personnalisé pour le rendu D3 des diagrammes Sankey
 * Isole toute la complexité du rendu D3 du composant principal
 */

import { useEffect, useRef, RefObject } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyJustify, sankeyCenter } from "d3-sankey";
import { SankeyData, ExtendedNode, BaseNode } from "../types/SankeyTypes";
import { SankeyContext } from "../states/SankeyStates";
import { STYLE_CONSTANTS } from "../constants/StyleConstants";
import { PriceCalculationService, PriceData } from "../services/PriceCalculationService";
import { formatEnergyValue, formatValue, calculatePercentage, formatCost, normalizeEnergyType } from "../utils/unitConverter";

interface D3RenderingProps {
  svgRef: RefObject<SVGSVGElement>;
  containerRef: RefObject<HTMLDivElement>;
  sankeyData: SankeyData | null;
  sankeyContext: SankeyContext;
  selectedNode: string | null;
  dimensions: { width: number; height: number };
  selectedEnergies: string;
  displayMode: "consumption" | "cost";
  priceData: PriceData | null;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  onNodeClick: (node: BaseNode) => void;
  showDebugTools?: boolean;
}

interface ColorScheme {
  [key: string]: string;
}

const COLORS: ColorScheme = {
  // Niveaux hiérarchiques
  level0: "#2196F3", // Usine (Bleu)
  level1: "#4CAF50", // Secteur (Vert)
  level2: "#FF9800", // Atelier (Orange)
  level3: "#9C27B0", // Ligne (Violet)
  level4: "#795548", // Équipement (Marron)
  
  // Autres
  link: "#E0E0E0"
};

export const useD3Rendering = (props: D3RenderingProps) => {
  // 🔧 CORRECTION: Timer tooltip isolé par instance
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (!props.svgRef.current || !props.containerRef.current || !props.sankeyData) {
      return;
    }

    // Nettoyage et initialisation
    const cleanup = initializeD3Rendering(props, hideTimerRef);
    
    return cleanup;
    
  }, [
    props.sankeyData, 
    props.dimensions, 
    props.displayMode, 
    props.selectedEnergies,
    props.selectedNode,
    props.priceData,
    props.currency,
    props.startDate,
    props.endDate,
    props.showDebugTools,
    props.onNodeClick
  ]);
};

// === FONCTIONS DE RENDU D3 ===

function initializeD3Rendering(props: D3RenderingProps, hideTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>): () => void {
  const {
    svgRef,
    containerRef,
    sankeyData,
    sankeyContext,
    selectedNode,
    dimensions,
    selectedEnergies,
    displayMode,
    priceData,
    currency,
    startDate,
    endDate,
    onNodeClick,
    showDebugTools
  } = props;

  const { width, height } = dimensions;
  
  // 🔧 AMÉLIORATION: Dimensions plus généreuses pour un meilleur affichage
  const effectiveWidth = Math.min(Math.max(width, 800), 1200);   // Min 800, Max 1200
  const effectiveHeight = Math.min(Math.max(height, 600), 800);  // Min 600, Max 800

  // Initialisation du tooltip
  const tooltip = createTooltip();
  
  // 🔧 MARGES AUGMENTÉES: Plus d'espace pour les labels et orphelins
  const margin = {
    top: 40,    // 30 → 40
    right: 120, // 80 → 120 pour plus d'espace pour orphelins
    bottom: 40, // 30 → 40
    left: 100   // 80 → 100 pour plus d'espace pour labels
  };

  const innerWidth = Math.max(500, effectiveWidth - margin.left - margin.right);   // 400 → 500
  const innerHeight = Math.max(400, effectiveHeight - margin.top - margin.bottom); // 250 → 400

  // Configuration du SVG
  const { svg, cleanupResize } = setupSVG(svgRef.current!, effectiveWidth, effectiveHeight);
  const g = svg.append("g");

  // Séparation des nœuds connectés et orphelins
  const { connectedNodes, orphanNodes } = separateNodes(sankeyData!, selectedNode, sankeyContext);
  
  // Debug info
  if (showDebugTools) {
    logDebugInfo(sankeyData!, connectedNodes, orphanNodes, effectiveWidth, effectiveHeight);
  }

  // 🔧 CORRECTION: Utiliser directement les liens du sankeyData qui sont déjà filtrés par l'orchestrateur.
  // La logique précédente créait une confusion entre les liens de la vue et ceux du contexte.
  const linksToRender = sankeyData!.links;

  // Configuration du générateur Sankey
  const { sankeyGenerator, processedData } = configureSankey(
    connectedNodes, 
    linksToRender, // Utilisation des liens corrects
    innerWidth, 
    innerHeight,
    margin
  );

  // Calcul D3 et positionnement
  const sankeyResult = sankeyGenerator(processedData);
  const { nodes: connectedD3Nodes, links } = sankeyResult;
  
  // 🔧 CORRECTION CRITIQUE: Gérer le cas des vues sans liens (ex: orphelin + enfants)
  if (connectedD3Nodes.length > 1 && links.length === 0) {
    console.log(`🎯 D3: Vue multi-nœuds sans liens. Positionnement en grille.`);
    // Positionner manuellement les nœuds en grille pour éviter le chevauchement
    const nodeWidth = 50;
    const nodeHeight = 50;
    const padding = 40;
    const nodesPerRow = Math.floor(innerWidth / (nodeWidth + padding));

    connectedD3Nodes.forEach((node, i) => {
        const row = Math.floor(i / nodesPerRow);
        const col = i % nodesPerRow;
        node.x0 = margin.left + col * (nodeWidth + padding);
        node.x1 = node.x0 + nodeWidth;
        node.y0 = margin.top + row * (nodeHeight + padding);
        node.y1 = node.y0 + nodeHeight;
    });
  } else if (connectedD3Nodes.length === 1 && links.length === 0) {
    // Positionner manuellement le nœud unique au centre
    const singleNode = connectedD3Nodes[0];
    const nodeWidth = Math.max(30, Math.min(50, innerWidth * 0.08));
    const nodeHeight = Math.max(40, Math.min(60, innerHeight * 0.1));
    
    singleNode.x0 = margin.left + (innerWidth - nodeWidth) / 2;
    singleNode.x1 = singleNode.x0 + nodeWidth;
    singleNode.y0 = margin.top + (innerHeight - nodeHeight) / 2;
    singleNode.y1 = singleNode.y0 + nodeHeight;
    
    console.log(`🎯 D3: Nœud terminal unique positionné manuellement: ${singleNode.name}`);
  }
  
  // 🔧 CORRECTION CRITIQUE: Préserver les valeurs originales après calcul D3
  connectedD3Nodes.forEach((d3Node, index) => {
    const originalNode = connectedNodes[index];
    if (originalNode && d3Node.value !== originalNode.value) {
      console.log(`🔧 VALEUR RESTAURÉE: ${originalNode.name} - D3: ${d3Node.value} → Original: ${originalNode.value}`);
      d3Node.value = originalNode.value; // Forcer la valeur originale
    }
  });
  
  const positionedOrphanNodes = positionOrphanNodes(
    orphanNodes, 
    connectedD3Nodes, 
    innerWidth, 
    innerHeight
  );

  const allNodes = [...connectedD3Nodes, ...positionedOrphanNodes];

  // Rendu des liens
  renderLinks(g, links, tooltip, sankeyData!, selectedEnergies, displayMode, priceData, currency, startDate, endDate, hideTimerRef);
  
  // Rendu des nœuds
  renderNodes(
    g, 
    allNodes, 
    tooltip, 
    sankeyData!, 
    sankeyContext,
    selectedEnergies, 
    displayMode, 
    priceData, 
    currency, 
    startDate, 
    endDate, 
    onNodeClick,
    effectiveWidth,
    hideTimerRef
  );

  // 🔧 NOUVEAU: Calculer et appliquer le viewBox optimal après rendu
  calculateAndApplyViewBox(svg, allNodes);

  // 🔧 CORRECTION: Fonction de nettoyage complète avec resize listener
  return () => {
    // Nettoyer le timer tooltip
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    
    // Nettoyer le tooltip DOM
    if (tooltip && document.body.contains(tooltip)) {
      document.body.removeChild(tooltip);
    }
    
    // 🔧 CORRECTION: Utiliser la fonction de cleanup retournée par makeResponsive
    cleanupResize();
  };
}

// === FONCTIONS UTILITAIRES ===

function createTooltip(): HTMLDivElement {
  // Nettoyer les anciens tooltips
  const existingTooltip = document.querySelector('.sankey-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  const tooltipDiv = document.createElement('div');
  tooltipDiv.className = 'sankey-tooltip';
  tooltipDiv.style.cssText = `
    position: fixed;
    opacity: 0;
    pointer-events: none;
    background: rgba(255, 255, 255, 0.97);
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(24, 33, 62, 0.12);
    max-width: 320px;
    color: #18213e;
    font-size: 15px;
    line-height: 1.5;
    font-family: 'Barlow', sans-serif;
    z-index: 2147483647 !important;
    transition: opacity 0.2s ease-in-out;
  `;
  
  document.body.appendChild(tooltipDiv);
  return tooltipDiv;
}

function setupSVG(svgElement: SVGSVGElement, width: number, height: number): { svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, cleanupResize: () => void } {
  const svg = d3.select(svgElement);
  
  // 🔧 CORRECTION VIEWBOX: Height fixe du SVG, viewBox calculé dynamiquement
  const svgHeight = 600; // Height fixe comme suggéré
  
  svg
    .attr("width", width)
    .attr("height", svgHeight);
    // Pas de viewBox initial - sera défini après calcul du contenu

  // Nettoyer le contenu existant
  svg.selectAll("*").remove();

  // 🔧 CORRECTION: Appliquer la responsivité et obtenir la fonction de cleanup
  const cleanupResize = makeResponsive(svg);
    
  return { svg, cleanupResize };
}

function separateNodes(
  sankeyData: SankeyData, 
  selectedNode: string | null, 
  sankeyContext: SankeyContext
) {
  // 🔧 CORRECTION: Gérer le cas des nœuds terminaux (sans liens)
  if (sankeyData.links.length === 0) {
    console.log("🎯 D3: Nœud terminal - aucun lien à traiter, tous les nœuds sont connectés");
    return { 
      connectedNodes: sankeyData.nodes, 
      orphanNodes: [] as ExtendedNode[] 
    };
  }

  // 🔧 CORRECTION: Cohérence avec orchestrateur - vue initiale si selectedNode = null OU racine niveau 0
  const firstNodeId = sankeyContext.availableNodes.find(n => n.metadata?.level === 0)?.id;
  const isRootView = selectedNode === null || selectedNode === firstNodeId;
  
  if (isRootView) {
    // Au démarrage, tous les nœuds (y compris orphelins repositionnés) sont connectés
    const connectedNodes = sankeyData.nodes; // Tous les nœuds disponibles
    const orphanNodes: ExtendedNode[] = []; // Pas d'orphelins séparés au démarrage
    
    console.log("🎯 D3: Vue racine - tous les nœuds traités comme connectés:", connectedNodes.length);
    return { connectedNodes, orphanNodes };
  } else {
    // En navigation, logique normale : séparer connectés et orphelins
    const connectedNodes = sankeyData.nodes.filter(node => !node.metadata?.isOrphan || node.id === selectedNode);
    const orphanNodes = sankeyData.nodes.filter(node => node.metadata?.isOrphan && node.id !== selectedNode);
    
    console.log("🔄 D3: Navigation - connectés:", connectedNodes.length, "orphelins:", orphanNodes.length);
    return { connectedNodes, orphanNodes };
  }
}

function configureSankey(
  connectedNodes: ExtendedNode[], 
  links: any[], 
  innerWidth: number, 
  innerHeight: number,
  margin: { top: number; right: number; bottom: number; left: number }
) {
  // 🔧 CORRECTION: Gérer le cas des nœuds terminaux (aucun lien)
  if (links.length === 0) {
    console.log("🎯 D3: Nœud terminal - configuration simplifiée sans liens");
    
    // Configuration minimale pour affichage d'un nœud seul
    const nodeWidth = Math.max(30, Math.min(50, innerWidth * 0.08));
    const sankeyGenerator = sankey<ExtendedNode, any>()
      .nodeWidth(nodeWidth)
      .nodePadding(20)
      .extent([[margin.left, margin.top], [innerWidth + margin.left, innerHeight + margin.top]])
      .nodeAlign(sankeyCenter);

    const processedData = {
      nodes: connectedNodes.map(node => ({ ...node })),
      links: [] // Aucun lien
    };

    return { sankeyGenerator, processedData };
  }

  // 1. Déterminer la fonction de normalisation basée sur les *valeurs des liens*
  const linkValues = links.map(l => l.value).filter(v => v > 0);
  let valueNormalizer = (v: number) => Math.max(1, v); // Assurer une valeur minimale
  let normalizationInfo = {
    applied: false,
    ratio: 1
  };

  if (linkValues.length > 0) {
    const minValue = Math.min(...linkValues);
    const maxValue = Math.max(...linkValues);
    const ratio = maxValue / minValue;

    if (ratio > 1000) {
      normalizationInfo.applied = true;
      normalizationInfo.ratio = ratio;

      const sqrtMin = Math.sqrt(minValue);
      const sqrtMax = Math.sqrt(maxValue);
      const sqrtRange = sqrtMax - sqrtMin;
      const targetMin = 1;
      const targetMax = 80; // Cible plus large pour plus de différentiation

      valueNormalizer = (v: number) => {
        if (v <= 0) return targetMin;
        const sqrtValue = Math.sqrt(v);
        if (sqrtRange === 0) return targetMin;
        const normalizedSqrt = targetMin + ((sqrtValue - sqrtMin) / sqrtRange) * (targetMax - targetMin);
        return Math.max(targetMin, Math.pow(normalizedSqrt, 1.3)); // Exposant ajusté
      };
    }
  }
  
  // 🔧 NOUVEAU: Détecter la vue simple (un-vers-plusieurs) pour optimiser les croisements
  const sourceIds = new Set(links.map(l => l.source));
  const isSimpleView = sourceIds.size === 1;

  if (isSimpleView) {
    console.log("🎨 Vue simple détectée, D3 optimisera l'ordre des nœuds pour éviter les croisements.");
  } else {
    console.log("🔠 Vue complexe, tri personnalisé appliqué pour la clarté logique.");
  }

  // 🔧 AMÉLIORATION: Espacement plus généreux et adaptatif
  const nodePadding = (() => {
      const baseSpacing = Math.max(20, Math.min(50, innerHeight / Math.max(connectedNodes.length, 6))); // 12→20, max 30→50
      return normalizationInfo.applied ? Math.max(baseSpacing * 1.5, 30) : baseSpacing; // min 20→30
  })();
  
  // 🔧 LARGEUR NŒUD: Plus large pour meilleure lisibilité
  const nodeWidth = Math.max(30, Math.min(50, innerWidth * 0.08)); // 25→30, max 40→50

  console.log(`🎛️ Configuration Sankey: padding=${nodePadding.toFixed(1)}, width=${nodeWidth.toFixed(1)}, taille=${innerWidth}x${innerHeight}`);

  // 3. Configurer le générateur Sankey
  const sankeyGenerator = sankey<ExtendedNode, any>()
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .extent([[margin.left, margin.top], [innerWidth + margin.left, innerHeight + margin.top]])
    .nodeAlign(sankeyCenter);

  // Appliquer le tri personnalisé uniquement pour les vues complexes pour garantir la clarté
  if (!isSimpleView) {
    sankeyGenerator.nodeSort((a, b) => {
        const levelA = a.metadata?.level ?? 99;
        const levelB = b.metadata?.level ?? 99;
        if (levelA !== levelB) {
            return levelA - levelB; // Trier par niveau (croissant)
        }
        
        const valueA = a.value ?? 0;
        const valueB = b.value ?? 0;
        if (valueA !== valueB) {
            return valueB - valueA; // Puis par valeur (décroissant)
        }

        return a.name.localeCompare(b.name); // Enfin par nom (alphabétique)
    });
  }

  // 4. Normaliser les liens et préparer les données pour D3
  const nodeIndexMap = new Map(connectedNodes.map((node, i) => [node.id, i]));
  
  const filteredLinks = links
    .filter(link => nodeIndexMap.has(link.source) && nodeIndexMap.has(link.target))
    .map(d => ({
      ...d,
      source: nodeIndexMap.get(d.source),
      target: nodeIndexMap.get(d.target),
      metadata: { ...d.metadata, originalValue: d.value }, // Sauvegarder la valeur originale du lien
      value: valueNormalizer(d.value) // Appliquer la normalisation
    }))
    .filter(link => link.source !== undefined && link.target !== undefined && link.value > 0);

  const processedData = {
    nodes: connectedNodes.map(node => ({ ...node })), // D3 mute les objets, donc on envoie des copies
    links: filteredLinks
  };

  if (normalizationInfo.applied) {
    console.log(`📊 Normalisation (sqrt) appliquée aux liens (ratio original: ${normalizationInfo.ratio.toFixed(0)}:1)`);
  }

  return { sankeyGenerator, processedData };
}

function positionOrphanNodes(
  orphanNodes: ExtendedNode[], 
  connectedD3Nodes: ExtendedNode[], 
  innerWidth: number, 
  innerHeight: number
): ExtendedNode[] {
  if (orphanNodes.length === 0) return [];

  // 🔧 AMÉLIORATION: Calcul plus intelligent du positionnement des orphelins
  const maxConnectedY = connectedD3Nodes.length > 0 
    ? Math.max(...connectedD3Nodes.map(n => n.y1!)) 
    : 0;
  
  // 🔧 ESPACEMENT OPTIMISÉ: Plus d'espace entre les orphelins et adaptation dynamique
  const orphanStartY = Math.max(maxConnectedY + 60, innerHeight * 0.15); // 25 → 60, minimum 15% de la hauteur
  const baseSpacing = Math.max(45, innerHeight / Math.max(orphanNodes.length, 8)); // 30 → 45, espacement adaptatif
  const nodeWidth = 35; // 25 → 35
  const nodeHeight = Math.max(25, Math.min(40, baseSpacing * 0.8)); // Hauteur adaptative

  // 🔧 NOUVEAU: Calcul de colonnes pour beaucoup d'orphelins
  const maxOrphansPerColumn = Math.floor((innerHeight - orphanStartY) / baseSpacing);
  const columnsNeeded = Math.ceil(orphanNodes.length / maxOrphansPerColumn);
  
  // Position X de départ : plus à droite que les nœuds connectés
  const rightmostNodes = connectedD3Nodes.filter(n => n.x0 !== undefined);
  const baseX = rightmostNodes.length > 0 
    ? Math.max(...rightmostNodes.map(n => n.x1!)) + 40  // 20 → 40 plus d'espace
    : innerWidth - (columnsNeeded * (nodeWidth + 20)) - 20;

  return orphanNodes.map((orphan, index) => {
    // 🔧 DISPOSITION EN COLONNES: Si trop d'orphelins, les répartir en colonnes
    const columnIndex = Math.floor(index / maxOrphansPerColumn);
    const rowIndex = index % maxOrphansPerColumn;
    
    const orphanX = baseX + (columnIndex * (nodeWidth + 25)); // 25px entre les colonnes
    const orphanY = orphanStartY + (rowIndex * baseSpacing);
    
    console.log(`📍 Orphelin ${orphan.name}: colonne ${columnIndex}, ligne ${rowIndex}, position (${orphanX.toFixed(0)}, ${orphanY.toFixed(0)})`);
    
    return {
      ...orphan,
      x0: orphanX,
      x1: orphanX + nodeWidth,
      y0: orphanY,
      y1: orphanY + nodeHeight,
      sourceLinks: [],
      targetLinks: [],
      value: orphan.value,
      index: connectedD3Nodes.length + index
    };
  });
}

function calculateOptimalHeight(
  baseHeight: number, 
  orphanNodes: ExtendedNode[], 
  innerHeight: number
): number {
  if (orphanNodes.length === 0) return Math.min(baseHeight, 400); // 250 → 400

  const lastOrphan = orphanNodes[orphanNodes.length - 1];
  if (lastOrphan && lastOrphan.y1) {
    const requiredHeight = lastOrphan.y1 + 40; // 30 → 40 marge normale
    return Math.min(Math.max(baseHeight, requiredHeight), 500); // 300 → 500
  }

  return Math.min(baseHeight, 400); // 250 → 400
}

function updateSVGHeight(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
  width: number, 
  height: number
): void {
  svg
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);
}

function logDebugInfo(
  sankeyData: SankeyData, 
  connectedNodes: ExtendedNode[], 
  orphanNodes: ExtendedNode[], 
  width: number, 
  height: number
): void {
  console.log("🔍 DEBUG RENDU D3:", {
    sankeyDataNodes: sankeyData.nodes.length,
    sankeyDataLinks: sankeyData.links.length,
    connectedNodes: connectedNodes.length,
    orphanNodes: orphanNodes.length,
    dimensions: { width, height }
  });
}

// === FONCTIONS DE RENDU ===

function renderLinks(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: any[],
  tooltip: HTMLDivElement,
  sankeyData: SankeyData,
  selectedEnergies: string,
  displayMode: "consumption" | "cost",
  priceData: PriceData | null,
  currency: string,
  startDate: Date | undefined,
  endDate: Date | undefined,
  hideTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
): void {
  const linkGroup = g.append("g").attr("class", "links").attr("fill", "none");

  // Liens visuels
  const linkVisual = linkGroup
    .selectAll("path.sankey-link-visual")
    .data(links)
    .join("path")
    .attr("class", "sankey-link-visual")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", "#E0E0E0")
    .attr("stroke-width", d => Math.max(2, d.width || 0)) // Épaisseur minimale pour visibilité
    .style("opacity", 0.8)
    .style("pointer-events", "none");

  // Liens d'interaction
  linkGroup
    .selectAll("path.sankey-link-interaction")
    .data(links)
    .join("path")
    .attr("class", "sankey-link-interaction")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", "transparent")
    .attr("stroke-width", d => Math.max(20, d.width || 20))
    .style("opacity", 0)
    .style("cursor", "pointer")
    .on("mouseover", function(event: MouseEvent, d: any) {
      linkVisual.filter((_, i) => i === links.indexOf(d)).style("opacity", 0.9);
      showLinkTooltip(event, d, sankeyData, selectedEnergies, displayMode, priceData, currency, startDate, endDate, tooltip, hideTimerRef);
    })
    .on("mousemove", (event: MouseEvent) => moveTooltip(event, tooltip))
    .on("mouseout", function(event: MouseEvent, d: any) {
      linkVisual.filter((_, i) => i === links.indexOf(d)).style("opacity", 0.7);
      hideTooltip(tooltip, hideTimerRef);
    });
}

function renderNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: ExtendedNode[],
  tooltip: HTMLDivElement,
  sankeyData: SankeyData,
  sankeyContext: SankeyContext,
  selectedEnergies: string,
  displayMode: "consumption" | "cost",
  priceData: PriceData | null,
  currency: string,
  startDate: Date | undefined,
  endDate: Date | undefined,
  onNodeClick: (node: BaseNode) => void,
  effectiveWidth: number,
  hideTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
): void {
  const node = g.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", "sankey-node")
    .attr("transform", d => {
      const x = isNaN(d.x0!) ? 0 : d.x0!;
      const y = isNaN(d.y0!) ? 0 : d.y0!;
      return `translate(${x},${y})`;
    });

  // Rectangles des nœuds
  node.append("rect")
    .attr("height", d => {
      const calculatedHeight = d.y1! - d.y0!;
      return isNaN(calculatedHeight) ? STYLE_CONSTANTS.MIN_NODE_HEIGHT : Math.max(STYLE_CONSTANTS.MIN_NODE_HEIGHT, calculatedHeight);
    })
    .attr("width", d => {
      const calculatedWidth = d.x1! - d.x0!;
      return isNaN(calculatedWidth) ? STYLE_CONSTANTS.MIN_NODE_WIDTH : Math.max(STYLE_CONSTANTS.MIN_NODE_WIDTH, calculatedWidth);
    })
    .attr("fill", d => getNodeColor(d))
    .attr("rx", 4)
    .attr("ry", 4)
    .style("cursor", "pointer")
    .style("filter", "drop-shadow(2px 2px 3px rgba(0,0,0,0.2))")
    .on("mouseover", function(event: MouseEvent, d: ExtendedNode) {
      d3.select(this).style("filter", "drop-shadow(3px 3px 4px rgba(0,0,0,0.3))");
      showNodeTooltip(event, d, sankeyData, sankeyContext, selectedEnergies, displayMode, priceData, currency, startDate, endDate, tooltip, hideTimerRef);
    })
    .on("mousemove", (event: MouseEvent) => moveTooltip(event, tooltip))
    .on("mouseout", function() {
      d3.select(this).style("filter", "drop-shadow(2px 2px 3px rgba(0,0,0,0.2))");
      hideTooltip(tooltip, hideTimerRef);
    })
    .on("click", (event: MouseEvent, d: ExtendedNode) => {
      console.log(`🎯 D3 CLICK: Clic sur nœud ${d.name} (${d.id}) dans D3, va appeler onNodeClick`);
      onNodeClick(d);
    });

  // Labels des nœuds
  node.append("text")
    .attr("x", d => getTextPosition(d, effectiveWidth))
    .attr("y", d => {
      const height = d.y1! - d.y0!;
      return isNaN(height) ? 10 : height / 2;
    })
    .attr("dy", "0.35em")
    .attr("text-anchor", d => getTextAnchor(d, effectiveWidth))
    .attr("fill", "#424242")
    .attr("font-family", "'Barlow', sans-serif")
    .style("font-size", "20px")
    .style("font-weight", "500")
    .text(d => getNodeLabel(d, selectedEnergies, displayMode, priceData, currency, startDate, endDate));
}

// === FONCTIONS UTILITAIRES TOOLTIP ET STYLE ===

function getNodeColor(node: ExtendedNode): string {
  const level = node.metadata?.level;
  switch(level) {
    case 0: return COLORS.level0;
    case 1: return COLORS.level1;
    case 2: return COLORS.level2;
    case 3: return COLORS.level3;
    case 4: return COLORS.level4;
    default: return "#9E9E9E"; // Un gris neutre pour les cas non prévus
  }
}

function getTextPosition(node: ExtendedNode, effectiveWidth: number): number {
  const padding = 12; 
  const nodeWidth = (node.x1 || 0) - (node.x0 || 0);
  const x0 = isNaN(node.x0!) ? 0 : node.x0!;
  
  // Le texte est à droite si le nœud est dans la moitié droite du SVG
  return x0 < effectiveWidth / 2 ? -padding : nodeWidth + padding;
}

function getTextAnchor(node: ExtendedNode, effectiveWidth: number): string {
  const x0 = isNaN(node.x0!) ? 0 : node.x0!;
  
  // Ancre à droite pour les nœuds à gauche, à gauche pour les nœuds à droite
  return x0 < effectiveWidth / 2 ? "end" : "start";
}

function getNodeLabel(
  node: ExtendedNode,
  selectedEnergies: string,
  displayMode: "consumption" | "cost",
  priceData: PriceData | null,
  currency: string,
  startDate?: Date,
  endDate?: Date
): string {
  // Utiliser la valeur originale si disponible, sinon la valeur actuelle
  const displayValue = node.metadata?.originalValue || node.value;
  
  const energyTypeNormalized = normalizeEnergyType(selectedEnergies) || selectedEnergies;
  const formattedValue = formatEnergyValue(displayValue, energyTypeNormalized);
  let label = `${node.name} (${formatValue(formattedValue.value)} ${formattedValue.unit})`;
  
  if (displayMode === "cost" && priceData) {
    const costResult = PriceCalculationService.calculateCostForValue(
      displayValue,
      energyTypeNormalized,
      priceData,
      currency,
      startDate,
      endDate
    );

    if (costResult) {
      label = `${node.name} (${formatCost(costResult.cost, currency)})`;
    }
  }
  
  return label;
}

function showLinkTooltip(
  event: MouseEvent,
  link: any,
  sankeyData: SankeyData,
  selectedEnergies: string,
  displayMode: "consumption" | "cost",
  priceData: PriceData | null,
  currency: string,
  startDate: Date | undefined,
  endDate: Date | undefined,
  tooltip: HTMLDivElement,
  hideTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
): void {
  if (hideTimerRef.current) {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }
  
  const displayValue = link.metadata?.originalValue ?? link.value;
  const sourceNodeOriginalValue = sankeyData.nodes.find(n => n.id === link.source.id)?.metadata?.originalValue ?? link.source.value;

  const energyTypeNormalized = normalizeEnergyType(selectedEnergies) || selectedEnergies;
  const formattedValue = formatEnergyValue(displayValue, energyTypeNormalized);
  const percentage = calculatePercentage(displayValue, sourceNodeOriginalValue);
  
  let content = `
    <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">
      ${link.source.name} → ${link.target.name}
    </div>
    <div>Valeur: ${formatValue(formattedValue.value)} ${formattedValue.unit}</div>
    <div>Proportion: ${percentage} du flux de ${link.source.name}</div>
  `;

  if (displayMode === "cost" && priceData) {
    const costResult = PriceCalculationService.calculateCostForValue(
      displayValue,
      energyTypeNormalized,
      priceData,
      currency,
      startDate,
      endDate
    );

    if (costResult) {
      content += `<div>Coût: ${formatCost(costResult.cost, currency)}</div>`;
    }
  }

  showTooltip(event, content, tooltip);
}

function showNodeTooltip(
  event: MouseEvent,
  node: ExtendedNode,
  sankeyData: SankeyData,
  sankeyContext: SankeyContext,
  selectedEnergies: string,
  displayMode: "consumption" | "cost",
  priceData: PriceData | null,
  currency: string,
  startDate: Date | undefined,
  endDate: Date | undefined,
  tooltip: HTMLDivElement,
  hideTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
): void {
  if (hideTimerRef.current) {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }

  // Utiliser la valeur originale si disponible, sinon la valeur actuelle
  const displayValue = node.metadata?.originalValue || node.value;
  const energyTypeNormalized = normalizeEnergyType(selectedEnergies) || selectedEnergies;
  const formattedValue = formatEnergyValue(displayValue, energyTypeNormalized);
  
  let content = `
    <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">
      ${node.name}
    </div>
    <div>Niveau: ${node.category}</div>
    <div>Valeur: ${formatValue(formattedValue.value)} ${formattedValue.unit}</div>
  `;

  // Afficher info de normalisation si applicable
  if (node.metadata?.originalValue && node.metadata.originalValue !== node.value) {
    content += `<div style="font-size: 12px; color: #666; font-style: italic;">
      (Valeur normalisée pour l'affichage)
    </div>`;
  }

  if (displayMode === "cost" && priceData) {
    const costResult = PriceCalculationService.calculateCostForValue(
      displayValue,
      energyTypeNormalized,
      priceData,
      currency,
      startDate,
      endDate
    );

    if (costResult) {
      content += `<div>Coût: ${formatCost(costResult.cost, currency)}</div>`;
    }
  }

  showTooltip(event, content, tooltip);
}

function showTooltip(event: MouseEvent, content: string, tooltip: HTMLDivElement): void {
  const x = event.pageX + 12;
  const y = event.pageY - 8;
  
  tooltip.innerHTML = content;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.style.opacity = '1';
  tooltip.style.display = 'block';
}

function moveTooltip(event: MouseEvent, tooltip: HTMLDivElement): void {
  const x = event.pageX + 12;
  const y = event.pageY - 8;
  
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function hideTooltip(tooltip: HTMLDivElement, hideTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>): void {
  if (hideTimerRef.current) {
    clearTimeout(hideTimerRef.current);
  }
  
  hideTimerRef.current = setTimeout(() => {
    tooltip.style.opacity = '0';
    tooltip.style.display = 'none';
    hideTimerRef.current = null;
  }, 100);
}

// === FONCTION DE RESPONSIVITÉ D3 ===

/**
 * Fonction responsivefy pour adapter automatiquement le SVG au conteneur
 * 🔧 CORRECTION VIEWBOX: Préserver le viewBox height calculé lors du redimensionnement
 * 🔧 CORRECTION MEMORY LEAK: Retourne une fonction de cleanup pour supprimer le listener
 */
function makeResponsive(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): () => void {
  // Obtenir le conteneur parent
  const container = d3.select(svg.node()!.parentNode as Element);
  const initialWidth = parseInt(svg.style("width"), 10);
  
  // 🔧 NOUVEAU: Height fixe du SVG à 600px
  const fixedHeight = 600;
  
  // 🔧 CORRECTION: preserveAspectRatio pour centrage sans déformation
  svg.attr("preserveAspectRatio", "xMidYMid meet");

  // Ajouter un listener pour redimensionner avec la fenêtre
  const containerId = container.attr("id") || "sankey-container";
  const eventName = `resize.${containerId}`;
  
  // Fonction de redimensionnement qui préserve le viewBox height
  function resize() {
    const containerNode = container.node() as HTMLElement;
    if (!containerNode) return;

    const targetWidth = containerNode.getBoundingClientRect().width;
    
    // 🔧 CORRECTION: Limites raisonnables 
    const minWidth = 600;
    const maxWidth = 1200;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, targetWidth));
    
    if (clampedWidth > 0) {
      // Mettre à jour seulement la largeur, préserver le viewBox existant
      svg.attr("width", clampedWidth);
      
      // Le viewBox est géré par calculateAndApplyViewBox, on ne le modifie pas ici
      console.log(`📱 Redimensionnement: ${clampedWidth}px, viewBox préservé`);
    }
  }

  // Attacher le listener
  d3.select(window).on(eventName, resize);

  // 🔧 NOUVEAU: Retourner la fonction de cleanup
  return () => {
    d3.select(window).on(eventName, null);
    console.log(`🧹 Cleanup resize listener: ${eventName}`);
  };
}

function calculateAndApplyViewBox(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  allNodes: ExtendedNode[]
) {
  if (allNodes.length === 0) return;

  const padding = 40; // Espace de respiration autour du contenu

  // Les coordonnées des nœuds incluent maintenant les marges
  const minX = Math.min(...allNodes.map(n => n.x0!)) - padding;
  const maxX = Math.max(...allNodes.map(n => n.x1!)) + padding;
  const minY = Math.min(...allNodes.map(n => n.y0!)) - padding;
  const maxY = Math.max(...allNodes.map(n => n.y1!)) + padding;

  const viewBoxWidth = maxX - minX;
  const viewBoxHeight = maxY - minY;

  if (viewBoxWidth > 0 && viewBoxHeight > 0) {
    svg.attr("viewBox", `${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`);
    console.log(`📐 ViewBox appliqué pour centrage: ${minX.toFixed(0)} ${minY.toFixed(0)} ${viewBoxWidth.toFixed(0)} ${viewBoxHeight.toFixed(0)}`);
  }
} 