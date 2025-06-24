/**
 * Service de tri des nœuds selon la règle R6
 * R6: Dans une même colonne, tri par poids descendant (ou alphabétique si poids = 0)
 */
import { ExtendedNode } from '../types/SankeyTypes';
export declare class NodeSortingService {
    /**
     * R6: Trie les nœuds dans une colonne par poids descendant, puis alphabétique
     * Remplace l'algorithme D3 par notre logique métier
     */
    static sortNodesInColumn(nodes: ExtendedNode[]): ExtendedNode[];
    /**
     * Applique le tri R6 à tous les niveaux de la hiérarchie
     * Adaptation pour respecter la structure par colonnes du Sankey
     */
    static sortAllLevels(nodes: ExtendedNode[]): ExtendedNode[];
    /**
     * Tri spécialisé pour optimiser l'affichage Sankey
     * Garde les nœuds importants en haut pour réduire les croisements
     */
    static sortForOptimalDisplay(nodes: ExtendedNode[]): ExtendedNode[];
    /**
     * Valide que le tri respecte R6
     * Outil de debug pour s'assurer de la conformité
     */
    static validateR6Compliance(nodes: ExtendedNode[]): {
        isCompliant: boolean;
        violations: string[];
    };
    /**
     * Utilitaire pour afficher l'ordre des nœuds (debug)
     */
    static logNodeOrder(nodes: ExtendedNode[], label?: string): void;
}
//# sourceMappingURL=NodeSortingService.d.ts.map