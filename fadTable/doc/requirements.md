# Spécifications Fonctionnelles - Widget Tableau de Bord Énergétique Mendix

## 1. Objectif

Développer un widget Mendix "pluggable" personnalisé pour visualiser les données de consommation énergétique. Le widget présentera ces données sous forme de tableau, organisant les chiffres de consommation par `Secteur`, `Atelier` et `Machine` (Compteur), avec une ventilation mensuelle, dans le but de faciliter la refacturation des consommations aux clients locataires.

## 2. Modèle de Données & Structure

*   **Hiérarchie Principale :** L'application utilise une hiérarchie potentielle à trois niveaux : `Secteur` > `Atelier` > `Machine`.
*   **Point de Mesure :** La consommation énergétique est relevée au niveau de l'entité `Machine`.
*   **Liaison Hiérarchique :**
    *   Chaque `Machine` peut être associée à un `Atelier` et/ou un `Secteur`.
    *   Une `Machine` peut être directement liée à un `Secteur` (sans `Atelier` intermédiaire).
    *   Une `Machine` peut n'être associée à aucun `Atelier` ni `Secteur`.
*   **Stockage des Données de Consommation :**
    *   Les données de consommation mensuelle sont agrégées (via un Scheduled Event appelant une API) et stockées dans l'entité persistante `ConsommationMensuelleMachine`.
    *   Cette entité contient au minimum :
        *   `Machine` (String) : Identifiant de la machine (correspondant à `Machine.Identifiant`).
        *   `Mois` (Integer) : Le mois (1-12).
        *   `Annee` (Integer) : L'année.
        *   `ValeurConsommation` (Decimal) : La consommation totale pour ce mois.

## 3. Fonctionnalités & Affichage du Widget

*   **Format :** Le widget affichera les données dans un tableau (grille).
*   **Ergonomie :** L'interface doit être claire, intuitive et permettre une lecture facile des données pour la facturation.
*   **Lignes :**
    *   Les lignes représenteront les `Machines`.
    *   Les `Machines` seront regroupées visuellement ou structurellement sous leur `Atelier` respectif (si applicable).
    *   Les `Ateliers` seront regroupés sous leur `Secteur` respectif (si applicable).
    *   Une section distincte pourrait être nécessaire pour les `Machines` sans `Atelier` et/ou `Secteur`.
*   **Colonnes :**
    *   Les colonnes représenteront les mois de l'année (Janvier, Février, ..., Décembre).
    *   Une colonne additionnelle pourrait afficher le nom/identifiant de la `Machine`.
    *   Des colonnes pourraient afficher le nom de l'`Atelier` et du `Secteur` pour chaque `Machine` ou via le regroupement.
    *   Une colonne "Total Annuel" par machine pourrait être utile.
*   **Cellules :** Chaque cellule à l'intersection d'une ligne `Machine` et d'une colonne Mois affichera la valeur de consommation correspondante.
*   **Agrégation (Optionnel) :** Des lignes de totaux pourraient être ajoutées pour :
    *   Total mensuel par `Atelier`.
    *   Total mensuel par `Secteur`.
    *   Total annuel par `Atelier`.
    *   Total annuel par `Secteur`.
    *   Total général mensuel et annuel.
*   **Période & Comparaison :**
    *   Le widget doit afficher les données pour une année spécifique.
    *   **Clarification Requise :** Comment l'année est-elle sélectionnée ? (Année en cours par défaut ? Sélectionneur d'année dans le widget ou la page Mendix ?)
    *   **Optionnel :** Possibilité d'afficher les données de l'année précédente (N-1) à des fins de comparaison. Comment cette comparaison serait-elle visualisée (colonnes côte à côte, indicateurs de variation, etc.)?
*   **Gestion des Données Manquantes :**
    *   Si une `Machine` n'a pas de relevé pour un mois donné, la cellule correspondante devra clairement indiquer l'absence de donnée (ex: "N/A", "-", 0 si approprié).

*   **Fonctionnalités d'interactivité :**
    *   **Exportation :** Bouton(s) permettant d'exporter la vue actuelle du tableau (potentiellement filtrée/triée) aux formats PDF et Excel.
    *   **Filtrage :** Mécanisme permettant de filtrer les données affichées, au minimum par `Secteur` et `Atelier`. Une recherche textuelle sur le nom de la `Machine` serait également utile.
    *   **Tri :** Possibilité de trier le tableau en cliquant sur les en-têtes de colonnes (Nom Machine, Total Annuel, potentiellement les mois).

## 4. Configuration Mendix (XML)

*   **Source de Données Principale (`dsGridData`) :** La configuration XML du widget doit définir une propriété pour recevoir la liste **d'objets Non-Persistants (`FadTableRowData_NPE`)** préparés par un Microflow/Nanoflow (`DS_GetFadTableData`).
*   **Microflow Source (`DS_GetFadTableData`) :** Ce microflow sera responsable de :
    1.  Prendre l'année sélectionnée en paramètre.
    2.  Récupérer les `Machines` pertinentes.
    3.  Pour chaque `Machine`, récupérer les enregistrements `ConsommationMensuelleMachine` correspondants pour l'année N (et N-1 si besoin).
    4.  Créer et retourner une liste d'objets `FadTableRowData_NPE`, en pivotant les données mensuelles dans les attributs `JanValue`, `FebValue`, etc., et en ajoutant `MachineName`, `AtelierName`, `SecteurName` depuis l'entité `Machine`.
*   **Propriétés de Configuration :**
    *   Propriété `dsGridData` (type `datasource`, isList=true) pour recevoir la liste de `FadTableRowData_NPE`.
    *   Propriétés `attribute` (`attrMachineName`, `attrAtelierName`, ..., `attrDecValue`, `attrTotalYearValue`, etc.) pointant vers les attributs de `FadTableRowData_NPE`.
    *   Propriété(s) potentielle(s) pour passer l'année sélectionnée au microflow source `DS_GetFadTableData` (si non géré par le contexte de la page).
    *   Options d'affichage (ex: afficher/masquer les totaux, activer/désactiver la comparaison N-1).
    *   Options pour activer/désactiver l'exportation, le filtrage, le tri.

## 5. Cas d'Usage Spécifiques

*   **Machine Standard :** `Secteur` -> `Atelier` -> `Machine`. Affichage groupé normal.
*   **Machine sans Atelier :** `Secteur` -> `Machine`. La machine est affichée directement sous le `Secteur`, sans niveau `Atelier`.
*   **Machine Orpheline :** `Machine` (sans `Secteur` ni `Atelier`). Ces machines doivent être listées dans une section distincte ou au niveau racine.
*   **Absence de Données Mensuelles :** Gestion claire dans l'affichage pour les mois sans consommation enregistrée.

## 6. Technologies Front-end (Suggestion si applicable)

*   Si le widget est développé en React :
    *   **UI:** Utilisation de `Mantine` pour les composants de base (Tableau, etc.).
    *   **Mise en page :** `React-Grid-Layout` ou `Resizable-Panels` pourraient être envisagés si une disposition modulaire complexe est nécessaire (bien que pour un tableau simple, `Mantine Table` suffise).
    *   **Interactions :** `Framer Motion`, `dnd-kit` (si des fonctionnalités de glisser-déposer sont envisagées ultérieurement).

## 7. Performance

*   **Gestion des Volumes de Données :** Le widget doit rester performant même avec un grand nombre de `Secteurs`, `Ateliers`, et `Machines`. Des tests de charge devront être envisagés.
    *   **Clarification Requise :** Quel est l'ordre de grandeur attendu du nombre de machines (dizaines, centaines, milliers) ?
*   **Stratégie de Chargement des Données :**
    *   Si le volume de données est potentiellement élevé, une stratégie de chargement doit être définie :
        *   **Pagination :** Afficher les données par pages (ex: 50 machines par page).
        *   **Chargement Différé (Lazy Loading) / Défilement Infini :** Charger plus de données lorsque l'utilisateur fait défiler le tableau vers le bas.
    *   Le microflow `DS_GetFadTableData` devra être optimisé (utilisation d'index, récupération efficace) mais l'essentiel de la charge (appel API) est géré par le Scheduled Event.

## 8. Expérience Utilisateur (UX)

*   **Responsive Design :** Le tableau doit s'adapter correctement aux différentes tailles d'écran (desktop, tablette, potentiellement mobile), éventuellement en masquant certaines colonnes ou en modifiant la disposition sur les petits écrans.
*   **Personnalisation Visuelle (Optionnel) :** Possibilité de configurer certains aspects visuels (ex: couleurs primaires, thème clair/sombre) via les propriétés du widget ou le thème Mendix global.
*   **Gestion des Erreurs :** Affichage de messages clairs et informatifs à l'utilisateur en cas de problème (ex: erreur de chargement des données, échec de l'exportation).

---

Ce document servira de référence pour le développement. Veuillez vérifier s'il correspond bien à vos attentes et si des clarifications sont nécessaires, notamment sur la sélection de l'année. 