/**
 * Service de navigation pour les diagrammes Sankey
 * Centralise la logique de navigation, breadcrumbs et clics sur nœuds
 */
import { BaseNode } from "../types/SankeyTypes";
import { SankeyContext } from "../states/SankeyStates";
export interface NavigationPath {
    id: string;
    name: string;
    isRoot?: boolean;
    isParent?: boolean;
    isCurrent?: boolean;
}
export declare class NavigationService {
    /**
     * Gère le clic sur un nœud. La logique est unifiée :
     * - Si le nœud a des enfants, on navigue vers lui.
     * - Si c'est un nœud terminal, on exécute seulement l'action Mendix sans naviguer.
     */
    static handleNodeClick(clickedNode: BaseNode, currentSelectedNode: string | null, sankeyContext: SankeyContext, setSelectedNode: (nodeId: string | null) => void, props: any): void;
    /**
     * Construit le chemin de navigation (breadcrumbs)
     */
    static buildNavigationPath(selectedNode: string | null, sankeyContext: SankeyContext): NavigationPath[];
    /**
     * Calcule le niveau de navigation actuel
     */
    static getCurrentNavigationLevel(navigationPath: NavigationPath[]): number;
    /**
     * Vérifie si on peut naviguer vers le haut depuis le nœud actuel
     */
    static canNavigateUp(selectedNode: string | null, sankeyContext: SankeyContext): boolean;
    private static navigateUp;
    private static hasChildren;
    private static executeMendixActions;
}
//# sourceMappingURL=NavigationService.d.ts.map