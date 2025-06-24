/**
 * Service de calcul des parents directs selon la règle R3
 * R3: Pour un nœud X de niveau k > 0:
 *     - Parcours attributs niveau (k-1, k-2, ... 0)
 *     - Premier attribut non vide = parent direct
 *     - Les attributs entre parent et X doivent être vides
 *
 * EXTENSION: Support des convergences multiples
 */
import { HierarchyConfigType } from '../../typings/AdvancedSankeyV2Props';
export declare class ParentCalculationService {
    /**
     * R3: Recherche le parent direct d'un nœud selon sa configuration de niveau
     * 🔧 CORRECTION: Gère les trous hiérarchiques en cherchant le parent disponible le plus proche
     * 🔧 EXTENSION: Support des niveaux illimités (5, 6, 7...)
     */
    static findDirectParent(item: any, currentLevel: HierarchyConfigType, allLevels: HierarchyConfigType[]): {
        parentId: string;
        parentLevel: number;
    } | null;
    /**
     * NOUVEAU: Trouve TOUS les parents possibles (pour convergences)
     * Utile si les données Mendix contiennent plusieurs attributs parents renseignés
     * CORRECTION R3: Seul le parent le plus proche avec niveaux intermédiaires vides est valide
     */
    static findAllPossibleParents(item: any, levelConfig: HierarchyConfigType, allLevelConfigs: HierarchyConfigType[]): Array<{
        parentId: string;
        parentLevel: number;
        value: number;
    }>;
    /**
     * Récupère la valeur numérique d'un nœud
     */
    private static getNodeValue;
    /**
     * Valide si une structure supporte les convergences
     * Vérifie si un nœud a plusieurs parents renseignés
     */
    static hasConvergence(item: any, levelConfig: HierarchyConfigType, allLevelConfigs: HierarchyConfigType[]): boolean;
    /**
     * Récupère l'attribut Mendix parent pour un niveau donné
     * 🔧 EXTENSION: Support des niveaux illimités avec gestion dynamique
     */
    private static getMendixAttributeForLevel;
    /**
     * Récupère l'attribut parent pour un niveau donné
     * Adaptation de la logique existante avec les props actuelles
     */
    private static getParentAttributeForLevel;
    /**
     * Vérifie qu'une valeur n'est pas vide selon R3
     */
    private static isNonEmpty;
    /**
     * Vérifie que les niveaux intermédiaires sont vides (R3)
     * Condition importante : entre parent et enfant, tous les niveaux doivent être vides
     */
    private static areIntermediateLevelsEmpty;
    /**
     * Méthode utilitaire pour identifier les nœuds orphelins
     * Utile pour la gestion des nœuds virtuels
     */
    static isOrphan(item: any, levelConfig: HierarchyConfigType, allLevelConfigs: HierarchyConfigType[]): boolean;
}
//# sourceMappingURL=ParentCalculationService.d.ts.map