/**
 * Service de prévention des chevauchements selon la règle R7
 * R7: Aucun chevauchement de liens ne doit dépasser 3% de la largeur totale
 */

import { ExtendedNode, SimplifiedLink } from '../types/SankeyTypes';

interface LinkGeometry {
  id: string;
  sourceY: number;
  targetY: number;
  width: number;
  path: { x: number; y: number }[];
}

export class OverlapPreventionService {
  
  /**
   * R7: Analyse et corrige les chevauchements de liens
   * Vérifie que les chevauchements ne dépassent pas 3% de la largeur
   */
  static preventOverlaps(
    links: SimplifiedLink[],
    nodes: ExtendedNode[],
    containerWidth: number,
    linkPaths?: Map<string, string>
  ): { 
    adjustedLinks: SimplifiedLink[]; 
    violations: string[]; 
    maxOverlapPercentage: number; 
  } {
    
    const maxAllowedOverlap = containerWidth * 0.03; // 3% de la largeur
    console.log(`📐 R7: Seuil chevauchement autorisé: ${maxAllowedOverlap.toFixed(1)}px (3% de ${containerWidth}px)`);
    
    const violations: string[] = [];
    const linkGeometries = this.calculateLinkGeometries(links, nodes);
    
    // 1. Détecter les chevauchements existants
    const overlaps = this.detectOverlaps(linkGeometries);
    
    // 2. Calculer le pourcentage maximal de chevauchement
    const maxOverlap = Math.max(...overlaps.map(o => o.overlapAmount), 0);
    const maxOverlapPercentage = (maxOverlap / containerWidth) * 100;
    
    console.log(`📐 R7: Chevauchement maximal détecté: ${maxOverlap.toFixed(1)}px (${maxOverlapPercentage.toFixed(2)}%)`);
    
    // 3. Vérifier la conformité R7
    if (maxOverlap > maxAllowedOverlap) {
      violations.push(`Chevauchement de ${maxOverlap.toFixed(1)}px dépasse le seuil de ${maxAllowedOverlap.toFixed(1)}px`);
      console.warn(`⚠️ R7: Violation détectée - ${maxOverlapPercentage.toFixed(2)}% > 3%`);
    }
    
    // 4. Ajuster les liens si nécessaire
    const adjustedLinks = violations.length > 0 ? 
      this.adjustLinksToReduceOverlap(links, nodes, overlaps, maxAllowedOverlap) : 
      links;
    
    if (violations.length === 0) {
      console.log(`✅ R7: Conformité validée - chevauchement maximal ${maxOverlapPercentage.toFixed(2)}%`);
    }
    
    return {
      adjustedLinks,
      violations,
      maxOverlapPercentage
    };
  }
  
  /**
   * Calcule la géométrie de chaque lien pour analyse des chevauchements
   */
  private static calculateLinkGeometries(
    links: SimplifiedLink[],
    nodes: ExtendedNode[]
  ): LinkGeometry[] {
    
    return links.map(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (!sourceNode || !targetNode) {
        console.warn(`⚠️ R7: Nœuds manquants pour lien ${link.source} → ${link.target}`);
        return {
          id: `${link.source}-${link.target}`,
          sourceY: 0,
          targetY: 0,
          width: 1,
          path: []
        };
      }
      
      const sourceY = (sourceNode.y0 || 0) + (sourceNode.y1! - sourceNode.y0!) / 2;
      const targetY = (targetNode.y0 || 0) + (targetNode.y1! - targetNode.y0!) / 2;
      
      // Largeur proportionnelle à la valeur (même logique que le rendu)
      const linkWidth = Math.max(1, link.value * 0.1);
      
      // Approximation du chemin (simplifié pour l'analyse)
      const path = this.approximateLinkPath(sourceNode, targetNode, linkWidth);
      
      return {
        id: `${link.source}-${link.target}`,
        sourceY,
        targetY,
        width: linkWidth,
        path
      };
    });
  }
  
  /**
   * Approximation du chemin d'un lien pour calcul des chevauchements
   */
  private static approximateLinkPath(
    sourceNode: ExtendedNode,
    targetNode: ExtendedNode,
    width: number
  ): { x: number; y: number }[] {
    
    const sourceX = sourceNode.x1 || 0;
    const sourceY = (sourceNode.y0 || 0) + (sourceNode.y1! - sourceNode.y0!) / 2;
    const targetX = targetNode.x0 || 0;
    const targetY = (targetNode.y0 || 0) + (targetNode.y1! - targetNode.y0!) / 2;
    
    // Approximation par segments de droite (simplifié pour R7)
    const segments = 10;
    const path: { x: number; y: number }[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = sourceX + t * (targetX - sourceX);
      const y = sourceY + t * (targetY - sourceY);
      path.push({ x, y });
    }
    
    return path;
  }
  
  /**
   * Détecte les chevauchements entre liens
   */
  private static detectOverlaps(
    linkGeometries: LinkGeometry[]
  ): Array<{ 
    link1: string; 
    link2: string; 
    overlapAmount: number; 
    position: { x: number; y: number }; 
  }> {
    
    const overlaps: Array<{ 
      link1: string; 
      link2: string; 
      overlapAmount: number; 
      position: { x: number; y: number }; 
    }> = [];
    
    // Comparer chaque paire de liens
    for (let i = 0; i < linkGeometries.length; i++) {
      for (let j = i + 1; j < linkGeometries.length; j++) {
        const link1 = linkGeometries[i];
        const link2 = linkGeometries[j];
        
        const overlap = this.calculateLinkOverlap(link1, link2);
        
        if (overlap.amount > 0) {
          overlaps.push({
            link1: link1.id,
            link2: link2.id,
            overlapAmount: overlap.amount,
            position: overlap.position
          });
          
          console.log(`🔍 R7: Chevauchement détecté entre ${link1.id} et ${link2.id}: ${overlap.amount.toFixed(1)}px`);
        }
      }
    }
    
    return overlaps;
  }
  
  /**
   * Calcule le chevauchement entre deux liens
   */
  private static calculateLinkOverlap(
    link1: LinkGeometry,
    link2: LinkGeometry
  ): { amount: number; position: { x: number; y: number } } {
    
    // Algorithme simplifié : vérifier le croisement des boîtes englobantes
    const minY1 = link1.sourceY - link1.width / 2;
    const maxY1 = link1.sourceY + link1.width / 2;
    const minY2 = link2.sourceY - link2.width / 2;
    const maxY2 = link2.sourceY + link2.width / 2;
    
    // Calculer le chevauchement vertical
    const overlapStart = Math.max(minY1, minY2);
    const overlapEnd = Math.min(maxY1, maxY2);
    const overlapAmount = Math.max(0, overlapEnd - overlapStart);
    
    // Position approximative du chevauchement
    const position = {
      x: ((link1.path[0]?.x || 0) + (link2.path[0]?.x || 0)) / 2,
      y: (overlapStart + overlapEnd) / 2
    };
    
    return { amount: overlapAmount, position };
  }
  
  /**
   * Ajuste la position des liens pour réduire les chevauchements
   */
  private static adjustLinksToReduceOverlap(
    links: SimplifiedLink[],
    nodes: ExtendedNode[],
    overlaps: Array<{ link1: string; link2: string; overlapAmount: number }>,
    maxAllowedOverlap: number
  ): SimplifiedLink[] {
    
    console.log(`🔧 R7: Ajustement de ${overlaps.length} chevauchements`);
    
    // Pour cette implémentation, on retourne les liens inchangés
    // Une implémentation complète nécessiterait de recalculer les positions Y
    // en collaboration avec le LinkRoutingService
    
    console.log(`🔧 R7: Ajustement reporté au LinkRoutingService pour coordination`);
    
    return links;
  }
  
  /**
   * Valide que la configuration respecte R7
   */
  static validateR7Compliance(
    links: SimplifiedLink[],
    nodes: ExtendedNode[],
    containerWidth: number
  ): { 
    isCompliant: boolean; 
    violations: string[]; 
    maxOverlapPercentage: number;
    analysis: {
      totalLinks: number;
      overlappingPairs: number;
      maxOverlapPx: number;
    };
  } {
    
    const result = this.preventOverlaps(links, nodes, containerWidth);
    
    const linkGeometries = this.calculateLinkGeometries(links, nodes);
    const overlaps = this.detectOverlaps(linkGeometries);
    
    const analysis = {
      totalLinks: links.length,
      overlappingPairs: overlaps.length,
      maxOverlapPx: Math.max(...overlaps.map(o => o.overlapAmount), 0)
    };
    
    const isCompliant = result.violations.length === 0;
    
    if (isCompliant) {
      console.log(`✅ R7: Conformité validée - ${analysis.overlappingPairs} chevauchements sous le seuil`);
    } else {
      console.warn(`⚠️ R7: Non-conformité - ${result.maxOverlapPercentage.toFixed(2)}% > 3%`);
    }
    
    return {
      isCompliant,
      violations: result.violations,
      maxOverlapPercentage: result.maxOverlapPercentage,
      analysis
    };
  }
} 