# 🔍 AUDIT COMPLET DU WIDGET SANKEY V2
*Date : ${new Date().toLocaleDateString('fr-FR')}*

## 🚨 CONFLITS CRITIQUES IDENTIFIÉS

### 1. **PROBLÈME MAJEUR : Confusion de niveaux dans ParentCalculationService**

#### 🔴 **Issue critique** 
```typescript
// PROBLÈME : La fonction traite ETH comme niveau 3 au lieu de niveau 2
if (currentLevelOrder === 3) {
  // Chercher dans parentLevel1NameAttribute qui contient le parent de niveau 2
  const parentName = currentLevel.parentLevel1NameAttribute?.get(item);
  // ...
}
```

#### 📊 **Réalité des données (selon vos logs)**
- Usine : niveau 0
- Atelier : niveau 1  
- **ETH : niveau 2** ⚠️
- **Machine : niveau 3** ⚠️

#### 🔧 **Logique actuelle défaillante**
```typescript
// PROBLÈME : ETH (niveau 2) est traité avec la logique niveau 3
if (currentLevelOrder === 2) {
  // parentLevel1NameAttribute pour niveau 2 ✅ 
  const parentName = currentLevel.parentLevel1NameAttribute?.get(item);
  // Cherche parent au niveau 1 ✅ (Atelier)
}

// MANQUANT : Machine (niveau 3) n'a pas de logique dédiée !
```

### 2. **CONFLICT États FSM vs Navigation**

#### 🔴 **Incohérence d'état**
```typescript
// PROBLÈME : États FSM non synchronisés avec navigation
setCurrentState(SankeyState.Loading);        // ← État FSM
setSelectedNode(currentRoot);                 // ← Navigation UX
// ❌ Pas de transition d'état après setSelectedNode!
```

#### 🔧 **Navigation brisée**
```typescript
// Dans handleNodeClick: CONFLICT avec FSM
if (selectedNode === node.id) {
  // Logic de remontée
  setSelectedNode(parentLink.id);
  // ❌ MANQUE: setCurrentState(SankeyState.NavigatingUp);
}
```

### 3. **CONFLICT Filtrage par Énergie vs Services**

#### 🔴 **Double filtrage conflictuel**
```typescript
// 1. Filtrage dans l'effet principal (ligne ~376)
if (props.selectedEnergies && props.selectedEnergies !== "all") {
  // Logique complexe de filtrage...
}

// 2. Filtrage REDONDANT dans filterDataForView() (ligne ~346)
const filteredByEnergy: SankeyData = data;
// ❌ CONFLICT : Deux endroits qui font le même travail !
```

### 4. **CONFLICT Services autonomes sans coordination**

#### 🔴 **Services indépendants** 
- `NodeSelectionService` → Trouve racine
- `ParentCalculationService` → Trouve parents  
- `DisplayFilterService` → Filtre affichage
- **❌ PROBLÈME** : Pas de service coordinateur !

### 5. **PROBLÈME Architecture : Logique métier dans Composant**

#### 🔴 **Violation Règles R2-R8**
```typescript
// 🚨 MAUVAIS : Logique métier dans AdvancedSankeyV2.tsx (ligne 569-900+)
useEffect(() => {
  // 300+ lignes de logique métier dans le composant !
  // ❌ Violation règles Clean Architecture
}, [dependencies]);
```

---

## 🎯 SOLUTIONS RECOMMANDÉES

### 🚀 **Solution 1 : Corriger ParentCalculationService**

```typescript
// CORRECTION IMMÉDIATE
static findDirectParent(item: any, currentLevel: HierarchyConfigType, allLevels: HierarchyConfigType[]) {
  const currentLevelOrder = currentLevel.levelOrder;
  
  // CORRECTION : Gestion correcte de tous les niveaux
  if (currentLevelOrder === 1) {
    // Atelier cherche parent niveau 0 (Usine)
    const parentName = currentLevel.parentLevel0NameAttribute?.get(item);
    if (parentName?.status === ValueStatus.Available && parentName.value) {
      const parentLevel = allLevels.find(l => l.levelOrder === 0);
      if (parentLevel) {
        return {
          parentId: `${parentLevel.levelId}_${parentName.value}`,
          parentLevel: 0
        };
      }
    }
  }
  
  if (currentLevelOrder === 2) {
    // ETH cherche parent niveau 1 (Atelier)
    const parentName = currentLevel.parentLevel1NameAttribute?.get(item);
    if (parentName?.status === ValueStatus.Available && parentName.value) {
      const parentLevel = allLevels.find(l => l.levelOrder === 1);
      if (parentLevel) {
        return {
          parentId: `${parentLevel.levelId}_${parentName.value}`,
          parentLevel: 1
        };
      }
    }
  }
  
  // AJOUT : Logique pour Machine (niveau 3)
  if (currentLevelOrder === 3) {
    // Machine cherche parent niveau 2 (ETH)
    const parentName = currentLevel.parentLevel2NameAttribute?.get(item);
    if (parentName?.status === ValueStatus.Available && parentName.value) {
      const parentLevel = allLevels.find(l => l.levelOrder === 2);
      if (parentLevel) {
        return {
          parentId: `${parentLevel.levelId}_${parentName.value}`,
          parentLevel: 2
        };
      }
    }
  }
  
  return null;
}
```

### 🚀 **Solution 2 : Service Coordinateur**

```typescript
// NOUVEAU : SankeyOrchestrator.ts
export class SankeyOrchestrator {
  
  static processHierarchicalData(
    hierarchyConfig: HierarchyConfigType[],
    selectedEnergy: string,
    selectedNode: string | null
  ): {
    data: SankeyData;
    state: SankeyState;
    context: SankeyContext;
  } {
    // 1. Créer nœuds
    const nodes = this.createNodes(hierarchyConfig);
    
    // 2. Créer liens avec ParentCalculationService CORRIGÉ
    const links = this.createLinks(nodes, hierarchyConfig);
    
    // 3. Filtrer par énergie
    const energyFiltered = this.filterByEnergy(nodes, links, selectedEnergy);
    
    // 4. Sélectionner racine avec NodeSelectionService
    const rootId = selectedNode || NodeSelectionService.findInitialRoot(energyFiltered.nodes);
    
    // 5. Filtrer affichage avec DisplayFilterService
    const displayed = DisplayFilterService.filterVisibleNodes(
      energyFiltered.nodes, 
      rootId, 
      energyFiltered.links, 
      1
    );
    
    // 6. Trier avec NodeSortingService
    const sorted = NodeSortingService.sortAllLevels(displayed.nodes);
    
    return {
      data: { nodes: sorted, links: displayed.links, levels: [] },
      state: SankeyState.ShowingRoot,
      context: this.buildContext(rootId, energyFiltered.nodes, displayed.links)
    };
  }
}
```

### 🚀 **Solution 3 : Refactoring Composant**

```typescript
// OBJECTIF : Composant lean avec services
export function AdvancedSankeyV2(props: AdvancedSankeyV2ContainerProps): ReactElement {
  const [currentState, setCurrentState] = useState<SankeyState>(SankeyState.Loading);
  const [sankeyData, setSankeyData] = useState<SankeyData | null>(null);
  
  // SIMPLIFICATION : Un seul effet avec orchestrateur
  useEffect(() => {
    const result = SankeyOrchestrator.processHierarchicalData(
      props.hierarchyConfig,
      props.selectedEnergies,
      selectedNode
    );
    
    setSankeyData(result.data);
    setCurrentState(result.state);
    setSankeyContext(result.context);
  }, [props.hierarchyConfig, props.selectedEnergies, selectedNode]);
  
  // Rendu D3 séparé
  useD3Rendering(sankeyData, dimensions);
  
  return (
    <SankeyContainer>
      <SankeyHeader {...headerProps} />
      <SankeyBreadcrumbs navigation={sankeyContext.navigationPath} />
      <SankeyChart ref={containerRef} />
    </SankeyContainer>
  );
}
```

---

## 📋 CHECKLIST CORRECTION

### ✅ **Phase 1 : Corrections Immédiates** 
- [ ] Corriger `ParentCalculationService.findDirectParent()` pour niveaux 2-3
- [ ] Ajouter gestion Machine (niveau 3) avec `parentLevel2NameAttribute`
- [ ] Tester avec données réelles

### ✅ **Phase 2 : Architecture**
- [ ] Créer `SankeyOrchestrator` service coordinateur
- [ ] Refactorer logique métier hors composant
- [ ] Simplifier `useEffect` principal

### ✅ **Phase 3 : Tests**
- [ ] Tests unitaires `ParentCalculationService`
- [ ] Tests intégration navigation
- [ ] Tests performances avec données réelles

---

## 🎯 PRIORITÉ ABSOLUE

**CORRECTION IMMÉDIATE** : `ParentCalculationService` niveau 2-3
- **Impact** : Résout l'erreur ETH dans vos logs
- **Effort** : 30 minutes  
- **Risque** : Bas

Cette correction devrait immédiatement résoudre le problème visible dans vos logs où l'ETH ne trouve pas son parent. 