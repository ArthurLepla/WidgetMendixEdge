# 📋 Plan de Refactorisation - Widget Synthese v2.0
## Migration vers le système unifié Asset/Level

---

## 🎯 Objectif Principal
Transformer le widget Synthese pour qu'il exploite directement les entités **Asset** et **Level**, en conservant l'interface visuelle et les fonctionnalités existantes, tout en unifiant et simplifiant radicalement le backend. Le widget affichera dynamiquement les consommations énergétiques par niveau hiérarchique, avec comparaison période n-1 et DPE configurable.

---

## 📊 Analyse de la Transformation

### Architecture Actuelle à Supprimer
```
❌ Concepts fixes : Usine, Secteurs, Ateliers
❌ Datasources multiples avec attributs directs
❌ Structure rigide à 2 niveaux seulement
❌ Attributs de consommation dupliqués partout
```

### Nouvelle Architecture Simplifiée
```
✅ Hiérarchie dynamique via Levels (L0, L1, L2...)
✅ Assets avec totaux précalculés par JavaActions
✅ Structure flexible à N niveaux
✅ Une source de vérité : les Assets et leurs relations
```

### Principe de Fonctionnement
Le widget va maintenant fonctionner en exploitant la hiérarchie naturelle des Assets via leur Level. Chaque Asset possède déjà ses totaux calculés (ConsoTotalElec, ConsoTotalGaz, etc.) grâce aux JavaActions. Le widget va simplement :
1. Récupérer l'Asset du niveau supérieur (L0) pour les totaux globaux
2. Récupérer les Assets du niveau suivant (L1) pour le breakdown par "secteur"
3. S'adapter automatiquement au nombre de niveaux disponibles

---

## 🚀 Plan de Refactorisation Détaillé

### **Phase 1 : Nettoyage et Réorganisation Complète** (1 jour)

#### 1.1 Création de la Nouvelle Structure
```
SyntheseWidget/
├── src/
│   ├── SyntheseWidget.tsx          # Composant principal refactorisé
│   ├── SyntheseWidget.xml          # Configuration simplifiée
│   ├── SyntheseWidget.editorConfig.ts
│   ├── SyntheseWidget.editorPreview.tsx
│   │
│   ├── components/                  # Composants visuels (réorganisés)
│   │   ├── cards/
│   │   │   ├── CardConsoTotal.tsx  # Carte métrique principale
│   │   │   └── LevelConsoCard.tsx  # Ancien SecteurConsoCard renommé
│   │   ├── charts/
│   │   │   └── ColumnChart.tsx     # Graphique breakdown
│   │   ├── dpe/
│   │   │   └── DPE.tsx             # Système DPE (conservé intact)
│   │   └── navigation/
│   │       └── DateRangeSelector.tsx
│   │
│   ├── adapters/                    # NOUVEAU - Adaptateurs de données
│   │   └── AssetLevelAdapter.ts    # Transformation Asset → Format visuel
│   │
│   ├── types/                       # Types TypeScript
│   │   ├── entities.ts             # Asset, Level, etc.
│   │   └── widget.ts               # Types du widget
│   │
│   ├── utils/                       # Utilitaires
│   │   ├── unitConverter.ts        # Conversion d'unités (conservé)
│   │   └── calculations.ts         # Calculs de variations
│   │
│   └── styles/                      # Styles (vers CSS pur, sans Tailwind)
│       ├── SyntheseWidget.css       # CSS pur sans @tailwind, classes namespacées + !important ciblés (Mendix)
│       └── loader.css
│
└── typings/                         # Types générés
```

#### 1.2 Suppression des Éléments Obsolètes
```bash
# À SUPPRIMER
- Toute référence à "Usine", "Secteur", "Atelier"
- Les types/interfaces spécifiques UsineData, SecteurData
- Les datasources multiples dsUsine, dsSecteurs
- Les attributs directs de consommation dans le XML
- Les fichiers de test obsolètes
- Les services inutilisés
```

#### 1.3 Archivage de Sécurité
```bash
# Créer une archive complète avant refactoring
SyntheseWidget_v1_backup_[date].zip
├── src/           # Code source complet v1
├── package.json   # Dépendances v1
└── README.md      # Documentation v1
```

---

### **Phase 2 : Nouveau Modèle de Données Unifié** (2 jours)

#### 2.1 Configuration XML Simplifiée
```xml
<!-- src/SyntheseWidget.xml - Structure unifiée -->
<widget id="synthese.widget" needsEntityContext="true">
    <properties>
        <!-- ========== Configuration des Niveaux ========== -->
        <propertyGroup caption="Configuration des Niveaux">
            <!-- Niveau principal (ex: L0 - Usine) -->
            <property key="topLevelName" type="expression" defaultValue="'L0'">
                <caption>Nom du Niveau Principal</caption>
                <description>Niveau hiérarchique le plus élevé (ex: L0)</description>
                <returnType type="String"/>
            </property>
            
            <!-- Niveau breakdown (ex: L1 - Secteurs) -->
            <property key="breakdownLevelName" type="expression" defaultValue="'L1'">
                <caption>Nom du Niveau Breakdown</caption>
                <description>Niveau pour le détail (ex: L1)</description>
                <returnType type="String"/>
            </property>
        </propertyGroup>

        <!-- ========== Sources de Données Unifiées ========== -->
        <propertyGroup caption="Sources de Données">
            <!-- Assets du niveau principal -->
            <property key="mainLevelAssets" type="datasource" isList="true" required="true">
                <caption>Assets Niveau Principal</caption>
                <description>Microflow retournant les assets du niveau principal</description>
            </property>
            
            <!-- Assets du niveau breakdown -->
            <property key="breakdownLevelAssets" type="datasource" isList="true" required="true">
                <caption>Assets Niveau Détail</caption>
                <description>Microflow retournant les assets pour le breakdown</description>
            </property>
            
            <!-- Association pour récupérer le niveau d'un asset -->
            <property key="assetLevel" type="association" dataSource="mainLevelAssets">
                <caption>Asset → Level</caption>
                <description>Association vers l'entité Level</description>
            </property>
        </propertyGroup>

        <!-- ========== Configuration Temporelle ========== -->
        <propertyGroup caption="Période et Calculs">
            <!-- Objet de configuration temporelle -->
            <property key="periodConfig" type="object" required="true">
                <caption>Configuration Période</caption>
                <description>Objet contenant la période sélectionnée et les dates</description>
            </property>
            
            <!-- Actions de recalcul -->
            <property key="refreshDataAction" type="action" required="true">
                <caption>Rafraîchir les Données</caption>
                <description>Microflow pour recalculer les métriques via JavaActions</description>
            </property>
            
            <!-- Callback changement période -->
            <property key="onPeriodChange" type="action">
                <caption>Sur Changement Période</caption>
                <description>Action lors du changement jour/semaine/mois</description>
            </property>
        </propertyGroup>

        <!-- ========== Navigation et Actions ========== -->
        <propertyGroup caption="Actions">
            <property key="onAssetClick" type="action">
                <caption>Sur Clic Asset</caption>
                <description>Navigation vers le détail d'un asset</description>
            </property>
            
            <property key="selectedAssetAttribute" type="attribute">
                <caption>Asset Sélectionné</caption>
                <description>Attribut pour stocker l'asset cliqué</description>
            </property>
        </propertyGroup>

        <!-- ========== Configuration DPE (Inchangée) ========== -->
        <!-- Conserver EXACTEMENT la même structure DPE qui fonctionne -->
        <propertyGroup caption="Configuration DPE">
            <!-- ... configuration DPE existante ... -->
        </propertyGroup>

        <!-- ========== Configuration des Unités ========== -->
        <propertyGroup caption="Unités">
            <!-- Conserver la configuration des unités existante -->
            <property key="baseUnitElectricity" type="enumeration" defaultValue="auto">
                <!-- ... -->
            </property>
            <!-- ... autres unités ... -->
        </propertyGroup>
    </properties>
</widget>
```

#### 2.2 Types Unifiés
```typescript
// src/types/entities.ts
export interface Asset {
    id: string;
    nom: string;
    iihId: string;
    
    // Relations
    level?: Level;
    parent?: Asset;
    children?: Asset[];
    
    // Métriques calculées par JavaActions
    // Période courante
    consoTotalElec?: number;
    consoTotalGaz?: number;
    consoTotalEau?: number;
    consoTotalAir?: number;
    
    // Période précédente (n-1)
    consoTotalElecPrec?: number;
    consoTotalGazPrec?: number;
    consoTotalEauPrec?: number;
    consoTotalAirPrec?: number;
    
    // IPE si nécessaire
    ipeElec?: number;
    ipeGaz?: number;
    ipeEau?: number;
    ipeAir?: number;
}

export interface Level {
    id: string;
    nom: string;        // "L0", "L1", "L2", etc.
    sortOrder: number;  // 0, 1, 2, etc.
    description?: string;
}

// Plus besoin de types séparés Usine/Secteur !
export interface AssetMetrics {
    nom: string;
    level: string;
    // Consommations actuelles
    consoElec: number;
    consoGaz: number;
    consoEau: number;
    consoAir: number;
    // Consommations précédentes
    consoElecPrec: number;
    consoGazPrec: number;
    consoEauPrec: number;
    consoAirPrec: number;
}
```

#### 2.3 Adaptateur Unifié Asset → Métriques
```typescript
// src/adapters/AssetLevelAdapter.ts
import { Asset, AssetMetrics } from "../types/entities";
import { Big } from "big.js";

export class AssetLevelAdapter {
    /**
     * Transforme un Asset en métriques pour l'affichage
     * Fonctionne pour n'importe quel niveau (L0, L1, L2...)
     */
    static toAssetMetrics(asset: Asset): AssetMetrics {
        return {
            nom: asset.nom,
            level: asset.level?.nom || "Unknown",
            
            // Période courante
            consoElec: asset.consoTotalElec || 0,
            consoGaz: asset.consoTotalGaz || 0,
            consoEau: asset.consoTotalEau || 0,
            consoAir: asset.consoTotalAir || 0,
            
            // Période précédente
            consoElecPrec: asset.consoTotalElecPrec || 0,
            consoGazPrec: asset.consoTotalGazPrec || 0,
            consoEauPrec: asset.consoTotalEauPrec || 0,
            consoAirPrec: asset.consoTotalAirPrec || 0
        };
    }
    
    /**
     * Agrège plusieurs assets du même niveau
     * Utile pour calculer les totaux d'un niveau complet
     */
    static aggregateAssets(assets: Asset[]): AssetMetrics {
        const totals = assets.reduce((acc, asset) => {
            return {
                consoElec: acc.consoElec + (asset.consoTotalElec || 0),
                consoGaz: acc.consoGaz + (asset.consoTotalGaz || 0),
                consoEau: acc.consoEau + (asset.consoTotalEau || 0),
                consoAir: acc.consoAir + (asset.consoTotalAir || 0),
                consoElecPrec: acc.consoElecPrec + (asset.consoTotalElecPrec || 0),
                consoGazPrec: acc.consoGazPrec + (asset.consoTotalGazPrec || 0),
                consoEauPrec: acc.consoEauPrec + (asset.consoTotalEauPrec || 0),
                consoAirPrec: acc.consoAirPrec + (asset.consoTotalAirPrec || 0)
            };
        }, {
            consoElec: 0, consoGaz: 0, consoEau: 0, consoAir: 0,
            consoElecPrec: 0, consoGazPrec: 0, consoEauPrec: 0, consoAirPrec: 0
        });
        
        return {
            nom: assets[0]?.level?.nom || "Total",
            level: assets[0]?.level?.nom || "Unknown",
            ...totals
        };
    }
    
    /**
     * Convertit les métriques en format Big pour les composants
     */
    static toBigNumbers(metrics: AssetMetrics) {
        return {
            consoElec: new Big(metrics.consoElec),
            consoGaz: new Big(metrics.consoGaz),
            consoEau: new Big(metrics.consoEau),
            consoAir: new Big(metrics.consoAir),
            consoElecPrec: new Big(metrics.consoElecPrec),
            consoGazPrec: new Big(metrics.consoGazPrec),
            consoEauPrec: new Big(metrics.consoEauPrec),
            consoAirPrec: new Big(metrics.consoAirPrec)
        };
    }
}
```

---

### **Phase 3 : Refactorisation du Composant Principal** (2 jours)

#### 3.1 Widget Principal Simplifié
```typescript
// src/SyntheseWidget.tsx - Version unifiée
import { ReactElement, createElement, useState, useMemo, useCallback } from "react";
import { SyntheseWidgetContainerProps } from "../typings/SyntheseWidgetProps";
import { AssetLevelAdapter } from "./adapters/AssetLevelAdapter";
import { LoadingOverlay } from "./components/LoadingOverlay";

// Import des composants visuels (renommés mais fonctionnalité identique)
import { CardConsoTotal } from "./components/cards/CardConsoTotal";
import { ColumnChart } from "./components/charts/ColumnChart";
import { LevelConsoCard } from "./components/cards/LevelConsoCard"; // Ex-SecteurConsoCard
import { DPE } from "./components/dpe/DPE";
import { DateRangeSelector } from "./components/navigation/DateRangeSelector";

export function SyntheseWidget(props: SyntheseWidgetContainerProps): ReactElement {
    const {
        mainLevelAssets,
        breakdownLevelAssets,
        refreshDataAction,
        onPeriodChange,
        onAssetClick,
        selectedAssetAttribute,
        // Props DPE et unités conservées telles quelles
        ...dpeAndUnitProps
    } = props;
    
    // État local pour la période
    const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Agrégation des métriques du niveau principal (ex: L0)
    const mainLevelMetrics = useMemo(() => {
        if (mainLevelAssets?.status !== "available" || !mainLevelAssets.items?.length) {
            return null;
        }
        
        // Les assets du niveau principal ont déjà leurs totaux calculés
        const aggregated = AssetLevelAdapter.aggregateAssets(mainLevelAssets.items);
        return AssetLevelAdapter.toBigNumbers(aggregated);
    }, [mainLevelAssets]);
    
    // Transformation des assets du niveau breakdown (ex: L1)
    const breakdownMetrics = useMemo(() => {
        if (breakdownLevelAssets?.status !== "available" || !breakdownLevelAssets.items?.length) {
            return [];
        }
        
        // Chaque asset a déjà ses totaux, on les transforme juste pour l'affichage
        return breakdownLevelAssets.items.map(asset => {
            const metrics = AssetLevelAdapter.toAssetMetrics(asset);
            return {
                ...metrics,
                // Conversion en Big pour les composants
                ...AssetLevelAdapter.toBigNumbers(metrics)
            };
        });
    }, [breakdownLevelAssets]);
    
    // Gestion du changement de période
    const handlePeriodChange = useCallback(async (newPeriod: 'day' | 'week' | 'month') => {
        setSelectedPeriod(newPeriod);
        setIsRefreshing(true);
        
        try {
            // Mise à jour de la période dans l'objet de configuration
            // Le microflow Mendix mettra à jour DateRange et CalculationTrend
            if (onPeriodChange?.canExecute) {
                await onPeriodChange.execute();
            }
            
            // Rafraîchissement des données via JavaActions
            if (refreshDataAction?.canExecute) {
                await refreshDataAction.execute();
            }
        } catch (error) {
            console.error("Erreur lors du changement de période:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [onPeriodChange, refreshDataAction]);
    
    // Gestion du clic sur un asset
    const handleAssetClick = useCallback(async (asset: any, energyType: string) => {
        if (selectedAssetAttribute && asset) {
            selectedAssetAttribute.setValue(asset);
        }
        
        if (onAssetClick?.canExecute) {
            await onAssetClick.execute();
        }
    }, [selectedAssetAttribute, onAssetClick]);
    
    // Calcul de la valeur DPE (basée sur le niveau principal)
    const dpeValue = mainLevelMetrics?.consoElec?.toNumber() || 0;
    const dpeGrade = calculateDPEGrade(dpeValue, selectedPeriod);
    
    // Affichage du loader pendant le rafraîchissement
    if (isRefreshing) {
        return <LoadingOverlay message="Mise à jour des données..." />;
    }
    
    // Message si pas de données
    if (!mainLevelMetrics) {
        return (
            <div className="synthese-widget">
                <div className="card-base text-center p-8">
                    <p className="text-gray-500">Aucune donnée disponible</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Vérifiez la configuration des niveaux et des sources de données
                    </p>
                </div>
            </div>
        );
    }
    
    // Rendu principal - IDENTIQUE VISUELLEMENT À L'ORIGINAL
    return (
        <div className="synthese-widget">
            {/* Sélecteur de période */}
            <div className="mb-6">
                <DateRangeSelector
                    onClickDay={() => handlePeriodChange('day')}
                    onClickWeek={() => handlePeriodChange('week')}
                    onClickMonth={() => handlePeriodChange('month')}
                    activeButton={selectedPeriod}
                />
            </div>
            
            {/* Cartes des 4 énergies - Niveau principal agrégé */}
            <div className="grid-responsive-4 mb-6">
                <CardConsoTotal
                    title="Électricité"
                    currentValue={mainLevelMetrics.consoElec}
                    previousValue={mainLevelMetrics.consoElecPrec}
                    type="electricity"
                    baseUnit={props.baseUnitElectricity}
                />
                <CardConsoTotal
                    title="Gaz"
                    currentValue={mainLevelMetrics.consoGaz}
                    previousValue={mainLevelMetrics.consoGazPrec}
                    type="gas"
                    baseUnit={props.baseUnitGas}
                />
                <CardConsoTotal
                    title="Eau"
                    currentValue={mainLevelMetrics.consoEau}
                    previousValue={mainLevelMetrics.consoEauPrec}
                    type="water"
                    baseUnit={props.baseUnitWater}
                />
                <CardConsoTotal
                    title="Air"
                    currentValue={mainLevelMetrics.consoAir}
                    previousValue={mainLevelMetrics.consoAirPrec}
                    type="air"
                    baseUnit={props.baseUnitAir}
                />
            </div>
            
            {/* Breakdown par niveau (ex: L1) */}
            <div className="grid-responsive-2 mb-6">
                {/* Graphique en colonnes */}
                <ColumnChart
                    data={breakdownMetrics}
                    title={`Consommation par ${props.breakdownLevelName || 'Niveau'}`}
                    type="elec"
                    baseUnit={props.baseUnitElectricity}
                    onBarClick={(item) => handleAssetClick(item, 'electricity')}
                />
                
                {/* DPE - Complètement inchangé */}
                <DPE
                    value={dpeValue}
                    grade={dpeGrade}
                    period={selectedPeriod}
                    {...dpeAndUnitProps}
                />
            </div>
            
            {/* Cartes détaillées par asset du niveau breakdown */}
            <div className="grid-responsive-2">
                {breakdownMetrics.map((metrics, index) => (
                    <LevelConsoCard
                        key={index}
                        name={metrics.nom}
                        level={metrics.level}
                        consoElec={metrics.consoElec}
                        consoGaz={metrics.consoGaz}
                        consoEau={metrics.consoEau}
                        consoAir={metrics.consoAir}
                        consoElecPrec={metrics.consoElecPrec}
                        consoGazPrec={metrics.consoGazPrec}
                        consoEauPrec={metrics.consoEauPrec}
                        consoAirPrec={metrics.consoAirPrec}
                        baseUnitElectricity={props.baseUnitElectricity}
                        baseUnitGas={props.baseUnitGas}
                        baseUnitWater={props.baseUnitWater}
                        baseUnitAir={props.baseUnitAir}
                        onClick={() => handleAssetClick(breakdownLevelAssets.items[index], 'detail')}
                    />
                ))}
            </div>
        </div>
    );
}
```

#### 3.2 Renommage / Migration des classes & Dépendances
```typescript
// src/components/cards/LevelConsoCard.tsx
// (Ancien SecteurConsoCard, juste renommé)
export interface LevelConsoCardProps {
    name: string;
    level: string;  // NOUVEAU: affiche le niveau (L0, L1, etc.)
    // ... reste identique
}

// Le composant reste IDENTIQUE visuellement
// Seule différence: on peut afficher le niveau si souhaité
```

- Migration classes Tailwind → CSS pur:
  - Remplacement des utilitaires (mb-6, grid, flex, etc.) par classes internes `grid-responsive-*`, `card-base`, `btn-*`.
  - Uniformisation de la police: Barlow partout via `.syntheseWidget-root { font-family: "Barlow", Arial, sans-serif }`.
  - DPE Settings: remplacement des classes utilitaires par `dialog-*`, `form-*`, `btn-*`.

- Dépendances:
  - Mantine/Tabler supprimés. Radix Dialog + lucide conservés. PostCSS: autoprefixer seul.
```

---

### **Phase 4 : Configuration Mendix** (2 jours)

#### 4.1 Microflows Principaux

##### MW_GetMainLevelAssets
```
1. [Start]
2. Paramètre: LevelName (ex: "L0")
3. Retrieve: Level où Nom = $LevelName
4. Retrieve: Assets où Asset_Level = $Level
5. [End] → Retourner List<Asset>
```

##### MW_GetBreakdownLevelAssets
```
1. [Start]
2. Paramètre: LevelName (ex: "L1")
3. Retrieve: Level où Nom = $LevelName
4. Retrieve: Assets où Asset_Level = $Level
5. Trier par Asset.Nom
6. [End] → Retourner List<Asset>
```

##### MW_RefreshSyntheseData
```
1. [Start]
2. Récupérer PeriodConfig depuis contexte
3. Déterminer DateRange et CalculationTrend selon la période
4. Récupérer tous les Assets concernés (L0 + L1)
5. Pour chaque Asset:
   - JavaAction: CalculateAssetCompleteMetrics
     * Input: Asset, DateRange, EnergyType.All, CalculationTrend
     * Les totaux sont directement mis à jour sur l'Asset
6. [End] → Les Assets ont maintenant leurs totaux à jour
```

##### MW_HandlePeriodChange
```
1. [Start]
2. Paramètre: NewPeriod (day/week/month)
3. Mettre à jour PeriodConfig.SelectedPeriod
4. Calculer les nouvelles dates:
   - Day: Aujourd'hui vs Hier
   - Week: Cette semaine vs Semaine dernière
   - Month: Ce mois vs Mois dernier
5. Mettre à jour DateRange avec les nouvelles dates
6. Mettre à jour CalculationTrend.Aggregation
7. Appeler MW_RefreshSyntheseData
8. [End]
```

#### 4.2 Configuration dans Mendix Studio Pro

##### Page de Configuration
```
1. Créer un objet de contexte SyntheseContext contenant:
   - PeriodConfig (période sélectionnée, dates)
   - SelectedAsset (pour la navigation)
   - DPESettings (configuration des seuils)

2. Configurer le widget:
   - topLevelName: "L0"
   - breakdownLevelName: "L1"
   - mainLevelAssets: MW_GetMainLevelAssets
   - breakdownLevelAssets: MW_GetBreakdownLevelAssets
   - refreshDataAction: MW_RefreshSyntheseData
   - onPeriodChange: MW_HandlePeriodChange
```

---

### **Phase 5 : Tests et Validation** (1-2 jours)

#### 5.1 Tests Fonctionnels
- [ ] **Affichage initial** : Les totaux du niveau L0 s'affichent correctement
- [ ] **Breakdown** : Les assets du niveau L1 apparaissent dans les graphiques et cartes
- [ ] **Changement de période** : Day/Week/Month met à jour toutes les données
- [ ] **Comparaisons n-1** : Les variations sont correctement calculées
- [ ] **DPE** : Le grade s'adapte à la consommation et à la période
- [ ] **Configuration DPE** : Les seuils sont modifiables et sauvegardés
- [ ] **Navigation** : Clic sur un asset déclenche l'action appropriée

#### 5.2 Tests de Performance
- [ ] Temps de chargement initial < 2s
- [ ] Changement de période < 1.5s
- [ ] Pas de re-rendus inutiles
- [ ] Mémoire stable après plusieurs changements

#### 5.3 Tests d'Adaptabilité
- [ ] Fonctionne avec 1 seul niveau (pas de breakdown)
- [ ] Fonctionne avec 10+ assets au niveau L1
- [ ] S'adapte si certains assets n'ont pas toutes les énergies
- [ ] Gère les valeurs nulles ou zéro gracieusement

#### 5.4 Validation Visuelle
- [ ] Interface IDENTIQUE à l'original
- [ ] Responsive sur mobile/tablette/desktop
- [ ] Animations fluides
- [ ] Pas de régression visuelle

---

### **Phase 6 : Documentation et Déploiement** (1 jour)

#### 6.1 Documentation Technique
```markdown
# Widget Synthese v2.0 - Documentation

## Architecture Simplifiée
Le widget exploite désormais directement la hiérarchie Asset/Level :
- Plus de concepts fixes Usine/Secteur
- Adaptation automatique aux niveaux disponibles
- Une seule source de vérité : les Assets

## Configuration
1. Spécifier les niveaux à afficher (L0, L1...)
2. Configurer les microflows de récupération des assets
3. Les JavaActions calculent automatiquement les totaux

## Avantages
- Flexibilité : fonctionne avec N niveaux
- Simplicité : plus de duplication de données
- Maintenabilité : code unifié et clair
```

#### 6.2 Guide de Migration
```markdown
# Migration v1 → v2

## Changements de Configuration
1. Remplacer dsUsine → mainLevelAssets (niveau L0)
2. Remplacer dsSecteurs → breakdownLevelAssets (niveau L1)
3. Supprimer tous les attributs directs de consommation
4. Configurer les microflows pour utiliser les JavaActions

## Mapping des Données
- Usine → Assets de niveau L0
- Secteurs → Assets de niveau L1
- Ateliers → Assets de niveau L2 (si nécessaire)
```

---

## 📈 Bénéfices de cette Refactorisation

### Simplification Radicale
Le passage de multiples datasources avec attributs directs à une architecture unifiée Asset/Level élimine toute la complexité de mapping. Le code est divisé par 2 en termes de complexité.

### Flexibilité Totale
Le widget s'adapte maintenant à n'importe quelle structure hiérarchique. Vous pouvez avoir 2, 3, ou 10 niveaux, le widget fonctionnera. Il suffit de changer les paramètres L0/L1 pour afficher d'autres niveaux.

### Maintenabilité Améliorée
Plus de duplication entre Usine/Secteur/Atelier. Un seul adaptateur gère tous les niveaux. Les modifications futures seront beaucoup plus simples.

### Performance Optimisée
Les JavaActions calculent directement les totaux sur les Assets. Plus besoin d'agréger des TimeSeriesPoints côté widget. Les données sont prêtes à l'emploi.

### Interface Préservée
L'utilisateur ne verra AUCUNE différence visuelle. Toutes les fonctionnalités sont conservées. L'expérience reste identique.

---

## 🚨 Points d'Attention Critiques

### Validation des Totaux
Assurez-vous que les JavaActions calculent bien TOUS les totaux nécessaires sur les Assets :
- ConsoTotalElec, ConsoTotalGaz, ConsoTotalEau, ConsoTotalAir pour la période courante
- Les mêmes avec le suffixe "Prec" pour la période n-1

### Gestion des Niveaux Manquants
Si un niveau n'existe pas (ex: pas de L2), le widget doit gérer gracieusement ce cas. Prévoir des messages appropriés ou masquer les sections vides.

### Migration des Données DPE
Les seuils DPE configurés doivent être conservés lors de la migration. Faire un export/import si nécessaire.

---

## 🎯 Conclusion

Cette refactorisation transforme le widget Synthese en un composant véritablement flexible et maintenable. En abandonnant les concepts rigides Usine/Secteur au profit du système Asset/Level, vous obtenez un widget qui s'adapte à toute structure organisationnelle, tout en conservant l'interface que vos utilisateurs connaissent et apprécient.

La simplicité de la nouvelle architecture facilitera grandement les évolutions futures et réduira considérablement la dette technique.

---

## 🔁 Extension: Ingestion complète Levels/Assets + Sélection des niveaux

### But
Exploiter pleinement les entités `Asset` et `Level` en chargeant tous les niveaux et tous les assets, puis en agrégeant côté widget. Ajouter une « sélection de niveaux » configurable pour inclure/exclure des niveaux (qui peut le plus peut le moins).

### Changements XML (faits)
```
Nouveaux groupes/propriétés:
- Niveaux & Sélection
  - levels (datasource list → Level)
  - levelName (attribute → levels)
  - levelSortOrder (attribute → levels) [optionnel]

- Sources de Données
  - allAssets (datasource list → Asset)
  - assetName (attribute → allAssets)
- assetLevel (association → allAssets → Level) avec selectableObjects="levels" et associationTypes Reference

Attributs métriques (inchangés mais désormais liés à allAssets):
- attrTotalConsoElec, attrTotalConsoGaz, attrTotalConsoEau, attrTotalConsoAir
- attrTotalConsoElecPeriodPrec, attrTotalConsoGazPeriodPrec, attrTotalConsoEauPeriodPrec, attrTotalConsoAirPeriodPrec

Supprimés (nettoyage):
- topLevelName, breakdownLevelName
- mainLevelAssets, breakdownLevelAssets
- attrSecteurNom et attrSecteurConso* liés au breakdown
```

### Implémentation côté TS (fait)
- Agrégé tous les `allAssets` par `assetLevel` via l'objet associé Reference; tri par `levelSortOrder`; fallback si niveau non listé.
- Calculer:
  - Totaux globaux = somme des niveaux sélectionnés
  - Breakdown = 1 item par niveau sélectionné (nom=levelName, valeurs agrégées)
- UI inchangée visuellement (cards/charts/DPE). Les libellés passent de « Secteur » à « Niveau ».

### UI Modernisée (inspirée de la maquette)
- Palette conservée: `primary/#18213e`, `electric/#38a13c`, `gas/#f9be01`, `water/#3293f3`, `air/#66d8e6`.
- Typo: Barlow globale.
- Nouveaux composants:
  - `StackedBarChart` (ECharts): répartition empilée élec/gaz/eau/air par niveau, tooltips unitaires par série.
  - `DateRangeSelector` revisité: `btn-toggle` actifs/inactifs, tooltip centralisé.
  - `DPE` Settings: modal Radix stylé via classes `dialog-*` + boutons `btn-*`.
- Harmonisation CSS: classes `card-base`, `grid-responsive-*`, `title-*`, `value-*`, `variation-*`, `section-row`, `text-*`.

### Accessibilité & UX
- Couleurs respectant le contraste AA pour textes critiques.
- Tooltips informatifs, focus visible sur boutons du modal DPE.
- Réactivité: grilles responsives, labels tronqués si besoin dans les charts.

### Sélection de niveaux (UX/Studio Pro)
- On ne définit pas `selectedLevels` dans le widget. Le filtrage se fait côté datasource (XPath/microflow). Si besoin d’une UI runtime plus tard, on ajoutera une feature dédiée.

### Microflows suggérés
- MW_GetAllLevels
- MW_GetSelectedLevels (optionnel) → retourne une sous‑liste selon préférences
- MW_GetAllAssets (avec associations → Level)
- MW_RefreshSyntheseData (inchangé)

### Tests
- Niveaux vides → message gracieux
- 10+ niveaux → labels et grilles OK (vérifier ColumnChart adaptatif)