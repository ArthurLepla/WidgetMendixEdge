# Guide d'implémentation : Fonctionnalité Double IPE

## 📋 Vue d'ensemble

Cette fonctionnalité permet de gérer deux IPE (Indices de Performance Énergétique) distincts dans un même widget, avec la possibilité de basculer entre eux via un toggle moderne.

### Fonctionnalités clés
- **Mode Simple IPE** : Comportement standard (rétrocompatible)
- **Mode Double IPE** : Gestion de deux IPE indépendants
- **Toggle dynamique** : Interface moderne pour basculer entre les IPE
- **Données séparées** : Chaque IPE a ses propres sources et configurations
- **Export intelligent** : Exporte automatiquement les données de l'IPE actif

---

## 🏗️ Architecture

### Principe FSM (Finite State Machine)
```
States: [single_ipe, double_ipe_1, double_ipe_2]
Events: [toggle_to_ipe_1, toggle_to_ipe_2, change_mode]
Transitions:
  - single_ipe + change_mode → double_ipe_1
  - double_ipe_1 + toggle_to_ipe_2 → double_ipe_2
  - double_ipe_2 + toggle_to_ipe_1 → double_ipe_1
```

---

## 📝 Étape 1 : Configuration XML

### 1.1 Ajout de la propriété ipeMode

```xml
<property key="ipeMode" type="enumeration" defaultValue="single">
    <caption>Mode IPE</caption>
    <description>Choisir entre un IPE simple ou double</description>
    <enumerationValues>
        <enumerationValue key="single">Simple IPE</enumerationValue>
        <enumerationValue key="double">Double IPE</enumerationValue>
    </enumerationValues>
</property>
```

### 1.2 Duplication des groupes de propriétés

Pour chaque groupe existant, créer une version "2" :

#### Source de données 2
```xml
<propertyGroup caption="Source de données 2">
    <property key="consumptionDataSource2" type="datasource" isList="true" required="false">
        <caption>Source de données de consommation 2</caption>
        <description>Sélectionner la source de données pour la consommation du deuxième IPE</description>
    </property>
    <property key="timestampAttr2" type="attribute" dataSource="consumptionDataSource2" required="false">
        <caption>Attribut timestamp 2</caption>
        <description>Sélectionner l'attribut timestamp pour le deuxième IPE</description>
        <attributeTypes>
            <attributeType name="DateTime"/>
        </attributeTypes>
    </property>
    <!-- Répéter pour consumptionAttr2, NameAttr2 -->
</propertyGroup>
```

#### Période d'analyse 2
```xml
<propertyGroup caption="Période d'analyse 2">
    <property key="startDate2" type="attribute" required="false">
        <caption>Date de début 2</caption>
        <description>Sélectionner la date de début pour le deuxième IPE</description>
        <attributeTypes>
            <attributeType name="DateTime"/>
        </attributeTypes>
    </property>
    <!-- Répéter pour endDate2 -->
</propertyGroup>
```

#### Configuration des cartes IPE 2
```xml
<propertyGroup caption="Configuration IPE 2 - Card 1">
    <property key="card1Title2" type="string" required="false">
        <caption>Titre Card 1 (IPE 2)</caption>
        <description>Titre pour la première card du deuxième IPE</description>
    </property>
    <!-- Répéter pour card1Icon2, card1Unit2, card1DataSource2, card1ValueAttr2 -->
</propertyGroup>
<!-- Répéter pour Card 2 et Card 3 -->
```

#### Configuration des noms IPE
```xml
<propertyGroup caption="Configuration Double IPE">
    <property key="ipe1Name" type="string" required="false">
        <caption>Nom IPE 1</caption>
        <description>Nom affiché pour le premier IPE dans le toggle</description>
    </property>
    <property key="ipe2Name" type="string" required="false">
        <caption>Nom IPE 2</caption>
        <description>Nom affiché pour le deuxième IPE dans le toggle</description>
    </property>
</propertyGroup>
```

---

## 🔧 Étape 2 : Implémentation TypeScript

### 2.1 Ajout des états

```typescript
// État pour gérer quel IPE est actif en mode double
const [activeIPE, setActiveIPE] = useState<1 | 2>(1);

// États pour les données des deux IPE
const [data1, setData1] = useState<Array<{ timestamp: Date; value: Big; name: string | undefined }>>([]);
const [data2, setData2] = useState<Array<{ timestamp: Date; value: Big; name: string | undefined }>>([]);

// États pour les cartes des deux IPE
const [card1Data1, setCard1Data1] = useState<Big | undefined>(undefined);
const [card2Data1, setCard2Data1] = useState<Big | undefined>(undefined);
const [card3Data1, setCard3Data1] = useState<Big | undefined>(undefined);
const [card1Data2, setCard1Data2] = useState<Big | undefined>(undefined);
const [card2Data2, setCard2Data2] = useState<Big | undefined>(undefined);
const [card3Data2, setCard3Data2] = useState<Big | undefined>(undefined);
```

### 2.2 Fonction de sélection des propriétés

```typescript
const getCurrentIPEProps = () => {
    if (ipeMode === "single" || activeIPE === 1) {
        return {
            consumptionDataSource,
            timestampAttr,
            consumptionAttr,
            NameAttr,
            startDate,
            endDate,
            card1Title,
            card1Icon,
            card1Unit,
            card1DataSource,
            card1ValueAttr,
            card2Title,
            card2Icon,
            card2Unit,
            card2DataSource,
            card2ValueAttr,
            card3Title,
            card3Icon,
            card3Unit,
            card3DataSource,
            card3ValueAttr,
            data: data1,
            card1Data: card1Data1,
            card2Data: card2Data1,
            card3Data: card3Data1
        };
    } else {
        return {
            consumptionDataSource: consumptionDataSource2,
            timestampAttr: timestampAttr2,
            consumptionAttr: consumptionAttr2,
            NameAttr: NameAttr2,
            startDate: startDate2,
            endDate: endDate2,
            card1Title: card1Title2,
            card1Icon: card1Icon2,
            card1Unit: card1Unit2,
            card1DataSource: card1DataSource2,
            card1ValueAttr: card1ValueAttr2,
            card2Title: card2Title2,
            card2Icon: card2Icon2,
            card2Unit: card2Unit2,
            card2DataSource: card2DataSource2,
            card2ValueAttr: card2ValueAttr2,
            card3Title: card3Title2,
            card3Icon: card3Icon2,
            card3Unit: card3Unit2,
            card3DataSource: card3DataSource2,
            card3ValueAttr: card3ValueAttr2,
            data: data2,
            card1Data: card1Data2,
            card2Data: card2Data2,
            card3Data: card3Data2
        };
    }
};
```

### 2.3 Duplication des useEffect

Créer des `useEffect` séparés pour chaque IPE :

```typescript
// Chargement des données principales IPE 1
useEffect(() => {
    if (!devMode && isConsumptionDataReady1 && timestampAttr && consumptionAttr) {
        // Logique de chargement pour IPE 1
        const itemsRaw = consumptionDataSource?.items ?? [];
        // ... traitement des données
        setData1(sortedItems);
    }
}, [devMode, isConsumptionDataReady1, timestampAttr, consumptionAttr, NameAttr, consumptionDataSource]);

// Chargement des données principales IPE 2
useEffect(() => {
    if (!devMode && ipeMode === "double" && isConsumptionDataReady2 && timestampAttr2 && consumptionAttr2) {
        // Logique de chargement pour IPE 2
        const itemsRaw = consumptionDataSource2?.items ?? [];
        // ... traitement des données
        setData2(sortedItems);
    }
}, [devMode, ipeMode, isConsumptionDataReady2, timestampAttr2, consumptionAttr2, NameAttr2, consumptionDataSource2]);
```

---

## 🎨 Étape 3 : Composant Toggle

### 3.1 Ajout des props au ChartContainer

```typescript
interface ChartContainerProps {
  // ... props existantes
  showIPEToggle?: boolean;
  ipe1Name?: string;
  ipe2Name?: string;
  activeIPE?: 1 | 2;
  onIPEToggle?: (ipe: 1 | 2) => void;
}
```

### 3.2 Composant RadioToggle

```typescript
const RadioToggle = ({ 
  ipe1Name, 
  ipe2Name, 
  activeIPE, 
  onToggle 
}: { 
  ipe1Name: string; 
  ipe2Name: string; 
  activeIPE: 1 | 2; 
  onToggle: (ipe: 1 | 2) => void; 
}) => (
  <div className="radio-inputs">
    <label className="radio">
      <input 
        type="radio" 
        name="ipe-radio" 
        checked={activeIPE === 1}
        onChange={() => onToggle(1)}
      />
      <span className="name">{ipe1Name || "IPE 1"}</span>
    </label>
    <label className="radio">
      <input 
        type="radio" 
        name="ipe-radio" 
        checked={activeIPE === 2}
        onChange={() => onToggle(2)}
      />
      <span className="name">{ipe2Name || "IPE 2"}</span>
    </label>
  </div>
);
```

### 3.3 Intégration dans le header

```typescript
{/* Actions wrapper pour toggle et export */}
<div className="chart-header-actions">
  {/* Toggle IPE */}
  {showIPEToggle && ipe1Name && ipe2Name && onIPEToggle && (
    <RadioToggle
      ipe1Name={ipe1Name}
      ipe2Name={ipe2Name}
      activeIPE={activeIPE}
      onToggle={onIPEToggle}
    />
  )}

  {/* Export button */}
  {hasData && showExportButton && (
    <ExportMenu
      data={data}
      filename={filename}
      machineName={machineName}
    />
  )}
</div>
```

---

## 🎨 Étape 4 : Styles CSS

### 4.1 Wrapper des actions

```css
.chart-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
```

### 4.2 Styles du RadioToggle

```css
.radio-inputs {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  border-radius: 0.5rem;
  background-color: #eee;
  box-sizing: border-box;
  box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.06);
  padding: 0.25rem;
  font-size: 14px;
  min-width: 200px;
}

.radio-inputs .radio {
  flex: 1 1 auto;
  text-align: center;
}

.radio-inputs .radio input {
  display: none;
}

.radio-inputs .radio .name {
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: none;
  padding: 0.5rem 0;
  color: rgba(51, 65, 85, 1);
  transition: all 0.15s ease-in-out;
  font-weight: 500;
}

.radio-inputs .radio input:checked + .name {
  background-color: #fff;
  font-weight: 600;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: select 0.3s ease;
}

@keyframes select {
  0% { transform: scale(0.95); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

---

## 🔄 Étape 5 : Intégration finale

### 5.1 Passage des props au ChartContainer

```typescript
return (
  <ChartContainer
    data={hasData ? exportData : []}
    energyConfig={ipeConfig}
    startDate={effectiveStartDate}
    endDate={effectiveEndDate}
    filename={`ipe_${baseFilename}${dateRangeString}`}
    showLineChart={hasData}
    showHeatMap={false}
    showExportButton={hasData}
    extraHeaderContent={ipeCards}
    title={`Indice de Performance Énergétique${titleSuffix}`}
    noDataContent={!hasData ? <NoDataMessage /> : undefined}
    showIPEToggle={ipeMode === "double"}
    ipe1Name={ipe1Name}
    ipe2Name={ipe2Name}
    activeIPE={activeIPE}
    onIPEToggle={setActiveIPE}
  />
);
```

---

## ✅ Checklist de validation

### Fonctionnalités
- [ ] Mode simple fonctionne comme avant (rétrocompatibilité)
- [ ] Mode double affiche le toggle
- [ ] Basculement entre IPE fonctionne
- [ ] Données indépendantes pour chaque IPE
- [ ] Export fonctionne avec l'IPE actif

### Interface
- [ ] Toggle positionné correctement dans le header
- [ ] Animations fluides
- [ ] Design cohérent avec le système existant
- [ ] Responsive sur mobile

### Performance
- [ ] Pas de re-render inutiles
- [ ] Chargement asynchrone des données
- [ ] Gestion d'état optimisée

---

## 🚀 Bonnes pratiques

### 1. Gestion d'état
- Séparer les états pour éviter les conflits
- Utiliser des fonctions pures pour la sélection des propriétés
- Centraliser la logique de basculement

### 2. Performance
- Charger uniquement les données nécessaires
- Éviter les re-calculs inutiles avec `useMemo`
- Optimiser les `useEffect` avec des dépendances précises

### 3. Accessibilité
- Utiliser des labels appropriés pour le toggle
- Supporter la navigation clavier
- Fournir des descriptions ARIA

### 4. Maintenabilité
- Documenter les transitions d'état
- Utiliser des noms de propriétés cohérents
- Séparer les responsabilités en composants

---

## 🔧 Dépannage

### Problèmes courants

1. **Toggle ne s'affiche pas**
   - Vérifier que `ipeMode === "double"`
   - S'assurer que `ipe1Name` et `ipe2Name` sont définis

2. **Données ne se chargent pas**
   - Vérifier les `useEffect` pour chaque IPE
   - Contrôler les conditions de chargement

3. **Export incorrect**
   - S'assurer que `getCurrentIPEProps()` retourne les bonnes données
   - Vérifier que `currentProps.data` contient l'IPE actif

### Debug
```typescript
// Ajouter des logs pour débugger
console.log("Active IPE:", activeIPE);
console.log("Current props:", getCurrentIPEProps());
console.log("Export data:", exportData);
```

---

## 📚 Ressources

- [Documentation Mendix Widgets](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets/)
- [Guide FSM](https://xstate.js.org/docs/)
- [Bonnes pratiques React](https://react.dev/learn)

---

*Document créé le 2024-12-19 - Version 1.0* 