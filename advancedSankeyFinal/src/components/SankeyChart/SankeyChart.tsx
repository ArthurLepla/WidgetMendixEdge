import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyJustify } from "d3-sankey";
import { VisualNode, VisualLink } from "../../utils/visualDataAdapter";
import { UnitConversionService } from "../../utils/dataTransformers";

export interface SankeyChartProps {
    nodes: VisualNode[];
    links: VisualLink[];
    width: number;
    height: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    onNodeClick: (node: VisualNode) => void;
    onNodeDetails?: (node: VisualNode) => void;
    unitOfMeasure?: string;
    linkColor?: string;
    showValues?: boolean;
    // Liens originaux avec noms pour détection des enfants
    originalLinks?: VisualLink[];
}

type ChartNode = VisualNode & { x0?: number; x1?: number; y0?: number; y1?: number };
type ChartLink = { source: number; target: number; value: number; width?: number } & Partial<VisualLink> & { y0?: number; y1?: number };

const SankeyChart: React.FC<SankeyChartProps> = ({
    nodes,
    links,
    width,
    height,
    margin = { top: 20, right: 20, bottom: 20, left: 20 },
    onNodeClick,
    onNodeDetails,
    unitOfMeasure = "kWh",
    linkColor = "#E0E0E0",
    showValues = true,
    originalLinks
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!svgRef.current || !tooltipRef.current || width === 0) {
            return;
        }

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        // Utilitaires de formatage (auto convert kWh→MWh/GWh, L→m3)
        const formatForDisplay = (val: number, baseUnit: string) => {
            try {
                const { value: v, unit } = UnitConversionService.autoFormat(val, baseUnit);
                const formatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(v);
                return `${formatted} ${unit}`;
            } catch {
                return `${val.toFixed(2)} ${baseUnit}`;
            }
        };

        // Assure un viewport cohérent pour D3 et un centrage correct dans le conteneur
        svg
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        // Fonctions pour le tooltip (coordonnées relatives au conteneur, pas à la page)
        const showTooltip = (event: MouseEvent, content: string) => {
            const containerEl = svgRef.current?.parentElement as HTMLElement;
            const tooltipEl = tooltipRef.current as HTMLDivElement;
            const tooltip = d3.select(tooltipEl);
            // Position du pointeur relative au conteneur pour éviter les décalages
            const [mx, my] = d3.pointer(event as any, containerEl);
            tooltip.html(content);
            // Calcul après injection du contenu pour obtenir les dimensions
            requestAnimationFrame(() => {
                const containerRect = containerEl.getBoundingClientRect();
                const ttRect = tooltipEl.getBoundingClientRect();
                const offsetX = 12;
                const offsetY = 12;
                let left = mx + offsetX;
                let top = my + offsetY;
                const maxLeft = containerRect.width - ttRect.width - 4;
                const maxTop = containerRect.height - ttRect.height - 4;
                left = Math.max(4, Math.min(maxLeft, left));
                top = Math.max(4, Math.min(maxTop, top));
                tooltip
                    .style("opacity", 1)
                    .style("left", `${left}px`)
                    .style("top", `${top}px`);
            });
        };

        const hideTooltip = () => {
            d3.select(tooltipRef.current)
                .style("opacity", 0);
        };

        try {
            // Validation des données
            const hasInvalidNodes = nodes.some(node => 
                typeof node.value !== 'number' ||
                isNaN(node.value)
            );

            if (hasInvalidNodes) {
                console.error("[DEBUG] Invalid node values detected");
                return;
            }

            // Création du layout Sankey avec paramètres adaptatifs
            const nodeCount = nodes.length;
            const adaptiveNodePadding = nodeCount > 20 ? Math.max(5, 20 - nodeCount / 10) : 20;
            const adaptiveNodeWidth = nodeCount > 30 ? 20 : 30;
            
            console.log(`[SankeyChart] Rendering ${nodeCount} nodes, ${links.length} links`);
            
            // Marges adaptées avec zone dédiée aux labels externes (dimensionnée selon la longueur max des noms)
            const maxNameChars = Math.max(0, ...nodes.map(n => (n.name ? n.name.length : 0)));
            let labelZone = Math.round(Math.min(380, Math.max(180, maxNameChars * 9.5)));
            const labelZoneMaxAllowed = Math.max(100, (width - 240) / 2); // préserver au moins 240px pour le diagramme central
            labelZone = Math.min(labelZone, labelZoneMaxAllowed);
            const verticalMargin = Math.min(Math.max(24, height * 0.08), 80);
            const dynamicMargin = {
                top: verticalMargin,
                right: labelZone,
                bottom: verticalMargin,
                left: labelZone
            };
            
            console.log(`[SankeyChart] Dynamic margins:`, dynamicMargin, `for size ${width}x${height}`);
            
            const sankeyGenerator = sankey<ChartNode, ChartLink>()
                .nodeWidth(adaptiveNodeWidth)
                .nodePadding(adaptiveNodePadding)
                .extent([[dynamicMargin.left, dynamicMargin.top], [width - dynamicMargin.right, height - dynamicMargin.bottom]])
                .nodeAlign(sankeyJustify); // Alignment justifié (par défaut)

            // Préparation des données
            const sankeyData = {
                nodes: nodes.map(node => ({ ...node } as ChartNode)),
                links: links.map(l => ({
                    ...l,
                    source: typeof l.source === "number" ? l.source : Number(l.source),
                    target: typeof l.target === "number" ? l.target : Number(l.target)
                } as ChartLink))
            };

            // Exclure explicitement toute valeur non positive pour la robustesse (défense supplémentaire)
            sankeyData.links = sankeyData.links.filter(l => (l.value as number) > 0);
            const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator(sankeyData);

            // Vérification des positions calculées
            const hasInvalidPositions = sankeyNodes.some(
                node => isNaN(node.x0!) || isNaN(node.x1!) || isNaN(node.y0!) || isNaN(node.y1!)
            );

            if (hasInvalidPositions) {
                // Quand il n'y a aucun lien, d3-sankey ne positionne pas les nœuds -> fallback simple
                if (sankeyData.links.length === 0) {
                    const columnWidth = (width - dynamicMargin.left - dynamicMargin.right) / Math.max(1, nodeCount);
                    nodes.forEach((n, i) => {
                        (sankeyNodes[i] as any).x0 = dynamicMargin.left + i * columnWidth;
                        (sankeyNodes[i] as any).x1 = (sankeyNodes[i] as any).x0 + adaptiveNodeWidth;
                        (sankeyNodes[i] as any).y0 = dynamicMargin.top + i * 10;
                        (sankeyNodes[i] as any).y1 = (sankeyNodes[i] as any).y0 + 30;
                    });
                } else {
                    console.error("[DEBUG] Invalid node positions detected");
                    return;
                }
            }
            
            // Centrage vertical des nœuds si l'espace le permet
            const usedHeight = Math.max(...sankeyNodes.map(n => n.y1!)) - Math.min(...sankeyNodes.map(n => n.y0!));
            const availableHeight = height - dynamicMargin.top - dynamicMargin.bottom;
            const verticalOffset = availableHeight > usedHeight ? (availableHeight - usedHeight) / 2 : 0;
            
            // Appliquer l'offset vertical si nécessaire
            if (verticalOffset > 0) {
                sankeyNodes.forEach(node => {
                    node.y0! += verticalOffset;
                    node.y1! += verticalOffset;
                });
                
                // Recalculer les positions des liens
                sankeyLinks.forEach(link => {
                    if ((link as any).y0 !== undefined) (link as any).y0 += verticalOffset;
                    if ((link as any).y1 !== undefined) (link as any).y1 += verticalOffset;
                });
            }

            // Dessiner les liens
            const linkSelection = svg.append("g")
                .selectAll("path")
                .data(sankeyLinks)
                .join("path")
                .attr("class", "sankey-link")
                .attr("d", sankeyLinkHorizontal())
                .attr("stroke-width", d => {
                    const baseWidth = Math.max(1, (d as any).width || 0);
                    // S'assurer que la largeur du lien correspond exactement à la hauteur des nœuds
                    const s = (d as any).source as ChartNode;
                    const t = (d as any).target as ChartNode;
                    const sourceHeight = ((s?.y1 ?? 0) as number) - ((s?.y0 ?? 0) as number);
                    const targetHeight = ((t?.y1 ?? 0) as number) - ((t?.y0 ?? 0) as number);
                    // Utiliser la plus petite hauteur pour maintenir la cohérence visuelle
                    const constraintHeight = Math.min(sourceHeight, targetHeight);
                    return Math.min(baseWidth, Math.max(1, constraintHeight));
                })
                .attr("stroke", linkColor)
                .attr("fill", "none")
                .attr("opacity", 0.95)
                .on("mouseover", (event, d) => {
                    const formattedValue = formatForDisplay((d as any).value, unitOfMeasure);
                    showTooltip(event, `
                        <div class="sankey-tooltip-title">
                            ${(d as any).source?.name ?? ""} → ${(d as any).target?.name ?? ""}
                        </div>
                        <div class="sankey-tooltip-content">
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Source:</span>
                                <span class="sankey-tooltip-value">${(d as any).source?.name ?? ""}</span>
                            </div>
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Destination:</span>
                                <span class="sankey-tooltip-value">${(d as any).target?.name ?? ""}</span>
                            </div>
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Valeur:</span>
                                <span class="sankey-tooltip-value">${formattedValue}</span>
                            </div>
                        </div>
                    `);
                })
                .on("mouseout", hideTooltip);

            // Labels de valeurs sur les liens (optionnels, affichés pour liens suffisamment épais)
            const valueLabelThreshold = 6; // px
            const linkValueGroup = svg.append("g").attr("class", "sankey-link-values");
            linkValueGroup
                .selectAll("text.sankey-link-value")
                .data(sankeyLinks.filter((d: any) => ((d as any).width || 0) >= valueLabelThreshold))
                .join("text")
                .attr("class", "sankey-link-value")
                .attr("x", d => ((d as any).source?.x1 ?? 0) + (((d as any).target?.x0 ?? 0) - ((d as any).source?.x1 ?? 0)) / 2)
                .attr("y", d => (((d as any).y0 ?? 0) + ((d as any).y1 ?? 0)) / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#18213e")
                .style("pointer-events", "none")
                .text(d => formatForDisplay((d as any).value, unitOfMeasure));

            // Dessiner les nœuds
            const nodeGroup = svg.append("g")
                .selectAll("g")
                .data(sankeyNodes)
                .join("g")
                .attr("class", "sankey-node");

            nodeGroup.append("rect")
                .attr("x", d => d.x0!)
                .attr("y", d => d.y0!)
                .attr("height", d => Math.max(3, d.y1! - d.y0!))
                .attr("width", d => d.x1! - d.x0!)
                .attr("fill", d => (d as any).color || "#757575")
                .style("cursor", d => {
                    // Ne pas permettre de cliquer sur ALIMENTATION PRINCIPALE (nœud racine virtuel)
                    if (d.name === "ALIMENTATION PRINCIPALE") {
                        return "default";
                    }
                    
                    // Tous les nœuds sont cliquables (drill-down ou vue détaillée)
                    return "pointer";
                })
                .on("mouseover", (event, d) => {
                    const formattedValue = formatForDisplay(d.value, unitOfMeasure);
                    
                    // Utiliser originalLinks si disponible, sinon links
                    const linksToCheck = originalLinks || links;
                    const nodeHasChildren = linksToCheck.some(link => {
                        const sourceName = (link as any).sourceName || 
                            (typeof link.source === 'number' ? nodes[link.source]?.name : link.source);
                        return sourceName === d.name;
                    });
                    
                    const hintText = nodeHasChildren 
                        ? "Clic: navigation • Ctrl+clic: vue détaillée"
                        : "Ctrl+clic: vue détaillée";
                    
                    showTooltip(event, `
                        <div class="sankey-tooltip-title">${d.name}</div>
                        <div class="sankey-tooltip-content">
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Niveau:</span>
                                <span class="sankey-tooltip-value">${(d as any).level ?? "-"}</span>
                            </div>
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Valeur:</span>
                                <span class="sankey-tooltip-value">${formattedValue}</span>
                            </div>
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Enfants:</span>
                                <span class="sankey-tooltip-value">${(() => {
                                    const linksToCheck = originalLinks || links;
                                    return linksToCheck.filter(link => {
                                        const sourceName = (link as any).sourceName || 
                                            (typeof link.source === 'number' ? nodes[link.source]?.name : link.source);
                                        return sourceName === d.name;
                                    }).length;
                                })()}</span>
                            </div>
                            <div class="sankey-tooltip-hint">
                                <small style="color: #666; font-style: italic;">💡 ${hintText}</small>
                            </div>
                        </div>
                    `);
                })
                .on("mouseout", hideTooltip)
                .on("click", (event, d) => {
                    // Ne pas permettre de cliquer sur ALIMENTATION PRINCIPALE (nœud racine virtuel)
                    if (d.name === "ALIMENTATION PRINCIPALE") {
                        console.log(`Cannot click on virtual root node: ${d.name}`);
                        return;
                    }
                    
                    // Utiliser originalLinks si disponible, sinon links
                    const linksToCheck = originalLinks || links;
                    const nodeHasChildren = linksToCheck.some(link => {
                        const sourceName = (link as any).sourceName || 
                            (typeof link.source === 'number' ? nodes[link.source]?.name : link.source);
                        return sourceName === d.name;
                    });
                    
                    // Ctrl+clic ou Cmd+clic: vue détaillée partout
                    const wantsDetails = event.ctrlKey || event.metaKey;
                    if (wantsDetails && onNodeDetails) {
                        console.log(`Ctrl+clic sur ${d.name}: ouverture vue détaillée`);
                        onNodeDetails(d as unknown as VisualNode);
                        return;
                    }
                    
                    // Clic normal: navigation uniquement si enfants; sinon, ne rien faire
                    console.log(`Node clicked: ${d.name}, has children: ${nodeHasChildren}`);
                    if (nodeHasChildren) {
                        onNodeClick(d as unknown as VisualNode);
                    }
                });

            // Labels externes (placés à l'opposé du flux) avec troncature mesurée + masquage si nœud trop petit
            const MIN_LABEL_NODE_HEIGHT = 14;

            const truncateToFit = (textEl: SVGTextElement, fullText: string, maxWidth: number) => {
                if (maxWidth <= 0) {
                    textEl.textContent = "";
                    return;
                }
                textEl.textContent = fullText;
                // Si ça tient, on garde tel quel
                // getComputedTextLength est sûr sur <text>
                if ((textEl as any).getComputedTextLength && textEl.getComputedTextLength() <= maxWidth) return;
                // Sinon on tronque progressivement
                let low = 0;
                let high = fullText.length;
                let best = 0;
                // Recherche binaire pour performance sur textes longs
                while (low <= high) {
                    const mid = Math.floor((low + high) / 2);
                    const candidate = fullText.slice(0, mid) + "…";
                    textEl.textContent = candidate;
                    const len = (textEl as any).getComputedTextLength ? textEl.getComputedTextLength() : Number.MAX_SAFE_INTEGER;
                    if (len <= maxWidth) {
                        best = mid;
                        low = mid + 1;
                    } else {
                        high = mid - 1;
                    }
                }
                textEl.textContent = best > 0 ? fullText.slice(0, best) + "…" : "";
            };

            // Préparer les pistes de labels gauche/droite
            const leftLaneX = Math.max(12, dynamicMargin.left - 10);
            const rightLaneX = Math.min(width - 12, width - dynamicMargin.right + 10);
            const minLabelGap = 14;
            const topBound = dynamicMargin.top;
            const bottomBound = height - dynamicMargin.bottom;

            const labelDataLeft = sankeyNodes
                .filter(n => n.x0! < width / 2)
                .map(n => ({
                    node: n,
                    x: leftLaneX,
                    y: (n.y0! + n.y1!) / 2,
                    anchor: "end" as const,
                    text: `${n.name}`
                }))
                .sort((a, b) => a.y - b.y);

            const labelDataRight = sankeyNodes
                .filter(n => n.x0! >= width / 2)
                .map(n => ({
                    node: n,
                    x: rightLaneX,
                    y: (n.y0! + n.y1!) / 2,
                    anchor: "start" as const,
                    text: `${n.name}`
                }))
                .sort((a, b) => a.y - b.y);

            // Évitement de collision vertical (glouton)
            const applyVerticalLayout = (items: Array<{ y: number }>) => {
                let prev = topBound;
                for (const it of items) {
                    it.y = Math.max(it.y, prev + minLabelGap);
                    prev = it.y;
                }
                // Clamp final au bas
                for (let i = items.length - 1; i >= 0; i--) {
                    const it = items[i];
                    if (it.y > bottomBound - 4) {
                        it.y = bottomBound - 4;
                        if (i > 0) {
                            items[i - 1].y = Math.min(items[i - 1].y, it.y - minLabelGap);
                        }
                    }
                }
            };

            applyVerticalLayout(labelDataLeft);
            applyVerticalLayout(labelDataRight);

            const labelsLayer = svg.append("g").attr("class", "sankey-labels");

            // Connecteurs
            const connectorFor = (fromX: number, fromY: number, toX: number, toY: number) =>
                `M ${fromX} ${fromY} L ${toX} ${toY}`;

            // Dessin gauche
            labelsLayer
                .selectAll("path.sankey-label-connector-left")
                .data(labelDataLeft)
                .join("path")
                .attr("class", "sankey-label-connector-left")
                .attr("d", d => connectorFor(d.node.x0! - 2, (d.node.y0! + d.node.y1!) / 2, d.x + 2, d.y))
                .attr("stroke", "#c7cbd1")
                .attr("stroke-width", 1)
                .attr("fill", "none");

            labelsLayer
                .selectAll("text.sankey-label-left")
                .data(labelDataLeft)
                .join("text")
                .attr("class", "sankey-label sankey-label-left")
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .attr("dy", "0.35em")
                .attr("text-anchor", d => d.anchor)
                .text(d => d.text)
                .each(function(d: any) {
                    const textEl = this as SVGTextElement;
                    const maxWidth = d.x; // distance au bord gauche
                    truncateToFit(textEl, d.text, Math.max(0, maxWidth - 6));
                });

            // Dessin droite
            labelsLayer
                .selectAll("path.sankey-label-connector-right")
                .data(labelDataRight)
                .join("path")
                .attr("class", "sankey-label-connector-right")
                .attr("d", d => connectorFor(d.node.x1! + 2, (d.node.y0! + d.node.y1!) / 2, d.x - 2, d.y))
                .attr("stroke", "#c7cbd1")
                .attr("stroke-width", 1)
                .attr("fill", "none");

            labelsLayer
                .selectAll("text.sankey-label-right")
                .data(labelDataRight)
                .join("text")
                .attr("class", "sankey-label sankey-label-right")
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .attr("dy", "0.35em")
                .attr("text-anchor", d => d.anchor)
                .text(d => d.text)
                .each(function(d: any) {
                    const textEl = this as SVGTextElement;
                    const maxWidth = width - d.x; // distance au bord droit
                    truncateToFit(textEl, d.text, Math.max(0, maxWidth - 6));
                });

        } catch (error) {
            console.error("[DEBUG] Error rendering Sankey diagram:", error);
        }
    }, [nodes, links, width, height, margin.top, margin.right, margin.bottom, margin.left, onNodeClick, unitOfMeasure, linkColor, showValues]);

    return (
        <div className="sankey-chart" style={{ 
            position: "relative", 
            width: "100%", 
            height: "100%",
            minHeight: `${height}px`
        }}>
            <svg ref={svgRef} style={{ 
                width: "100%", 
                height: `${height}px`,
                display: "block"
            }} />
            <div 
                ref={tooltipRef} 
                className="sankey-tooltip" 
                style={{ 
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none"
                }} 
            />
        </div>
    );
}; 

export default SankeyChart;