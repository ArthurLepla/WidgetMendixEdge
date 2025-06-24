/**
 * Service coordinateur principal pour le traitement des données Sankey
 * Orchestrate tous les services selon les règles R2-R8
 *
 * OBJECTIF: Extraire toute la logique métier du composant AdvancedSankeyV2
 * pour respecter Clean Architecture
 */
import { SankeyData } from '../types/SankeyTypes';
import { SankeyState, SankeyContext } from '../states/SankeyStates';
import { HierarchyConfigType } from '../../typings/AdvancedSankeyV2Props';
export interface SankeyProcessingResult {
    success: boolean;
    data?: SankeyData;
    state: SankeyState;
    context: SankeyContext;
    validation?: {
        r2: {
            isCompliant: boolean;
            violations: string[];
        };
        r3: {
            isCompliant: boolean;
            violations: string[];
        };
        r4: {
            isCompliant: boolean;
            violations: string[];
        };
        r6: {
            isCompliant: boolean;
            violations: string[];
        };
        r7: {
            isCompliant: boolean;
            violations: string[];
        };
    };
    performance?: {
        duration: number;
        nodeCount: number;
        linkCount: number;
    };
    error?: string;
}
export declare class SankeyOrchestrator {
    /**
     * Point d'entrée unique pour traitement complet des données Sankey
     * Version production avec intégration R5/R7 optimisée
     */
    static processHierarchicalData(hierarchyConfig: HierarchyConfigType[], selectedEnergy: string, selectedNode: string | null, startDate?: Date, endDate?: Date): SankeyProcessingResult;
    /**
     * Convertit FlexibleLink[] en SimplifiedLink[] pour compatibilité
     */
    private static convertFlexibleLinksToSimplified;
    /**
     * ÉTAPE 1: Validation des données d'entrée
     */
    private static validateInputData;
    /**
     * ÉTAPE 2: Création et validation des nœuds - Version production
     */
    private static createValidatedNodes;
    /**
     * ÉTAPE 3: Création des liens hiérarchiques avec ParentCalculationService (R3)
     */
    private static createHierarchicalLinks;
    /**
     * ÉTAPE 4: Filtrage par énergie adapté aux données PRÉ-FILTRÉES
     * 🔧 CORRECTION MAJEURE: Les données sont TOUJOURS pré-filtrées par Mendix
     * selectedEnergy sert uniquement pour l'affichage (couleurs, icônes, etc.)
     */
    private static applyEnergyFilter;
    /**
     * 🎯 NOUVELLE MÉTHODE: Recalcul correct des valeurs remontantes
     */
    private static recalculateParentValues;
    /**
     * ÉTAPE 10: Validation conformité toutes règles
     */
    private static validateAllRules;
    /**
     * Détermine l'état FSM selon les données
     */
    private static determineState;
    /**
     * Construit le contexte FSM
     */
    private static buildContext;
    /**
     * Contexte d'erreur
     */
    private static buildErrorContext;
    /**
     * Contexte vide
     */
    private static buildEmptyContext;
    /**
     * Extrait les niveaux de la configuration
     */
    private static extractLevels;
}
//# sourceMappingURL=SankeyOrchestrator.d.ts.map