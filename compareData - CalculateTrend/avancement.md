### ⌛ Changement (2025-01-11 – Correction erreurs XML) :
Correction des erreurs de validation XML dans `src/CompareData.xml` :
- **tsAssetAssociation** : Ajout de `<selectableObjects><entity name="Smart.Asset"/></selectableObjects>`
- **tsVariableAssociation** : Ajout de `<selectableObjects><entity name="Smart.Variable"/></selectableObjects>`
- **variableAssetAssociation** : Ajout de `<selectableObjects><entity name="Smart.Asset"/></selectableObjects>`

### 🤔 Analyse :
Les propriétés d'association de type `association` dans Mendix doivent spécifier soit `selectableObjects` soit `isMetaData="true"` pour indiquer quelles entités peuvent être sélectionnées. Sans ces attributs, le validateur XML génère des erreurs. Les corrections permettent au widget de se compiler correctement et d'être utilisable dans Mendix Studio Pro.

### 💜 Prochaines étapes :
- Tester la configuration des associations dans Mendix Studio Pro
- Vérifier que les entités Smart.Asset et Smart.Variable sont bien disponibles dans le projet

---

### ⌛ Changement (2025-01-11 – Correction erreurs TypeScript) :
Correction des erreurs TypeScript dans `src/CompareData.tsx` :
- **Ligne 342** : Remplacement de `tsPoint.getValue('TimeSeriesPoint_Variable')` par `tsAssetAssociation?.get(tsPoint)?.value` pour utiliser correctement l'association Mendix via `ListReferenceValue`
- **Lignes 652-653** : Suppression de la vérification `onAssetClick?.canExecute` car `ListActionValue` n'a pas cette propriété, simplification en `if (asset && onAssetClick)`

### 🤔 Analyse :
Les erreurs provenaient de l'utilisation incorrecte des APIs Mendix :
- `getValue()` n'existe pas sur `ObjectItem` - il faut utiliser les associations via `ListReferenceValue.get()`
- `ListActionValue` n'a pas de propriété `canExecute` - seules les `ActionValue` l'ont
- La correction aligne le code avec les patterns utilisés dans `detailswidget - CalculateTrend`

### 💜 Prochaines étapes :
- Vérifier que les associations Mendix sont correctement configurées dans le XML
- Tester l'exécution des actions `onAssetClick` avec des données réelles

---

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

## 2025-01-27

### ⌛ Changement: Correction des incohérences de features et amélioration du diagnostic
- **Problème identifié**: Hook `useFeatureMap` sans `useMemo` causant des états figés des features
- **Solution**: Ajout de `useMemo` avec dépendances correctes dans `use-feature-toggle.ts`
- **Problème identifié**: Contrôle de granularité affiché même en mode IPE
- **Solution**: Restriction `showGranularityControls={isGranulariteManuelleEnabled && detectedMode === "energetic"}`
- **Amélioration**: Diagnostic détaillé de la source de données avec analyse du premier élément
- **Amélioration**: Mode développeur enrichi avec affichage clair des features (✅/❌)
- **Amélioration**: Messages d'erreur plus précis pour guider la configuration XPath

### 🤔 Analyse:
Les logs montraient `totalItems: 0` dès le début, indiquant un problème en amont (XPath Mendix). Le diagnostic amélioré permettra d'identifier si c'est un problème de configuration ou de données. Les features sont maintenant correctement réactives aux changements de configuration.

## 2025-01-27 (suite)

### ⌛ Changement: Correction de l'affichage IPEUnavailable et amélioration de la gestion des erreurs
- **Problème identifié**: Le composant `IPEUnavailable` n'était affiché que dans des conditions très restrictives (mode IPE + validation stricte)
- **Solution**: Extension de l'utilisation d'`IPEUnavailable` pour tous les cas d'absence de données
- **Amélioration**: Remplacement des messages d'erreur simples par le composant `IPEUnavailable` plus informatif
- **Amélioration**: Affichage d'`IPEUnavailable` même quand aucune donnée n'arrive du tout (XPath incorrect)
- **Amélioration**: Messages contextuels selon le mode (IPE vs Énergétique)

### 🤔 Analyse:
Le composant `IPEUnavailable` était sous-utilisé car il ne s'affichait qu'en mode IPE avec validation stricte. Maintenant, il s'affiche dans tous les cas d'absence de données, offrant une meilleure UX avec des messages contextuels et des recommandations d'action.

### ⌛ Changement (2025-01-27): Correction du composant ConsumptionUnavailable

- **Problème identifié**: Le composant `ConsumptionUnavailable.tsx` avait plusieurs incohérences par rapport à `IPEUnavailable.tsx`
- **Correction**: Renommage de la prop `ipeCount` → `consumptionCount` pour plus de clarté
- **Amélioration**: Implémentation de la fonction `getThemeColors()` avec thèmes dynamiques selon le `recommendedMode`
- **Amélioration**: Logique de recommandation conditionnelle basée sur le mode (fallback/single/double)
- **Amélioration**: Affichage conditionnel des assets disponibles avec consommation
- **Amélioration**: Harmonisation du style et de la structure avec `IPEUnavailable.tsx`
- **Amélioration**: Correction de la grammaire dans le badge (pluriel conditionnel)

### 🤔 Analyse:
Le composant `ConsumptionUnavailable` était une version simplifiée de `IPEUnavailable` sans la logique avancée de thèmes et de recommandations. La correction aligne les deux composants sur la même architecture, offrant une expérience utilisateur cohérente et des recommandations contextuelles appropriées selon le mode d'affichage.

### 💜 Prochaines étapes:
- Vérifier que les props `consumptionCount` sont correctement passées depuis le composant parent
- Tester les différents modes de recommandation (fallback/single/double)
- Considérer l'extraction des thèmes dans un fichier partagé pour éviter la duplication

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

## 2025-01-27 (correction finale)

### ⌛ Changement: Logique intelligente selon la feature Double IPE et correction du bouton granularité
- **Problème identifié**: Le bouton de granularité n'était affiché qu'en mode énergétique, et la logique des unités IPE n'était pas intelligente selon la feature Double IPE.
- **Solution**: 
  - Correction de `showGranularityControls` pour s'afficher en mode énergétique ET IPE quand la feature est activée
  - Logique intelligente des unités IPE : en mode Double IPE activé → deux variantes distinctes (IPE_kg/IPE), en mode simple → même unité pour les deux
  - Amélioration des logs pour tracer la résolution des unités

### 🤔 Analyse:
Le système est maintenant cohérent avec Detailswidget : la granularité s'affiche dans les deux modes quand la feature est activée, et les unités IPE s'adaptent intelligemment selon la configuration Double IPE. Cela améliore l'UX en évitant la confusion entre les modes simple et double.

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

### ⌛ Changement (2025-08-11 – Correction erreurs TypeScript et alignement Detailswidget):
- Suppression de l'import `ValueStatus` inutilisé dans `smartUnitUtils.ts` ✅
- **Correction majeure de `getSmartIPEUnitForSeries`** : remplacement de la logique simplifiée par celle de Detailswidget avec 3 niveaux de fallback sophistiqués

### 🤔 Analyse :
- `ValueStatus` : correctement supprimé (utilitaires purs, pas de gestion d'état)
- `smartEnergyType` : **ERREUR** - la fonction avait une logique simplifiée vs Detailswidget
- **Solution** : Remplacé par la logique complète de Detailswidget :
  1. Série avec énergie explicite → IPE_kg/IPE direct
  2. Énergie du widget → IPE_kg/IPE avec mapping
  3. Dernier recours → première unité IPE disponible

### 💜 Prochaines étapes :
- Vérifier que la compilation fonctionne sans erreurs
- Tester la résolution d'unités IPE avec différentes configurations

### ⌛ Changement (2025-08-11 – z-index Mendix compatibility):
- Ajustement des z-index pour respecter la hiérarchie Mendix : `.chart-header-actions` (z-index: 10), `.export-menu` (z-index: 20), `.granularity-control` (z-index: 20). Les menus dropdowns restent à z-index: 1000 pour passer devant le header local.

### 🤔 Analyse:
Mendix utilise des z-index entre 50-1000 pour ses éléments UI (modales, sélecteurs, tooltips). En gardant nos contrôles en dessous de 50, on évite les conflits de stacking context et on permet aux éléments Mendix de s'afficher correctement au-dessus de nos widgets.

### 💜 Prochaines étapes:
- Vérifier que Detailswidget utilise la même stratégie de z-index pour la cohérence.
- Documenter cette contrainte dans les guidelines de développement widget.

### ⌛ Changement (2025-08-11 – Corrections TS2339 et TS2339/execute):

- `src/CompareData.editorPreview.tsx` : remplacement de `props.selectedAsset` (inexistant dans `CompareDataPreviewProps`) par un comptage sûr basé sur `assetsDataSource`.
- `src/CompareData.tsx` : correction de l'appel d'action liste `onAssetClick` — utilisation de `onAssetClick.get(asset)` pour obtenir un `ActionValue`, puis exécution conditionnelle (`canExecute`) via `action.execute()`.

### 🤔 Analyse :
Les typings générés n'exposent pas `selectedAsset` côté preview et `ListActionValue` ne s'exécute pas directement. L'accès via `get(item)` respecte l'API Mendix et élimine l'erreur `Property 'execute' does not exist on type 'ListActionValue'`.

### 💜 Prochaines étapes :
- Vérifier en exécution réelle que l'action est bien déclenchée avec l'`asset` attendu.
- Si besoin, afficher un état désactivé lorsque `action?.canExecute` est faux.

### ⌛ Changement (2025-08-11 – alignement logique Detailswidget):
- **SmartUnitUtils complet** : Remplacement complet du système de résolution des unités IPE pour aligner avec la logique sophistiquée de Detailswidget. Ajout des types `SmartMetricType`/`SmartEnergyType`, mappings complets, et fonctions de résolution intelligente.
- **Résolution IPE sophistiquée** : Priorité aux métadonnées de série (`metricTypeAttr`/`energyTypeAttr`), fallback vers les variantes détectées dans les variables Smart, puis fallback général. Gestion des cas explicites vs implicites.
- **Debug et observabilité** : Ajout de `debugSmartVariables()` et logs détaillés pour tracer la résolution des unités IPE en mode développement.

### 🤔 Analyse:
L'ancienne logique était trop simpliste et ne gérait pas les subtilités comme les métadonnées de série, les fallbacks multiples, ou la détection d'énergie. La nouvelle approche respecte la hiérarchie de résolution de Detailswidget : série explicite → variantes détectées → fallback général, garantissant une cohérence parfaite entre les widgets.

### 💜 Prochaines étapes:
- Tester avec différents jeux de données (séries avec/sans métadonnées explicites, variables Smart complètes/incomplètes).
- Vérifier que les unités IPE affichées correspondent exactement à celles de Detailswidget pour les mêmes assets.

### ⌛ Changement (2025-01-11 – Diagnostic et correction des doublons de données):
- **Système de logging ultra-détaillé** : Création de `debugDataLogger.ts` pour analyser les données brutes et détecter les problèmes de filtrage
- **Détection des doublons** : Identification automatique des timestamps multiples avec analyse des causes (même asset avec valeurs différentes, types de métriques mixtes)
- **Filtrage intelligent** : Implémentation d'un système de déduplication basé sur `assetName_timestamp` pour éliminer les doublons
- **Composant IPEUnavailable** : Intégration du composant de Detailswidget avec adaptation pour CompareData (affichage des assets sélectionnés vs disponibles)
- **Logging en temps réel** : Analyse des données avant/après filtrage avec recommandations automatiques
- **Mode développeur enrichi** : Affichage des statistiques de doublons et warnings dans l'interface de debug

### 🤔 Analyse :
Le problème des données multiples au même timestamp était causé par un manque de filtrage au niveau du traitement des données. Le nouveau système de logging révèle les patterns de doublons et permet d'identifier les causes (variables multiples, types de métriques mixtes). Le filtrage par clé unique `assetName_timestamp` élimine efficacement les doublons tout en préservant la première occurrence valide. L'intégration du composant IPEUnavailable améliore l'UX en guidant l'utilisateur vers des solutions alternatives.

### 💜 Prochaines étapes :
- Tester avec des données réelles pour valider l'élimination des doublons
- Optimiser les performances du logging pour les gros volumes de données
- Ajouter des paramètres de configuration pour activer/désactiver le logging détaillé

### ⌛ Changement (2025-01-11 – Diagnostic avancé et messages d'aide):
- **Diagnostic automatique des données manquantes** : Analyse des types de métriques et d'énergie disponibles avec messages d'aide contextuels
- **Logs de filtrage détaillés** : Affichage des données exclues avec raison (IPE vs Conso, énergie spécifique)
- **Messages IPEUnavailable améliorés** : Diagnostic précis du problème (données Conso vs IPE, énergie manquante, XPath incorrect)
- **Debug mode permanent** : Activation automatique du debug pour diagnostiquer les problèmes de configuration
- **Recommandations XPath** : Suggestions automatiques de XPath pour corriger les problèmes de filtrage

### 🤔 Analyse :
Le problème principal était que les utilisateurs recevaient des données de type "Conso" (consommation) alors qu'ils étaient en mode IPE. Le système de diagnostic révèle maintenant exactement pourquoi aucune donnée n'est affichée et guide l'utilisateur vers la solution (modification du XPath dans Mendix Studio Pro). Les messages d'erreur sont maintenant contextuels et actionnables.

### 💜 Prochaines étapes :
- Tester avec différents XPath pour valider les recommandations
- Ajouter des exemples de XPath dans la documentation
- Créer un guide de configuration pour les différents modes (IPE Électrique, IPE Gaz, etc.)

## 2024-07-26

### ⌛ Changement :
Visibilité du `GranularityControl` en mode IPE (In-Place Editing).

### 🤔 Analyse :
La modification assure que les contrôles de granularité sont visibles dans l'éditeur de Mendix, même sans données complètes. En liant la propriété `isGranularityDisabled` à la présence de données (`!hasData`), le composant apparaît en IPE mais reste non-interactif, prévenant les erreurs tout en donnant un aperçu fidèle de l'interface finale. Cette approche améliore significativement l'expérience de développement et de configuration du widget.

### 🔜 Prochaines étapes :
Aucune étape suivante n'est immédiatement nécessaire pour cette fonctionnalité.

