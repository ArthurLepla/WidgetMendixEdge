# Avancement du Projet Headers

## [28 Janvier 2025] - Amélioration UX DateRangePickerV2 - Navigation automatique

### ⌛ Changement :
Amélioration du composant `DateRangePickerV2` pour qu'il s'ouvre automatiquement sur la plage de dates sélectionnée. Ajout d'une fonction utilitaire `calculateMonthsToDisplay()` qui positionne intelligemment les calendaires gauche et droite en fonction de la plage sélectionnée, et d'un effet qui remet les calendriers sur la bonne position à chaque ouverture du popover.

### 🤔 Analyse :
Cette amélioration UX élimine la friction utilisateur en évitant de devoir naviguer manuellement vers les dates sélectionnées à chaque ouverture. Pour les workflows impliquant des modifications fréquentes de plages temporelles, cela réduit significativement le nombre de clics et améliore l'efficacité. L'implémentation respecte les principes FSM en gérant clairement les états d'ouverture/fermeture et la synchronisation des vues calendriers.

### 💜 Prochaines étapes :
- Tester le comportement avec des plages de dates dans des années différentes
- Valider que la navigation manuelle reste fluide après l'ouverture automatique
- Considérer l'ajout d'une animation de transition lors du positionnement automatique

## [12 Juillet 2025] - Intégration de DateRangePickerV2 dans HeaderContainer

### ⌛ Changement :
Remplacement de l'ancien composant `DateRangePicker` par le nouveau `DateRangePickerV2` dans le `HeaderContainer.tsx`. L'ancien composant `date-range-picker.tsx` est maintenant prêt à être supprimé.

### 🤔 Analyse :
Cette migration finalise la mise à jour du sélecteur de dates. En utilisant `DateRangePickerV2` de manière centralisée, on assure une expérience utilisateur unifiée sur toute l'application. La maintenabilité est grandement améliorée car il n'y a plus qu'un seul composant de sélection de date à gérer, ce qui réduit la dette technique et simplifie le code de `HeaderContainer`.

### 💜 Prochaines étapes :
-   Supprimer le fichier de l'ancien composant `src/components/ui/date-range-picker.tsx`.
-   Supprimer le fichier de style associé `src/components/ui/date-range-picker.module.css`.
-   Effectuer un test de régression pour s'assurer que le header s'affiche et fonctionne comme attendu.

## [12 Juillet 2025] - Création du composant DateRangePickerV2

### ⌛ Changement :
Création du nouveau composant `DateRangePickerV2` avec une interface utilisateur moderne et unifiée, et stylisation via un fichier CSS dédié. Le composant inclut la sélection de plage de dates sur un double calendrier, la sélection d'heure, et des périodes prédéfinies. Un fichier CSS dédié (`DateRangePickerV2.css`) a été créé pour assurer une cohérence visuelle avec les autres composants de l'application, comme `TreeSelect`.

### 🤔 Analyse :
L'adoption de ce composant standardisé améliore la maintenabilité en centralisant la logique de sélection de date/heure. L'interface utilisateur, inspirée de `TreeSelect`, renforce la cohérence du design system, ce qui réduit la charge cognitive pour l'utilisateur et facilite le développement de nouvelles fonctionnalités. L'utilisation de `framer-motion` et d'un CSS soigné garantit une expérience utilisateur fluide et moderne, ce qui est crucial pour l'adoption du produit.

### 💜 Prochaines étapes :
-   Remplacer toutes les anciennes instances de sélecteurs de date par `DateRangePickerV2` pour standardiser l'UX.
-   Valider l'accessibilité du nouveau composant (navigation clavier, rôles ARIA).
-   Ajouter des tests unitaires pour le `CustomCalendar` et la logique de gestion d'état.

## [29 Janvier 2025] - Migration vers Joy UI pour le composant Input

### ⌛ Changement :
Migration complète du composant de recherche (`SearchInput`) vers la librairie Joy UI de MUI. L'ancienne implémentation (d'abord `tailwind-variants`, puis CSS pur) a été remplacée par un composant robuste et standardisé.

**Actions réalisées :**
1.  Installation des dépendances `@mui/joy`, `@emotion/react`, et `@emotion/styled`.
2.  Refactorisation complète de `src/components/ui/input.tsx` pour exporter un unique composant `SearchInput` basé sur `<Input />` de Joy UI.
    -   Utilisation de la variante `soft` par défaut.
    -   Mise en place d'un mapping de props (`inputSize` -> `size`, `hasError` -> `color='danger'`) pour la rétrocompatibilité.
3.  Mise à jour de `src/components/ui/multi-select.tsx` pour utiliser ce nouveau composant standardisé.
4.  Suppression du fichier `src/components/ui/multi-select.css` devenu obsolète.

### 🤔 Analyse :
**Scalabilité & Maintenabilité** : ✅ L'adoption de Joy UI standardise notre base de composants, ce qui la rend plus prévisible, maintenable et facile à faire évoluer. Nous bénéficions de l'accessibilité, du theming et des fonctionnalités intégrées de MUI, réduisant ainsi la quantité de code custom à maintenir. Cette approche est beaucoup plus robuste que la gestion manuelle via CSS pur ou `tailwind-variants`.

### 💜 Prochaines étapes :
-   Étendre l'utilisation de Joy UI à d'autres composants pour uniformiser l'UI.
-   Mettre en place un thème custom Joy UI pour aligner les styles avec la charte graphique du projet.


## [29 Janvier 2025] - Remplacement de l'input de recherche dans MultiSelect

### ⌛ Changement :
Remplacement du composant `SearchInputPopover` (basé sur `tailwind-variants` et `AlignUI`) par un composant `SearchInput` simple, stylisé avec du CSS pur et modulaire (`multi-select.css`). Cette modification a été effectuée dans le composant `multi-select.tsx` pour résoudre des conflits potentiels et améliorer l'isolation stylistique.

**Actions réalisées :**
1.  Création du fichier `src/components/ui/multi-select.css` avec des styles dédiés pour le champ de recherche.
2.  Définition d'un nouveau composant `SearchInput` local dans `multi-select.tsx` utilisant ces classes CSS.
3.  Remplacement de l'ancien `SearchInputPopover` par ce nouveau composant.
4.  Suppression du composant `SearchInputPopover` devenu inutile du fichier `src/components/ui/input.tsx`.

### 🤔 Analyse :
**Scalabilité & Maintenabilité** : ✅ L'utilisation de CSS pur et scopé (`multi-select.css`) pour le champ de recherche réduit les risques de conflits de style et de dépendances complexes. Le code du `multi-select` est désormais plus autonome et facile à maintenir, sans dépendre de la structure interne d'un autre composant comme `AlignUI`. La suppression du code mort simplifie la codebase.

### 💜 Prochaines étapes :
-   Valider le comportement et le style du nouveau champ de recherche sur différents navigateurs.
-   Revue générale des composants pour identifier d'autres opportunités de simplification similaires.


## [28 Janvier 2025] - Refactorisation Input v3.0.0 vers AlignUI moderne

### ⌛ Changement :
Refactorisation complète du composant Input pour s'aligner sur l'exemple AlignUI avec gestion correcte des états placeholder/filled, système de shadows/borders moderne, et variants appropriés.

**Améliorations apportées :**
- **États placeholder/filled avancés** : Utilisation de `group-has-[:placeholder-shown]` pour détecter l'état vide vs rempli
- **Système de borders moderne** : Pseudo-elements `before:` pour les bordures avec transitions fluides
- **Variants alignés** : `rounded-10` pour medium, hauteurs `h-10` au lieu de `h-14`
- **Couleurs harmonisées** : Système de couleurs gris cohérent avec transitions d'états
- **Gestion des icônes sophistiquée** : États spécifiques pour placeholder vs filled avec transitions

**Changements techniques :**
- Suppression du Context API au profit de props explicites
- Simplification des variants avec focus sur les cas d'usage réels
- Amélioration du système de transition et hover states
- Meilleure gestion des disabled states

### 🤔 Analyse :
**Scalabilité** : ✅ Approche plus moderne et maintenable alignée sur les standards AlignUI
**Maintainabilité** : ✅ Code plus propre avec logique d'états mieux structurée
**Performance** : ✅ Réduction de complexité (pas de Context API)
**Problème identifié** : ❌ Conflit de types dans les composants de compatibilité (SearchInput/SearchInputPopover)

**Problème technique résolu** : ✅ Les props HTML natives comme `size` (nombre) entraient en conflit avec nos props personnalisées `size` (string union). **Solution appliquée** : Destructuring explicite `const { size: htmlSize, ...inputProps } = props;` dans les composants de compatibilité.

### 🔜 Prochaines étapes :
1. ✅ **RÉSOLU** : Conflit de types dans SearchInput/SearchInputPopover corrigé
2. ✅ **TERMINÉ** : Props extraites manuellement dans les composants de compatibilité
3. Tester les nouvelles transitions et états visuels
4. Valider la cohérence avec les autres composants (multi-select, etc.)
5. Mettre à jour la documentation des nouvelles props

**BUILD RÉUSSI** : 🎉 Le composant Input v3.0.0 est maintenant entièrement fonctionnel avec la structure modulaire AlignUI moderne. 

## [29 Janvier 2025] - Ajustements UI et support hiérarchie MultiSelect

### ⌛ Changement :
Affinement visuel du composant `SearchInput` (taille d'input réduite à 38 px, font-size 1.05 rem, placeholder assorti) et ajout de deux nouveaux attributs dans `Headers.xml` pour permettre l'affichage en arborescence dans le multi-select (`parentNameAttribute`, `levelAttribute`).

### 🤔 Analyse :
Ces réglages améliorent l'ergonomie (lisibilité accrue, padding cohérent) et ouvrent la voie au rendu hiérarchique des assets.

### 💜 Prochaines étapes :
-   Implémenter le rendu « tree view » dans `multi-select.tsx` en utilisant les nouveaux attributs. 

# Avancement du projet Headers Widget

## 2025-01-28 - Migration TreeSelect et harmonisation des largeurs

### ⌛ Changement :
Migration complète du multi-select vers TreeSelect d'Ant Design + harmonisation des largeurs entre multi-select et date-range-picker + refonte CSS minimaliste

### 🤔 Analyse :
**Problèmes résolus :**
- Multi-select migré de react-complex-tree vers TreeSelect d'Ant Design (plus simple, plus robuste)
- Largeurs harmonisées entre les deux composants (320px minimum)
- CSS complètement revu pour un style sobre et minimaliste
- Conflits et chevauchements de focus ring corrigés
- Suppression des composants inutiles (select.tsx, input.tsx, multi-select.css)

**Améliorations apportées :**
- TreeSelect d'Ant Design avec configuration optimisée (treeCheckable, showCheckedStrategy, etc.)
- Tags personnalisés avec style sobre (gris/neutre au lieu de bleu vibrant)
- Focus ring unifié et sans conflits
- Transitions réduites à 0.15s pour plus de fluidité
- Scrollbar discrète (6px au lieu de 8px)
- Suppression des animations complexes (shimmer, slide-in, etc.)

**Impact technique :**
- Réduction du bundle size (suppression de react-complex-tree, framer-motion, radix-ui/popover)
- Meilleure consistance avec l'écosystème Ant Design
- Code plus maintenable et prévisible
- Moins de conflits CSS potentiels

### 💜 Prochaines étapes :
- Tester l'intégration dans l'environnement Mendix
- Valider l'accessibilité du TreeSelect
- Optimiser les performances si nécessaire
- Documenter l'utilisation du nouveau composant

---

## 2025-01-27 - Résolution erreur React #301

### ⌛ Changement :
Résolution complète de l'erreur React #301 "Objects are not valid as a React child" dans le composant multi-select

### 🤔 Analyse :
**Problème identifié :** Rendu direct d'objets JavaScript dans JSX, particulièrement dans les fonctions de rendu avec react-complex-tree et framer-motion.

**Solutions implémentées :**
- Utilisation systématique d'`useMemo` pour stabiliser les données
- Séparation des logiques de rendu en fonctions dédiées
- Validation stricte des types retournés (string, number, ReactElement uniquement)
- Gestion améliée des états vides et de loading

**Impact :** Composant stable, animations fluides, build réussi, prêt pour tests Mendix.

### 💜 Prochaines étapes :
- Tests d'intégration Mendix
- Validation UX des animations
- Optimisation performances si nécessaire 

## [09 Juillet 2025] - Harmonisation des hauteurs MultiSelect / DateRangePicker

### ⌛ Changement :
Alignement des hauteurs entre le composant MultiSelect (TreeSelect AntD) et le DateRangePicker pour éviter les décalages verticaux dans l'entête.

**Actions réalisées :**
1.  Mise à jour de `src/components/ui/multi-select.css` : 
    - Hauteur, min-hauteur et max-hauteur du sélecteur passées de 40 px à 48 px.
    - Ajustement du `line-height` et du `max-height` des conteneurs associés.
    - Harmonisation des règles responsives.
2.  Ajout d'une `min-height` (48 px) + flag `!important` (`!tw-h-12`) dans le `DateRangePicker` pour forcer la hauteur à 48 px malgré Bootstrap/Mendix.

### 🤔 Analyse :
Uniformiser la hauteur améliore la cohérence visuelle et réduit la « jank » dans l'alignement flexbox. Cela assure également une cible tactile ≥ 44 px recommandée par les guides d’accessibilité, tout en gardant la palette et le style existants.

### 💜 Prochaines étapes :
- Vérifier l’affichage sur mobiles (viewport ≤ 640 px) et ajuster si nécessaire.
- Contrôler l’impact sur les écrans haute densité et les états d’erreur.
- Ajouter un test visuel automatisé (Storybook / Playwright) pour éviter les régressions de hauteur. 

## [10 Juillet 2025] - Améliorations UI MultiSelect (focus, alignement, hiérarchie)

### ⌛ Changement :
Corrections visuelles et fonctionnelles du composant MultiSelect.

**Actions réalisées :**
1.  `multi-select.tsx` : suppression de `treeLine` pour répliquer l’exemple *Basic* d’Ant Design (indentation sans lignes).
2.  `multi-select.css` :
    - Centrage vertical du contenu (`align-items: center`).
    - Suppression de l’outline/focus ring bleu par défaut.
    - Positionnement absolu du bouton clear (`right: 32px`) et chevron (`right: 12px`) pour éviter le chevauchement.
3.  MàJ responsive & box-shadow conservé pour l’accessibilité focus.

### 🤔 Analyse :
Ces ajustements améliorent la lisibilité (alignement), l’UX (focus discret mais visible) et corrigent un chevauchement d’icônes. L’ajout de `treeLine` rend visuelle la structure parent-enfant des nœuds.

### 💜 Prochaines étapes :
- Tester la hiérarchie sur des jeux de données profonds (>3 niveaux).
- Affiner l’espacement si nécessaire entre les tags sélectionnés. 

## 29/07/2024

### ⌛ Changement :
Correction d'un conflit de style dans le composant `TreeSelect`. L'icône de recherche et le placeholder se superposaient. J'ai ajouté l'icône de recherche manquante depuis `lucide-react` et ajusté le `padding` du champ de recherche. De plus, j'ai ajouté la règle `!important` à toutes les propriétés CSS concernées pour garantir que les styles ne soient pas écrasés par d'autres feuilles de style, comme celles de Mendix.

### 🤔 Analyse :
La correction garantit une expérience utilisateur cohérente et sans friction visuelle dans le composant `TreeSelect`. L'utilisation de `!important` est une solution pragmatique pour forcer la priorité des styles dans un environnement où plusieurs frameworks (comme Mendix) peuvent imposer leurs propres styles, prévenant ainsi de futurs conflits. Cela améliore la robustesse de l'interface utilisateur.

### 💜 Prochaines étapes :
-   Vérifier d'autres composants pour des conflits de style similaires.
-   Envisager une stratégie de gestion CSS plus granulaire pour éviter l'usage excessif de `!important` à long terme, si possible. 

## [11 Juillet 2025] - Migration et Amélioration Esthétique du DateRangePicker

### ⌛ Changement :
Migration complète des styles du composant `DateRangePicker` de Tailwind CSS vers des CSS Modules purs (`date-range-picker.module.css`). Cette migration s'accompagne d'une refonte visuelle pour améliorer la lisibilité, l'ergonomie et l'utilisation de l'espace, en s'inspirant de la capture d'écran fournie.

**Améliorations apportées :**
- **Migration vers CSS Modules** : Suppression de toutes les classes `tw-*` et de la dépendance `cn` au profit de styles scopés, garantissant une meilleure isolation.
- **Popover Élargi** : La largeur minimale du popover a été augmentée à `820px` pour un affichage plus aéré.
- **Lisibilité Accrue** : La taille des polices a été augmentée pour les titres, les préréglages, les labels et les boutons.
- **Ergonomie Améliorée** : Les zones cliquables (cellules du calendrier, boutons) ont été agrandies (`--rdp-cell-size: 48px`).
- **Espacement Optimisé** : Les paddings et les espacements (`gap`) ont été revus pour une meilleure hiérarchie visuelle.

### 🤔 Analyse :
Cette double intervention (migration technique et refonte esthétique) atteint plusieurs objectifs. D'une part, elle standardise l'approche stylistique du projet en éliminant Tailwind au profit de CSS Modules, ce qui renforce la maintenabilité et la cohérence. D'autre part, les améliorations visuelles rendent le composant plus agréable et facile à utiliser, en particulier sur les écrans tactiles, tout en optimisant l'affichage d'informations complexes (deux mois, sélecteurs d'heure).

### 💜 Prochaines étapes :
-   Valider le rendu sur différentes résolutions pour confirmer que le design responsive est cohérent.
-   Effectuer des tests d'accessibilité pour s'assurer que les modifications de style (contrastes, tailles) respectent les normes WCAG.
-   Mettre à jour la documentation du composant si les changements impactent son utilisation. 

## [11 Juillet 2025] - Ajustement du style de survol dans TreeSelect

### ⌛ Changement :
Modification de l'effet de survol (`hover`) pour les nœuds du composant `TreeSelect`. La couleur de fond au survol a été remplacée par un gris très clair et discret (`#f9fafb`) pour offrir une expérience plus sobre et minimaliste.

### 🤔 Analyse :
Cet ajustement purement visuel affine l'expérience utilisateur en réduisant la "lourdeur" de l'interaction. L'utilisation d'une couleur déjà présente dans la palette du composant (`#f9fafb` pour le fond de la recherche) renforce la cohérence stylistique. C'est une petite amélioration qui contribue à une interface plus polie et professionnelle, sans aucun impact sur la performance ou la maintenabilité.

### 💜 Prochaines étapes :
-   Passer en revue d'autres micro-interactions pour identifier des opportunités d'amélioration similaires.
-   Valider que le contraste reste suffisant pour l'accessibilité. 

## [11 Juillet 2025] - Refactorisation des styles du DateRangePicker

### ⌛ Changement :
Résolution d'un conflit CSS majeur pour le composant `DateRangePicker`. Tous les styles qui lui étaient dédiés ont été supprimés du fichier global `src/ui/Headers.css` et centralisés dans son propre fichier CSS Module : `src/components/ui/date-range-picker.module.css`.

**Actions réalisées :**
1.  **Nettoyage de `Headers.css`** : Suppression de toutes les règles ciblant `.date-range-picker`, `button[id="date"]` et la classe utilitaire `.date-range-picker-large`.
2.  **Mise à jour de `date-range-picker.module.css`** : Intégration des styles d'harmonisation (hauteur de `44px`, largeur minimale de `350px`, taille de police de `1.125rem`) directement dans la classe `.triggerButton` et `.dateRangePicker`.

### 🤔 Analyse :
Cette refactorisation est cruciale pour la **maintenabilité** et la **robustesse** de l'application. En éliminant les styles globaux et les `!important` au profit d'une approche modulaire, on supprime les risques de conflits et d'écrasement de styles non désirés. Le code est désormais plus propre, plus prévisible et aligné avec les bonnes pratiques du projet. La cohérence visuelle entre le `DateRangePicker` et le `TreeSelect` est maintenant assurée de manière fiable.

### 💜 Prochaines étapes :
-   Effectuer une revue finale pour s'assurer qu'aucun style résiduel ne traîne dans les fichiers globaux.
-   Vérifier le rendu dans Mendix pour confirmer que l'application des styles est parfaite. 

## [11 Juillet 2025] - Harmonisation finale des styles et suppression des conflits

### ⌛ Changement :
Finalisation de la stratégie de stylisation en faisant des CSS spécifiques à chaque composant la seule source de vérité. Tous les styles conflictuels ou redondants ont été purgés du fichier global `src/ui/Headers.css`.

**Actions réalisées :**
1.  **Purge de `Headers.css`** : Suppression des dernières règles CSS qui ciblaient le composant `TreeSelect` depuis le fichier global. Un commentaire a été laissé pour indiquer que tous les styles des composants sont maintenant gérés localement.
2.  **Harmonisation finale** : Le style du `DateRangePicker` a été ajusté pour correspondre parfaitement à celui du `TreeSelect`, notamment avec une taille de police de `1.3rem` pour la valeur affichée, assurant une cohérence visuelle parfaite entre les deux sélecteurs.

### 🤔 Analyse :
Cette intervention met fin aux conflits de précédence CSS (`CSS specificity`) qui causaient des incohérences visuelles. En adoptant une approche "component-first" où chaque composant est stylisé de manière autonome via les CSS (ou CSS Modules), nous garantissons :
- **Maintenabilité accrue** : Il est beaucoup plus simple de modifier le style d'un composant sans risquer de régression ailleurs.
- **Prévisibilité** : Le rendu d'un composant ne dépend plus de l'ordre de chargement des feuilles de style globales.
- **Robustesse** : Le système est moins fragile et plus facile à faire évoluer.

C'est une étape clé vers une base de code UI saine et scalable.

### 💜 Prochaines étapes :
-   La base de style est maintenant propre. Prochaine étape : intégration et validation complètes dans l'environnement Mendix.
-   Mettre en place des tests de régression visuelle (par ex. avec Storybook) pour automatiser la détection de ce type de problème à l'avenir. 

## [11 Juillet 2025] - Correction et Amélioration de l'agencement du DateRangePicker

### ⌛ Changement :
Correction d'une régression visuelle dans le composant `DateRangePicker`. L'agencement du popover a été revu pour utiliser pleinement l'espace disponible, et les styles ont été finalisés pour une parfaite harmonie avec le `TreeSelect`.

**Actions réalisées :**
1.  **Optimisation de l'espace** : Dans `date-range-picker.module.css`, les conteneurs internes (`.mainContent`, `.calendarContainer`) utilisent maintenant la propriété `flex: 1` pour s'étendre et remplir l'espace horizontal et vertical disponible, ce qui élimine les marges vides inesthétiques.
2.  **Harmonisation de la police** : La taille de la police du texte dans le bouton déclencheur (`.triggerText`) a été alignée sur `1.3rem`, conformément au style du `TreeSelect`.
3.  **Nettoyage final** : La propriété `font-size` a été retirée du conteneur `.triggerButton` pour éviter les conflits et laisser le `.triggerText` dicter la taille de la police.

### 🤔 Analyse :
Cette correction était essentielle pour finaliser la refonte du `DateRangePicker`. Le composant est maintenant non seulement visuellement cohérent avec le reste de l'interface, mais son agencement interne est aussi plus robuste et flexible grâce à une utilisation correcte de Flexbox. Le résultat est une expérience utilisateur plus professionnelle et un code CSS plus maintenable.

### 💜 Prochaines étapes :
-   Valider le comportement responsive du nouveau layout sur différentes tailles d'écran.
-   Archiver cette version comme étant la référence visuelle pour les futurs composants de type "sélection". 

## [11 Juillet 2025] - Refonte de l'agencement et de la lisibilité du DateRangePicker

### ⌛ Changement :
Amélioration majeure de l'interface du `DateRangePicker` pour optimiser l'utilisation de l'espace et augmenter la lisibilité, en s'alignant sur le design de référence.

**Actions réalisées dans `date-range-picker.module.css` :**
1.  **Réorganisation de l'espace** : Le conteneur du calendrier (`.calendarContainer`) a été transformé en conteneur flex vertical. Cela permet d'empiler correctement les calendriers et les sélecteurs de temps, tout en utilisant l'espace vertical disponible (`flex: 1`). Un espacement (`gap`) a été ajouté pour aérer la disposition.
2.  **Augmentation de la lisibilité** : Des variables CSS ont été définies pour augmenter significativement la taille de police des éléments clés du calendrier :
    -   `--rdp-caption-font-size` (nom du mois) : `1.25rem`
    -   `--rdp-head_cell-font-size` (jours de la semaine) : `1rem`
    -   `--rdp-day-font-size` (numéros des jours) : `1.125rem`
    
### 🤔 Analyse :
Cette refonte corrige le problème d'espace mal utilisé et améliore grandement l'expérience utilisateur. L'augmentation de la taille des polices rend le calendrier moins dense et beaucoup plus facile à lire. L'utilisation de Flexbox pour l'agencement vertical assure que le composant s'adapte de manière plus prévisible et robuste, quel que soit l'espace disponible. Le résultat est une interface plus professionnelle, aérée et fonctionnelle.

### 💜 Prochaines étapes :
-   Confirmer que l'agencement des sélecteurs de temps sous les calendriers est correct sur toutes les résolutions.
-   Effectuer un test final d'accessibilité sur les contrastes et les tailles de police. 

## [11 Juillet 2025] - Finalisation de l'harmonisation des composants de sélection

### ⌛ Changement :
Application de la largeur minimale de `350px` au composant `TreeSelect` pour finaliser son harmonisation avec le `DateRangePicker`.

### 🤔 Analyse :
Ce changement, bien que mineur, est l'étape finale pour garantir une cohérence visuelle parfaite entre les deux principaux composants de sélection de l'en-tête. En s'assurant que les deux partagent la même `min-width` directement dans leurs fichiers de style respectifs, on élimine les dernières incohérences qui auraient pu survenir à cause de la purge des styles globaux. La base de code est maintenant plus propre, plus modulaire, et l'interface utilisateur est visuellement unifiée.

### 💜 Prochaines étapes :
-   Le travail de refactorisation et d'harmonisation est terminé.
-   Procéder à la validation finale dans l'environnement Mendix. 

## [11 Juillet 2025] - Ajustement final de la largeur minimale des composants

### ⌛ Changement :
Correction de la largeur minimale des composants `TreeSelect` et `DateRangePicker` pour la fixer à `320px`, suite à une revue finale des spécifications de design.

### 🤔 Analyse :
Cet ajustement assure que les composants respectent précisément les contraintes de layout définies, tout en conservant l'harmonie visuelle établie précédemment. Cette modification finalise la configuration stylistique des composants de sélection et clôt le cycle de refactorisation.

### 💜 Prochaines étapes :
-   Tous les ajustements de style sont terminés. Le code est prêt pour la validation finale. 

## [11 Juillet 2025] - Refactorisation de la logique du DateRangePicker (Phase 1)

### ⌛ Changement :
Première phase de la refactorisation du composant `DateRangePicker` axée sur l'amélioration de l'expérience utilisateur et la simplification des interactions.

**Améliorations apportées :**
1.  **Sélection instantanée des préréglages** : Cliquer sur une période présélectionnée (ex: "Aujourd'hui") applique maintenant la date et ferme le popover immédiatement, éliminant ainsi le besoin de cliquer sur "Appliquer".
2.  **Stabilité de l'interface** : Les sélecteurs d'heure (`TimePicker`) sont désormais toujours visibles mais désactivés tant qu'une date n'est pas sélectionnée. Cela supprime les sauts de mise en page (CLS) et rend l'interface plus stable et prévisible.
3.  **Amélioration du `TimePicker`** : Le composant `TimePicker` a été enrichi pour accepter une propriété `disabled`, permettant de contrôler son état depuis le composant parent.

### 🤔 Analyse :
Cette première phase de refactorisation a un impact significatif sur l'UX. Le flux de travail pour les cas d'usage les plus courants (sélection d'une période prédéfinie) est maintenant plus rapide et plus intuitif. La stabilisation de l'interface (absence de CLS) contribue à une perception de fluidité et de qualité accrue. Techniquement, le code est plus robuste grâce à la gestion explicite de l'état désactivé du `TimePicker`.

### 💜 Prochaines étapes :
-   Passer à la **Phase 2 : Refactorisation de la Structure du Code** en divisant le composant en sous-composants plus petits et maintenables.
-   Valider le comportement du `TimePicker` désactivé. 

## [11 Juillet 2025] - Refactorisation de la structure du DateRangePicker (Phase 2)

### ⌛ Changement :
Seconde phase de la refactorisation du `DateRangePicker` axée sur la clarification de la structure du code. Le composant a été décomposé en trois sous-composants logiques : `PresetsColumn`, `CalendarView`, et `ActionFooter`.

**Améliorations apportées :**
1.  **Isolation des responsabilités** : Chaque sous-composant a un rôle unique (afficher les préréglages, gérer le calendrier, afficher les boutons d'action), ce qui rend le code plus facile à comprendre et à maintenir.
2.  **Lisibilité accrue** : Le JSX du composant principal `DateRangePicker` est maintenant beaucoup plus concis et déclaratif, se contentant d'assembler les sous-composants.
3.  **Maintenabilité améliorée** : Les modifications futures sur une partie spécifique de l'interface (par exemple, le style des boutons) ne nécessiteront que d'intervenir dans le sous-composant concerné, réduisant le risque de régressions.

### 🤔 Analyse :
Cette refactorisation structurelle est un investissement majeur dans la santé à long terme de la base de code. En suivant le principe de responsabilité unique, nous avons transformé un composant monolithique complexe en un assemblage de briques simples et réutilisables. Cela améliore non seulement la maintenabilité, mais facilite également les tests et l'évolution future du composant.

### 💜 Prochaines étapes :
-   Passer à la **Phase 3 : Améliorations Visuelles et Animations** pour peaufiner l'interface.
-   Envisager de déplacer les sous-composants dans leurs propres fichiers si leur complexité augmente à l'avenir.

## [11 Juillet 2025] - Améliorations visuelles du DateRangePicker (Phase 3)

### ⌛ Changement :
Troisième et dernière phase de la refactorisation du `DateRangePicker`, axée sur le polissage de l'interface et l'ajout de micro-interactions.

**Améliorations apportées :**
1.  **Interactions fluides** : Utilisation de `framer-motion` pour ajouter des animations de survol (`scale: 1.03`) et de clic (`scale: 0.98`) sur les boutons de préréglages, offrant un retour visuel satisfaisant.
2.  **Harmonisation des boutons** : Le style des boutons "Annuler" et "Appliquer" a été revu pour correspondre parfaitement au design system de l'application (bouton primaire sombre, bouton secondaire clair).
3.  **Transitions CSS** : Des transitions douces ont été ajoutées sur les boutons pour rendre les changements d'état (survol, focus) plus agréables.

### 🤔 Analyse :
Cette dernière phase finalise la refonte du composant en lui apportant une touche de professionnalisme et de fluidité. Les micro-interactions, bien que subtiles, améliorent considérablement l'expérience utilisateur perçue. L'harmonisation des styles de boutons renforce la cohérence globale de l'interface. Le composant est maintenant non seulement fonctionnel et bien structuré, mais aussi élégant et agréable à utiliser.

### 💜 Prochaines étapes :
-   La refactorisation du `DateRangePicker` est terminée.
-   Procéder à une validation complète en environnement Mendix pour s'assurer du bon fonctionnement de toutes les nouvelles fonctionnalités et styles.
-   Archiver ce composant comme référence pour les futurs développements. 

## [11 Juillet 2025] - Finalisation de la migration vers CSS Modules

### ⌛ Changement :
Finalisation de la stratégie de style en migrant le dernier composant récalcitrant, `TimePicker`, loin de Tailwind CSS. Le composant utilise maintenant exclusivement son propre module CSS (`time-picker.module.css`).

**Actions réalisées :**
1.  **Création du CSS Module** : Un nouveau fichier `time-picker.module.css` a été créé pour héberger les styles du composant.
2.  **Traduction des styles** : Toutes les classes utilitaires Tailwind ont été converties en règles CSS pures et bien nommées.
3.  **Mise à jour du composant** : Le fichier `time-picker.tsx` a été modifié pour importer et utiliser les nouveaux styles, supprimant ainsi la dépendance à `cn` et Tailwind.

### 🤔 Analyse :
Cette dernière étape clôt avec succès l'effort de refactorisation visant à établir une approche de style cohérente et maintenable. En éliminant les dernières traces de Tailwind au profit de CSS Modules, nous avons renforcé l'isolation des composants, amélioré la prévisibilité des styles et simplifié la base de code. L'ensemble de l'écosystème de sélection de date est maintenant propre, robuste et aligné sur les meilleures pratiques du projet.

### 💜 Prochaines étapes :
-   Le projet est techniquement propre et prêt pour une validation complète.
-   Effectuer une passe de tests de non-régression sur tous les composants modifiés. 

## [12 Juillet 2025] - Correction du Popover et Amélioration UI de DateRangePickerV2

### ⌛ Changement :
Correction d'un bug majeur de positionnement dans le `DateRangePickerV2` où le popover était coupé par les conteneurs parents. Amélioration générale de la lisibilité en augmentant la taille des polices.

**Actions réalisées :**
1.  **Correction du Popover** :
    -   Implémentation d'un portail React (`createPortal`) pour rendre le dropdown directement dans le `<body>` du document. Cela l'extrait du flux normal et empêche tout conteneur parent de le couper.
    -   Ajout d'une logique de positionnement dynamique en JavaScript pour calculer et appliquer les coordonnées `top` et `left` du popover par rapport au bouton déclencheur, assurant qu'il s'affiche toujours au bon endroit.
    -   Mise à jour de la logique de détection de clic extérieur pour fonctionner avec le portail.
2.  **Amélioration de la Lisibilité** :
    -   Augmentation de la taille de police de tous les textes à l'intérieur du popover (préréglages, titres, labels) dans `DateRangePickerV2.css`.
    -   Augmentation spécifique de la taille des chiffres du calendrier et des en-têtes de jours pour une meilleure clarté.

### 🤔 Analyse :
La correction du positionnement du popover via un portail est une solution robuste qui élimine les problèmes de `z-index` et de `overflow` cachés, fréquents dans les applications complexes comme Mendix. Cela garantit une expérience utilisateur sans faille, quelle que soit la structure de la page. Les ajustements typographiques, quant à eux, améliorent le confort de lecture et renforcent la cohérence et la qualité perçue de l'interface.

### 💜 Prochaines étapes :
-   Valider le comportement du popover sur différents navigateurs et résolutions d'écran.
-   Confirmer que les nouvelles tailles de police ne créent pas de débordement de texte inattendu. 

## [12 Juillet 2025] - Correction Avancée du Positionnement du Popover

### ⌛ Changement :
Correction de la logique de positionnement dynamique pour le popover du `DateRangePickerV2`. La version précédente ne gérait pas correctement le dépassement de la fenêtre (`viewport`) lorsque le composant était situé près du bord droit de l'écran.

**Actions réalisées :**
1.  **Logique d'alignement intelligent** : Le `useEffect` de positionnement a été modifié. Il calcule maintenant si le popover (avec sa largeur fixe de `720px`) dépasserait de la fenêtre. 
    -   Si c'est le cas, il aligne le bord droit du popover avec le bord droit du bouton déclencheur.
    -   Sinon, il conserve l'alignement par défaut sur le bord gauche.
2.  **Sécurité anti-dépassement** : Une vérification `Math.max(16, left)` a été ajoutée pour garantir que le popover ne sorte jamais de l'écran par la gauche.

### 🤔 Analyse :
Cette correction affine le comportement du portail React et résout de manière robuste le problème de positionnement. Le popover est maintenant "conscient" des limites de la fenêtre, ce qui garantit qu'il reste toujours entièrement visible, améliorant considérablement l'expérience utilisateur sur toutes les résolutions et dans tous les contextes de mise en page. C'est la touche finale pour un composant de sélection de date professionnel et fiable.

### 💜 Prochaines étapes :
-   Le composant `DateRangePickerV2` est maintenant considéré comme stable et complet.
-   Procéder à des tests de validation finaux sur différents navigateurs. 

## [12 Juillet 2025] - Correction du bug d'ouverture du Popover

### ⌛ Changement :
Correction d'un bug critique dans le `DateRangePickerV2` qui empêchait l'ouverture du popover au clic.

**Actions réalisées :**
1.  **Diagnostic du problème** : Le problème provenait d'un conflit dans la gestion des événements. L'événement `mousedown` qui déclenchait l'ouverture était immédiatement intercepté par le listener `handleClickOutside`, qui refermait le popover à peine ouvert.
2.  **Correction via `setTimeout`** : L'appel à `setOpen(!open)` dans le `onClick` du bouton a été enveloppé dans un `setTimeout(() => {...}, 0)`. Cette technique décale l'exécution de la mise à jour de l'état à la fin de la file d'événements du navigateur, après que l'événement `mousedown` initial ait été entièrement traité.

### 🤔 Analyse :
Cette correction, bien que subtile, est fondamentale pour le bon fonctionnement du composant. Elle résout une "race condition" classique en React lors de la manipulation d'événements sur le `document` et de mises à jour d'état qui modifient le DOM. L'utilisation de `setTimeout` est une solution standard et fiable pour ce type de problème, assurant que le popover s'ouvre de manière prévisible sans être immédiatement refermé.

### 💜 Prochaines étapes :
-   Le composant `DateRangePickerV2` est maintenant entièrement fonctionnel.
-   Effectuer un cycle complet de tests de non-régression avant de considérer la tâche comme terminée. 

## 28 janvier 2025

### ⌛ Correction TimePicker - Arrondi des minutes défaillant

**Problème identifié** : Le TimePicker ne corrigeait pas toujours les minutes en arrondissant au 5min près à cause de plusieurs problèmes techniques :

1. **Contrôle React défaillant** : `defaultValue` au lieu de `value` 
2. **Key dynamique problématique** : `key={minutes-${minutes}}` recréait l'input, empêchant `onBlur`
3. **Gestion d'événements incomplète** : Seul `onBlur`, pas d'`onChange`
4. **Désynchronisation** : Conflits entre saisie utilisateur et état React

**Solution implémentée** :
- État local `minuteInputValue` pour gérer la saisie en cours
- Input contrôlé avec `value` + `onChange` + `onBlur`
- Suppression de la key dynamique problématique
- Synchronisation automatique après arrondi sur blur
- Permet saisie libre ("40") avec validation différée

### 🤔 Analyse :

L'architecture respecte les principes UI/UX modernes : saisie libre sans interruption + validation intelligente au bon moment. La solution maintient la séparation des responsabilités (état vs affichage) et améliore la fiabilité du composant. Aucun impact sur les autres fonctionnalités du DateRangePicker.

### 💜 Prochaines étapes :

- Tests utilisateur pour valider l'UX améliorée
- Considérer extension du pattern aux autres inputs si applicable
- Documentation des patterns de validation différée pour réutilisation 

### ⌛ Peaufinage CSS - Style de focus du TimePicker

**Changement** : Suppression du "focus ring" bleu de l'input et application d'un style de focus unifié (`:focus-within`) sur l'ensemble du groupe d'input pour une meilleure cohérence visuelle. Suppression des règles CSS vides.

**Analyse** : Améliore l'élégance de l'interface sans nuire à l'accessibilité. Le focus reste clairement visible, mais de manière plus subtile et moderne.

**Prochaines étapes** : Aucune. 

### 🐛 Correction Bug Critique - Crash du TreeSelect lors de la recherche

**Problème identifié** : Le composant `TreeSelect` crashait instantanément si l'utilisateur saisissait un caractère spécial Regex (ex: `(`, `*`) dans le champ de recherche. La chaîne de recherche était utilisée directement pour créer une `RegExp` sans être échappée, provoquant une exception non gérée.

**Solution implémentée** : Ajout d'une fonction `escapeRegex` dans le composant `HighlightText` pour nettoyer la chaîne de recherche avant la création de la `RegExp`. Le `searchTerm` est également "trimmé" pour supprimer les espaces inutiles.

**Analyse** : Correction d'un bug critique qui nuisait gravement à la stabilité du composant. La solution est robuste et prévient toute injection de caractères invalides dans le constructeur `RegExp`. L'impact est limité au composant `TreeSelect` et améliore sa fiabilité.

**Prochaines étapes** : Aucune. 

### 🐛 Correction Bug Critique #2 - Crash du TreeSelect (Règles des Hooks)

**Problème identifié** : Le composant `TreeSelect` crashait à nouveau si la recherche ne retournait aucun résultat. L'erreur `Minified React error #300` ("Rendered more hooks than during the previous render") a été identifiée. La cause était une violation des Règles des Hooks dans `TreeNodeComponent` : un retour `null` prématuré était exécuté après certains hooks (`useMemo`) mais avant d'autres (`useCallback`), changeant ainsi le nombre de hooks appelés entre les rendus.

**Solution implémentée** : Réorganisation du code dans `TreeNodeComponent` pour que tous les appels de hooks (`useMemo`, `useCallback`) soient effectués de manière inconditionnelle au début du composant, avant toute logique de retour prématuré.

**Analyse** : Correction d'un bug critique de stabilité causé par une mauvaise compréhension des règles fondamentales de React. Le composant est maintenant robuste et ne crash plus lors des recherches sans résultats. Cela renforce l'importance de l'ordre d'appel des hooks.

**Prochaines étapes** : Aucune. 

### ✨ Ajout Fonctionnalité - Aperçu de la plage de dates au survol

**Problème identifié** : L'utilisateur ne disposait d'aucun retour visuel lors de la sélection d'une plage de dates après avoir cliqué sur la date de début. L'expérience était peu intuitive.

**Solution implémentée** :
- **État de survol** : Ajout d'un état `hoveredDate` dans le composant `DateRangePickerV2` pour mémoriser la date actuellement survolée.
- **Logique d'aperçu** : Le composant `CustomCalendar` a été modifié pour utiliser `hoveredDate` afin de dessiner une plage de prévisualisation en temps réel. La logique gère correctement les cas où la date survolée est avant ou après la date de début.
- **Gestionnaires d'événements** : Ajout de `onMouseEnter` sur les jours du calendrier et `onMouseLeave` sur le conteneur des calendriers pour activer et désactiver l'aperçu de manière fluide.

**Analyse** : Amélioration significative de l'UX du composant, le rendant plus intuitif et conforme aux standards des sélecteurs de plage de dates modernes. Le code reste propre en centralisant la logique d'état dans le composant parent.

**Prochaines étapes** : Aucune. 

### ✨ Peaufinage UI/UX - Style de plage de dates et layout

**Problème identifié** : L'interface du DateRangePicker pouvait être améliorée sur deux points : le style de la plage de dates sélectionnée n'était pas assez intuitif (deux ronds déconnectés) et la barre latérale des préréglages prenait trop de place.

**Solution implémentée** :
- **Style "Pilule"** : Refonte du CSS pour que la plage de dates forme une "pilule" continue. Une nouvelle classe `.drp-calendar-day--selected` a été créée pour gérer la couleur, tandis que `.drp-calendar-day--range-start` et `...--range-end` ne gèrent que la forme des bords (arrondi à gauche/droite). Les sélections d'un seul jour restent des cercles pleins.
- **Optimisation du Layout** : La largeur de la barre latérale des préréglages a été réduite de `220px` à `180px`, donnant plus d'espace visuel aux calendriers, qui sont l'élément d'interaction principal.

**Analyse** : Amélioration significative du design et de l'UX. Le nouveau style de plage est plus clair et esthétique. La réorganisation du layout rend l'utilisation du composant plus confortable sur des écrans de taille moyenne.

**Prochaines étapes** : Aucune. 

### ✨ Améliorations UX du TreeSelect

**Problème identifié** : Plusieurs points d'friction dans l'utilisation du TreeSelect :
1. Les éléments enfants sélectionnés étaient difficiles à localiser (parents fermés)
2. Pas de moyen rapide pour effacer toute la sélection
3. Placeholder de multisélection peu informatif ("X éléments sélectionnés")

**Solution implémentée** :

**Auto-expansion intelligente** :
- Nouvelle fonction `findParentPath()` qui remonte récursivement la hiérarchie
- `useEffect` qui auto-expand tous les parents des éléments sélectionnés à l'ouverture
- Les utilisateurs voient immédiatement leurs sélections, même profondément enfouies

**Bouton de suppression globale** :
- Croix discrète à côté de la flèche du trigger
- Apparaît uniquement quand il y a des sélections
- Fonction `clearAllSelections()` avec gestion complète des états Mendix

**Placeholder contextuel amélioré** :
- 1 élément : affiche le nom complet
- 2 éléments : "Item1, Item2"
- 3+ éléments : "Item1, Item2 +X autres"
- Plus informatif et élégant que le texte générique précédent

**Analyse** : Ces améliorations transforment significativement l'expérience utilisateur du TreeSelect. L'auto-expansion élimine la frustration de chercher ses sélections, le bouton de suppression améliore l'efficacité, et le placeholder contextuel donne une meilleure visibilité du contenu sélectionné.

**Prochaines étapes** : Aucune. 

## [29 Juillet 2025] - Suppression des badges de multi-sélection du TreeSelect

### ⌛ Changement :
Suppression de l'affichage des badges (tags) dans le `TreeSelect` lorsque plus de deux éléments sont sélectionnés. Cela évite la duplication d'informations avec le placeholder et allège visuellement le composant.

### 🤔 Analyse :
La simplification améliore l'expérience utilisateur en supprimant un visuel redondant et potentiel source de confusion. Le code est plus léger (bloc JSX supprimé) et la lisibilité de la sélection repose désormais uniquement sur le placeholder contextuel, cohérent avec le design système.

### 💜 Prochaines étapes :
- Vérifier la cohérence visuelle sur différentes largeurs d'écran.
- Mettre à jour la documentation utilisateur pour préciser le nouveau comportement.
- Envisager un test visuel automatisé pour prévenir toute régression future. 