### 2025-08-14 – UI/UX corrections DateRange + DPE + hover + spacing

### ⌛ Changement :
Refonte du sélecteur de période « Personnalisé » (popover dropdown, sans overlay ni loader), correction des tailles icônes/wrappers, base typographique portée à 16px pour lisibilité, rétablissement des couleurs des seuils DPE et ajout d’un paramètre `customColors`, suppression des translations au hover, et augmentation de l’espacement sous les KPI.

### 🤔 Analyse :
La lisibilité est améliorée (taille de police de base) et les icônes sont proportionnées (wrappers 48px, icônes 1.5rem). Le sélecteur personnalisé n’enferme plus l’utilisateur et n’active le chargement qu’après « Appliquer ». Les couleurs des seuils DPE ne sont plus écrasées par le CSS et peuvent être personnalisées par configuration. La suppression des micro‑translations stabilise l’interface et réduit les distractions. L’espacement supplémentaire clarifie la hiérarchie visuelle.

### 🔜 Prochaines étapes :
- Exposer `customColors` dans la config Mendix (`editorConfig`) et documenter l’usage.
- QA responsive large écrans, vérification accessibilité (focus/ARIA Popover).
- Option : granularité des presets rapides dans le picker.

# Avancement - Widget SyntheseWidget

## 📅 13 août 2025

### ⌛ Changement :
Suppression complète de PostCSS/Tailwind et nettoyage CSS. Retrait du CSS compilé et bascule vers `src/ui/SyntheseWidget.css`. Correction des avertissements TypeScript (variables non utilisées) dans `src/SyntheseWidget.tsx`.

### 🤔 Analyse :
Build simplifié et plus rapide, moins de toolchain. CSS désormais maîtrisé et namespacé, réduisant les risques de régression Atlas/Mendix. Aucune dépendance runtime supplémentaire. Maintenabilité accrue.

### 💜 Prochaines étapes :
- Vérifier visuellement le widget en mode éditeur et runtime.
- Ajouter éventuellement un préfixage léger si besoin spécifique navigateurs cibles.

### 📁 Fichiers modifiés :
- `package.json` (scripts et devDependencies nettoyés)
- `src/SyntheseWidget.editorPreview.tsx` (importe `SyntheseWidget.css` et met à jour `getPreviewCss`)
- `src/SyntheseWidget.tsx` (suppression imports inutiles, variables non lues)
- `avancement.md` (entrée de journal)

### 🗑️ Fichiers supprimés :
- `postcss.config.js`
- `tailwind.config.js`
- `src/ui/SyntheseWidget.compiled.css`

## 📅 13 août 2025

### ⌛ Changement :
Refonte CSS complète et namespacée `syntheseWidget-root` pour rétablir les espacements cohérents entre composants (grilles, marges, helpers). Harmonisation des couleurs du `DPEGauge` avec `DPE.tsx`. Ajustements mineurs des cartes (`CardConsoTotal`) et du header DPE.

### 🤔 Analyse :
Les collisions de styles sont évitées par le namespacing strict et des utilitaires minimaux. La grille définit des gaps uniformes pour supprimer l’effet « collé ». La palette DPE unifiée améliore la cohérence visuelle.

### 💜 Prochaines étapes :
- Ajouter des micro‑interactions (Framer Motion) pour transitions douces.
- QA visuelle Mendix (thèmes Atlas) et écrans 1280–1920 px.

### 📁 Fichiers modifiés :
- `src/ui/SyntheseWidget.css`
- `src/components/dpe/DPEGauge.tsx`
- `src/components/dpe/DPE.tsx`
- `src/components/cards/CardConsoTotal.tsx`

## 📅 25 janvier 2025

### ⌛ Changement :
Amélioration intelligente de la lisibilité des labels de l'axe X dans le ColumnChart avec gestion adaptative selon le nombre d'entités et l'espace disponible.

### 🤔 Analyse :
**Impact sur l'UX :** Résolution significative du problème de chevauchement des labels quand il y a beaucoup d'entités. Le système adapte automatiquement la rotation, la taille, l'espacement et la troncature selon le contexte.

**Architecture adaptive :** 
- ≤4 entités : affichage normal sans rotation
- 5-8 entités : rotation légère et adaptation responsive  
- 9-12 entités : rotation plus importante avec troncature
- 13-20 entités : affichage sélectif (1 label sur N)
- >20 entités : affichage très sélectif avec rotation maximale

**Maintenabilité :** Logique centralisée dans `calculateLabelConfig()` avec paramètres calculés dynamiquement. Gestion responsive intégrée au redimensionnement de fenêtre.

**Performance :** Calculs légers effectués uniquement lors de l'initialisation et du redimensionnement. Pas d'impact sur les performances de rendu.

### 🔜 Prochaines étapes :
- Tester avec des jeux de données réels contenant 15+ entités
- Optimiser la fonction de troncature pour préserver les mots importants
- Envisager un mode scroll horizontal pour les cas extrêmes (>25 entités)
- Ajouter des tests unitaires pour `calculateLabelConfig()` et `truncateLabel()`

### 📁 Fichiers modifiés :
- `src/components/ColumnChart.tsx` : Système adaptatif de gestion des labels

---

## 📅 25 janvier 2025

### ⌛ Changement :
Début refactorisation vers modèle unifié Asset/Level selon `RefactoPlan.md`. Mise à jour de `src/SyntheseWidget.xml` pour introduire les nouvelles propriétés: `topLevelName`, `breakdownLevelName`, `mainLevelAssets`, `breakdownLevelAssets`, et actions `refreshDataAction`, `onPeriodChange`. Conservation de la config DPE et des unités.

### 🤔 Analyse :
Cette évolution prépare la bascule du widget vers l’agrégation côté widget des métriques d’`Asset` par niveau, tout en gardant rétrocompatibles les cartes, graphiques et DPE. Elle simplifie la configuration côté Mendix (microflows par niveaux) et isole la logique d’agrégation au front.

### 🔜 Prochaines étapes :
- Créer `src/adapters/AssetLevelAdapter.ts` et `src/types/entities.ts`
- Refactorer `src/SyntheseWidget.tsx` pour consommer `mainLevelAssets`/`breakdownLevelAssets`
- Renommer `SecteurConsoCard` -> `LevelConsoCard` et ajuster les imports
- Mettre à jour `typings/SyntheseWidgetProps.d.ts` via build

### 📁 Fichiers modifiés :
- `src/SyntheseWidget.xml`

---

## 📅 25 janvier 2025

### ⌛ Changement :
Ajout de `src/adapters/AssetLevelAdapter.ts` pour transformer/agréger les métriques d’Asset et création du composant `src/components/LevelConsoCard.tsx` (remplacement minimal de `SecteurConsoCard` côté usage). Début d’adaptation de `src/SyntheseWidget.tsx` pour utiliser `mainLevelAssets`/`breakdownLevelAssets` et l’adapter, sans changer le rendu visuel.

### 🤔 Analyse :
L’adapter centralise les conversions Big→number et l’agrégation, rendant la logique testable et réutilisable. Le renommage « Level » garde la sémantique générique tout en préservant la structure UI.

### 🔜 Prochaines étapes :
- Finaliser `SyntheseWidget.tsx` pour gérer `onPeriodChange`/`refreshDataAction` si fournis
- Ajouter le champ `level` aux items breakdown lorsque disponible
- Lancer le build pour régénérer `typings/SyntheseWidgetProps.d.ts`

### 📁 Fichiers modifiés :
- `src/adapters/AssetLevelAdapter.ts`
- `src/components/LevelConsoCard.tsx`
- `src/SyntheseWidget.tsx`

---

## 📅 25 janvier 2025

### ⌛ Changement :
Intégration des actions `onPeriodChange` et `refreshDataAction` dans le changement de période côté widget. Suppression des dépendances directes aux attributs `dateDebut`/`dateFin` côté widget UI (piloté désormais par microflows).

### 🤔 Analyse :
Mieux découplé: le widget notifie le système, la couche Mendix ajuste la période et recalcule via JavaActions. Réduit le couplage UI↔domaine et facilite l’évolution des règles métiers sans modifier le widget.

### 🔜 Prochaines étapes :
- Vérifier la configuration des microflows `MW_HandlePeriodChange` et `MW_RefreshSyntheseData`
- Tests de bout en bout du cycle de période

### 📁 Fichiers modifiés :
- `src/SyntheseWidget.tsx`

---

## 📅 25 janvier 2025

### ⌛ Changement :
Mise à jour de la prévisualisation pour utiliser `LevelConsoCard`.

### 🤔 Analyse :
Prépare la cohérence visuelle et le wording "Level" dans l’éditeur sans affecter la production.

### 📁 Fichiers modifiés :
- `src/SyntheseWidget.editorPreview.tsx`

---

## 📅 25 janvier 2025

### ⌛ Changement :
Réorganisation des dossiers UI sans perte visuelle/feature: `components/cards/*`, `components/charts/*`, `components/dpe/*`, `components/navigation/*`. Mises à jour des imports dans `src/SyntheseWidget.tsx`.

### 🤔 Analyse :
Arborescence plus claire, meilleure maintenabilité. Aucun downgrade visuel: composants inchangés fonctionnellement.

### 🔜 Prochaines étapes :
- Migration CSS loin de Tailwind vers CSS pur avec classes utilitaires contrôlées et `!important` ciblés
- Suppression Tailwind et plugins liés

### 📁 Fichiers modifiés :
- `src/components/cards/CardConsoTotal.tsx` (déplacé)
- `src/components/cards/LevelConsoCard.tsx` (déplacé/renommé)
- `src/components/charts/ColumnChart.tsx` (déplacé)
- `src/components/dpe/DPE.tsx` (déplacé)
- `src/components/navigation/DateRangeSelector.tsx` (déplacé)
- `src/SyntheseWidget.tsx`

---

## 📅 25 janvier 2025

### ⌛ Changement :
Début de la dé-Tailwindisation: suppression des directives `@tailwind` dans `src/ui/SyntheseWidget.css`, réécriture en CSS pur namespacé avec `!important` pour éviter les conflits Mendix. Retrait de `tailwindcss`, `@tailwindcss/forms`, `@tailwindcss/typography`, `classnames`, `react-spinners`, `recharts` des dépendances.

### 🤔 Analyse :
Build plus rapide et CSS maîtrisé. Les classes minimales nécessaires sont re-définies. Aucun downgrade visuel (styles équivalents recréés).

### 📁 Fichiers modifiés :
- `src/ui/SyntheseWidget.css`
- `postcss.config.js`
- `package.json`

---

## 📅 25 janvier 2025

### ⌛ Changement :
Passage à une ingestion complète Levels/Assets + sélection de niveaux configurables. Nettoyage du XML: ajout `levels`, `levelName`, `levelSortOrder`, `selectedLevels`, `allAssets`, `assetName`, `assetLevel`. Suppression des anciennes props de niveaux fixes et breakdown. Mise à jour mineure des titres des graphiques.

### 🤔 Analyse :
Plus flexible: on peut traiter N niveaux (qui peut le plus peut le moins). L’agrégation se fait côté widget, la sélection est pilotée par un datasource configurable.

### 🔜 Prochaines étapes :
- Implémenter l’agrégation par niveaux dans `SyntheseWidget.tsx` (actuellement encore basé sur old props partiellement)
- Ajouter un guide Studio Pro pour `selectedLevels`

### 📁 Fichiers modifiés :
- `src/SyntheseWidget.xml`
- `RefactoPlan.md`
- `src/SyntheseWidget.tsx` (libellés)

## 📅 25 janvier 2025

### ⌛ Changement :
Implémentation d'un système d'unité de base personnalisable similaire au widget CompareData. Ajout de 4 paramètres de configuration (`baseUnitElectricity`, `baseUnitGas`, `baseUnitWater`, `baseUnitAir`) permettant de choisir l'unité d'entrée pour chaque type d'énergie (auto/kWh/m³).

### 🤔 Analyse :
**Impact sur la scalabilité :** Le système centralisé avec `unitConverter.ts` facilite la maintenance et l'évolution future. L'ajout de nouvelles unités peut se faire facilement dans ce module unique.

**Impact sur la maintenabilité :** La logique de conversion est isolée dans un module dédié, réduisant la duplication de code entre les composants `CardConsoTotal` et `ColumnChart`. Les types TypeScript sont automatiquement générés depuis le XML.

**Rétrocompatibilité :** Le mode "auto" garantit un comportement identique à l'existant (électricité → kWh, autres → m³). Les widgets existants continuent de fonctionner sans modification.

**Architecture :** Respect des principes FSM via la conversion déterministe d'unités. Chaque transformation est pure et sans effet de bord.

### 🔜 Prochaines étapes :
- Adapter le composant `SecteurConsoCard` pour utiliser le système d'unités personnalisables
- Ajouter des tests unitaires pour `unitConverter.ts` avec couverture des cas limites 
- Documenter les cas d'usage métier dans la documentation utilisateur
- Envisager l'extension du système pour d'autres unités (J, cal, BTU)

### 📁 Fichiers modifiés :
- `src/SyntheseWidget.xml` : Ajout des propriétés de configuration d'unités
- `src/utils/unitConverter.ts` : Nouveau module de conversion intelligent
- `src/components/CardConsoTotal.tsx` : Adaptation au nouveau système
- `src/components/ColumnChart.tsx` : Adaptation au nouveau système  
- `src/SyntheseWidget.tsx` : Intégration des nouvelles propriétés
- `src/SyntheseWidget.editorPreview.tsx` : Mise à jour pour la prévisualisation
- `typings/SyntheseWidgetProps.d.ts` : Types générés automatiquement

### ✅ Validation :
- ✅ Compilation réussie sans erreurs TypeScript
- ✅ Types générés correctement depuis le XML
- ✅ Rétrocompatibilité préservée avec le mode "auto"
- ✅ Logique de conversion centralisée et réutilisable 