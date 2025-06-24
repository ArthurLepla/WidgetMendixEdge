/**
 * Service de routage des liens selon la règle R5
 * R5: Contrôle explicite du routage avec espacement minimal de 8px entre liens parallèles
 */
import { ExtendedNode, SimplifiedLink } from '../types/SankeyTypes';
export declare class LinkRoutingService {
    /**
     * R5: Calcule les chemins des liens avec espacement minimal 8px
     * Remplace le routage automatique D3 par un contrôle explicite
     */
    static calculateLinkPaths(nodes: ExtendedNode[], links: SimplifiedLink[], containerWidth: number, containerHeight: number): {
        paths: Map<string, string>;
        widths: Map<string, number>;
    };
    /**
     * Groupe les liens par niveau source pour traitement séquentiel
     */
    private static groupLinksBySourceLevel;
    /**
     * Trie les liens pour un routage optimal (minimise les croisements)
     */
    private static sortLinksForOptimalRouting;
    /**
     * Calcule le chemin d'un lien unique avec gestion des espacements R5
     */
    private static calculateSingleLinkPath;
    /**
     * R5: Trouve une position Y optimale respectant l'espacement 8px minimal
     */
    private static findOptimalYPosition;
    /**
     * Crée un chemin SVG courbé pour une apparence professionnelle
     */
    private static createCurvedPath;
    /**
     * Crée un chemin SVG droit (fallback)
     */
    private static createStraightPath;
    /**
     * Valide que le routage respecte R5
     */
    static validateR5Compliance(linkPaths: Map<string, string>, links: SimplifiedLink[]): {
        isCompliant: boolean;
        violations: string[];
    };
}
//# sourceMappingURL=LinkRoutingService.d.ts.map