# CompareData Widget

Widget de comparaison des données de consommation énergétique pour Mendix.

## 🚀 Fonctionnalités

### Mode Double IPE
- **Toggle moderne** : Basculement entre deux IPE avec interface Radix UI
- **Chargement parallèle** : Les deux IPE sont chargés simultanément pour un basculement instantané
- **Design responsive** : Interface adaptée à tous les écrans
- **Accessibilité** : Support complet des lecteurs d'écran et navigation clavier

### Interface utilisateur
- **Design moderne** : Utilisation de Radix UI pour un rendu professionnel
- **Animations fluides** : Transitions CSS optimisées
- **Couleur signature** : Violet (#be49ec) pour les éléments actifs
- **Responsive design** : Adaptation automatique sur mobile et tablette

## 🛠️ Technologies

- **React 18** avec TypeScript
- **Radix UI** pour les composants d'interface
- **Lucide React** pour les icônes
- **ECharts** pour les graphiques
- **CSS natif** pour les styles personnalisés

## 📦 Installation

```bash
npm install
```

## 🔧 Développement

```bash
# Mode développement
npm run dev

# Compilation
npm run build

# Linting
npm run lint
npm run lint:fix
```

## 🎨 Styles

Le widget utilise un système de styles CSS natif avec :
- Variables CSS pour la cohérence des couleurs
- Breakpoints responsive standardisés
- Animations et transitions optimisées
- Support complet de l'accessibilité

### Couleurs principales
- **Primaire** : #18213e
- **Électricité** : #38a13c  
- **Gaz** : #f9be01
- **Eau** : #3293f3
- **Air** : #66d8e6
- **Accent** : #be49ec (toggle actif)

## 📋 Configuration

### Propriétés principales
- `viewMode` : "energetic" | "ipe"
- `ipeMode` : "single" | "double"
- `ipe1Name` / `ipe2Name` : Noms des IPE
- `energyType` : Type d'énergie à afficher

### Sources de données
- `selectedMachines` / `selectedMachines2` : Machines sélectionnées
- `dsMesures` / `dsMesures2` : Données de mesures
- `dsProduction_Consommation` / `dsProduction_Consommation2` : Données de production

## 🏗️ Architecture

Le widget suit une architecture FSM (Finite State Machine) avec :

### États
- `single_ipe` : Mode IPE simple
- `double_ipe_1` : Mode double avec IPE 1 actif  
- `double_ipe_2` : Mode double avec IPE 2 actif

### Transitions
- Basculement automatique selon la configuration
- Toggle utilisateur entre IPE 1 et IPE 2
- Gestion d'erreur avec fallback gracieux

## 📊 Export

- **Formats supportés** : Excel (.xlsx), CSV
- **Données exportées** : Basées sur l'IPE actif
- **Nommage automatique** : Inclusion du nom de l'IPE dans le fichier

## 🔍 Tests

Le widget inclut :
- Validation TypeScript stricte
- Linting ESLint avec règles personnalisées
- Tests de compilation automatisés
- Validation d'accessibilité

## 📝 Changelog

Voir le fichier `avancement.md` pour l'historique détaillé des modifications.

## 📄 Licence

Apache-2.0 © Mendix Technology BV 2024

## Features
[feature highlights]

## Usage
[step by step instructions]

## Demo project
[link to sandbox]

## Issues, suggestions and feature requests
[link to GitHub issues]

## Development and contribution

1. Install NPM package dependencies by using: `npm install`. If you use NPM v7.x.x, which can be checked by executing `npm -v`, execute: `npm install --legacy-peer-deps`.
1. Run `npm start` to watch for code changes. On every change:
    - the widget will be bundled;
    - the bundle will be included in a `dist` folder in the root directory of the project;
    - the bundle will be included in the `deployment` and `widgets` folder of the Mendix test project.

[specify contribution]
