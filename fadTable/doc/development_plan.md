# Plan de Développement - Widget FAD Table

## Vue d'ensemble du projet

Le widget FAD Table est un composant Mendix permettant de visualiser les données de consommation énergétique sous forme de tableau, organisées par Secteur, Atelier et Machine avec une ventilation mensuelle. Il servira à faciliter la refacturation des consommations aux clients locataires.

## Architecture du widget

### Structure des composants
```
src/
├── FadTable.tsx             # Point d'entrée principal du widget
├── components/
│   ├── DataTable/           # Composant principal de tableau
│   │   ├── index.tsx        # Export principal
│   │   ├── DataTable.tsx    # Implémentation du tableau
│   │   ├── TableHeader.tsx  # En-tête du tableau
│   │   ├── TableBody.tsx    # Corps du tableau
│   │   ├── TableFooter.tsx  # Pied du tableau (totaux)
│   │   └── types.ts         # Types spécifiques au tableau
│   ├── Filters/             # Composants de filtrage
│   │   ├── index.tsx        # Export principal
│   │   ├── SearchField.tsx  # Champ de recherche
│   │   └── FilterControls.tsx # Contrôles de filtrage
│   ├── Export/              # Fonctionnalités d'exportation
│   │   ├── index.tsx        # Export principal
│   │   ├── ExportToExcel.tsx # Exportation vers Excel
│   │   └── ExportToPDF.tsx  # Exportation vers PDF
│   └── Pagination/          # Composants de pagination
│       ├── index.tsx        # Export principal
│       └── Pagination.tsx   # Contrôles de pagination
├── utils/                  # Utilitaires
│   ├── dataFormatters.ts   # Formatage des données
│   ├── calculations.ts     # Calculs (totaux, variations)
│   ├── sorting.ts          # Fonctions de tri
│   └── filtering.ts        # Fonctions de filtrage
└── hooks/                  # Hooks personnalisés
    ├── useTableData.ts     # Gestion des données du tableau
    ├── usePagination.ts    # Logique de pagination
    ├── useSorting.ts       # Logique de tri
    └── useFiltering.ts     # Logique de filtrage
```

### Flux de données
1. Les données sont fournies au widget via la propriété `dsGridData`
2. Le widget traite ces données dans le hook `useTableData`
3. Les hooks `useSorting` et `useFiltering` appliquent le tri et les filtres
4. Le hook `usePagination` gère la pagination si nécessaire
5. Les données traitées sont passées aux composants d'affichage

## Plan de développement par phases

### Phase 1: Structure de base et affichage des données
- [x] Configuration initiale du projet (déjà en place)
- [ ] Création de la structure des dossiers
- [ ] Implémentation du composant DataTable basique
- [ ] Traitement et affichage des données de base
- [ ] Mise en place du formatage des nombres

### Phase 2: Fonctionnalités de groupement et totaux
- [ ] Implémentation du regroupement par Secteur/Atelier
- [ ] Calcul des totaux par Secteur/Atelier
- [ ] Calcul des totaux par mois
- [ ] Affichage des totaux dans le pied de tableau

### Phase 3: Tri et filtrage
- [ ] Implémentation du tri sur les colonnes
- [ ] Création du champ de recherche
- [ ] Développement des contrôles de filtrage
- [ ] Intégration de la logique de filtrage multiple

### Phase 4: Pagination et gestion de grandes quantités de données
- [ ] Implémentation de la pagination
- [ ] Support du chargement différé (lazy loading)
- [ ] Optimisation des performances pour les grands volumes

### Phase 5: Exportation et fonctionnalités avancées
- [ ] Exportation vers Excel
- [ ] Exportation vers PDF
- [ ] Comparaison des données N-1
- [ ] Visualisation des écarts (pourcentages, tendances)

### Phase 6: Peaufinage et optimisation
- [ ] Amélioration de l'interface utilisateur
- [ ] Tests de performance
- [ ] Corrections de bugs
- [ ] Documentation utilisateur

## Technologies et bibliothèques

- **UI Components**: @mantine/core, @mantine/hooks
- **Export**: jspdf, xlsx
- **Data Handling**: React hooks personnalisés
- **Styling**: CSS modulaire avec Mantine, thèmes personnalisables

## Priorités de développement

1. Affichage correct des données et calcul des totaux
2. Tri et filtrage pour faciliter la navigation
3. Exportation pour les besoins de facturation
4. Fonctionnalités de comparaison N-1
5. Optimisations de performance

## Gestion des dépendances

Nous utiliserons les dépendances suivantes:

```json
{
  "dependencies": {
    "@mantine/core": "^7.17.3",
    "@mantine/hooks": "^7.17.3",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.1",
    "xlsx": "^0.18.5",
    "classnames": "^2.2.6"
  }
}
``` 