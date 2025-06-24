/**
 * Service de filtrage d'affichage selon la règle R4 AMÉLIORÉE
 * R4: Affichage intelligent selon le contexte :
 *     - Si racine a un parent : parent + racine + enfants directs
 *     - Sinon : racine + enfants directs uniquement
 *     - Les nœuds à valeur 0 restent visibles (R8)
 */
import { ExtendedNode, SimplifiedLink } from '../types/SankeyTypes';
interface FlexibleLink {
    source: string | {
        id: string;
    };
    target: string | {
        id: string;
    };
    value: number;
    metadata?: {
        sourceLevel?: string | number;
        targetLevel?: string | number;
        isDirectLink?: boolean;
        skipLevels?: boolean;
    };
}
export declare class DisplayFilterService {
    /**
     * R4: Filtre les nœuds visibles selon les règles strictes
     * CORRECTION MAJEURE: Orphelins seulement au démarrage + gestion profondeur centralisée
     */
    static filterVisibleNodes(allNodes: ExtendedNode[], rootId: string, allLinks: FlexibleLink[], showDepth?: number, // 🔧 CORRECTION: Profondeur par défaut = 1 pour respecter R4
    isInitialView?: boolean): {
        nodes: ExtendedNode[];
        links: FlexibleLink[];
    };
    /**
     * Vérifie si un nœud peut naviguer vers son parent
     */
    static canNavigateUp(currentRootId: string, allNodes: ExtendedNode[], allLinks: FlexibleLink[]): {
        canNavigateUp: boolean;
        parentId?: string;
        parentName?: string;
    };
    /**
     * R4: Validation de la conformité (mise à jour pour inclure orphelins)
     */
    static validateR4Compliance(visibleNodes: ExtendedNode[], visibleLinks: FlexibleLink[], selectedRootId: string): {
        isCompliant: boolean;
        violations: string[];
    };
    /**
     * 🔧 NOUVELLE MÉTHODE: Trouve tous les nœuds connectés à une racine
     * Utilise un parcours en largeur pour déterminer la connectivité réelle
     */
    static findAllConnectedNodes(rootId: string, allNodes: ExtendedNode[], allLinks: FlexibleLink[]): Set<string>;
    /**
     * Vérifie si un nœud est un enfant direct d'un autre
     * Utile pour la validation R4
     */
    static isDirectChild(childId: string, parentId: string, links: SimplifiedLink[]): boolean;
    /**
     * Compte le nombre d'enfants directs d'un nœud
     * Utile pour l'UX (savoir s'il y a des sous-niveaux à explorer)
     */
    static countDirectChildren(parentId: string, links: SimplifiedLink[]): number;
    /**
     * Adaptation UX: Détermine si un nœud peut être exploré
     * (a des enfants directs)
     */
    static canBeExplored(nodeId: string, links: SimplifiedLink[]): boolean;
    private static normalizeLink;
    /**
     * Identifie les nœuds orphelins (ceux qui n'ont aucun parent).
     */
    private static identifyOrphans;
}
export {};
//# sourceMappingURL=DisplayFilterService.d.ts.map