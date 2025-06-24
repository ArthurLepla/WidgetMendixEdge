# Plan de Refactoring - Respect des 9 Règles Sankey

## 🎯 Objectif
Refactorer `AdvancedSankeyV2` pour respecter strictement les 9 règles de conception définies.

## 📋 État Actuel vs Règles

| Règle | Status | Priorité | Effort |
|-------|--------|----------|--------|
| R1. Définition des niveaux | ❌ Partiel | Moyenne | 2j |
| R2. Sélection de la racine | ❌ Non | **Haute** | 3j |
| R3. Calcul du parent direct | ❌ Non | **Haute** | 2j |
| R4. Nœuds affichés | ❌ Non | **Haute** | 2j |
| R5. Routing des liens | ❌ Non | Moyenne | 3j |
| R6. Empilage vertical | ❌ Non | Moyenne | 1j |
| R7. Chevauchement interdit | ❓ Partiel | Basse | 1j |
| R8. Style & UX | ❌ Partiel | Moyenne | 2j |
| R9. Performance | ❌ Non | Basse | 1j |

**Total estimé : 17 jours**

## 🏗️ Architecture FSM (Priorité 1)

### États à implémenter
```typescript
enum SankeyState {
  Loading = "Loading",
  ShowingRoot = "ShowingRoot", 
  ShowingChildren = "ShowingChildren",
  NavigatingTo = "NavigatingTo",
  Error = "Error",
  NoData = "NoData"
}

interface SankeyContext {
  currentRoot: string | null;
  availableNodes: ExtendedNode[];
  filteredNodes: ExtendedNode[];
  error?: string;
}
```

### Fichiers à créer
- `src/states/SankeyStates.ts` - Définition des états FSM
- `src/services/SankeyStateMachine.ts` - Machine à états
- `src/services/NodeSelectionService.ts` - Logique sélection racine (R2)
- `src/services/ParentCalculationService.ts` - Algorithme parent direct (R3)
- `src/services/DisplayFilterService.ts` - Filtrage nœuds affichés (R4)

## 📐 Règle R1 : Définition des niveaux

### Changements props
```typescript
// AVANT
interface AdvancedSankeyV2ContainerProps {
  hierarchyConfig: HierarchyConfigType[];
  // ...
}

// APRÈS - Backward compatible
interface AdvancedSankeyV2ContainerProps {
  hierarchyConfig: HierarchyConfigType[];
  levels?: string[]; // Nouvelle prop optionnelle simple
  // ...
}
```

### Logique d'adaptation
```typescript
const getLevels = (props: Props): string[] => {
  if (props.levels) {
    return props.levels; // Nouvelle API simple
  }
  // Fallback vers ancienne API complexe
  return props.hierarchyConfig
    .sort((a, b) => a.levelOrder - b.levelOrder)
    .map(config => config.levelName);
};
```

## 🎯 Règle R2 : Sélection de la racine

### Service NodeSelection
```typescript
// src/services/NodeSelectionService.ts
export class NodeSelectionService {
  
  /**
   * R2: Au chargement, racine = nœud avec index le plus bas au niveau 0
   */
  static findInitialRoot(nodes: ExtendedNode[]): string {
    const level0Nodes = nodes.filter(n => n.metadata?.level === 0);
    if (level0Nodes.length === 0) throw new Error("Aucun nœud niveau 0");
    
    // Tri par index croissant, premier = racine
    level0Nodes.sort((a, b) => a.index - b.index);
    return level0Nodes[0].id;
  }
  
  /**
   * R2: Au clic, ce nœud devient la nouvelle racine
   */
  static setNewRoot(nodeId: string, nodes: ExtendedNode[]): string {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Nœud ${nodeId} introuvable`);
    return nodeId;
  }
}
```

## 🔍 Règle R3 : Calcul du parent direct

### Service ParentCalculation
```typescript
// src/services/ParentCalculationService.ts
export class ParentCalculationService {
  
  /**
   * R3: Pour un nœud X de niveau k > 0:
   * - Parcours attributs niveau (k-1, k-2, ... 0)
   * - Premier attribut non vide = parent direct
   */
  static findDirectParent(
    node: MendixNode, 
    levelConfigs: HierarchyConfigType[]
  ): string | null {
    const nodeLevel = node.level;
    if (nodeLevel <= 0) return null;
    
    // Parcours des niveaux parents par ordre décroissant
    for (let parentLevel = nodeLevel - 1; parentLevel >= 0; parentLevel--) {
      const parentAttribute = this.getParentAttribute(node, parentLevel);
      
      if (this.isNonEmpty(parentAttribute)) {
        // Vérifier que les niveaux intermédiaires sont vides (R3)
        if (this.areIntermediateLevelsEmpty(node, parentLevel, nodeLevel)) {
          return parentAttribute;
        }
      }
    }
    
    return null; // Nœud orphelin
  }
  
  private static getParentAttribute(node: MendixNode, level: number): string | null {
    // Logique pour récupérer l'attribut parent selon le niveau
    switch (level) {
      case 0: return node.parentLevel0Name;
      case 1: return node.parentLevel1Name;
      case 2: return node.parentLevel2Name;
      default: return null;
    }
  }
  
  private static isNonEmpty(value: string | null): boolean {
    return value !== null && value !== "" && value !== "empty";
  }
  
  private static areIntermediateLevelsEmpty(
    node: MendixNode, 
    parentLevel: number, 
    nodeLevel: number
  ): boolean {
    for (let level = parentLevel + 1; level < nodeLevel; level++) {
      const intermediateAttr = this.getParentAttribute(node, level);
      if (this.isNonEmpty(intermediateAttr)) {
        return false; // Niveau intermédiaire non vide = violation R3
      }
    }
    return true;
  }
}
```

## 👁️ Règle R4 : Nœuds affichés

### Service DisplayFilter
```typescript
// src/services/DisplayFilterService.ts
export class DisplayFilterService {
  
  /**
   * R4: L'écran ne montre QUE:
   * - la racine (colonne 0)
   * - tous les nœuds dont le parent direct est la racine
   */
  static filterVisibleNodes(
    allNodes: ExtendedNode[],
    currentRoot: string,
    links: SimplifiedLink[]
  ): ExtendedNode[] {
    const visibleNodes: ExtendedNode[] = [];
    
    // 1. Ajouter la racine
    const rootNode = allNodes.find(n => n.id === currentRoot);
    if (!rootNode) throw new Error(`Racine ${currentRoot} introuvable`);
    visibleNodes.push(rootNode);
    
    // 2. Ajouter SEULEMENT les enfants directs de la racine
    const directChildren = this.findDirectChildren(currentRoot, allNodes, links);
    visibleNodes.push(...directChildren);
    
    return visibleNodes;
  }
  
  private static findDirectChildren(
    rootId: string,
    allNodes: ExtendedNode[],
    links: SimplifiedLink[]
  ): ExtendedNode[] {
    // Trouver tous les liens sortant de la racine
    const outgoingLinks = links.filter(link => link.source === rootId);
    
    // Récupérer les nœuds cibles (enfants directs)
    const childrenIds = outgoingLinks.map(link => link.target);
    
    return allNodes.filter(node => childrenIds.includes(node.id));
  }
}
```

## 📏 Règle R5 : Routing des liens

### CustomSankeyLayout
```typescript
// src/services/CustomSankeyLayout.ts
export class CustomSankeyLayout {
  private static readonly MIN_LINK_SPACING = 8; // R5: espacement minimal 8px
  
  /**
   * R5: Chaque lien part du bord droit du parent 
   * et arrive au bord gauche de l'enfant
   */
  static calculateLinkPositions(
    nodes: ExtendedNode[],
    links: SimplifiedLink[]
  ): PositionedLink[] {
    const positionedLinks: PositionedLink[] = [];
    
    links.forEach((link, index) => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Position de départ : bord droit du parent
      const startX = sourceNode.x1!;
      const startY = this.calculateLinkStartY(sourceNode, index, links);
      
      // Position d'arrivée : bord gauche de l'enfant  
      const endX = targetNode.x0!;
      const endY = this.calculateLinkEndY(targetNode, index, links);
      
      positionedLinks.push({
        ...link,
        path: this.generateLinkPath(startX, startY, endX, endY),
        spacing: this.MIN_LINK_SPACING
      });
    });
    
    return positionedLinks;
  }
  
  private static calculateLinkStartY(
    sourceNode: ExtendedNode,
    linkIndex: number,
    allLinks: SimplifiedLink[]
  ): number {
    // Calculer la position Y avec espacement minimal
    const sourceLinks = allLinks.filter(l => l.source === sourceNode.id);
    const linkPosition = sourceLinks.indexOf(sourceLinks[linkIndex]);
    
    return sourceNode.y0! + (linkPosition * this.MIN_LINK_SPACING);
  }
}
```

## 📊 Règle R6 : Empilage vertical

### Service NodeSorting
```typescript
// src/services/NodeSortingService.ts
export class NodeSortingService {
  
  /**
   * R6: Dans une même colonne, tri par poids descendant 
   * (ou alphabétique si poids = 0)
   */
  static sortNodesInColumn(nodes: ExtendedNode[]): ExtendedNode[] {
    return [...nodes].sort((a, b) => {
      // Priorité 1: Poids descendant
      if (a.value !== b.value) {
        return b.value - a.value;
      }
      
      // Priorité 2: Alphabétique si poids égal ou nul
      return a.name.localeCompare(b.name);
    });
  }
  
  /**
   * Appliquer le tri à tous les niveaux
   */
  static sortAllLevels(nodes: ExtendedNode[]): ExtendedNode[] {
    const nodesByLevel = new Map<number, ExtendedNode[]>();
    
    // Grouper par niveau
    nodes.forEach(node => {
      const level = node.metadata?.level ?? 0;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    });
    
    // Trier chaque niveau
    const sortedNodes: ExtendedNode[] = [];
    nodesByLevel.forEach((levelNodes, level) => {
      const sorted = this.sortNodesInColumn(levelNodes);
      sortedNodes.push(...sorted);
    });
    
    return sortedNodes;
  }
}
```

## 🎨 Règle R8 : Style & UX

### Constantes et validation
```typescript
// src/constants/StyleConstants.ts
export const STYLE_CONSTANTS = {
  MIN_NODE_SIZE: 24, // R8: Taille min 24×24 px
  MAX_LABEL_LENGTH: 20, // R8: Troncature > 20 caractères
  WCAG_COLORS: {
    // R8: Couleurs conformes WCAG AA
    PRIMARY: "#1976D2",     // Contraste 4.5:1 minimum
    SECONDARY: "#388E3C",   
    ERROR: "#D32F2F",
    WARNING: "#F57C00",
    TEXT: "#212121"         // Contraste élevé
  }
} as const;

// src/utils/StyleUtils.ts
export class StyleUtils {
  
  static truncateLabel(text: string): { display: string; showTooltip: boolean } {
    if (text.length <= STYLE_CONSTANTS.MAX_LABEL_LENGTH) {
      return { display: text, showTooltip: false };
    }
    
    return {
      display: text.substring(0, STYLE_CONSTANTS.MAX_LABEL_LENGTH - 3) + "...",
      showTooltip: true
    };
  }
  
  static ensureMinNodeSize(calculatedSize: number): number {
    return Math.max(calculatedSize, STYLE_CONSTANTS.MIN_NODE_SIZE);
  }
}
```

## ⚡ Règle R9 : Performance

### Service de métriques
```typescript
// src/services/PerformanceService.ts
export class PerformanceService {
  private static readonly TARGET_RENDER_TIME = 1000; // R9: < 1s pour 500 nœuds
  
  static startMeasurement(label: string): string {
    const measurementId = `${label}_${Date.now()}`;
    performance.mark(`${measurementId}_start`);
    return measurementId;
  }
  
  static endMeasurement(measurementId: string): number {
    performance.mark(`${measurementId}_end`);
    performance.measure(measurementId, `${measurementId}_start`, `${measurementId}_end`);
    
    const entries = performance.getEntriesByName(measurementId);
    const duration = entries[0]?.duration || 0;
    
    // Log si dépasse la cible R9
    if (duration > this.TARGET_RENDER_TIME) {
      console.warn(`⚠️ Performance R9: ${measurementId} took ${duration}ms (target: ${this.TARGET_RENDER_TIME}ms)`);
    }
    
    return duration;
  }
  
  static validateR9Compliance(nodeCount: number, renderTime: number): boolean {
    const isCompliant = renderTime < this.TARGET_RENDER_TIME;
    
    console.log(`📊 R9 Performance Check:`, {
      nodeCount,
      renderTime: `${renderTime}ms`,
      target: `${this.TARGET_RENDER_TIME}ms`,
      compliant: isCompliant ? "✅" : "❌"
    });
    
    return isCompliant;
  }
}
```

## 📅 Plan d'exécution par Sprint

### Sprint 1 (5j) - Core FSM + Navigation
- [ ] Créer la FSM avec états de base
- [ ] Implémenter R2 (sélection racine)
- [ ] Implémenter R4 (filtrage nœuds)
- [ ] Tests unitaires FSM

### Sprint 2 (4j) - Algorithmes métier  
- [ ] Implémenter R3 (calcul parent direct)
- [ ] Implémenter R6 (tri vertical)
- [ ] Refactoring fonctions longues
- [ ] Tests unitaires algorithmes

### Sprint 3 (4j) - Layout et style
- [ ] Implémenter R5 (routing liens)
- [ ] Implémenter R8 (style & UX)
- [ ] Améliorer R7 (chevauchements)
- [ ] Tests visuels

### Sprint 4 (3j) - Performance et props
- [ ] Implémenter R9 (métriques performance)
- [ ] Ajouter R1 (props simplifiées)
- [ ] Optimisations performance
- [ ] Tests d'intégration

### Sprint 5 (1j) - Documentation et validation
- [ ] Documenter tous les changements
- [ ] Valider conformité des 9 règles
- [ ] Démo et feedback
- [ ] Mise à jour avancement.md

## 🧪 Stratégie de tests

### Tests unitaires par règle
```typescript
// src/__tests__/rules/
// - R1_LevelDefinition.test.ts
// - R2_RootSelection.test.ts  
// - R3_ParentCalculation.test.ts
// - R4_NodeDisplay.test.ts
// - R5_LinkRouting.test.ts
// - R6_VerticalStacking.test.ts
// - R7_OverlapPrevention.test.ts
// - R8_StyleUX.test.ts
// - R9_Performance.test.ts
```

### Tests d'intégration FSM
```typescript
// src/__tests__/integration/
// - SankeyStateMachine.test.ts
// - NavigationFlow.test.ts
// - DataProcessing.test.ts
```

## 📈 Métriques de succès

- ✅ **Conformité** : 9/9 règles respectées
- ✅ **Performance** : R9 validée (< 1s pour 500 nœuds)  
- ✅ **Tests** : 90%+ couverture code métier
- ✅ **Maintenabilité** : Fonctions < 40 LOC
- ✅ **Documentation** : Chaque règle documentée avec exemples 