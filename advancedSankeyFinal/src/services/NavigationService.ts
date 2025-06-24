/**
 * Service de navigation pour les diagrammes Sankey
 * Centralise la logique de navigation, breadcrumbs et clics sur nœuds
 */

import { ValueStatus } from "mendix";
import { BaseNode } from "../types/SankeyTypes";
import { SankeyContext } from "../states/SankeyStates";
import { NodeSelectionService } from "./NodeSelectionService";
import { DisplayFilterService } from "./DisplayFilterService";

export interface NavigationPath {
  id: string;
  name: string;
  isRoot?: boolean;
  isParent?: boolean;
  isCurrent?: boolean;
}

export class NavigationService {

  /**
   * Gère le clic sur un nœud. La logique est unifiée :
   * - Si le nœud a des enfants, on navigue vers lui.
   * - Si c'est un nœud terminal, on exécute seulement l'action Mendix sans naviguer.
   */
  static handleNodeClick(
    clickedNode: BaseNode,
    currentSelectedNode: string | null,
    sankeyContext: SankeyContext,
    setSelectedNode: (nodeId: string | null) => void,
    props: any
  ): void {
    
    // 1. Gérer le clic sur le nœud déjà sélectionné (navigation vers le haut)
    if (currentSelectedNode === clickedNode.id) {
      console.log(`🖱️ NAVIGATION: Clic sur le nœud actuel → Navigation vers le haut.`);
      this.navigateUp(currentSelectedNode, sankeyContext, setSelectedNode);
      return;
    }

    // 2. Gérer le clic sur tout autre nœud
    const hasChildren = this.hasChildren(clickedNode.id, sankeyContext);
    const nodeInContext = sankeyContext.availableNodes.find(n => n.id === clickedNode.id);
    const nodeLevel = nodeInContext?.metadata?.level ?? 0;

    console.log(`🖱️ NAVIGATION: Clic sur "${clickedNode.name}" (niveau ${nodeLevel}). A-t-il des enfants? -> ${hasChildren}`);

    if (hasChildren) {
      // Ce nœud a des enfants, on navigue vers lui
      console.log(`✅ NAVIGATION: Navigation vers "${clickedNode.name}".`);
      setSelectedNode(clickedNode.id);
      this.executeMendixActions(clickedNode, props);
    } else {
      // C'est un nœud terminal, on exécute seulement l'action Mendix, sans naviguer.
      console.log(`❌ NAVIGATION: Nœud terminal. Exécution de l'action pour "${clickedNode.name}".`);
      this.executeMendixActions(clickedNode, props);
    }
  }

  /**
   * Construit le chemin de navigation (breadcrumbs)
   */
  static buildNavigationPath(
    selectedNode: string | null,
    sankeyContext: SankeyContext
  ): NavigationPath[] {
    
    const path: NavigationPath[] = [];
    
    // Toujours commencer par la racine initiale
    const initialRoot = NodeSelectionService.findInitialRoot(sankeyContext.availableNodes);
    if (initialRoot) {
      const rootNode = sankeyContext.availableNodes.find(n => n.id === initialRoot);
      if (rootNode) {
        path.push({ 
          id: rootNode.id, 
          name: rootNode.name, 
          isRoot: true 
        });
      }
    }
    
    // 🔧 CORRECTION: Utiliser allLinks pour la navigation remontante
    const navigationUp = selectedNode ? DisplayFilterService.canNavigateUp(
      selectedNode, 
      sankeyContext.availableNodes, 
      sankeyContext.allLinks // ✅ Utiliser TOUS les liens
    ) : { canNavigateUp: false };
    
    if (navigationUp.canNavigateUp && navigationUp.parentId !== initialRoot) {
      path.push({ 
        id: navigationUp.parentId!, 
        name: navigationUp.parentName!, 
        isParent: true 
      });
    }
    
    // Ajouter le nœud actuel s'il n'est pas la racine
    if (selectedNode && selectedNode !== initialRoot) {
      const currentNode = sankeyContext.availableNodes.find(n => n.id === selectedNode);
      if (currentNode && !path.some(p => p.id === currentNode.id)) {
        path.push({ 
          id: currentNode.id, 
          name: currentNode.name, 
          isCurrent: true 
        });
      }
    }
    
    return path;
  }

  /**
   * Calcule le niveau de navigation actuel
   */
  static getCurrentNavigationLevel(navigationPath: NavigationPath[]): number {
    return Math.max(0, navigationPath.length - 1);
  }

  /**
   * Vérifie si on peut naviguer vers le haut depuis le nœud actuel
   */
  static canNavigateUp(
    selectedNode: string | null,
    sankeyContext: SankeyContext
  ): boolean {
    
    if (!selectedNode) return false;
    
    // 🔧 CORRECTION: Utiliser allLinks pour la navigation remontante
    const navigationUp = DisplayFilterService.canNavigateUp(
      selectedNode, 
      sankeyContext.availableNodes, 
      sankeyContext.allLinks // ✅ Utiliser TOUS les liens
    );
    
    return navigationUp.canNavigateUp;
  }

  // === MÉTHODES PRIVÉES ===

  private static navigateUp(
    selectedNode: string,
    sankeyContext: SankeyContext,
    setSelectedNode: (nodeId: string | null) => void
  ): void {
    
    // 🔧 CORRECTION: Utiliser allLinks pour trouver le parent
    const parentLink = sankeyContext.availableNodes.find(n => {
      return sankeyContext.allLinks.some(link => { // ✅ Utiliser TOUS les liens
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        return targetId === selectedNode && sourceId === n.id;
      });
    });
    
    if (parentLink) {
      setSelectedNode(parentLink.id);
    } else {
      // Retour à la racine initiale
      const initialRoot = NodeSelectionService.findInitialRoot(sankeyContext.availableNodes);
      setSelectedNode(initialRoot);
    }
  }

  private static hasChildren(
    nodeId: string,
    sankeyContext: SankeyContext
  ): boolean {
    
    // 🔧 CORRECTION: Utiliser TOUS les liens, pas seulement ceux de la vue actuelle
    const hasChildrenInAllLinks = sankeyContext.allLinks.some(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      return sourceId === nodeId;
    });
    
    console.log(`🖱️ DEBUG: ${nodeId} → hasChildren dans allLinks: ${hasChildrenInAllLinks}`);
    console.log(`🖱️ DEBUG: allLinks count: ${sankeyContext.allLinks.length}, filteredLinks count: ${sankeyContext.filteredLinks.length}`);
    
    return hasChildrenInAllLinks;
  }

  private static executeMendixActions(
    node: BaseNode,
    props: any
  ): void {
    
    const levelConfig = props.hierarchyConfig?.find(
      (config: any) => config.levelId === node.category
    );

    if (levelConfig?.levelClickedItemAttribute?.status === ValueStatus.Available) {
      levelConfig.levelClickedItemAttribute.setValue(node.name);
    }
    
    if (levelConfig?.levelOnItemClick?.canExecute) {
      levelConfig.levelOnItemClick.execute();
    }
  }
} 