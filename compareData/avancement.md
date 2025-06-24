# 📋 Avancement - Widget CompareData

## 🎯 Objectif
Implémentation de la fonctionnalité Double IPE permettant de gérer deux IPE distincts avec basculement dynamique via toggle moderne.

---

## 📅 2024-12-19 - Initialisation du projet Double IPE

### ⌛ Changement :
Création du fichier de traçabilité et analyse de l'architecture existante du widget CompareData.

### 🤔 Analyse :
- **Architecture actuelle** : Widget basé sur FSM implicite avec mode énergétique/IPE
- **Impact scalabilité** : Duplication contrôlée des propriétés pour maintenir la simplicité de configuration
- **Impact maintenabilité** : Réutilisation des patterns du Detailswidget validés en production

### 🔜 Prochaines étapes :
1. Modification du fichier XML pour ajouter les nouvelles propriétés
2. Mise à jour des types TypeScript
3. Implémentation de la logique métier avec FSM explicite
4. Intégration du toggle dans l'interface utilisateur

---

## 📅 2024-12-19 - Phase 1 & 2 : Configuration XML et Types TypeScript ✅

### ⌛ Changement :
- Ajout de la propriété `ipeMode` avec valeurs "single" et "double"
- Ajout des propriétés `ipe1Name` et `ipe2Name` pour les noms des IPE
- Duplication complète des sources de données pour IPE 2 (selectedMachines2, dsMesures2, etc.)
- Duplication des propriétés de production/consommation pour IPE 2
- Génération automatique des types TypeScript via `npm run build`

### 🤔 Analyse :
- **Impact scalabilité** : Duplication maîtrisée des propriétés, maintient la simplicité de configuration Mendix
- **Impact maintenabilité** : Types générés automatiquement, cohérence garantie entre XML et TypeScript
- **Rétrocompatibilité** : `defaultValue="single"` assure la compatibilité avec les widgets existants

### 🔜 Prochaines étapes :
- Implémentation de la logique métier avec FSM explicite
- Intégration du toggle dans l'interface utilisateur

---

## 📅 2024-12-19 - Phase 3 : Logique métier avec FSM ✅

### ⌛ Changement :
- Ajout des états FSM : `activeIPE` (1 | 2) avec état initial à 1
- Implémentation de `getCurrentIPEProps()` pour sélectionner les propriétés de l'IPE actif
- Duplication des `useEffect` pour gérer IPE 1 et IPE 2 indépendamment
- Séparation des états de données : `machinesStats1/2`, `machinesData1/2`, `chartExportData1/2`
- Gestion différenciée des erreurs : IPE 1 peut faire échouer le widget, IPE 2 échoue silencieusement

### 🤔 Analyse :
- **Impact scalabilité** : Chargement parallèle des deux IPE permet un basculement instantané
- **Impact maintenabilité** : FSM explicite avec transitions claires et prévisibles
- **Performance** : Potentiel doublement des requêtes réseau, mais UX améliorée

### 🔜 Prochaines étapes :
- Intégration du toggle dans l'interface utilisateur
- Résolution des erreurs de linter

---

## 📅 2024-12-19 - Phase 4 : Interface utilisateur ✅

### ⌛ Changement :
- Création du composant `RadioToggle` avec animations CSS modernes
- Intégration dans `ChartContainer` avec nouveau wrapper `.chart-header-actions`
- Modification du rendu pour utiliser les données de l'IPE actif
- Ajout de la logique de suffixe de titre et nom de fichier d'export
- Résolution des erreurs TypeScript liées aux propriétés string/boolean

### 🤔 Analyse :
- **Impact scalabilité** : Interface modulaire et réutilisable
- **Impact maintenabilité** : Composant isolé avec responsabilités claires
- **UX** : Toggle moderne avec animations fluides et feedback visuel

### 🔜 Prochaines étapes :
- Tests et validation de la fonctionnalité complète
- Documentation finale

---

## 📅 2024-12-19 - Amélioration Modal IPE ✅

### ⌛ Changement :
- Remplacement de toutes les classes Tailwind CSS par du CSS natif dans le modal IPE
- Augmentation significative de la taille du modal (max-width: 42rem vs 28rem)
- Amélioration de la hiérarchie typographique avec des tailles de police plus grandes
- Création du fichier `MachineCard.css` avec styles dédiés et responsive design
- Amélioration de l'espacement, des couleurs et des animations

### 🤔 Analyse :
- **Impact scalabilité** : CSS natif évite les dépendances externes et améliore les performances
- **Impact maintenabilité** : Styles isolés et personnalisables, meilleur contrôle du design
- **UX** : Modal plus lisible avec une meilleure hiérarchie visuelle et responsive design

### 🔜 Prochaines étapes :
- Tests finaux de la fonctionnalité complète
- Validation du responsive design sur différents écrans

---

## 📅 2024-12-19 - Migration Toggle vers Radix UI ✅

### ⌛ Changement :
- Installation de `@radix-ui/react-toggle-group` pour remplacer le toggle radio custom
- Remplacement du composant `RadioToggle` par `IPEToggle` utilisant Radix UI
- Mise à jour complète du CSS avec les styles fournis (couleur violette #be49ec, design moderne)
- Amélioration du responsive design avec breakpoints cohérents
- Ajout d'accessibilité native via les composants Radix UI

### 🤔 Analyse :
- **Impact scalabilité** : Utilisation d'une librairie éprouvée réduit la maintenance du code custom
- **Impact maintenabilité** : Composants Radix UI offrent une meilleure accessibilité et robustesse
- **UX** : Design plus moderne et professionnel avec animations fluides et états visuels clairs

### 🔜 Prochaines étapes :
- Tests de la nouvelle interface toggle
- Validation de l'accessibilité et du responsive design

---

## 📅 2024-12-19 - Correction des unités IPE ✅

### ⌛ Changement :
- Correction du système de conversion d'unités en mode IPE pour éviter les conversions automatiques
- Maintien des valeurs en unités de base : kWh et m³ (pas de conversion vers MWh, GWh, km³, etc.)
- Ajustement des décimales en mode IPE pour supporter les valeurs float (2 décimales par défaut)
- Vérification que les unités s'affichent correctement au format "kWh/pièce" et "m³/pièce"

### 🤔 Analyse :
- **Impact scalabilité** : Simplification du système d'unités en mode IPE, plus prévisible
- **Impact maintenabilité** : Code plus clair avec séparation nette entre mode énergétique et IPE
- **UX** : Affichage cohérent des unités IPE sans conversions automatiques indésirables

### 🔜 Prochaines étapes :
- Tests de validation des affichages d'unités
- Vérification du bon fonctionnement sur différents ordres de grandeur

---

## 📅 2024-12-19 - Corrections UX et résolution bug chargement ✅

### ⌛ Changement :
- Suppression de l'affichage de la ligne "Période: XX/XX/XXXX - XX/XX/XXXX" dans l'en-tête selon demande utilisateur
- Résolution du bug de chargement infini "Chargement des données Mendix..." en mode IPE
- Nettoyage du code : suppression de la fonction `formatDateForHeader` devenue inutile
- Maintien des valeurs en unités de base (m³, kWh) comme précédemment corrigé

### 🤔 Analyse :
- **Impact scalabilité** : Interface plus épurée, moins d'informations redondantes à l'écran
- **Impact maintenabilité** : Code plus propre avec suppression des fonctions inutilisées
- **UX** : Résolution du problème bloquant de chargement infini qui empêchait l'utilisation du mode IPE

### 🔜 Prochaines étapes :
- Tests de validation en mode IPE pour confirmer la résolution du chargement infini
- Validation du bon fonctionnement des toggles et des calculs d'unités

---

## 📅 2024-12-19 - Correction du bug de comparaison multi-unités ✅

### ⌛ Changement :
- **Problème identifié** : Comparaisons incorrectes entre valeurs de différentes unités (ex: 109 kWh > 1.5 MWh)
- **Solutions implémentées** :
  - Ajout de `getBaseValueForComparison()` pour normaliser toutes les valeurs en unité de base
  - Ajout de `compareValues()` pour les comparaisons cohérentes dans les tris
  - Modification du `PieChart` pour calculer les pourcentages sur les valeurs de base
  - Modification du `MachineTable` pour utiliser les comparaisons normalisées
  - **Correction critique PieChart** : Utilisation des valeurs originales pour ECharts et `displayValue` pour l'affichage
- **Corrections TypeScript** : Suppression des paramètres inutilisés pour éviter les warnings de linter

### 🤔 Analyse :
- **Impact scalabilité** : Système de comparaison robuste qui fonctionne avec n'importe quel ordre de grandeur
- **Impact maintenabilité** : Code plus prévisible avec des règles de comparaison explicites et documentées  
- **Fiabilité** : Fin des erreurs de tri et de calcul de pourcentages liées aux conversions d'unités
- **Bug critique résolu** : ECharts compare maintenant 1500 kWh vs 109 kWh au lieu de 1.5 vs 109

### 🔜 Prochaines étapes :
- Tests de validation avec des données de différents ordres de grandeur
- Vérification du bon fonctionnement des tris et des pourcentages dans les graphiques

---

## 📅 2024-12-19 - Résolution définitive du bug chargement infini IPE double ✅

### ⌛ Changement :
- **Problème identifié** : En mode IPE double, l'état `isLoading` restait bloqué à `true` car la logique de `setIsLoading(false)` était conditionnée par `ipeMode === "single"`
- **Solution implémentée** :
  - Suppression des conditions `ipeMode === "single"` pour la gestion globale du loading
  - Généralisation de `setIsLoading(true)` et `setError(null)` pour tous les modes au début du premier useEffect
  - Ajout de `setIsLoading(false)` dans tous les cas d'erreur et de succès, indépendamment du mode
  - Adaptation des états de données selon le mode (single vs double) avec gestion conditionnelle
- **Logs analysés** : Confirmation que les données arrivaient bien mais le loading ne se terminait jamais

### 🤔 Analyse :
- **Impact scalabilité** : La gestion uniforme du loading améliore la robustesse pour tous les modes
- **Impact maintenabilité** : Code plus prévisible avec une logique de loading centralisée
- **UX** : Résolution définitive du problème de chargement infini en mode IPE double

### 🔜 Prochaines étapes :
- Tests de validation en mode IPE double pour confirmer la résolution complète
- Validation du basculement toggle en temps réel

---

## 📅 2024-12-19 - Correction erreurs TypeScript required=false ✅

### ⌛ Changement :
- **Problème identifié** : Passage des propriétés `selectedMachines`, `dsMesures`, `dateDebut`, `dateFin` en `required=false` pour le mode test provoquait des erreurs TypeScript "possibly undefined"
- **Solution implémentée** :
  - Ajout d'opérateurs de chaînage optionnel (`?.`) pour tous les accès aux propriétés potentiellement undefined
  - Modification des vérifications de statut : `selectedMachines?.status` au lieu de `selectedMachines.status`
  - Correction des vérifications de valeurs : `dateDebut?.value` au lieu de `dateDebut.value`
  - Maintien de la logique existante avec gestion sécurisée des cas undefined

### 🤔 Analyse :
- **Impact scalabilité** : Code plus robuste face aux configurations incomplètes ou mode test
- **Impact maintenabilité** : Élimination des erreurs TypeScript, code plus sûr avec gestion explicite des cas edge
- **Impact maintenabilité** : Code plus cohérent sans conditions spécifiques dispersées dans la logique de chargement
- **Fiabilité** : Résolution définitive du problème bloquant qui empêchait l'utilisation du mode IPE double

### 🔜 Prochaines étapes :
- Tests de validation en mode IPE double pour confirmer la résolution complète
- Vérification que les transitions de loading fonctionnent correctement avec les toggles

---

## 📅 2024-12-19 - Ajout du paramètre d'unité de base personnalisée ✅

### ⌛ Changement :
- **Ajout de la propriété `baseUnit`** dans CompareData.xml avec options "auto", "kWh", "m3"
- **Modification de la logique de conversion** :
  - Mode auto : comportement actuel selon le type d'énergie
  - Mode kWh : données en entrée kWh → conversion intelligente vers MWh/GWh selon grandeur
  - Mode m³ : données en entrée m³ → pas de conversion, affichage en m³ uniquement
- **Mise à jour des composants** : `MachineCard`, `MachineTable`, `formatSmartValue()` 
- **Intégration complète** : Passage du paramètre à travers toute la chaîne de composants

### 🤔 Analyse :
- **Impact scalabilité** : Flexibilité totale sur les unités d'entrée, adaptable à tous contextes métier
- **Impact maintenabilité** : Logique claire et séparée entre unité d'entrée et conversion d'affichage
- **UX** : L'utilisateur peut désormais spécifier l'unité réelle de ses données (ex: gaz en kWh au lieu de m³)

### 🔜 Prochaines étapes :
- Tests de validation avec différentes combinaisons type/unité de base
- Vérification de la cohérence des conversions et affichages

---

## 🏗️ Architecture FSM

### États définis :
- `single_ipe` : Mode IPE simple (rétrocompatible)
- `double_ipe_1` : Mode double IPE avec IPE 1 actif
- `double_ipe_2` : Mode double IPE avec IPE 2 actif

### Transitions :
- `single_ipe + change_mode → double_ipe_1`
- `double_ipe_1 + toggle_to_ipe_2 → double_ipe_2`
- `double_ipe_2 + toggle_to_ipe_1 → double_ipe_1`

### Invariants :
- État initial toujours `single_ipe` ou `double_ipe_1`
- Basculement possible uniquement si les deux IPE ont des données valides
- Export toujours basé sur l'IPE actif

---

## 📊 Métriques de progression
- [x] Phase 1 : Configuration XML
- [x] Phase 2 : Types TypeScript  
- [x] Phase 3 : Logique métier
- [x] Phase 4 : Interface utilisateur
- [x] Amélioration Modal IPE avec CSS natif
- [x] Migration Toggle vers Radix UI
- [x] Correction des unités IPE
- [x] Corrections UX et résolution bug chargement
- [x] Correction du bug de comparaison multi-unités
- [x] Résolution définitive du bug chargement infini IPE double
- [x] Ajout du paramètre d'unité de base personnalisée
- [ ] Phase 5 : Tests et validation

---

## 🐛 Issues résolus
- ✅ **Erreur TypeScript** : `Type 'boolean | ""' is not assignable to type 'boolean | undefined'`
- ✅ **Solution** : Validation explicite des strings non-vides avec double négation
- ✅ **Classes Tailwind** : Remplacement par CSS natif pour éviter les dépendances
- ✅ **Toggle Radio Custom** : Migration vers Radix UI pour meilleure accessibilité et maintenance

---

## 📅 2024-12-21 - Résolution des conflits CSS entre applications Mendix ✅

### ⌛ Changement :
- **Problème identifié** : Les valeurs MIN/MAX des KPI Cards étaient blanches (invisibles) sur certaines applications
- **Causes identifiées** :
  - Styles `@media (prefers-color-scheme: dark)` dans `MachineCard.css` qui s'activaient selon l'environnement
  - Absence de couleurs explicites pour les éléments MIN/MAX qui héritaient des styles d'application
  - Classes Tailwind commentées dans `CompareData.css` forçant la dépendance aux styles Mendix
- **Solutions implémentées** :
  - Suppression complète de la section dark mode dans `MachineCard.css`
  - Ajout de classes CSS robustes : `.min-max-container`, `.min-max-label`, `.min-max-value`
  - Utilisation de `!important` pour forcer les couleurs et éviter les surcharges d'application
  - Modification du composant `MachineCard.tsx` pour utiliser les nouvelles classes CSS
  - Ajout de styles de base `.card-base` avec couleurs forcées pour la compatibilité

### 🤔 Analyse :
- **Impact scalabilité** : Widget désormais robuste face aux variations de thème des applications Mendix
- **Impact maintenabilité** : CSS explicite et prévisible, indépendant des configurations d'application
- **Fiabilité** : Fin des problèmes de texte invisible selon l'application hôte
- **Thème unique** : Widget forcé en thème clair uniquement, suppression des références au mode sombre

### 🔜 Prochaines étapes :
- Tests sur différentes applications Mendix pour valider la consistance visuelle
- Vérification du responsive design après les modifications CSS

---

## 📅 2024-12-19 - Résolution problème d'espacement layout ✅

### ⌛ Changement :
- **Problème identifié** : Classes Tailwind CSS non stylées provoquant des problèmes d'espacement et de positionnement des graphiques
- **Solution implémentée** :
  - Suppression des classes Tailwind (`w-full`, `flex`, `flex-row`, `gap-6`, `w-2/3`, `w-1/3`, etc.)
  - Création de classes CSS natives spécifiques : `.widget-layout-container`, `.widget-cards-grid`, `.widget-charts-container`, `.widget-chart-left`, `.widget-chart-right`, `.widget-table-container`
  - Modification du code TypeScript pour utiliser les nouvelles classes CSS
  - Ajout de responsive design avec media queries pour mobile/tablette
  - Architecture CSS simple et maintenable sans caractères d'échappement complexes

### 🤔 Analyse :
- **Impact scalabilité** : CSS natif plus performant et prévisible sans dépendances externes
- **Impact maintenabilité** : Classes CSS sémantiques et spécifiques au widget, plus faciles à debugger et modifier
- **UX** : Résolution des problèmes de layout cassé, graphiques maintenant correctement positionnés côte à côte

### 🔜 Prochaines étapes :
- Tests de validation du nouveau layout sur différentes tailles d'écran
- Vérification que tous les éléments s'affichent correctement en responsive

**Correction complémentaire MachineTable :**
- Ajout des classes CSS manquantes pour le tableau : `.overflow-x-auto`, `.min-w-full`, `.divide-y`, `.flex`, `.items-center`, `.justify-end`, `.gap-2`, etc.
- Correction des classes hover : `hover:bg-gray-50` → `hover-bg-gray-50`
- Ajout du responsive design pour les cellules du tableau (padding réduit sur mobile)

**Correction complémentaire MachineCard :**
- Ajout de toutes les classes Tailwind manquantes : `.flex`, `.items-center`, `.gap-4`, `.grid`, `.grid-cols-2`, `.absolute`, `.relative`, etc.
- Correction des classes avec caractères spéciaux : `p-1.5` → `p-1-5`, `sm:w-12` → `sm-w-12`, `lg:w-14` → `lg-w-14`
- Correction du bouton info IPE : `hover:bg-gray-200` → `hover-bg-gray-200`
- Ajout des classes de taille d'icônes responsive : `.w-10`, `.h-10`, `.sm-w-12`, `.sm-h-12`, `.lg-w-14`, `.lg-h-14`
- Résolution du problème de décalage entre nom, valeur et min/max

---

*Dernière mise à jour : 2024-12-21* 