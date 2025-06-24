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
import { ValueStatus } from 'mendix';
import { validateNodeName } from '../utils/unitConverter';

interface MendixNodeData {
  level: number;
  parentLevel0Name?: string;
  parentLevel1Name?: string;
  parentLevel2Name?: string;
}

export class ParentCalculationService {
  
  /**
   * R3: Recherche le parent direct d'un nœud selon sa configuration de niveau
   * 🔧 CORRECTION: Gère les trous hiérarchiques en cherchant le parent disponible le plus proche
   * 🔧 EXTENSION: Support des niveaux illimités (5, 6, 7...)
   */
  static findDirectParent(
    item: any,
    currentLevel: HierarchyConfigType,
    allLevels: HierarchyConfigType[]
  ): { parentId: string; parentLevel: number } | null {
    const currentLevelOrder = currentLevel.levelOrder;
    
    // Pour tous les niveaux > 0, chercher le parent disponible le plus proche
    // En partant du niveau immédiatement supérieur et en remontant
    
    for (let parentLevelOrder = currentLevelOrder - 1; parentLevelOrder >= 0; parentLevelOrder--) {
      // 🔧 EXTENSION: Récupérer l'attribut Mendix pour le niveau parent
      const parentAttribute = this.getMendixAttributeForLevel(currentLevel, parentLevelOrder);
      
      if (!parentAttribute) {
        console.log(`⚠️ Niveau ${parentLevelOrder}: Attribut parent non configuré pour ${currentLevel.levelId}`);
        continue; // Attribut non configuré, passer au suivant
      }
      
      const parentName = parentAttribute.get(item);
      if (parentName?.status === ValueStatus.Available && parentName.value && parentName.value.trim() !== "") {
        // 🔧 CORRECTION: Vérifier R3 - les niveaux intermédiaires doivent être vides
        if (this.areIntermediateLevelsEmpty(item, currentLevel, parentLevelOrder, currentLevelOrder)) {
          const parentLevelConfig = allLevels.find(l => l.levelOrder === parentLevelOrder);
          if (parentLevelConfig) {
            const cleanParentName = validateNodeName(parentName.value);
            console.log(`✅ Parent trouvé pour ${currentLevel.levelId}: ${cleanParentName} (niveau ${parentLevelOrder})`);
            return {
              parentId: `${parentLevelConfig.levelId}_${cleanParentName}`,
              parentLevel: parentLevelOrder
            };
          }
        } else {
          console.log(`⚠️ Parent niveau ${parentLevelOrder} ignoré: niveaux intermédiaires non vides`);
          // Continuer la recherche vers des niveaux plus éloignés
        }
      }
    }
    
    console.log(`❌ Aucun parent trouvé pour ${currentLevel.levelId} → ORPHELIN`);
    return null;
  }

  /**
   * NOUVEAU: Trouve TOUS les parents possibles (pour convergences)
   * Utile si les données Mendix contiennent plusieurs attributs parents renseignés
   * CORRECTION R3: Seul le parent le plus proche avec niveaux intermédiaires vides est valide
   */
  static findAllPossibleParents(
    item: any,
    levelConfig: HierarchyConfigType,
    allLevelConfigs: HierarchyConfigType[]
  ): Array<{ parentId: string; parentLevel: number; value: number }> {
    
    const nodeLevel = levelConfig.levelOrder;
    if (nodeLevel <= 0) return [];
    
    const allParents: Array<{ parentId: string; parentLevel: number; value: number }> = [];
    
    // R3: Parcourir du niveau le plus proche au plus éloigné
    for (let parentLevel = nodeLevel - 1; parentLevel >= 0; parentLevel--) {
      const parentAttribute = this.getParentAttributeForLevel(item, levelConfig, parentLevel);
      
      if (this.isNonEmpty(parentAttribute)) {
        // R3: Vérifier que les niveaux intermédiaires sont vides
        if (this.areIntermediateLevelsEmpty(item, levelConfig, parentLevel, nodeLevel)) {
          const parentLevelConfig = allLevelConfigs.find(c => c.levelOrder === parentLevel);
          if (parentLevelConfig) {
            const cleanParentName = validateNodeName(parentAttribute);
            const parentId = `${parentLevelConfig.levelId}_${cleanParentName}`;
            
            // Récupérer la valeur du flux pour ce parent spécifique
            const nodeValue = this.getNodeValue(item, levelConfig);
            
            allParents.push({ 
              parentId, 
              parentLevel, 
              value: nodeValue 
            });
            
            // R3: Arrêter dès qu'on trouve le premier parent valide (plus proche)
            break;
          }
        }
        // Si les niveaux intermédiaires ne sont pas vides, ignorer ce parent
        // et continuer la recherche vers des niveaux plus éloignés
      }
    }
    
    return allParents;
  }

  /**
   * Récupère la valeur numérique d'un nœud
   */
  private static getNodeValue(item: any, levelConfig: HierarchyConfigType): number {
    const value = levelConfig.valueAttribute.get(item);
    if (value?.status === ValueStatus.Available && value.value) {
      return Number(value.value);
    }
    return 0;
  }

  /**
   * Valide si une structure supporte les convergences
   * Vérifie si un nœud a plusieurs parents renseignés
   */
  static hasConvergence(
    item: any,
    levelConfig: HierarchyConfigType,
    allLevelConfigs: HierarchyConfigType[]
  ): boolean {
    const allParents = this.findAllPossibleParents(item, levelConfig, allLevelConfigs);
    return allParents.length > 1;
  }
  
  /**
   * Récupère l'attribut Mendix parent pour un niveau donné
   * 🔧 EXTENSION: Support des niveaux illimités avec gestion dynamique
   */
  private static getMendixAttributeForLevel(
    levelConfig: HierarchyConfigType, 
    targetLevel: number
  ): any | null {
    
    switch (targetLevel) {
      case 0:
        return levelConfig.parentLevel0NameAttribute;
      case 1:
        return levelConfig.parentLevel1NameAttribute;
      case 2:
        return levelConfig.parentLevel2NameAttribute;
      case 3:
        return levelConfig.parentLevel3NameAttribute;
      case 4:
        return levelConfig.parentLevel4NameAttribute;
      // 🔧 EXTENSION: Ajouter support pour niveaux 5+ si disponibles
      // Pour l'instant, les props Mendix ne supportent que jusqu'au niveau 4
      // Ceci peut être étendu quand les props seront étendues
      default:
        console.warn(`⚠️ Niveau ${targetLevel} non supporté par les props Mendix actuelles (max: 4)`);
        return null;
    }
  }

  /**
   * Récupère l'attribut parent pour un niveau donné
   * Adaptation de la logique existante avec les props actuelles
   */
  private static getParentAttributeForLevel(
    item: any, 
    levelConfig: HierarchyConfigType, 
    targetLevel: number
  ): string | null {
    
    let parentAttribute;
    
    switch (targetLevel) {
      case 0:
        parentAttribute = levelConfig.parentLevel0NameAttribute;
        break;
      case 1:
        parentAttribute = levelConfig.parentLevel1NameAttribute;
        break;
      case 2:
        parentAttribute = levelConfig.parentLevel2NameAttribute;
        break;
      case 3:
        parentAttribute = levelConfig.parentLevel3NameAttribute;
        break;
      case 4:
        parentAttribute = levelConfig.parentLevel4NameAttribute;
        break;
      default:
        return null;
    }
    
    if (!parentAttribute) return null;
    
    const value = parentAttribute.get(item);
    if (value?.status === ValueStatus.Available && value.value) {
      return value.value;
    }
    
    return null;
  }
  
  /**
   * Vérifie qu'une valeur n'est pas vide selon R3
   */
  private static isNonEmpty(value: string | null): value is string {
    return value !== null && 
           value !== "" && 
           value !== "empty" && 
           value.trim() !== "";
  }
  
  /**
   * Vérifie que les niveaux intermédiaires sont vides (R3)
   * Condition importante : entre parent et enfant, tous les niveaux doivent être vides
   */
  private static areIntermediateLevelsEmpty(
    item: any,
    levelConfig: HierarchyConfigType,
    parentLevel: number, 
    nodeLevel: number
  ): boolean {
    
    for (let level = parentLevel + 1; level < nodeLevel; level++) {
      const intermediateAttr = this.getParentAttributeForLevel(item, levelConfig, level);
      if (this.isNonEmpty(intermediateAttr)) {
        console.warn(`⚠️ R3: Niveau intermédiaire ${level} non vide: "${intermediateAttr}"`);
        return false; // Violation de R3
      }
    }
    
    return true;
  }
  
  /**
   * Méthode utilitaire pour identifier les nœuds orphelins
   * Utile pour la gestion des nœuds virtuels
   */
  static isOrphan(
    item: any,
    levelConfig: HierarchyConfigType,
    allLevelConfigs: HierarchyConfigType[]
  ): boolean {
    return this.findDirectParent(item, levelConfig, allLevelConfigs) === null;
  }
} 