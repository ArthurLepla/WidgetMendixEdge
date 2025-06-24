/**
 * Service de prévention des chevauchements selon la règle R7
 * R7: Aucun chevauchement de liens ne doit dépasser 3% de la largeur totale
 */
import { ExtendedNode, SimplifiedLink } from '../types/SankeyTypes';
export declare class OverlapPreventionService {
    /**
     * R7: Analyse et corrige les chevauchements de liens
     * Vérifie que les chevauchements ne dépassent pas 3% de la largeur
     */
    static preventOverlaps(links: SimplifiedLink[], nodes: ExtendedNode[], containerWidth: number, linkPaths?: Map<string, string>): {
        adjustedLinks: SimplifiedLink[];
        violations: string[];
        maxOverlapPercentage: number;
    };
    /**
     * Calcule la géométrie de chaque lien pour analyse des chevauchements
     */
    private static calculateLinkGeometries;
    /**
     * Approximation du chemin d'un lien pour calcul des chevauchements
     */
    private static approximateLinkPath;
    /**
     * Détecte les chevauchements entre liens
     */
    private static detectOverlaps;
    /**
     * Calcule le chevauchement entre deux liens
     */
    private static calculateLinkOverlap;
    /**
     * Ajuste la position des liens pour réduire les chevauchements
     */
    private static adjustLinksToReduceOverlap;
    /**
     * Valide que la configuration respecte R7
     */
    static validateR7Compliance(links: SimplifiedLink[], nodes: ExtendedNode[], containerWidth: number): {
        isCompliant: boolean;
        violations: string[];
        maxOverlapPercentage: number;
        analysis: {
            totalLinks: number;
            overlappingPairs: number;
            maxOverlapPx: number;
        };
    };
}
//# sourceMappingURL=OverlapPreventionService.d.ts.map