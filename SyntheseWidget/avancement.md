## 📅 14 août 2025 - CORRECTION Tailles de police

### ⌛ Changement :
Correction des conflits de tailles de police avec Mendix/Atlas. Les titres étaient écrasés par les styles Mendix (h2: 26px/30px) malgré nos règles CSS. Augmentation de la spécificité CSS et adaptation de tous les titres à `2rem` pour une meilleure lisibilité.

### 🤔 Analyse :
**Problème identifié** : Les styles Mendix/Atlas avaient une spécificité plus élevée que nos règles CSS, écrasant nos tailles de police. Par exemple, `1.375rem` (22px) était écrasé par `h2: 26px` de Mendix, résultant en `13.75px` calculé.

**Solution appliquée** :
- Augmentation de la spécificité CSS avec des sélecteurs multiples
- Ajout de règles `inherit` pour forcer l'héritage des styles
- Harmonisation de tous les titres à `2rem` pour cohérence
- Protection contre les conflits Mendix/Atlas

### 📁 Fichiers modifiés :
- `src/ui/SyntheseWidget.css` : spécificité CSS augmentée, tailles titres harmonisées à 2rem

---

## 📅 14 août 2025 - HARMONISATION COMPLÈTE Typographie

### ⌛ Changement :
Harmonisation complète de toutes les tailles de police dans le widget pour assurer une cohérence visuelle parfaite. Création d'un système de typographie unifié avec des tailles standardisées.

### 🤔 Analyse :
**Système de typographie harmonisé** :
- **Titres principaux** : `2rem` (32px) - Titres de sections, DPE, dialogs
- **Titres secondaires** : `1.5rem` (24px) - Sous-titres, valeurs importantes
- **Texte régulier** : `1.125rem` (18px) - Boutons, textes principaux
- **Texte standard** : `1rem` (16px) - Labels, tableaux, descriptions
- **Texte petit** : `0.875rem` (14px) - Textes secondaires, badges

**Composants harmonisés** :
- Boutons (période, niveau, primaire, secondaire) : `1.125rem`
- Tableaux (headers, données) : `1rem`
- Labels et descriptions : `1rem`
- Valeurs importantes : `1.125rem` ou `1.5rem`
- Formulaires et dialogs : `1.125rem`

### 📁 Fichiers modifiés :
- `src/ui/SyntheseWidget.css` : harmonisation complète de toutes les tailles de police

---

## 📅 14 août 2025 - CORRECTION Icônes et couleurs DPE

### ⌛ Changement :
Correction des tailles d'icônes pour les harmoniser avec la nouvelle typographie et rétablissement des couleurs DPE qui ne s'affichaient plus correctement.

### 🤔 Analyse :
**Problème identifié** :
- Les icônes n'étaient pas proportionnelles aux nouvelles tailles de texte
- Le DPEGauge.tsx utilisait `DPE_COLORS[level]` au lieu de `getColor(level)` dans les seuils
- Les couleurs personnalisées n'étaient pas prises en compte

**Solution appliquée** :
- Harmonisation des tailles d'icônes : `1.5rem` pour les icônes standard, `2rem` pour les grandes
- Correction du DPEGauge.tsx pour utiliser `getColor()` partout
- Rétablissement des couleurs visibles dans les seuils DPE
- Support des couleurs personnalisées via `customColors`

### 📁 Fichiers modifiés :
- `src/ui/SyntheseWidget.css` : tailles d'icônes harmonisées
- `src/components/dpe/DPEGauge.tsx` : couleurs DPE rétablies

---

## 📅 14 août 2025 - CORRECTION Espacement cartes/grilles

### ⌛ Changement :
Correction de l'espacement entre les cartes et les grilles qui étaient collées. Ajout d'espacement vertical par défaut aux grilles et amélioration du padding des cartes.

### 🤔 Analyse :
**Problème identifié** :
- Les grilles avaient `margin: 0` et `padding: 0` sans espacement vertical
- La section graphiques n'avait pas de classe `mb-8` pour l'espacement
- Les cartes avaient un padding insuffisant

**Solution appliquée** :
- Correction de la règle `> * + *` pour exclure les grilles et éviter les conflits de margin-top
- Ajout de `margin-top: 2rem` et `margin-bottom: 2rem` par défaut aux grilles `grid-responsive-2` et `grid-responsive-4`
- Ajout de la classe `mb-8` à la section graphiques dans SyntheseWidget.tsx
- Augmentation du padding des cartes de `1.25rem` à `1.5rem`
- Espacement interne amélioré pour éviter le contenu collé

### 📁 Fichiers modifiés :
- `src/ui/SyntheseWidget.css` : espacement des grilles et cartes amélioré
- `src/SyntheseWidget.tsx` : ajout de la classe mb-8 à la section graphiques

---

## 📅 14 août 2025 - CORRECTION Conflits CSS Mendix/Atlas

### ⌛ Changement :
Correction des conflits CSS avec Mendix/Atlas qui écrasaient nos tailles de police et d'icônes. Augmentation de la spécificité CSS pour forcer l'application de nos styles.

### 🤔 Analyse :
**Problème identifié** :
- Les styles Mendix/Atlas avaient une spécificité plus élevée que nos règles CSS
- Résultats observés :
  - Subtitle : `1rem` (16px) → `10px` (écrasé)
  - Icônes : `1.5rem` (24px) → `15px` (écrasé)
  - Boutons : `0.875rem` (14px) → `8.75px` (écrasé)

**Solution appliquée** :
- Extension de la règle `inherit` pour inclure `p`, `button`, `span`, `div`
- Augmentation de la spécificité avec des sélecteurs multiples
- Correction des tailles : boutons `0.875rem` → `1rem`
- Forçage des styles avec des sélecteurs plus spécifiques

### 📁 Fichiers modifiés :
- `src/ui/SyntheseWidget.css` : spécificité CSS augmentée pour tous les éléments

---

## 📅 14 août 2025 - OPTIMISATION DateRangePickerV2

### ⌛ Changement :
Suppression des presets dupliqués et amélioration de l'ouverture du DateRangePickerV2 pour éviter la redondance avec DateRangeSelector.tsx.

### 🤔 Analyse :
**Modifications apportées** :
- **Suppression des presets** : Retrait complet des périodes rapides (Aujourd'hui, Cette semaine, etc.) car déjà présentes dans DateRangeSelector.tsx
- **Amélioration de l'ouverture** : Animation plus fluide avec scale et meilleur positionnement
- **Interface simplifiée** : Suppression de la sidebar, focus sur la sélection de dates personnalisées
- **Meilleur UX** : Bouton avec hover effect et transition plus douce

**Avantages** :
- Évite la duplication de fonctionnalités
- Interface plus claire et focalisée
- Meilleure séparation des responsabilités entre les composants

### 📁 Fichiers modifiés :
- `src/components/navigation/DateRangePickerV2.tsx` : suppression presets et amélioration ouverture
- `src/components/navigation/DateRangePickerV2.css` : ajout classe drp-main--full-width

---

### 2025-08-14 – PATCH COMPLET UI/UX SyntheseWidget APPLIQUÉ

### ⌛ Changement :
Refonte du sélecteur de période « Personnalisé » (popover dropdown, sans overlay ni loader), correction des tailles icônes/wrappers, base typographique portée à 16px pour lisibilité, rétablissement des couleurs des seuils DPE et ajout d’un paramètre `customColors`, suppression des translations au hover, et augmentation de l’espacement sous les KPI.

### 🤔 Analyse :
La lisibilité est améliorée (taille de police de base) et les icônes sont proportionnées (wrappers 48px, icônes 1.5rem). Le sélecteur personnalisé n’enferme plus l’utilisateur et n’active le chargement qu’après « Appliquer ». Les couleurs des seuils DPE ne sont plus écrasées par le CSS et peuvent être personnalisées par configuration. La suppression des micro‑translations stabilise l’interface et réduit les distractions. L’espacement supplémentaire clarifie la hiérarchie visuelle.

### 🔜 Prochaines étapes :
- Exposer `customColors` dans la config Mendix (`editorConfig`) et documenter l’usage.
- QA responsive large écrans, vérification accessibilité (focus/ARIA Popover).
- Option : granularité des presets rapides dans le picker.

# Avancement - Widget SyntheseWidget

## 📅 14 août 2025 - Fix tooltip ECharts + couleurs DPE

### ⌛ Changement :
- Correction du tooltip transparent (ECharts) causé par un reset global qui forçait `background: transparent !important` et `color: inherit !important` sur `div/p/span`.
- Ajout d’un style dédié `.echarts-tooltip` sous `\.syntheseWidget-root` (fond blanc, bordure, ombre, padding).
- Restauration des couleurs de `DPEGauge.tsx` en supprimant `color: inherit !important` du reset hérité.

### 🤔 Analyse :
Les tooltips ECharts injectent des styles inline. Nos `!important` globaux prenaient le dessus → transparence. Même effet sur les couleurs inline du DPE. En limitant le reset aux éléments interactifs et en stylant le tooltip, on supprime l’effet de bord tout en gardant l’isolation Atlas/Mendix.

### 💜 Prochaines étapes :
- QA visuelle des tooltips sur tous les graphiques (StackedBar/Column).
- Option : unifier la typographie du contenu de tooltip avec des utilitaires locaux.

### 📁 Fichiers modifiés :
- `src/ui/SyntheseWidget.css`
## 📅 30 juin 2025 - Conversion typographique rem ➜ em et icônes
## 📅 14 août 2025 - Réduction typographie -20% + DateRange UX simplifiée + titres ajustés

### ⌛ Changement :
- Base typographique `.syntheseWidget-root` passée de 16px à 12.8px (-20%). Toutes les tailles en `em`/icônes suivent automatiquement.
- Titres harmonisés: `period-title` et `selector-title` à `1.325em`, `title-medium` à `1.5em`, `title-large` à `1.8em`, textes à `0.95em` par défaut.
- `DateRangePickerV2` simplifié: suppression des heures, application immédiate dès le 2e clic jour, popover plus compact (bouton 36px, calendriers 200px, typographies réduites), intégration conservée dans `DateRangeSelector`.

### 🤔 Analyse :
Taille globale plus contenue et lisible; le choix de `em` évite les effets collatéraux Atlas. Le picker devient « deux clics et c’est fait » sans friction ni overlay inutile.

### 💜 Prochaines étapes :
- Ajouter options avancées (heures) derrière un flag si besoin pro.
- QA responsive (>=320px) et vérif accessibilité clavier (focus visible sur jours).

### 📁 Fichiers modifiés :
- `src/ui/SyntheseWidget.css`
- `src/components/navigation/DateRangePickerV2.css`
- `src/components/navigation/DateRangePickerV2.tsx`
- `src/components/navigation/DateRangeSelector.tsx`
- `src/components/dpe/DPEGauge.tsx` (harmonisation wrappers d'icône)
- `src/ui/SyntheseWidget.css` (correction badge totaux tableau)
 - `src/components/charts/StackedBarChart.tsx` (click pour sélectionner un niveau)
 - `src/components/charts/DonutEnergyChart.tsx` (nouveau)
 - `src/components/dashboard/AssetsByEnergyTable.tsx` (nouveau)
 - `src/SyntheseWidget.tsx` (vue Analyse par niveau, retrait LevelSelector en tête)
 - `src/components/navigation/LevelPicker.tsx` (nouveau sélecteur de niveau)

### ⌛ Changement :
Conversion de toutes les tailles de police en `rem` vers `em` sous le scope `\.syntheseWidget-root`, et conversion des tailles d’icônes (width/height) exprimées en `rem` vers `em` pour découpler du root Mendix (62.5%).

### 🤔 Analyse :
L’usage de `rem` héritait de `html { font-size: 62.5% }` d’Atlas/Mendix, entraînant des `1rem = 10px` et des typography shrink dans le widget. Le passage en `em` rend les tailles relatives à la base du widget (`.syntheseWidget-root { font-size: 16px }`), garantissant cohérence et responsive interne. Les icônes suivent désormais la typo (em), évitant les écarts visuels.

### 💜 Prochaines étapes :
- Introduire des tokens CSS locaux (e.g. `--font-sm`, `--font-md`) pour centraliser les tailles.
- QA visuelle responsive (petits écrans Mendix) et ajustement fin si nécessaire.

### 📁 Fichiers modifiés :
- `src/ui/SyntheseWidget.css` : rem→em sur font-size + icônes.
- `src/components/navigation/DateRangePickerV2.css` : rem→em sur font-size.

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

## 📅 30 juin 2025 - APPLICATION PATCH.md - Modernisation LevelAnalysis

### ⌛ Changement :
Application complète des améliorations du Patch.md pour moderniser `LevelAnalysis` et ses sous-composants. Synchronisation du filtre énergie entre donut et tableau, ajout du label central dans le donut, tri par colonne, mini-barres dans les cellules, accessibilité améliorée et tokens de design.

### 🤔 Analyse :
**Améliorations UX majeures** :
- **Synchronisation énergie** : Un seul filtre `activeEnergy` pilotant donut ET tableau. Clic sur segment donut → filtre appliqué, segments non-sélectionnés grisés (opacité 0.4)
- **Label central donut** : Total + unité affiché au centre, éliminant le besoin de descendre l'œil vers le bas
- **Tri par colonne** : Headers cliquables avec `aria-sort`, icônes chevron, tri intelligent (nom + valeur)
- **Mini-barres** : Barres de fond proportionnelles dans chaque cellule pour visualiser rapidement les proportions
- **États "no data"** : Placeholders élégants pour donut et tableau vides

**Améliorations code** :
- **Tokens de design** : Variables CSS `--primary`, `--elec`, `--gas`, `--water`, `--air` centralisées
- **Accessibilité** : `role="table"`, `aria-label`, `aria-sort`, focus visibles, label accessible pour LevelPicker
- **Formatage** : `Intl.NumberFormat("fr-FR")` pour cohérence locale
- **Performance** : `useMemo` optimisé pour le tri et les totaux

**Architecture FSM** :
- État `activeEnergy` centralisé dans `LevelAnalysis`
- Transitions pures via `onEnergyChange` callback
- Immutabilité des données de tri et filtrage

### 💜 Prochaines étapes :
- QA responsive sur différents écrans (tableau avec beaucoup de colonnes)
- Tests d'accessibilité avec lecteurs d'écran
- Optimisation des performances pour de gros datasets (>100 assets)
- Ajout d'animations Framer Motion pour les transitions de filtres

### 📁 Fichiers modifiés :
- `src/components/dashboard/LevelAnalysis.tsx` : Synchronisation filtre énergie
- `src/components/charts/DonutEnergyChart.tsx` : Label central, interactivité, états no data
- `src/components/dashboard/AssetsByEnergyTable.tsx` : Tri par colonne, mini-barres, accessibilité
- `src/components/navigation/LevelPicker.tsx` : Accessibilité améliorée
- `src/components/dashboard/AssetsByEnergyTable.css` : Tokens design, styles tri et barres 