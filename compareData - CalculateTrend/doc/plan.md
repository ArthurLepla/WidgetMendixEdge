### Plan d’action détaillé

Objectifs (selon tes règles)
- Energetic: 1 timeseries/asset, variable liée à l’asset, MetricType=Conso, EnergyType=widget.
- IPE simple (Double IPE OFF): 1 timeseries/asset, variable liée à l’asset, MetricType=IPE_kg, EnergyType=widget, utiliser l’unité de la variable.
- IPE double (Double IPE ON): afficher le toggle; pour chaque asset, construire 2 séries distinctes si disponibles (IPE_kg et IPE), récupérer leurs unités respectives et piloter les courbes/axes/labels selon le toggle.
- Pas de Production (exclure Prod/Prod_kg).
- Granularité persistée via `display*` (lecture) et `buffer*` (écriture) + actions.
- Conserver messages et recommandations (fallback) du modèle Detailswidget.

1) Typages et modèles de données
- CompareData/src/CompareData.tsx
  - Étendre `AssetData` avec `unit: string` et conserver `metricType: "Conso" | "IPE_kg" | "IPE"`.
  - Étendre `AssetStats` avec `metricType?: string` (pour filtrer les stats selon le toggle).
- CompareData/src/components/ChartContainer/ChartContainer.tsx
  - Ajouter une prop interne calculée `currentUnit` (selon IPE1/2) et la passer aux sous-composants (LineChart, cards) pour affichage/format.
- Vérifier `typings/CompareDataProps.d.ts`: on exploitera `tsVariableAssociation?` et `variableAssetAssociation?` (déjà présents) pour vérifier que la variable est bien liée à l’asset.

2) Extraction et filtrage des séries (CompareData.tsx)
- Energetic:
  - Filtrer `timeSeriesDataSource.items` par asset via `tsAssetAssociation.get(tsPoint)`.
  - Trouver la variable via `tsVariableAssociation.get(tsPoint)`, puis valider:
    - `variableAssetAssociation?.get(variable)?.value?.id === asset.id` (si l’assoc est fournie).
    - `variableMetricTypeAttr === "Conso"`.
    - `variableEnergyTypeAttr === energyTypeConfig`.
  - Agréger les points dans UNE série par asset:
    - `metricType: "Conso"`, `unit`: unité par défaut énergie (ou `getSmartUnitForComparison(..., viewMode="energetic")` si on veut l’uniformiser).
- IPE simple (Double IPE OFF):
  - Même logique, mais `variableMetricTypeAttr === "IPE_kg"` et `variableEnergyTypeAttr === energyTypeConfig`.
  - UNE série par asset: `metricType: "IPE_kg"`, `unit`: `variableUnitAttr.get(variable)?.value` (si vide, fallback `getSmartIPEUnitForSeries`).
- IPE double (Double IPE ON):
  - Pour chaque asset, construire deux bacs:
    - IPE_kg: `variableMetricTypeAttr === "IPE_kg" && energyType === energyTypeConfig`.
    - IPE: `variableMetricTypeAttr === "IPE" && energyType === energyTypeConfig`.
  - Créer JUSQU’À DEUX séries par asset: une `metricType: "IPE_kg"`, une `metricType: "IPE"`, chacune avec la `unit` de sa variable dominante (si plusieurs variables IPE_kg/IPE existent, choisir l’unité la plus fréquente).
  - Si seulement un des deux existe globalement, le toggle se masque (inchangé).
- Supprimer toute tolérance Production:
  - Retirer `hasProductionData` et l’inclusion de `Prod`/`Prod_kg` du filtrage IPE.
- Stats:
  - Calculer les stats par série (par variant) pour que le `ChartContainer` puisse afficher les cartes/tab en cohérence avec le toggle; ajouter `metricType` aux stats pour filtrage côté UI.

3) Unités et toggle IPE
- CompareData.tsx
  - Calculer `ipe1Name` et `ipe2Name` depuis les unités des variantes réelles (priorité: unités lues des variables; fallback `getIPEVariantsFromVariables` puis `getSmartIPEUnits`).
  - En IPE simple: passer les deux labels identiques à l’UI, mais le toggle sera masqué (pas d’impact).
- ChartContainer (CompareData)
  - Conserver la séparation des données par `asset.metricType` pour alimenter le toggle.
  - Déduire `currentUnit` du toggle: `ipe1Name` si IPE1 actif, `ipe2Name` si IPE2 actif.
  - Passer `currentUnit` aux sous-composants (LineChart/cards) pour axes et badges d’unités.

4) Granularité (persistée)
- CompareData.tsx
  - Lecture initiale: `displayModeAttr?.value`, `displayTimeAttr?.value`, `displayUnitAttr?.value`, `displayPreviewOKAttr`.
  - Écriture: sur changement UI:
    - `bufferModeAttr.setValue("Auto" | "Strict")`; `onModeChange?.execute()`.
    - `bufferTimeAttr.setValue(Big(value))`; `bufferUnitAttr.setValue(mappedUnit)`; `onTimeChange?.execute()`.
- ChartContainer
  - Exposer des callbacks simples `onGranularityModeChange`, `onGranularityValueChange`, `onGranularityUnitChange` (tu as déjà une implémentation proche; les raccorder au parent).
  - Respecter `isGranularityDisabled` si preview KO ou pas de permission (feature off).

5) Fallbacks et messages (use-features)
- Porter `detailswidget - CalculateTrend/src/hooks/use-features.ts` vers `compareData - CalculateTrend/src/hooks/use-features.ts` (ou intégrer sa logique dans CompareData pour limiter les diff).
  - Calculer: `hasIPE1Data`, `hasIPE2Data`, `ipeCount`, `recommendedMode`, `shouldShowConsumptionFallback`, `fallbackMode`, `fallbackReason`, `canDisplayData`.
- CompareData.tsx
  - En IPE: si `shouldShowConsumptionFallback` → `IPEUnavailable` avec `ipeCount` et `recommendedMode`.
  - Si `!canDisplayData` → écran erreur IPE cohérent.
  - Energetic: `ConsumptionUnavailable` si vide.

6) UI/ChartContainer.css
- Conserver les styles toggle/controls. Ajouter si besoin une classe pour afficher `currentUnit` près du titre/axe si pas géré dans les charts.
- Vérifier z-index local du header actions (préserver compat Mendix).

7) Nettoyage et cohérence
- Unifier les utilitaires:
  - Utiliser `shouldDisplayVariable()` du modèle (ou version locale alignée) pour éviter logique dupliquée.
  - Garder `smartUnitUtils` actuel (il est déjà très proche du modèle).
- Supprimer code résiduel lié à Production dans CompareData.
- Réactiver l’usage de `variableAssetAssociation` (si fourni) pour valider que la variable est bien liée à l’asset.

8) Tests/QA
- Jeux de tests manuels (pages x8):
  - Energetic Elec/Gaz/Eau/Air: 1 série/asset, MetricType=Conso, EnergyType OK, unités OK, granularité persistée.
  - IPE simple: 1 série/asset, MetricType=IPE_kg, EnergyType OK, unité variable OK.
  - IPE double:
    - Cas A: 2 variantes présentes pour tous les assets → toggle visible, labels = unités réelles, switch OK.
    - Cas B: variantes mixtes (certains assets n’ont qu’une variante) → toggle visible si au moins une paire existe; séries absentes non affichées.
    - Cas C: aucune IPE → `IPEUnavailable` avec `recommendedMode="fallback"`.
  - Granularité: lecture de `display*`, écriture de `buffer*`, exécution des actions.
- Vérifier absence totale de Prod dans les graphes.
- Vérifier que l’unité affichée des axes/labels correspond à la variante active.

9) Documentation et avancement
- Mettre à jour `avancement.md` à chaque groupe d’édits:
  - Contexte, choix (pas de Prod), logique de sélection des variables/time series, gestion du toggle.
  - Impacts sur perf/maintenabilité.

10) Séquencement d’implémentation
- Étape 1: Modèles de données + filtrage strict par mode (Energetic/ IPE simple) + suppression Prod.
- Étape 2: Mode IPE double: séries par variante (par asset) + labels unités + toggle fonctionnel.
- Étape 3: Granularité persistée (lecture/écriture) + callbacks.
- Étape 4: Fallbacks (port `use-features`) + écrans `IPEUnavailable/ConsumptionUnavailable`.
- Étape 5: Propagation de `currentUnit` aux charts et cartes.
- Étape 6: QA et docs.

Assumptions
- Toggle IPE visible si au moins un asset possède 2 variantes (sinon masqué).  
- Si un asset ne possède pas la variante active, sa série est simplement absente dans cet état du toggle.