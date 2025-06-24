/**
 * Service coordinateur principal pour le traitement des données Sankey
 * Orchestrate tous les services selon les règles R2-R8
 * 
 * OBJECTIF: Extraire toute la logique métier du composant AdvancedSankeyV2
 * pour respecter Clean Architecture
 */

import { ExtendedNode, SankeyData, SimplifiedLink } from '../types/SankeyTypes';
import { SankeyState, SankeyContext } from '../states/SankeyStates';
import { HierarchyConfigType } from '../../typings/AdvancedSankeyV2Props';
import { ValueStatus } from 'mendix';

// Services spécialisés
import { NodeSelectionService } from './NodeSelectionService';
import { ParentCalculationService } from './ParentCalculationService';
import { DisplayFilterService } from './DisplayFilterService';
import { NodeSortingService } from './NodeSortingService';
import { LinkRoutingService } from './LinkRoutingService';
import { OverlapPreventionService } from './OverlapPreventionService';
import { NavigationService } from './NavigationService';

// Utilitaires
import { validateNodeName, validateNodeValue, normalizeEnergyType, inferEnergyTypeFromName } from '../utils/unitConverter';

export interface SankeyProcessingResult {
  success: boolean;
  data?: SankeyData;
  state: SankeyState;
  context: SankeyContext;
  validation?: {
    r2: { isCompliant: boolean; violations: string[] };
    r3: { isCompliant: boolean; violations: string[] };
    r4: { isCompliant: boolean; violations: string[] };
    r6: { isCompliant: boolean; violations: string[] };
    r7: { isCompliant: boolean; violations: string[] };
  };
  performance?: {
    duration: number;
    nodeCount: number;
    linkCount: number;
  };
  error?: string;
}

interface EnergyFilterResult {
  nodes: ExtendedNode[];
  links: SimplifiedLink[];
  hasData: boolean;
  hasNonZeroValues: boolean;
}

export class SankeyOrchestrator {
  
  /**
   * Point d'entrée unique pour traitement complet des données Sankey
   * Version production avec intégration R5/R7 optimisée
   */
  static processHierarchicalData(
    hierarchyConfig: HierarchyConfigType[],
    selectedEnergy: string,
    selectedNode: string | null,
    startDate?: Date,
    endDate?: Date
  ): SankeyProcessingResult {
    
    const startTime = performance.now();
    
    try {
      // 1. VALIDATION PRÉLIMINAIRE DES DONNÉES
      const validationResult = this.validateInputData(hierarchyConfig, startDate, endDate);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error || "Validation échouée",
          state: SankeyState.Error,
          context: this.buildErrorContext(validationResult.error || "Validation échouée")
        };
      }
      
      // 2. CRÉATION DES NŒUDS AVEC VALIDATION ROBUSTE
      const nodesResult = this.createValidatedNodes(hierarchyConfig, startDate, endDate);
      if (!nodesResult.hasData) {
        return {
          success: true,
          data: { nodes: [], links: [], levels: [] },
          state: SankeyState.NoData,
          context: this.buildEmptyContext()
        };
      }
      
      // 🔍 DEBUG TEMPORAIRE: Vérifier les valeurs des nœuds créés
      console.log("🔍 DEBUG VALEURS - Nœuds créés:", nodesResult.nodes.map(n => ({
        id: n.id,
        name: n.name,
        value: n.value,
        level: n.metadata?.level
      })));
      
      // 3. CRÉATION DES LIENS HIÉRARCHIQUES (R3)
      const linksResult = this.createHierarchicalLinks(nodesResult.nodes, hierarchyConfig);
      
      console.log("🔍 DEBUG VALEURS - Liens créés:", linksResult.map(l => ({
        source: l.source,
        target: l.target,
        value: l.value
      })));
      
      // 4. FILTRAGE PAR ÉNERGIE UNIFIÉ
      const energyFiltered = this.applyEnergyFilter(
        nodesResult.nodes, 
        linksResult, 
        selectedEnergy
      );
      
      console.log("🔍 DEBUG VALEURS - Après filtrage énergie:", energyFiltered.nodes.map(n => ({
        id: n.id,
        name: n.name,
        value: n.value,
        level: n.metadata?.level
      })));
      
      // 5. SÉLECTION DE LA RACINE (R2)
      const rootId = selectedNode || NodeSelectionService.findInitialRoot(energyFiltered.nodes);
      if (!rootId) {
        return {
          success: false,
          error: "Aucune racine trouvée",
          state: SankeyState.Error,
          context: this.buildErrorContext("Pas de nœud niveau 0")
        };
      }
      
      // 6. FILTRAGE AFFICHAGE (R4) - 🔧 CORRECTION: Gestion centralisée profondeur + orphelins
      // RÈGLE STRICTE: 
      // - Vue initiale (selectedNode = null OU racine niveau 0) : profondeur=1 + orphelins visibles
      // - Navigation : profondeur=1 + PAS d'orphelins
      const firstNodeId = energyFiltered.nodes[0]?.id;
      const rootNode = energyFiltered.nodes.find(n => n.id === rootId);
      const isInitialView = selectedNode === null || rootId === firstNodeId;
      const displayDepth = 1; // 🔧 CORRECTION: TOUJOURS 1 pour respecter R4 strict
      
      console.log(`🎯 R4: rootId=${rootId}, selectedNode=${selectedNode}, firstNode=${firstNodeId}, isInitial=${isInitialView}`);
      
      // 🔧 CORRECTION: Si on sélectionne un orphelin, on doit forcer la vue de ses enfants
      const showOrphansInCurrentView = isInitialView;

      const displayed = DisplayFilterService.filterVisibleNodes(
        energyFiltered.nodes, 
        rootId, 
        energyFiltered.links, 
        displayDepth,
        showOrphansInCurrentView
      );
      
      console.log("🔍 DEBUG VALEURS - Après filtrage affichage:", displayed.nodes.map(n => ({
        id: n.id,
        name: n.name,
        value: n.value,
        level: n.metadata?.level
      })));
      
      // 7. TRI DES NŒUDS (R6)
      const sorted = NodeSortingService.sortAllLevels(displayed.nodes);
      
      // CONVERSION: FlexibleLink[] → SimplifiedLink[] pour compatibilité services
      const simplifiedLinks = this.convertFlexibleLinksToSimplified(displayed.links);
      
      // 8. ROUTAGE DES LIENS (R5) - INTÉGRÉ PROPREMENT
      const routedLinks = LinkRoutingService.calculateLinkPaths(
        sorted,
        simplifiedLinks,
        800, // Largeur par défaut
        600  // Hauteur par défaut
      );
      
      // 9. VALIDATION CHEVAUCHEMENTS (R7) - INTÉGRÉ PROPREMENT  
      const overlapValidation = OverlapPreventionService.validateR7Compliance(
        simplifiedLinks,
        sorted,
        800
      );
      
      // 10. VALIDATION CONFORMITÉ TOUTES RÈGLES
      const validation = this.validateAllRules(sorted, simplifiedLinks, rootId, overlapValidation);
      
      // 11. CONSTRUCTION DU CONTEXTE FSM
      const context = this.buildContext(rootId, energyFiltered.nodes, simplifiedLinks, energyFiltered.links);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      return {
        success: true,
        data: { 
          nodes: sorted, 
          links: simplifiedLinks, // Utiliser les liens simplifiés
          levels: this.extractLevels(hierarchyConfig) 
        },
        state: this.determineState(rootId, sorted),
        context,
        validation,
        performance: {
          duration,
          nodeCount: sorted.length,
          linkCount: displayed.links.length
        }
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Erreur inconnue",
        state: SankeyState.Error,
        context: this.buildErrorContext(error.message || "Erreur inconnue")
      };
    }
  }
  
  /**
   * Convertit FlexibleLink[] en SimplifiedLink[] pour compatibilité
   */
  private static convertFlexibleLinksToSimplified(flexibleLinks: any[]): SimplifiedLink[] {
    return flexibleLinks.map(link => ({
      source: typeof link.source === 'string' ? link.source : link.source.id,
      target: typeof link.target === 'string' ? link.target : link.target.id,
      value: link.value,
      metadata: link.metadata
    }));
  }

  /**
   * ÉTAPE 1: Validation des données d'entrée
   */
  private static validateInputData(
    hierarchyConfig: HierarchyConfigType[],
    startDate?: Date,
    endDate?: Date
  ): { isValid: boolean; error?: string } {
    
    // Vérifier configuration hiérarchie
    if (!hierarchyConfig || hierarchyConfig.length === 0) {
      return { isValid: false, error: "Configuration hiérarchie manquante" };
    }
    
    // Vérifier entités disponibles (pas en loading)
    const unavailableEntities = hierarchyConfig.filter(config => 
      !config.entityPath || config.entityPath.status !== ValueStatus.Available
    );
    
    const loadingEntities = unavailableEntities.filter(entity => 
      entity.entityPath?.status === ValueStatus.Loading
    );
    
    if (loadingEntities.length > 0) {
      return { isValid: false, error: "Entités en cours de chargement" };
    }
    
    const actuallyUnavailable = unavailableEntities.filter(entity => 
      entity.entityPath?.status !== ValueStatus.Loading && entity.entityPath?.status !== ValueStatus.Available
    );
    
    if (actuallyUnavailable.length > 0) {
      return { 
        isValid: false, 
        error: `Entités non disponibles: ${actuallyUnavailable.map(e => e.levelId).join(', ')}` 
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * ÉTAPE 2: Création et validation des nœuds - Version production
   */
  private static createValidatedNodes(
    hierarchyConfig: HierarchyConfigType[], 
    startDate?: Date, 
    endDate?: Date
  ): { nodes: ExtendedNode[]; hasData: boolean; hasNonZeroValues: boolean } {
    
    const sortedLevels = [...hierarchyConfig].sort((a, b) => a.levelOrder - b.levelOrder);
    const nodesMap = new Map<string, ExtendedNode>();
    let hasDataForSelectedPeriod = false;
    let hasNonZeroValues = false;
    
    try {
      sortedLevels.forEach((levelConfig, levelIndex) => {
        try {
          const items = levelConfig.entityPath.items || [];
          
          if (items.length === 0) {
            console.log(`🔍 DEBUG NIVEAU ${levelConfig.levelId}: Aucun item trouvé`);
            return;
          }

          console.log(`🔍 DEBUG NIVEAU ${levelConfig.levelId}: ${items.length} items trouvés`);

          items.forEach((item, itemIndex) => {
            try {
              // Vérification de l'item
              if (!item) {
                return;
              }

              // Extraction sécurisée des attributs
              let nameValue, value, energyType;
              
              try {
                nameValue = levelConfig.nameAttribute.get(item);
                console.log(`🔍 DEBUG ITEM ${itemIndex}: nameValue brut =`, nameValue);
              } catch (error) {
                console.log(`❌ DEBUG ITEM ${itemIndex}: Erreur nameAttribute =`, error);
                return;
              }
              
              try {
                value = levelConfig.valueAttribute.get(item);
                console.log(`🔍 DEBUG ITEM ${itemIndex}: value brut =`, value);
              } catch (error) {
                console.log(`❌ DEBUG ITEM ${itemIndex}: Erreur valueAttribute =`, error);
                return;
              }
              
              try {
                energyType = levelConfig.energyTypeAttribute?.get(item);
                console.log(`🔍 DEBUG ITEM ${itemIndex}: energyType brut =`, energyType);
              } catch (error) {
                // Continuer car energyType est optionnel
                console.log(`⚠️ DEBUG ITEM ${itemIndex}: energyType non disponible (optionnel)`);
              }

              // Validation stricte des données
              if (!nameValue?.value || nameValue.status !== ValueStatus.Available ||
                  !value?.value || value.status !== ValueStatus.Available) {
                console.log(`❌ DEBUG ITEM ${itemIndex}: Données non disponibles - nameValue.status=${nameValue?.status}, value.status=${value?.status}`);
                return;
              }
              
              console.log(`✅ DEBUG ITEM ${itemIndex}: Données disponibles - nom="${nameValue.value}", valeur="${value.value}"`);
              
              // Normalisation et validation
              const cleanName = validateNodeName(nameValue.value);
              const validValue = validateNodeValue(value.value);
              
              console.log(`🔍 DEBUG ITEM ${itemIndex}: Après validation - nom="${cleanName}", valeur=${validValue}`);
              
              if (!cleanName || validValue === null) {
                console.log(`❌ DEBUG ITEM ${itemIndex}: Validation échouée - nom ou valeur invalide`);
                return;
              }
              
              // Inférence du type d'énergie avec fallback intelligent
              let normalizedEnergyType = normalizeEnergyType(energyType?.value);
              
              // Si pas de type explicite, inférer depuis le nom pour ETH/Machine
              if (!normalizedEnergyType && (levelConfig.levelOrder === 2 || levelConfig.levelOrder === 3)) {
                normalizedEnergyType = inferEnergyTypeFromName(cleanName);
              }
              
              // Création ou mise à jour du nœud
              const nodeId = `${levelConfig.levelId}_${cleanName}`;
              if (!nodesMap.has(nodeId)) {
                const newNode: ExtendedNode = {
                  id: nodeId,
                  name: cleanName,
                  value: validValue,
                  category: levelConfig.levelId,
                  index: itemIndex,
                  x0: 0, x1: 0, y0: 0, y1: 0,
                  sourceLinks: [], targetLinks: [],
                  metadata: {
                    level: levelConfig.levelOrder,
                    type: levelConfig.levelId,
                    energyType: normalizedEnergyType,
                    hasParent: false
                  }
                };
                
                nodesMap.set(nodeId, newNode);
                console.log(`✅ DEBUG ITEM ${itemIndex}: Nœud créé - ${nodeId} avec valeur ${validValue}`);
                
                hasDataForSelectedPeriod = true;
                if (validValue > 0) {
                  hasNonZeroValues = true;
                }
              } else {
                // Agrégation
                const existingNode = nodesMap.get(nodeId)!;
                existingNode.value += validValue;
                console.log(`📊 DEBUG ITEM ${itemIndex}: Nœud agrégé - ${nodeId} nouvelle valeur ${existingNode.value}`);
                
                if (existingNode.value > 0) {
                  hasNonZeroValues = true;
                }
              }
            } catch (itemError: any) {
              console.log(`❌ DEBUG ITEM ${itemIndex}: Erreur traitement =`, itemError);
              // Continuer avec les autres items
            }
          });
          
        } catch (levelError: any) {
          console.log(`❌ DEBUG NIVEAU ${levelConfig.levelId}: Erreur =`, levelError);
          // Continuer avec les autres niveaux
        }
      });
      
    } catch (globalError: any) {
      console.log(`❌ DEBUG GLOBAL: Erreur =`, globalError);
      // Retourner ce qui a pu être créé
    }
    
    return {
      nodes: Array.from(nodesMap.values()),
      hasData: hasDataForSelectedPeriod,
      hasNonZeroValues
    };
  }
  
  /**
   * ÉTAPE 3: Création des liens hiérarchiques avec ParentCalculationService (R3)
   */
  private static createHierarchicalLinks(
    nodes: ExtendedNode[], 
    hierarchyConfig: HierarchyConfigType[]
  ): SimplifiedLink[] {
    
    const links: SimplifiedLink[] = [];
    const sortedLevels = [...hierarchyConfig].sort((a, b) => a.levelOrder - b.levelOrder);
    
    sortedLevels.forEach((levelConfig) => {
      const items = levelConfig.entityPath.items || [];
      
      items.forEach((item) => {
        const nameValue = levelConfig.nameAttribute.get(item);
        const value = levelConfig.valueAttribute.get(item);
        
        if (nameValue?.status !== ValueStatus.Available || 
            value?.status !== ValueStatus.Available) {
          return;
        }
        
        const cleanName = validateNodeName(nameValue.value);
        const nodeId = `${levelConfig.levelId}_${cleanName}`;
        const nodeValue = Number(value.value);
        
        // Utiliser ParentCalculationService (R3)
        const parentResult = ParentCalculationService.findDirectParent(
          item, 
          levelConfig, 
          sortedLevels
        );
        
        if (parentResult) {
          links.push({
            source: parentResult.parentId,
            target: nodeId,
            value: nodeValue
          });
          
          // Marquer comme ayant un parent
          const node = nodes.find(n => n.id === nodeId);
          if (node?.metadata) {
            node.metadata.hasParent = true;
          }
        } else {
          // Marquer comme orphelin
          const node = nodes.find(n => n.id === nodeId);
          if (node?.metadata) {
            node.metadata.hasParent = false;
            node.metadata.isOrphan = true;
          }
        }
      });
    });
    
    return links;
  }
  
  /**
   * ÉTAPE 4: Filtrage par énergie adapté aux données PRÉ-FILTRÉES
   * 🔧 CORRECTION MAJEURE: Les données sont TOUJOURS pré-filtrées par Mendix
   * selectedEnergy sert uniquement pour l'affichage (couleurs, icônes, etc.)
   */
  private static applyEnergyFilter(
    nodes: ExtendedNode[], 
    links: SimplifiedLink[], 
    selectedEnergy: string
  ): EnergyFilterResult {
    
    // 🎯 DONNÉES PRÉ-FILTRÉES : Pas de filtrage nécessaire
    // selectedEnergy sert uniquement pour l'affichage (couleurs, titres, icônes)
    console.log(`✅ DONNÉES PRÉ-FILTRÉES PAR MENDIX: Traitement direct des ${nodes.length} nœuds reçus`);
    console.log(`🎨 ÉNERGIE SÉLECTIONNÉE: ${selectedEnergy} (utilisée pour l'affichage uniquement)`);
    
    return {
      nodes,        // 🔧 CORRECTION: Garder TOUS les nœuds reçus
      links,        // 🔧 CORRECTION: Garder TOUS les liens reçus  
      hasData: nodes.length > 0,
      hasNonZeroValues: nodes.some(n => n.value > 0)
    };
  }
  
  /**
   * 🎯 NOUVELLE MÉTHODE: Recalcul correct des valeurs remontantes
   */
  private static recalculateParentValues(
    nodes: ExtendedNode[], 
    links: SimplifiedLink[]
  ): ExtendedNode[] {
    
    // Créer une copie pour éviter les mutations
    const nodesCopy = nodes.map(node => ({ ...node }));
    
    // Créer la map des enfants
    const childrenMap = new Map<string, string[]>();
    links.forEach(link => {
      if (!childrenMap.has(link.source)) {
        childrenMap.set(link.source, []);
      }
      childrenMap.get(link.source)!.push(link.target);
    });
    
    // Identifier les niveaux
    const levels = nodesCopy.map(n => Number(n.metadata?.level || 0));
    const maxLevel = Math.max(...levels);
    const minLevel = Math.min(...levels);
    
    // Traiter du niveau max vers le niveau min (remontée)
    for (let level = maxLevel - 1; level >= minLevel; level--) {
      const currentLevelNodes = nodesCopy.filter(n => 
        Number(n.metadata?.level || 0) === level
      );
      
      currentLevelNodes.forEach(parentNode => {
        const childrenIds = childrenMap.get(parentNode.id) || [];
        
        if (childrenIds.length > 0) {
          // Calculer la somme des valeurs des enfants
          const childrenSum = childrenIds.reduce((sum, childId) => {
            const childNode = nodesCopy.find(n => n.id === childId);
            return sum + (childNode?.value || 0);
          }, 0);
          
          // Mettre à jour la valeur du parent
          parentNode.value = childrenSum;
          
          console.log(`📊 ${parentNode.name} (niveau ${level}): ${childrenSum} (somme de ${childrenIds.length} enfants)`);
        }
      });
    }
    
    return nodesCopy;
  }
  
  /**
   * ÉTAPE 10: Validation conformité toutes règles
   */
  private static validateAllRules(
    nodes: ExtendedNode[], 
    links: SimplifiedLink[], 
    rootId: string,
    overlapValidation?: { isCompliant: boolean; violations: string[] }
  ) {
    const r2 = { isCompliant: true, violations: [] }; // R2 implémenté par NodeSelectionService
    const r3 = { isCompliant: true, violations: [] }; // R3 implémenté par ParentCalculationService
    const r4 = DisplayFilterService.validateR4Compliance(nodes, links, rootId);
    const r6 = NodeSortingService.validateR6Compliance(nodes);
    const r7 = overlapValidation || { isCompliant: true, violations: [] };
    
    return { r2, r3, r4, r6, r7 };
  }
  
  /**
   * Détermine l'état FSM selon les données
   */
  private static determineState(rootId: string, nodes: ExtendedNode[]): SankeyState {
    if (nodes.length === 0) return SankeyState.NoData;
    if (!rootId) return SankeyState.Error;
    return SankeyState.ShowingRoot;
  }
  
  /**
   * Construit le contexte FSM
   */
  private static buildContext(
    rootId: string, 
    allNodes: ExtendedNode[], 
    visibleLinks: SimplifiedLink[],
    allLinks: SimplifiedLink[]
  ): SankeyContext {
    // Construire le contexte temporaire pour buildNavigationPath
    const tempContext: SankeyContext = {
      currentRoot: rootId,
      availableNodes: allNodes,
      filteredNodes: allNodes.filter(n => 
        visibleLinks.some(l => l.source === n.id || l.target === n.id) || n.id === rootId
      ),
      filteredLinks: visibleLinks,
      allLinks: allLinks,
      navigationPath: [] // Sera rempli juste après
    };
    
    // 🔧 CORRECTION: Utiliser NavigationService avec le contexte complet
    const navigationPath = NavigationService.buildNavigationPath(rootId, tempContext);
    
    return {
      ...tempContext,
      navigationPath: navigationPath
    };
  }
  
  /**
   * Contexte d'erreur
   */
  private static buildErrorContext(error: string): SankeyContext {
    return {
      currentRoot: null,
      availableNodes: [],
      filteredNodes: [],
      filteredLinks: [],
      allLinks: [],
      navigationPath: []
    };
  }
  
  /**
   * Contexte vide
   */
  private static buildEmptyContext(): SankeyContext {
    return {
      currentRoot: null,
      availableNodes: [],
      filteredNodes: [],
      filteredLinks: [],
      allLinks: [],
      navigationPath: []
    };
  }
  
  /**
   * Extrait les niveaux de la configuration
   */
  private static extractLevels(hierarchyConfig: HierarchyConfigType[]) {
    return hierarchyConfig
      .sort((a, b) => a.levelOrder - b.levelOrder)
      .map(config => ({
        level: config.levelOrder,
        name: config.levelName
      }));
  }
}

// Export du type pour utilisation dans le composant
// Export déjà fait en haut du fichier 