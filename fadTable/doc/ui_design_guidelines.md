# Directives de Conception UI pour le Widget FAD Table

Ce document définit les principes de design, la palette de couleurs, et les patterns d'interaction à utiliser dans le développement du widget FAD Table.

## Principes de Design

### 1. Clarté et Lisibilité

- Priorité à la clarté des données sur les éléments esthétiques
- Utilisation d'une typographie lisible avec un contraste suffisant
- Hiérarchie visuelle claire pour distinguer les différents niveaux d'information
- Espacement cohérent pour améliorer la lecture des données tabulaires

### 2. Modularité et Réutilisabilité

- Composants conçus pour être réutilisables et indépendants
- Architecture de styles permettant des thèmes personnalisables
- Séparation claire entre la logique et la présentation

### 3. Réactivité et Adaptabilité

- Design qui s'adapte à différentes tailles d'écran
- Optimisation pour les écrans tactiles et les écrans traditionnels
- Densité d'information ajustable selon le contexte

### 4. Accessibilité

- Conformité aux normes WCAG 2.1 niveau AA
- Support des technologies d'assistance comme les lecteurs d'écran
- Utilisation de ratios de contraste adaptés
- Navigation au clavier possible

## Système de Design

### Palette de Couleurs

#### Couleurs Primaires

```css
:root {
  --primary-50: #e3f2fd;  /* Très clair */
  --primary-100: #bbdefb;
  --primary-200: #90caf9;
  --primary-300: #64b5f6;
  --primary-400: #42a5f5;
  --primary-500: #2196f3;  /* Couleur principale */
  --primary-600: #1e88e5;
  --primary-700: #1976d2;
  --primary-800: #1565c0;
  --primary-900: #0d47a1;  /* Très foncé */
}
```

#### Couleurs Sémantiques

```css
:root {
  --success: #4caf50;
  --info: #2196f3;
  --warning: #ff9800;
  --danger: #f44336;
  
  /* Variations de couleurs pour les totaux */
  --atelier-total-bg: rgba(33, 150, 243, 0.1);
  --secteur-total-bg: rgba(33, 150, 243, 0.2);
  --global-total-bg: rgba(33, 150, 243, 0.3);
}
```

#### Couleurs Neutres

```css
:root {
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #eeeeee;
  --neutral-300: #e0e0e0;
  --neutral-400: #bdbdbd;
  --neutral-500: #9e9e9e;
  --neutral-600: #757575;
  --neutral-700: #616161;
  --neutral-800: #424242;
  --neutral-900: #212121;
}
```

### Typographie

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-md: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-loose: 1.8;
}
```

### Espacement

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.5rem;   /* 24px */
  --space-6: 2rem;     /* 32px */
  --space-7: 2.5rem;   /* 40px */
  --space-8: 3rem;     /* 48px */
}
```

### Ombres

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
```

## Composants et Patterns d'Interaction

### Tableau (Table)

- En-têtes de colonnes en gras avec un fond légèrement plus foncé
- Alternance subtile des couleurs de fond pour les lignes
- Hover sur les lignes avec changement de couleur de fond
- Colonnes numériques alignées à droite, texte à gauche
- Totaux mis en évidence avec un style particulier

### Expansion/Réduction

- Icônes explicites (chevron) pour indiquer la possibilité d'expansion
- Animation fluide lors de l'expansion/réduction
- Indication visuelle de la hiérarchie par indentation ou couleur
- Design cohérent entre état expansé et réduit

### États et Feedback

#### États des composants
- Normal: état par défaut
- Hover: léger changement visuel au survol
- Active: indication claire de l'élément actif/sélectionné
- Disabled: visiblement désactivé avec opacité réduite

#### Feedback utilisateur
- Animation subtile lors des interactions (clic, expansion)
- Transitions fluides entre les états (300-500ms)
- Feedback visuel immédiat pour toute action utilisateur

## Exemples de Styles Spécifiques

### Style de Tableau avec Alternance de Couleurs

```css
.fad-table tr:nth-child(even) {
  background-color: var(--neutral-50);
}

.fad-table tr:hover {
  background-color: var(--primary-50);
}

.fad-table th {
  background-color: var(--neutral-100);
  font-weight: var(--font-weight-bold);
}

.fad-table td, .fad-table th {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--neutral-200);
}

.fad-table td.numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Styles pour les totaux */
.fad-table tr.total-atelier {
  background-color: var(--atelier-total-bg);
  font-weight: var(--font-weight-medium);
}

.fad-table tr.total-secteur {
  background-color: var(--secteur-total-bg);
  font-weight: var(--font-weight-bold);
}

.fad-table tr.total-global {
  background-color: var(--global-total-bg);
  font-weight: var(--font-weight-bold);
}
```

## Recommandations d'Implémentation

1. **Utilisation de Mantine**: Tirer parti des composants Mantine existants tout en les personnalisant selon ces directives.

2. **Variables CSS**: Implémenter ces tokens de design comme variables CSS pour faciliter la personnalisation et la cohérence.

3. **Composants React**: Créer des composants modulaires qui acceptent des props de style pour une personnalisation locale.

4. **Thèmes**: Prévoir un système de thèmes clair/sombre basé sur ces variables.

5. **Tests d'Accessibilité**: Vérifier régulièrement le contraste des couleurs et la navigabilité clavier.

6. **Documentation des Composants**: Documenter chaque composant avec ses variants et propriétés personnalisables. 