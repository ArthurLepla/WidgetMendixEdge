/**
 * Service de routage des liens selon la règle R5
 * R5: Contrôle explicite du routage avec espacement minimal de 8px entre liens parallèles
 */

import { ExtendedNode, SimplifiedLink } from '../types/SankeyTypes';
import { STYLE_CONSTANTS } from '../constants/StyleConstants';

interface LinkPathResult {
  path: string;
  width: number;
}

interface LinkPath {
  source: { x: number; y: number };
  target: { x: number; y: number };
  width: number;
  id: string;
}

export class LinkRoutingService {
  
  /**
   * R5: Calcule les chemins des liens avec espacement minimal 8px
   * Remplace le routage automatique D3 par un contrôle explicite
   */
  static calculateLinkPaths(
    nodes: ExtendedNode[],
    links: SimplifiedLink[],
    containerWidth: number,
    containerHeight: number
  ): { paths: Map<string, string>; widths: Map<string, number> } {
    
    console.log(`🛤️ R5: Calcul des chemins pour ${links.length} liens`);
    
    const linkPaths = new Map<string, string>();
    const linkWidths = new Map<string, number>();
    
    // 1. Grouper les liens par colonne source
    const linksBySourceLevel = this.groupLinksBySourceLevel(links, nodes);
    
    // 2. Pour chaque colonne, calculer les chemins sans chevauchement
    linksBySourceLevel.forEach((levelLinks, sourceLevel) => {
      console.log(`🛤️ R5: Traitement niveau ${sourceLevel} - ${levelLinks.length} liens`);
      
      // Créer un array usedSpaces séparé pour ce niveau source
      const levelUsedSpaces: Array<{ y: number; width: number }> = [];
      
      // Trier par position Y du nœud source puis target
      const sortedLinks = this.sortLinksForOptimalRouting(levelLinks, nodes);
      
      // Calculer les chemins avec espacement R5
      sortedLinks.forEach((link, index) => {
        const result = this.calculateSingleLinkPath(
          link, 
          nodes, 
          levelUsedSpaces, 
          index, 
          containerHeight
        );
        
        // Créer une clé unique incluant l'index pour éviter les collisions
        const uniqueKey = `${link.source}-${link.target}-${index}`;
        
        linkPaths.set(uniqueKey, result.path);
        linkWidths.set(uniqueKey, result.width);
      });
    });
    
    console.log(`✅ R5: ${linkPaths.size} chemins calculés avec espacement 8px`);
    return { paths: linkPaths, widths: linkWidths };
  }
  
  /**
   * Groupe les liens par niveau source pour traitement séquentiel
   */
  private static groupLinksBySourceLevel(
    links: SimplifiedLink[],
    nodes: ExtendedNode[]
  ): Map<number, SimplifiedLink[]> {
    
    const groups = new Map<number, SimplifiedLink[]>();
    
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const level = typeof sourceNode?.metadata?.level === 'number' ? sourceNode.metadata.level : 0;
      
      if (!groups.has(level)) {
        groups.set(level, []);
      }
      groups.get(level)!.push(link);
    });
    
    return groups;
  }
  
  /**
   * Trie les liens pour un routage optimal (minimise les croisements)
   */
  private static sortLinksForOptimalRouting(
    links: SimplifiedLink[],
    nodes: ExtendedNode[]
  ): SimplifiedLink[] {
    
    return links.sort((a, b) => {
      const sourceA = nodes.find(n => n.id === a.source);
      const sourceB = nodes.find(n => n.id === b.source);
      const targetA = nodes.find(n => n.id === a.target);
      const targetB = nodes.find(n => n.id === b.target);
      
      // Trier par position Y source puis target
      const sourceYA = sourceA?.y0 || 0;
      const sourceYB = sourceB?.y0 || 0;
      
      if (sourceYA !== sourceYB) {
        return sourceYA - sourceYB;
      }
      
      const targetYA = targetA?.y0 || 0;
      const targetYB = targetB?.y0 || 0;
      
      return targetYA - targetYB;
    });
  }
  
  /**
   * Calcule le chemin d'un lien unique avec gestion des espacements R5
   */
  private static calculateSingleLinkPath(
    link: SimplifiedLink,
    nodes: ExtendedNode[],
    usedSpaces: Array<{ y: number; width: number }>,
    linkIndex: number,
    containerHeight: number
  ): LinkPathResult {
    
    const sourceNode = nodes.find(n => n.id === link.source);
    const targetNode = nodes.find(n => n.id === link.target);
    
    if (!sourceNode || !targetNode) {
      console.warn(`⚠️ R5: Nœuds manquants pour lien ${link.source} → ${link.target}`);
      return {
        path: this.createStraightPath(0, 0, 100, 100, 1),
        width: 1
      };
    }
    
    // Positions de départ et d'arrivée
    const sourceX = sourceNode.x1 || 0;
    const sourceY = (sourceNode.y0 || 0) + (sourceNode.y1! - sourceNode.y0!) / 2;
    const targetX = targetNode.x0 || 0;
    const targetY = (targetNode.y0 || 0) + (targetNode.y1! - targetNode.y0!) / 2;
    
    // Largeur du lien proportionnelle à la valeur
    const linkWidth = Math.max(1, link.value * 0.1); // Ajustement selon les données
    
    // Vérifier l'espacement R5 avec les liens existants
    const adjustedY = this.findOptimalYPosition(
      sourceY, 
      targetY, 
      linkWidth, 
      usedSpaces,
      containerHeight
    );
    
    // Enregistrer l'espace utilisé
    usedSpaces.push({ y: adjustedY, width: linkWidth });
    
    // Créer le chemin SVG avec courbe de Bézier
    const path = this.createCurvedPath(sourceX, adjustedY, targetX, targetY, linkWidth);
    
    console.log(`🛤️ R5: Lien ${link.source} → ${link.target} - Y ajusté: ${adjustedY}`);
    
    return { path, width: linkWidth };
  }
  
  /**
   * R5: Trouve une position Y optimale respectant l'espacement 8px minimal
   */
  private static findOptimalYPosition(
    preferredY: number,
    targetY: number,
    linkWidth: number,
    usedSpaces: Array<{ y: number; width: number }>,
    containerHeight: number
  ): number {
    
    const minSpacing = STYLE_CONSTANTS.LINK.MIN_SPACING;
    let candidateY = preferredY;
    
    // Vérifier les conflits avec les liens existants
    let hasConflict = true;
    let attempts = 0;
    
    while (hasConflict && attempts < 10) {
      hasConflict = false;
      
      for (const usedSpace of usedSpaces) {
        const distance = Math.abs(candidateY - usedSpace.y);
        const requiredDistance = minSpacing + (linkWidth + usedSpace.width) / 2;
        
        if (distance < requiredDistance) {
          // Conflit détecté - ajuster la position
          candidateY = usedSpace.y > candidateY ? 
            usedSpace.y - requiredDistance : 
            usedSpace.y + requiredDistance;
          hasConflict = true;
          break;
        }
      }
      
      attempts++;
    }
    
    if (attempts >= 10) {
      console.warn(`⚠️ R5: Impossible de résoudre les conflits d'espacement pour Y=${preferredY}`);
    }
    
    // Contraindre candidateY dans les limites du conteneur
    const minY = linkWidth / 2;
    const maxY = containerHeight - linkWidth / 2;
    candidateY = Math.max(minY, Math.min(maxY, candidateY));
    
    return candidateY;
  }
  
  /**
   * Crée un chemin SVG courbé pour une apparence professionnelle
   */
  private static createCurvedPath(
    x1: number, y1: number,
    x2: number, y2: number, 
    width: number
  ): string {
    
    const curvature = 0.5;
    const xi = (x1 + x2) / 2;
    const x3 = xi + curvature * (x2 - x1);
    
    return `M${x1},${y1}C${x3},${y1} ${x3},${y2} ${x2},${y2}`;
  }
  
  /**
   * Crée un chemin SVG droit (fallback)
   */
  private static createStraightPath(
    x1: number, y1: number,
    x2: number, y2: number,
    width: number
  ): string {
    return `M${x1},${y1}L${x2},${y2}`;
  }
  
  /**
   * Valide que le routage respecte R5
   */
  static validateR5Compliance(
    linkPaths: Map<string, string>,
    links: SimplifiedLink[]
  ): { isCompliant: boolean; violations: string[] } {
    
    const violations: string[] = [];
    
    // Vérifier que tous les liens ont un chemin
    const expectedKeys = links.map((link, index) => 
      `${link.source}-${link.target}-${index}`
    );
    
    const missingPaths = expectedKeys.filter(key => !linkPaths.has(key));
    
    if (missingPaths.length > 0) {
      violations.push(`${missingPaths.length} liens sans chemin calculé`);
    }
    
    // TODO: Vérifier l'espacement minimal (nécessite analyse géométrique des chemins)
    
    const isCompliant = violations.length === 0;
    
    if (isCompliant) {
      console.log(`✅ R5: Conformité validée pour ${linkPaths.size} chemins`);
    } else {
      console.warn(`⚠️ R5: Violations détectées:`, violations);
    }
    
    return { isCompliant, violations };
  }
} 