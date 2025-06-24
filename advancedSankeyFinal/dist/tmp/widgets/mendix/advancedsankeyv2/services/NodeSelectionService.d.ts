/**
 * Service de sélection des nœuds selon la règle R2
 * R2: Au chargement, racine = nœud avec index le plus bas au niveau 0
 *     Au clic, ce nœud devient la nouvelle racine
 */
import { ExtendedNode } from '../types/SankeyTypes';
export declare class NodeSelectionService {
    /**
     * R2: Trouve la racine initiale = nœud avec index le plus bas au niveau 0
     */
    static findInitialRoot(nodes: ExtendedNode[]): string | null;
    /**
     * R2: Au clic, le nœud devient la nouvelle racine
     * Adaptation UX: on garde la logique de navigation existante mais l'adapte à R2
     */
    static setNewRoot(nodeId: string, nodes: ExtendedNode[]): string;
    /**
     * Adaptation UX: Vérifie si un nœud peut devenir racine
     * Compatible avec l'UX actuelle mais respecte R2
     */
    static canBecomeRoot(node: ExtendedNode): boolean;
    /**
     * Construit le chemin de navigation pour les breadcrumbs
     * Adaptation de la logique existante
     */
    static buildNavigationPath(currentRoot: string, nodes: ExtendedNode[], links: any[]): Array<{
        id: string;
        name: string;
    }>;
}
//# sourceMappingURL=NodeSelectionService.d.ts.map