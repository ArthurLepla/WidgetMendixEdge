/**
 * Service de tri des nœuds selon la règle R6
 * R6: Dans une même colonne, tri par poids descendant (ou alphabétique si poids = 0)
 */

import { ExtendedNode } from '../types/SankeyTypes';

export class NodeSortingService {
  
  /**
   * R6: Trie les nœuds dans une colonne par poids descendant, puis alphabétique
   * Remplace l'algorithme D3 par notre logique métier
   */
  static sortNodesInColumn(nodes: ExtendedNode[]): ExtendedNode[] {
    return [...nodes].sort((a, b) => {
      // Priorité 1: Poids descendant (R6)
      if (a.value !== b.value) {
        const sortResult = b.value - a.value;
        console.log(`📊 R6: Tri par poids: ${a.name}(${a.value}) vs ${b.name}(${b.value}) = ${sortResult}`);
        return sortResult;
      }
      
      // Priorité 2: Alphabétique si poids égal ou nul (R6)
      const alphaResult = a.name.localeCompare(b.name);
      console.log(`🔤 R6: Tri alphabétique: ${a.name} vs ${b.name} = ${alphaResult}`);
      return alphaResult;
    });
  }
  
  /**
   * Applique le tri R6 à tous les niveaux de la hiérarchie
   * Adaptation pour respecter la structure par colonnes du Sankey
   */
  static sortAllLevels(nodes: ExtendedNode[]): ExtendedNode[] {
    const nodesByLevel = new Map<number, ExtendedNode[]>();
    
    // 1. Grouper les nœuds par niveau (colonnes)
    nodes.forEach(node => {
      const level = typeof node.metadata?.level === 'number' ? node.metadata.level : 0;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    });
    
    console.log(`📊 R6: Tri de ${nodesByLevel.size} niveaux`);
    
    // 2. Trier chaque niveau selon R6
    const sortedNodes: ExtendedNode[] = [];
    const sortedLevels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
    
    sortedLevels.forEach(level => {
      const levelNodes = nodesByLevel.get(level)!;
      const sortedLevelNodes = this.sortNodesInColumn(levelNodes);
      
      console.log(`✅ R6: Niveau ${level} trié: ${sortedLevelNodes.map(n => `${n.name}(${n.value})`).join(', ')}`);
      sortedNodes.push(...sortedLevelNodes);
    });
    
    return sortedNodes;
  }
  
  /**
   * Tri spécialisé pour optimiser l'affichage Sankey
   * Garde les nœuds importants en haut pour réduire les croisements
   */
  static sortForOptimalDisplay(nodes: ExtendedNode[]): ExtendedNode[] {
    return this.sortNodesInColumn(nodes).map((node, index) => ({
      ...node,
      // Mise à jour de l'index pour respecter l'ordre R6
      index: index
    }));
  }
  
  /**
   * Valide que le tri respecte R6
   * Outil de debug pour s'assurer de la conformité
   */
  static validateR6Compliance(nodes: ExtendedNode[]): { isCompliant: boolean; violations: string[] } {
    const violations: string[] = [];
    
    // Grouper par niveau
    const nodesByLevel = new Map<number, ExtendedNode[]>();
    nodes.forEach(node => {
      const level = typeof node.metadata?.level === 'number' ? node.metadata.level : 0;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    });
    
    // Vérifier chaque niveau
    nodesByLevel.forEach((levelNodes, level) => {
      // Créer une copie triée correctement selon les critères R6
      const expectedOrder = this.sortNodesInColumn(levelNodes);
      
      // Comparer l'ordre actuel avec l'ordre attendu
      for (let i = 0; i < levelNodes.length; i++) {
        const currentNode = levelNodes[i];
        const expectedNode = expectedOrder[i];
        
        if (currentNode.id !== expectedNode.id) {
          violations.push(
            `Niveau ${level}: Position ${i} - Trouvé ${currentNode.name}(${currentNode.value}), ` +
            `attendu ${expectedNode.name}(${expectedNode.value}) selon R6`
          );
        }
      }
    });
    
    const isCompliant = violations.length === 0;
    
    if (isCompliant) {
      console.log(`✅ R6: Conformité validée pour tous les niveaux`);
    } else {
      console.warn(`⚠️ R6: Violations détectées:`, violations);
    }
    
    return { isCompliant, violations };
  }
  
  /**
   * Utilitaire pour afficher l'ordre des nœuds (debug)
   */
  static logNodeOrder(nodes: ExtendedNode[], label: string = "Ordre des nœuds"): void {
    const nodesByLevel = new Map<number, ExtendedNode[]>();
    
    nodes.forEach(node => {
      const level = typeof node.metadata?.level === 'number' ? node.metadata.level : 0;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    });
    
    console.log(`📊 ${label}:`);
    nodesByLevel.forEach((levelNodes, level) => {
      const nodeDesc = levelNodes.map(n => `${n.name}(${n.value})`).join(' → ');
      console.log(`  Niveau ${level}: ${nodeDesc}`);
    });
  }
} 