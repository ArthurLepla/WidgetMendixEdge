# Journal de Développement - Widget FAD Table

## 04/04/2024 - Corrections de typage et préparation de la Phase 3

- Résolution de toutes les erreurs TypeScript empêchant la compilation du projet
- Unification des interfaces de types entre les différents composants
- Alignement des types `DataRow` et `FadTableRow` pour éviter les conflits
- Correction des problèmes d'indexation dans les objets FadTableRow
- Ajout d'un mapping explicite entre les ID de colonnes et les propriétés FadTableRow
- Gestion correcte des enumérations TotalType pour assurer la cohérence
- Ajout des assertions de type nécessaires dans les fonctions de rendu
- Établissement des directives UI pour la Phase 3
- Création de la documentation pour les styles et l'expérience utilisateur
- Le projet compile maintenant sans erreurs (`npm run build` fonctionne correctement)

## 03/04/2024 - Normalisation des fins de ligne et configuration du linter

- Ajout du script `fix-line-endings.js` pour normaliser les fins de ligne
- Configuration de Prettier via `.prettierrc`
- Mise à jour d'ESLint pour une meilleure cohérence de code
- Ajout de commandes npm pour faciliter la maintenance du code
- Résolution des conflits entre les fichiers de définition de types

## 02/04/2024 - Mise en place des structures de données et groupement

- Implémentation des types et interfaces pour les données du tableau
- Développement des fonctions de calcul de totaux par secteur et atelier
- Mise en place du regroupement hiérarchique des données
- Création du composant DataTable avec ses sous-composants (Header, Body, Footer)
- Affichage et mise en forme des totaux dans le tableau
- Implémentation du hook useTableData pour gérer les données du widget

## 01/04/2024 - Initialisation du projet

- Création de la structure initiale du projet
- Mise en place de la structure du widget Mendix
- Configuration de l'environnement de développement
- Définition des interfaces de base
- Établissement du plan de développement en quatre phases

## 2023-04-04: Implémentation des types TypeScript corrects

### Problèmes identifiés
- Erreurs de build liées à des types incompatibles entre `FadTableRow` et d'autres interfaces
- Utilisation de `any` pour contourner les problèmes de typage
- Propriétés indexées incorrectement typées

### Solutions implémentées
- Alignement des interfaces entre les composants
- Utilisation de génériques et assertions de type appropriées
- Correction des imports et exports des types
- Suppression des types redondants

### Amélioration de l'architecture
- Nettoyage du code et suppression des parties inutilisées
- Meilleure organisation des types entre les fichiers
- Documentation des interfaces et types avec JSDoc

## 2023-04-05: Implémentation de la Phase 3 - Styles et Interactivité

### Système de design modulaire
- Création d'un système de variables CSS pour la cohérence visuelle
- Définition des couleurs, typographies, espacements et autres propriétés de design
- Mise en place d'un fichier CSS principal pour les styles spécifiques aux composants
- Intégration d'un thème Mantine personnalisé aligné avec nos variables CSS

### Utilitaires de style
- Création d'un module `styleUtils.ts` pour la génération dynamique de classes CSS
- Fonctions `getRowClassName()`, `getCellClassName()` et `getIndentClass()` pour une gestion cohérente des styles
- Séparation des préoccupations entre logique métier et présentation visuelle

### Fonctionnalité d'expansion/réduction
- Ajout de l'état d'expansion dans le composant `DataTable`
- Mise en place du filtre des lignes visibles en fonction de l'état d'expansion
- Création d'un composant `ChevronIcon` pour indiquer l'état d'expansion
- Implémentation de la gestion des clics pour basculer l'expansion/réduction

### Améliorations visuelles
- Alternance des couleurs de lignes pour améliorer la lisibilité
- Mise en évidence distincte des lignes de totaux par type (atelier, secteur, global)
- Indentation hiérarchique des lignes en fonction de leur niveau
- Optimisation de la présentation des données numériques

### Refactoring des composants
- Passage des styles inline vers des classes CSS pour une meilleure maintenabilité
- Utilisation des hooks React pour gérer l'état d'expansion des lignes
- Amélioration de la structure du tableau pour respecter les bonnes pratiques d'accessibilité

### Prochaines étapes
- Ajouter des animations pour l'expansion/réduction des lignes
- Implémenter le tri interactif des colonnes
- Préparer l'affichage des comparaisons année N vs N-1

Ce document suit les problèmes rencontrés et les solutions appliquées lors du développement du widget FAD Table.

## Problèmes Rencontrés et Solutions

1.  **Erreur de Compilation TypeScript (Preview) : `TS2339: Property 'sampleText' does not exist on type 'FadTablePreviewProps'.`**
    *   **Cause :** Le fichier `src/FadTable.editorPreview.tsx` utilisait une propriété (`sampleText`) issue du template de base, qui a été supprimée du fichier XML (`src/FadTable.xml`).
    *   **Solution :** Modification de `src/FadTable.editorPreview.tsx` pour ne plus utiliser `sampleText` et afficher un placeholder.

2.  **Erreur de Compilation TypeScript (Preview) : `TS6133: 'props' is declared but its value is never read.`**
    *   **Cause :** Après la correction précédente, le paramètre `props` de la fonction `preview` dans `src/FadTable.editorPreview.tsx` n'était plus utilisé.
    *   **Solution :** Renommage du paramètre en `_props` pour indiquer à TypeScript qu'il est volontairement inutilisé.

3.  **Erreur de Compilation TypeScript (Composant Principal) : `TS2339: Property 'sampleText' does not exist on type 'FadTableContainerProps'.`**
    *   **Cause :** Le fichier principal `src/FadTable.tsx` utilisait également la propriété `sampleText` du template.
    *   **Solution :** Modification de `src/FadTable.tsx` pour accepter toutes les props (`props: FadTableContainerProps`) et afficher un placeholder temporaire.

4.  **Erreur de Conformité XML Mendix : `The 'key' attribute is invalid - The value 'Style' is invalid...`**
    *   **Cause :** Ajout incorrect de `<systemProperty key="Style"/>` dans `src/FadTable.xml`. La propriété de style Mendix n'est pas une `systemProperty` à déclarer.
    *   **Solution :** Suppression de la ligne `<systemProperty key="Style"/>` du fichier XML.

5.  **Erreur de Conformité XML Mendix : `Error in property 'pageSize': Property must be required.`**
    *   **Cause :** La propriété `pageSize` (type `integer`) n'était pas marquée comme `required="true"`. Le schéma Mendix l'exige pour ce type de propriété, même si elle n'est logiquement nécessaire que conditionnellement.
    *   **Solution :** Modification de `src/FadTable.xml` pour définir `required="true"` sur la propriété `pageSize`. La valeur par défaut sera utilisée si la pagination n'est pas sélectionnée.

6.  **Erreur de Compilation (Build) : `RollupError: "__spreadArray" is not exported by "node_modules/tslib/tslib.es6.js"`**
    *   **Cause :** Problème de dépendance ou de configuration lié à `tslib` et aux helpers TypeScript utilisés par Rollup (le bundler), potentiellement introduit après l'installation de `@mantine/core`.
    *   **Solution :** Installation explicite de `tslib` comme dépendance de développement (`npm install tslib --save-dev`).

7.  **Erreur Runtime (Client) : `@mantine/core: MantineProvider was not found in component tree`**
    *   **Cause :** Les composants Mantine (`LoadingOverlay`, `Table`, `Alert`) ont besoin d'être enveloppés par le composant `<MantineProvider>` pour accéder au thème et aux configurations globales de Mantine.
    *   **Solution :** Import de `MantineProvider` depuis `@mantine/core` dans `src/FadTable.tsx` et enveloppement du contenu retourné par le composant `FadTable` avec `<MantineProvider>`.

8.  **Erreur de Type TypeScript (Compilation) : `Property 'overlayBlur' / 'withGlobalStyles' / 'withNormalizeCSS' does not exist on type ...`**
    *   **Cause :** Utilisation de propriétés (`overlayBlur`, `withGlobalStyles`, `withNormalizeCSS`) sur les composants Mantine (`LoadingOverlay`, `MantineProvider`) qui ne sont pas reconnues par le vérificateur de type ou qui ont changé dans la version utilisée.
    *   **Solution :** Suppression de ces propriétés pour simplifier et résoudre l'erreur de type.

9.  **Erreur ESLint (Parsing Config) : `Parsing error: ESLint was configured to run on ... .eslintrc.js / prettier.config.js ... However, that TSConfig does not include this file.`**
    *   **Cause :** ESLint tentait d'analyser ses propres fichiers de configuration (`.eslintrc.js`, `prettier.config.js`) en utilisant les règles TypeScript définies dans `tsconfig.json`, mais ces fichiers de configuration ne font pas partie du projet TypeScript.
    *   **Solution :** Ajout de `.eslintrc.js` et `prettier.config.js` au fichier `.eslintignore` pour qu'ESLint les ignore.

10. **Erreurs ESLint/Prettier (Formatting) : `Delete ·`, `Insert {" "}` etc.**
    *   **Cause :** Conflits mineurs de formatage ou incohérences entre les règles d'ESLint et de Prettier.
    *   **Solution :** Exécution de `npx prettier --write` sur les fichiers concernés pour appliquer automatiquement le formatage correct selon les règles de Prettier.

## Progression du Développement

### Phase 1: Structure de base et affichage des données - COMPLÉTÉE

1. **Création de la structure des fichiers**
   * Structure de dossiers mise en place avec components/, utils/, hooks/
   * Fichiers de types de base créés
   * Composants modulaires pour le tableau implémentés

2. **Implémentation des utilitaires de formatage**
   * Fonction formatNumber pour le formatage des valeurs numériques
   * Fonction getAttributeValue pour récupérer de manière sécurisée les données Mendix
   * Fonction mapMendixItemToFadRow pour convertir les données Mendix en FadTableRow

3. **Implémentation du hook principal**
   * Hook useTableData créé pour gérer le traitement des données
   * Gestion des erreurs et états de chargement

4. **Composants de tableau**
   * Composant DataTable principal pour l'affichage du tableau
   * Sous-composants TableHeader et TableBody pour une architecture modulaire
   * Gestion des états vides et des erreurs

5. **Intégration dans le composant principal**
   * FadTable.tsx mis à jour pour utiliser la nouvelle architecture
   * Définition des colonnes avec useMemo pour l'optimisation
   * Intégration de MantineProvider pour la gestion du thème

### Problèmes à résoudre pour la Phase 2:

1. **Erreurs de linter**
   * Nombreuses erreurs de linter liées aux fins de ligne CRLF vs LF (Windows vs Unix)
   * Quelques problèmes d'indentation à corriger

2. **Comportement des dossiers sous Windows**
   * Problèmes lors de la création de dossiers avec les commandes mkdir 

## Phase 2 - Implémentation des regroupements et des totaux

### Objectifs
- Implémenter la fonctionnalité de regroupement des données par Secteur et Atelier
- Ajouter le calcul des totaux par groupe et le total global
- Créer un composant pour afficher les totaux dans le pied du tableau

### Implémentation

1. **Mise à jour des types**
   - Ajout de l'énumération `TotalType` pour distinguer les différents types de totaux (ATELIER, SECTEUR, GLOBAL)
   - Création des interfaces `ColumnDef` et `DataRow` avec la prise en compte des propriétés liées aux totaux
   - Mise à jour des interfaces `TableHeaderProps`, `TableBodyProps` et création de `TableFooterProps`

2. **Adaptation des composants existants**
   - Amélioration du composant `TableBody` pour afficher différemment les lignes de totaux
   - Création du composant `TableFooter` pour afficher les totaux dans le pied du tableau
   - Mise à jour du composant `DataTable` pour inclure le pied de tableau

3. **Gestion des données**
   - Refactorisation du hook `useTableData` pour calculer les différents totaux
   - Ajout de fonctions utilitaires `groupBy` et `calculateTotals` pour faciliter le traitement des données
   - Intégration des options de configuration pour activer/désactiver les différents regroupements

4. **Mise à jour des propriétés du widget**
   - Ajout des propriétés de configuration pour le regroupement par atelier (`groupByWorkshop`, `workshopAttribute`)
   - Ajout des propriétés de configuration pour le regroupement par secteur (`groupBySector`, `sectorAttribute`)
   - Ajout d'une option pour afficher ou non le total global (`showGlobalTotal`)

### Problèmes rencontrés et solutions

1. **Gestion des différents types de totaux**
   - Problème : Comment distinguer visuellement les différents types de totaux
   - Solution : Utilisation d'une énumération `TotalType` et application de styles spécifiques dans le composant `TableBody`

2. **Calcul des totaux pour les colonnes non numériques**
   - Problème : Comment gérer les colonnes qui ne doivent pas être totalisées
   - Solution : Vérification du type de colonne (`isNumeric`) et application du calcul uniquement pour les colonnes numériques

3. **Problèmes de ligne CRLF vs LF**
   - Problème : Erreurs linter concernant les sauts de ligne
   - Solution : Ces erreurs sont liées à la configuration du système et n'affectent pas le fonctionnement du widget 