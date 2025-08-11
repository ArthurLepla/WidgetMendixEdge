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

## 2025-08-11

### ⌛ Changement :
Correction des types pour les props listées Mendix dans `src/CompareData.tsx` (accès aux objets `selectedAsset` et `dateRange`). Suppression des erreurs TS2339 et TS7006.

### 🤔 Analyse :
Les propriétés `selectedAsset` et `dateRange` sont des listes d'objets (isList=true). L'accès direct aux champs provoquait des erreurs de type. Adoption d'un accès indexé `[0]` et typage explicite des callbacks `.map((name: string) => ...)` garantit la compatibilité TypeScript et évite les `any` implicites.

### ⌛ Changement (2025-08-11 – granularité & IPE labels):
- Hook `useFeatureMap` recalculé sans `useMemo` figé pour refléter immédiatement la désactivation de `Granularite_Manuelle` (évite un état collant du bouton de granularité).
- `ChartContainer` (CompareData): renommage des props `ipe1UnitLabel`/`ipe2UnitLabel` → `ipe1Name`/`ipe2Name` pour s’aligner sur `detailswidget - CalculateTrend` et éviter l’ambiguïté unité/label.
- `ChartContainer.css`: z-index du header-actions passé à `101` pour garantir la superposition des menus Export/Granularity comme dans le widget de référence.

### 🤔 Analyse:
Le recalcul du set de features évite un bug de cache et respecte l’intention des toggles Mendix. L’alignement des noms IPE supprime un risque de conflit sémantique avec le système d’unités smart. Le z-index harmonisé supprime les risques de clipping derrière des conteneurs parents.

### 💜 Prochaines étapes:
- Ajouter un `isDisabled` strict sur la granularité côté UI quand la feature est off ou `displayPreviewOK=false`.
- Vérifier à l’écran que les dropdowns ne sont pas coupés par un parent `overflow: hidden` dans la page Mendix.

### ⌛ Changement (2025-08-11 – z-index overlays):
- Réduction des stacking contexts: `.chart-header-actions` (z-index → auto), `.export-menu` (z-index → auto, transform: none), `ExportDropdown` (z-index 1000), `GranularityControl` (z-index → auto, menu 1000). Objectif: éviter que les boutons "Auto" et "Exporter" passent au-dessus de tout, tout en gardant leurs menus au-dessus du header local.

### 🤔 Analyse:
Les `transform`/`z-index` excessifs créaient des stacking contexts qui écrasaient d’autres overlays (ex. sélecteurs). En revenant à `auto` et à un z-index de 1000 uniquement pour les menus, on garantit l’ordre d’empilement local sans perturber le reste de la page.

### 💜 Prochaines étapes :
- Enrichir la gestion multi-enregistrements (si plusieurs lignes sont fournies, fusionner plutôt que de ne prendre que `[0]`).
- Ajouter des tests unitaires autour du parsing des noms d'assets et de l'extraction de la plage de dates.

### ⌛ Changement :
Réintroduction du layout complet « tableau de bord » (cartes + ligne + camembert + table) via un nouveau mode d’affichage `dashboard` dans `src/components/ChartContainer/ChartContainer.tsx`. Ajout du bouton dans le toggle d’affichage et valeur par défaut sur `dashboard`.

### 🤔 Analyse :
La refactorisation précédente avait simplifié l’UI au détriment du layout original. Le mode `dashboard` restitue l’expérience initiale sans dupliquer la logique : on réutilise `MachineCard`, `LineChart`, `PieChart` et `MachineTable` à partir des `stats` et `data` déjà calculés par `CompareData`. Impact minimal sur l’API publique et compatible avec les contrôles existants (export, IPE toggle, granularité simple).

### 💜 Prochaines étapes :
- Persister la préférence `displayMode` via `displayModeAttr` (lecture au montage) pour restaurer le dernier choix utilisateur.
- Ajuster les intitulés et icônes si besoin (ex. libeller « Tableau » vs « Dashboard »).

### ⌛ Changement :
Suppression du sélecteur de mode d’affichage (Tableau/Graphique/Répartition/Cartes) et verrouillage permanent en mode `dashboard`. Nettoyage du code associé dans `ChartContainer`.

### 🤔 Analyse :
La simplification élimine la complexité UI non nécessaire et garantit une expérience cohérente. Les props historiques (`displayModeAttr`, callbacks) restent dans la signature pour compat Mendix mais ne sont plus utilisées.

### 💜 Prochaines étapes :
- Optionnel: déprécier officiellement les props d’affichage dans la doc et le XML lors d’une version majeure.

### ⌛ Changement :
Intégration du système Smart d’unités IPE (inspiré de DetailsWidget):
- `src/utils/smartUnitUtils.ts` (nouveau) pour extraire les variables et résoudre les unités des variantes IPE.
- `src/CompareData.tsx`: extraction des variables Smart et passage des labels d’unités IPE à `ChartContainer`.
- `src/components/ChartContainer/ChartContainer.tsx`: labels du toggle IPE basés sur les unités réelles si disponibles.

### 🤔 Analyse :
Les unités IPE ne sont plus hardcodées: elles sont résolues à partir des variables d’assets, avec tolérance sur l’énergie ciblée. Le toggle Double IPE devient auto‑descriptif (ex. « kWh/kg » vs « kWh/pcs »), améliorant l’UX et réduisant les erreurs d’interprétation.

### 💜 Prochaines étapes :
- Exposer clairement dans le XML les propriétés `assetVariablesDataSource` et attributs associés (déjà présentes) dans la doc.
- Étendre la détection (fallback par nom via `getMetricTypeFromName`) pour les jeux de données incomplets.

### ⌛ Changement :
Activation de l’UI de granularité manuelle existante:
- `ChartContainer` affiche `GranularityPopover` quand la feature Granularité est active (`showGranularityControls`).
- Calcul auto de granularité (valeur + unité) selon la durée d’analyse; callbacks `onModeChange`/`onTimeChange` déclenchés.

### 🤔 Analyse :
Réutilisation de l’UI déjà présente (`GranularityControl/*`), sans toucher à l’API publique. La granularité reste non bloquante: bouton désactivé si pas de données, et bascule Auto/Strict gérée proprement.

### 💜 Prochaines étapes :
- Si besoin, persister le choix granularité dans des attributs Mendix dédiés.

### ⌛ Changement :
Correction du schéma XML `src/CompareData.xml` : remplacement des attributs `category` invalides par des éléments `<category>`, ajout des `<description>` requis avant `<attributeTypes>` et respect de l'ordre attendu par le schéma.

### 🤔 Analyse :
Le validateur du schéma Mendix n'autorise pas l'attribut `category` sur `<property>` et exige que `<category>`/`<description>` précèdent `<attributeTypes>`. La mise en conformité élimine les erreurs de validation et assure la régénération correcte des typings.

### 💜 Prochaines étapes :
- Lancer une reconstruction du widget pour vérifier la génération des typings.

## 2024-07-26

### ⌛ Changement :
Visibilité du `GranularityControl` en mode IPE (In-Place Editing).

### 🤔 Analyse :
La modification assure que les contrôles de granularité sont visibles dans l'éditeur de Mendix, même sans données complètes. En liant la propriété `isGranularityDisabled` à la présence de données (`!hasData`), le composant apparaît en IPE mais reste non-interactif, prévenant les erreurs tout en donnant un aperçu fidèle de l'interface finale. Cette approche améliore significativement l'expérience de développement et de configuration du widget.

### 🔜 Prochaines étapes :
Aucune étape suivante n'est immédiatement nécessaire pour cette fonctionnalité.

