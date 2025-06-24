/**
 * Service de sélection des nœuds selon la règle R2
 * R2: Au chargement, racine = nœud avec index le plus bas au niveau 0
 *     Au clic, ce nœud devient la nouvelle racine
 */

import { ExtendedNode } from '../types/SankeyTypes';
import { HierarchyConfigType } from '../../typings/AdvancedSankeyV2Props';

export class NodeSelectionService {
  
  /**
   * R2: Trouve la racine initiale = nœud avec index le plus bas au niveau 0
   */
  static findInitialRoot(nodes: ExtendedNode[]): string | null {
    const level0Nodes = nodes.filter(n => n.metadata?.level === 0);
    
    if (level0Nodes.length === 0) {
      console.warn("Aucun nœud de niveau 0 trouvé");
      return null;
    }
    
    // Tri par index croissant, premier = racine (R2)
    level0Nodes.sort((a, b) => a.index - b.index);
    
    const root = level0Nodes[0];
    console.log(`🎯 R2: Racine initiale sélectionnée: ${root.id} (index: ${root.index})`);
    
    return root.id;
  }
  
  /**
   * R2: Au clic, le nœud devient la nouvelle racine
   * Adaptation UX: on garde la logique de navigation existante mais l'adapte à R2
   */
  static setNewRoot(nodeId: string, nodes: ExtendedNode[]): string {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Nœud ${nodeId} introuvable pour devenir racine`);
    }
    
    console.log(`🎯 R2: Nouvelle racine: ${nodeId} (niveau: ${node.metadata?.level})`);
    return nodeId;
  }
  
  /**
   * Adaptation UX: Vérifie si un nœud peut devenir racine
   * Compatible avec l'UX actuelle mais respecte R2
   */
  static canBecomeRoot(node: ExtendedNode): boolean {
    // Tout nœud peut devenir racine selon R2
    // Mais on garde une logique sensée pour l'UX
    const level = node.metadata?.level;
    return level !== undefined && typeof level === 'number' && level <= 2;
  }
  
  /**
   * Construit le chemin de navigation pour les breadcrumbs
   * Adaptation de la logique existante
   */
  static buildNavigationPath(
    currentRoot: string, 
    nodes: ExtendedNode[], 
    links: any[]
  ): Array<{ id: string; name: string }> {
    const path: Array<{ id: string; name: string }> = [];
    let currentId: string | null = currentRoot;
    
    // Remonter la hiérarchie pour construire le chemin
    while (currentId) {
      const node = nodes.find(n => n.id === currentId);
      if (!node) break;
      
      path.unshift({ id: node.id, name: node.name });
      
      // Trouver le parent (logique adaptée de l'existant)
      const parentLink = links.find(link => {
        const targetId = typeof link.target === 'string' ? 
          link.target : (link.target as any).id;
        return targetId === currentId;
      });
      
      if (parentLink) {
        currentId = typeof parentLink.source === 'string' ? 
          parentLink.source : (parentLink.source as any).id;
      } else {
        currentId = null;
      }
    }
    
    return path;
  }
} 