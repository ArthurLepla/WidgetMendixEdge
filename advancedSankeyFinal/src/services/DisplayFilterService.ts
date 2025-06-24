/**
 * Service de filtrage d'affichage selon la règle R4 AMÉLIORÉE
 * R4: Affichage intelligent selon le contexte :
 *     - Si racine a un parent : parent + racine + enfants directs
 *     - Sinon : racine + enfants directs uniquement
 *     - Les nœuds à valeur 0 restent visibles (R8)
 */

import { ExtendedNode, SimplifiedLink } from '../types/SankeyTypes';

// Type pour les liens qui peuvent être soit des strings soit des objets
// (compatibilité avec différentes étapes du pipeline de traitement)
interface FlexibleLink {
  source: string | { id: string };
  target: string | { id: string };
  value: number;
  metadata?: {
    sourceLevel?: string | number;
    targetLevel?: string | number;
    isDirectLink?: boolean;
    skipLevels?: boolean;
  };
}

export class DisplayFilterService {
  
  /**
   * R4: Filtre les nœuds visibles selon les règles strictes
   * CORRECTION MAJEURE: Orphelins seulement au démarrage + gestion profondeur centralisée
   */
  static filterVisibleNodes(
    allNodes: ExtendedNode[],
    rootId: string,
    allLinks: FlexibleLink[],
    showDepth: number = 1, // 🔧 CORRECTION: Profondeur par défaut = 1 pour respecter R4
    isInitialView: boolean = false // 🔧 NOUVEAU: Détermine si on est au démarrage (pour orphelins)
  ): { nodes: ExtendedNode[]; links: FlexibleLink[] } {
    console.log(`🎯 R4: Filtrage profondeur=${showDepth}, racine=${rootId}, initial=${isInitialView}`);
    
    const rootNode = allNodes.find(n => n.id === rootId);
    if (!rootNode) {
      throw new Error(`R4: Racine ${rootId} introuvable`);
    }
    
    // 2. Extraire les liens directs depuis la racine
    const directLinks = allLinks.filter(link => link.source === rootId);
    const directChildrenIds = new Set(directLinks.map(l => l.target));

    // 3. Construire la liste des nœuds visibles
    const visibleNodeIds = new Set([rootId, ...directChildrenIds]);
    const visibleNodes = allNodes.filter(node => visibleNodeIds.has(node.id));

    console.log(`🎯 R4: Racine "${rootId}" a ${directChildrenIds.size} enfants directs.`);

    // 4. Ajouter les orphelins seulement en vue initiale
    if (isInitialView) {
        const orphans = this.identifyOrphans(allNodes, allLinks);
        orphans.forEach((orphan: ExtendedNode) => {
            if (!visibleNodeIds.has(orphan.id)) {
                visibleNodes.push(orphan);
                visibleNodeIds.add(orphan.id);
            }
        });
        console.log(`🔄 R4: Vue initiale - ${orphans.length} orphelins ajoutés.`);
    } else {
        console.log(`🔄 R4: Navigation - pas d'orphelins ajoutés.`);
    }

    // 5. Retourner les nœuds et SEULEMENT les liens directs
    console.log(`✅ R4: ${visibleNodes.length} nœuds visibles, ${directLinks.length} liens.`);
    
    return { nodes: visibleNodes, links: directLinks };
  }
  
  /**
   * Vérifie si un nœud peut naviguer vers son parent
   */
  static canNavigateUp(
    currentRootId: string,
    allNodes: ExtendedNode[],
    allLinks: FlexibleLink[]
  ): { canNavigateUp: boolean; parentId?: string; parentName?: string } {
    
    const parentLink = allLinks.find(link => {
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      return targetId === currentRootId;
    });
    
    if (parentLink) {
      const parentId = typeof parentLink.source === 'string' ? parentLink.source : (parentLink.source as any).id;
      const parentNode = allNodes.find(n => n.id === parentId);
      
      if (parentNode) {
        return {
          canNavigateUp: true,
          parentId: parentNode.id,
          parentName: parentNode.name
        };
      }
    }
    
    return { canNavigateUp: false };
  }
  
  /**
   * R4: Validation de la conformité (mise à jour pour inclure orphelins)
   */
  static validateR4Compliance(
    visibleNodes: ExtendedNode[],
    visibleLinks: FlexibleLink[],
    selectedRootId: string
  ): { isCompliant: boolean; violations: string[] } {
    
    const violations: string[] = [];
    
    // Vérifier qu'on a bien la racine
    const rootNode = visibleNodes.find(n => n.id === selectedRootId);
    if (!rootNode) {
      violations.push(`Racine ${selectedRootId} manquante dans les nœuds visibles`);
      return { isCompliant: false, violations };
    }
    
    const rootLevel = rootNode.metadata?.level;
    
    // Vérifier qu'on n'a que des enfants directs + orphelins du même niveau
    const rootChildren = visibleLinks.map(link => 
      typeof link.target === 'string' ? link.target : (link.target as any).id
    );
    
    const nonRootNodes = visibleNodes.filter(n => n.id !== selectedRootId);
    const hasOnlyValidNodes = nonRootNodes.every(n => {
      // Soit c'est un enfant direct
      const isDirectChild = rootChildren.includes(n.id);
      // Soit c'est un orphelin (de n'importe quel niveau)
      const isOrphanNode = n.metadata?.isOrphan === true;
      
      return isDirectChild || isOrphanNode;
    });
      
    if (!hasOnlyValidNodes) {
      violations.push("Des nœuds non conformes R4 sont présents (ni enfants directs, ni orphelins)");
    }
    
    return {
      isCompliant: violations.length === 0,
      violations
    };
  }
  
  /**
   * 🔧 NOUVELLE MÉTHODE: Trouve tous les nœuds connectés à une racine
   * Utilise un parcours en largeur pour déterminer la connectivité réelle
   */
  static findAllConnectedNodes(
    rootId: string,
    allNodes: ExtendedNode[],
    allLinks: FlexibleLink[]
  ): Set<string> {
    const connectedNodes = new Set<string>([rootId]);
    const queue = [rootId];
    
    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      
      // Trouver tous les liens où ce nœud est source
      const outgoingLinks = allLinks.filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        return sourceId === currentNodeId;
      });
      
      // Ajouter les cibles de ces liens
      outgoingLinks.forEach(link => {
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        if (!connectedNodes.has(targetId)) {
          connectedNodes.add(targetId);
          queue.push(targetId);
        }
      });
      
      // Trouver aussi les liens où ce nœud est cible (pour navigation ascendante)
      const incomingLinks = allLinks.filter(link => {
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        return targetId === currentNodeId;
      });
      
      incomingLinks.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        if (!connectedNodes.has(sourceId)) {
          connectedNodes.add(sourceId);
          queue.push(sourceId);
        }
      });
    }
    
    return connectedNodes;
  }

  /**
   * Vérifie si un nœud est un enfant direct d'un autre
   * Utile pour la validation R4
   */
  static isDirectChild(
    childId: string,
    parentId: string,
    links: SimplifiedLink[]
  ): boolean {
    return links.some(link => 
      link.source === parentId && link.target === childId
    );
  }
  
  /**
   * Compte le nombre d'enfants directs d'un nœud
   * Utile pour l'UX (savoir s'il y a des sous-niveaux à explorer)
   */
  static countDirectChildren(
    parentId: string,
    links: SimplifiedLink[]
  ): number {
    return links.filter(link => link.source === parentId).length;
  }
  
  /**
   * Adaptation UX: Détermine si un nœud peut être exploré
   * (a des enfants directs)
   */
  static canBeExplored(
    nodeId: string,
    links: SimplifiedLink[]
  ): boolean {
    return this.countDirectChildren(nodeId, links) > 0;
  }

  private static normalizeLink(link: any): SimplifiedLink {
    return {
      source: typeof link.source === 'string' ? link.source : link.source.id,
      target: typeof link.target === 'string' ? link.target : link.target.id,
      value: link.value
    };
  }

  /**
   * Identifie les nœuds orphelins (ceux qui n'ont aucun parent).
   */
  private static identifyOrphans(allNodes: ExtendedNode[], allLinks: any[]): ExtendedNode[] {
    const normalizedLinks = allLinks.map(this.normalizeLink);
    const nodesWithParents = new Set(normalizedLinks.map(link => link.target));
    return allNodes.filter(node => !nodesWithParents.has(node.id));
  }
} 