### ⌛ Changement (2025-08-09): Alignement CompareData avec Detailswidget (Double IPE, granularité, Big.js, export UTC)

- `src/CompareData.tsx`: import `Big` par défaut, branchement des features via hooks (`useDoubleIPEToggle`, `useGranulariteManuelleToggle`), calcul `shouldShowToggle` piloté par feature flag, mapping granularité (control avancé vs affichage simple), normalisation `second`→`minute`.
- `src/components/ChartContainer/ChartContainer.tsx` et `src/components/LineChart.tsx`: import `Big` par défaut.
- `src/hooks/use-feature-toggle.ts`: nouveau hook (même contrat que Detailswidget) pour lire `featureList`/`featureNameAttr`.
- `src/CompareData.xml`: ajout optionnel des props `featureList` et `featureNameAttr` (non cassant).
- `typings/CompareDataProps.d.ts`: ajout des deux props + correction import `Big`.
- Export: déjà en ISO UTC, confirmé dans `ExportLogic.ts`.

### 🤔 Analyse:
Ces changements unifient CompareData avec le widget Détails: même gating des fonctionnalités, granularité cohérente Auto/Strict, et un toggle IPE affiché uniquement si Double IPE est activé et que les deux séries existent. L’import `Big` par défaut évite les soucis de type/interop. L’export ISO UTC élimine les décalages de fuseau en post‑traitement. Modifs XML non cassantes: projets existants continuent à fonctionner sans configurer les features.

### 💜 Prochaines étapes:
- Ajouter un état non bloquant « calcul en cours » lorsque les datasources sont en `loading` pour remplacer `DATA_SOURCE_NOT_READY`.
- Documenter côté app Mendix que les datasources doivent être pré‑filtrées par `EnergyType`/`MetricType`.
- Tests: IPE simple/double, granularité ON/OFF via flags, export trié et en UTC.

# Journal d'avancement du projet

## 2024-07-26

### ⌛ Changement :
Visibilité du `GranularityControl` en mode IPE (In-Place Editing).

### 🤔 Analyse :
La modification assure que les contrôles de granularité sont visibles dans l'éditeur de Mendix, même sans données complètes. En liant la propriété `isGranularityDisabled` à la présence de données (`!hasData`), le composant apparaît en IPE mais reste non-interactif, prévenant les erreurs tout en donnant un aperçu fidèle de l'interface finale. Cette approche améliore significativement l'expérience de développement et de configuration du widget.

### 🔜 Prochaines étapes :
Aucune étape suivante n'est immédiatement nécessaire pour cette fonctionnalité.

