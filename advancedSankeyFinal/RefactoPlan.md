Je vais analyser votre widget AdvancedSankey actuel pour vous proposer un plan de refactoring structuré et efficace, en tenant compte de la transition vers les energyNode.Je vais vous proposer un plan de refactoring structuré et méthodique pour votre widget AdvancedSankey, en tenant compte de la transition vers les EnergyFlowNode créés via JavaAction.

## 📋 Plan de Refactoring AdvancedSankey → EnergyFlowNode

### **Phase 1 : Audit et Nettoyage Initial** 🧹 ✅ **TERMINÉ**

#### 1.1 Analyse de l'existant ✅
- Analyse complète de la structure existante effectuée
- Identification des 50+ fichiers et services complexes obsolètes

#### 1.2 Nettoyage des fichiers obsolètes ✅
- **Supprimé** : 10 services complexes (`SankeyOrchestrator`, `NavigationService`, etc.)
- **Supprimé** : Hooks complexes (`useD3Rendering`, `useSankeyStateMachine`)
- **Supprimé** : Types legacy (`SankeyTypes.ts`, `HierarchyTypes.ts`, etc.)
- **Supprimé** : Dossiers vides (`log/`, `coverage/`, `backup/`)
- **Nettoyé** : `CreateEnergyFlowNode-copie.java` → `CreateEnergyFlowNodes.java`

#### 1.3 Documentation de l'état actuel ✅
- Structure finale : 18 fichiers source (vs 50+ avant)
- Dépendances conservées : d3-sankey, lucide-react
- Architecture alignée sur le plan EnergyFlowNode

### **Phase 2 : Refonte du Modèle de Données** 📊 ⏳ **EN COURS**

#### 2.1 Mise à jour du fichier XML ⏳ **SUIVANT**
```xml
<!-- src/AdvancedSankeyV2.xml - Nouvelle structure simplifiée -->
<widget>
    <properties>
        <!-- Remplacer hierarchyConfig complexe par -->
        <propertyGroup caption="Configuration des flux">
            <property key="energyFlowDataSource" type="datasource" required="true">
                <caption>Source des EnergyFlowNode</caption>
                <description>Liste des flux créés par JavaAction</description>
            </property>
            <property key="sourceAssetAttribute" type="association">
                <caption>Asset source</caption>
            </property>
            <property key="targetAssetAttribute" type="association">
                <caption>Asset cible</caption>
            </property>
            <property key="flowValueAttribute" type="attribute">
                <caption>Valeur du flux</caption>
                <attributeTypes>
                    <attributeType name="Decimal"/>
                </attributeTypes>
            </property>
            <property key="percentageAttribute" type="attribute">
                <caption>Pourcentage</caption>
            </property>
        </propertyGroup>
        
        <!-- Configuration simplifiée des énergies -->
        <propertyGroup caption="Configuration énergétique">
            <property key="energyType" type="enumeration">
                <caption>Type d'énergie</caption>
            </property>
            <property key="metricType" type="enumeration">
                <caption>Type de métrique</caption>
            </property>
        </propertyGroup>
    </properties>
</widget>
```

#### 2.2 Rebuild et génération des types ⏳ **SUIVANT**
```bash
# Générer les nouveaux types TypeScript
npm run build
# Cela va mettre à jour typings/AdvancedSankeyV2Props.d.ts
```

### **Phase 3 : Restructuration des Dossiers** 📁 ✅ **TERMINÉ**

#### 3.1 Nouvelle architecture implémentée ✅
```
advancedSankeyFinal/
├── src/
│   ├── AdvancedSankeyV2.tsx          # Composant principal (à simplifier)
│   ├── AdvancedSankeyV2.xml          # Configuration widget
│   ├── components/
│   │   ├── SankeyChart/              # Composant D3 Sankey pur ✅
│   │   │   ├── SankeyChart.tsx       # Existant - à adapter
│   │   │   ├── SankeyChart.css       # Styles déplacés
│   │   │   └── index.ts              # Export créé
│   │   ├── Controls/                 # Contrôles utilisateur ✅
│   │   │   └── index.ts              # Structure prête
│   │   └── Debug/                    # Outils de debug ✅
│   │       ├── DebugTools.tsx        # Déplacé
│   │       └── index.ts              # Export créé
│   ├── hooks/
│   │   └── useEnergyFlowData.ts     # Hook principal EnergyFlowNode ✅
│   ├── utils/
│   │   ├── dataTransformers.ts      # Conversion EnergyFlowNode → D3 ✅
│   │   ├── colorMapping.ts          # Gestion couleurs par énergie ✅
│   │   └── energyConstants.ts       # Rétro-compatibilité ✅
│   └── types/
│       ├── EnergyFlow.types.ts      # Types pour EnergyFlowNode ✅
│       └── Widget.types.ts          # Types du widget ✅
├── typings/
│   └── AdvancedSankeyV2Props.d.ts   # Auto-généré par Mendix
└── package.json
```

### **Phase 4 : Implémentation du Nouveau Backend** 💻

#### 4.1 Hook principal pour les données
```typescript
// src/hooks/useEnergyFlowData.ts
export function useEnergyFlowData(props: AdvancedSankeyV2ContainerProps) {
    const { energyFlowDataSource, energyType, metricType } = props;
    
    return useMemo(() => {
        if (!energyFlowDataSource || energyFlowDataSource.status !== "available") {
            return { nodes: [], links: [], status: "loading" };
        }
        
        // Transformation directe des EnergyFlowNode
        const flows = energyFlowDataSource.items.map(item => ({
            source: sourceAssetAttribute.get(item).value,
            target: targetAssetAttribute.get(item).value,
            value: flowValueAttribute.get(item).value,
            percentage: percentageAttribute.get(item).value
        }));
        
        // Conversion vers format D3-Sankey
        return transformToSankeyFormat(flows);
    }, [energyFlowDataSource, energyType, metricType]);
}
```

#### 4.2 Simplification du composant principal
```typescript
// src/AdvancedSankeyV2.tsx
export function AdvancedSankeyV2(props: AdvancedSankeyV2ContainerProps) {
    const sankeyData = useEnergyFlowData(props);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    
    return (
        <div className="advanced-sankey-container">
            {props.showDebugTools && (
                <DataInspector data={sankeyData} />
            )}
            
            <div className="controls-bar">
                <EnergySelector 
                    value={props.energyType} 
                    onChange={props.onEnergyTypeChange}
                />
            </div>
            
            <SankeyChart
                data={sankeyData}
                onNodeClick={handleNodeClick}
                selectedNode={selectedNode}
                width={800}
                height={600}
            />
        </div>
    );
}
```

### **Phase 5 : Migration Progressive** 🔄

#### 5.1 Stratégie de migration
1. **Créer une branche parallèle** du composant avec le nouveau modèle
2. **Implémenter d'abord** la visualisation basique avec EnergyFlowNode
3. **Ajouter progressivement** les fonctionnalités (navigation, filtres)
4. **Tester en parallèle** avec l'ancienne version
5. **Basculer** une fois la parité fonctionnelle atteinte

#### 5.2 Points de validation
- [ ] Les données EnergyFlowNode s'affichent correctement
- [ ] La navigation entre niveaux fonctionne
- [ ] Les calculs de pourcentages sont corrects
- [ ] Les performances sont acceptables
- [ ] Le mode debug fonctionne

### **Phase 6 : Optimisation et Finalisation** ✨

#### 6.1 Performance
- Implémenter la virtualisation pour grands datasets
- Optimiser les re-renders avec `React.memo`
- Utiliser `useMemo` et `useCallback` systématiquement

#### 6.2 Tests et documentation
- Créer des tests unitaires pour les transformateurs
- Documenter les nouvelles APIs
- Mettre à jour le README avec les nouveaux prérequis

### **Timeline Suggérée** ⏰

- **Phase 1-2** : 1 jour (audit, nettoyage, XML)
- **Phase 3-4** : 2-3 jours (restructuration, nouveau backend)
- **Phase 5** : 2 jours (migration progressive)
- **Phase 6** : 1 jour (optimisation, documentation)

### **Commandes Clés** 🛠️

```bash
# Développement
npm run dev          # Mode watch avec hot reload
npm run build        # Build de production + génération types
npm run lint:fix     # Correction automatique du code

# Tests locaux
npm run start        # Démarrage serveur local Mendix

# Validation
npm run lint         # Vérification qualité code
```

Ce plan vous permettra une transition en douceur vers la nouvelle architecture basée sur les EnergyFlowNode, tout en gardant le contrôle à chaque étape. L'approche progressive minimise les risques et permet de valider chaque changement avant de passer au suivant.