# Phase 3: Visualisation et Expérience Utilisateur - Plan d'implémentation

Ce document détaille les étapes spécifiques pour implémenter la Phase 3 du widget FAD Table, axée sur l'amélioration visuelle et l'interactivité.

## Objectifs de la Phase 3

1. Moderniser l'interface utilisateur avec un design contemporain et cohérent
2. Ajouter des fonctionnalités interactives pour améliorer l'expérience utilisateur
3. Optimiser la lisibilité des données et la hiérarchie visuelle
4. Implémenter des animations fluides pour les transitions et interactions

## État d'avancement

### ✅ Fonctionnalités implémentées

#### Système de design modulaire
- ✅ Système de variables CSS créé dans `src/styles/variables.css`
- ✅ Définition des tokens de design (couleurs, typographies, espacements)
- ✅ Feuille de style principale dans `src/styles/fadTable.css`
- ✅ Intégration avec Mantine via un thème personnalisé

#### Utilitaires de style
- ✅ Module `src/utils/styleUtils.ts` pour la génération de classes CSS
- ✅ Fonction `getRowClassName()` pour les styles de ligne (alternance, totaux)
- ✅ Fonction `getCellClassName()` pour les styles de cellule
- ✅ Fonction `getIndentClass()` pour l'indentation hiérarchique

#### Expansion/réduction des groupes
- ✅ État d'expansion dans `DataTable` avec `expandedRowsMap`
- ✅ Filtrage des lignes visibles selon l'état d'expansion
- ✅ Composant `ChevronIcon` pour l'indicateur d'expansion
- ✅ Gestion des événements de clic pour l'expansion/réduction

#### Améliorations visuelles
- ✅ Alternance des couleurs de lignes
- ✅ Styles distincts pour les totaux (atelier, secteur, global)
- ✅ Indentation hiérarchique des lignes
- ✅ Optimisation de la présentation des données numériques

### 🔲 Fonctionnalités à implémenter

#### Animations et transitions
- 🔲 Animations pour l'expansion/réduction des groupes
- 🔲 Transitions lors des changements d'état
- 🔲 Feedback visuel pour les interactions

#### Interactivité avancée
- 🔲 Tri interactif des colonnes
- 🔲 Filtrage des données
- 🔲 Tooltips pour les informations détaillées

#### Optimisations
- 🔲 Modes d'affichage (compact/standard/spacieux)
- 🔲 Gestion des grands volumes de données
- 🔲 Améliorations d'accessibilité

## Plan d'implémentation pour les fonctionnalités restantes

### Étape 1: Amélioration des animations

1. **Animer l'expansion/réduction des groupes**
   ```typescript
   // Exemple d'animation avec Framer Motion pour l'expansion
   function AnimatedRows({ children, isExpanded }) {
       return (
           <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ 
                   height: isExpanded ? "auto" : 0,
                   opacity: isExpanded ? 1 : 0
               }}
               transition={{ duration: 0.3 }}
           >
               {children}
           </motion.div>
       );
   }
   ```

2. **Améliorer les transitions CSS**
   ```css
   .fad-table tbody tr {
       transition: background-color 0.3s ease, opacity 0.3s ease, height 0.3s ease;
   }
   
   .fad-table .expandable-row {
       cursor: pointer;
       transition: background-color 0.2s ease;
   }
   
   .fad-table .expandable-row:hover {
       background-color: var(--row-hover-bg);
   }
   ```

### Étape 2: Tri interactif des colonnes

1. **Ajouter l'état de tri dans le composant DataTable**
   ```typescript
   // État pour le tri
   const [sortConfig, setSortConfig] = useState<{
       column: string | null;
       direction: 'asc' | 'desc' | null;
   }>({ column: null, direction: null });
   
   // Fonction pour gérer le tri
   const handleSort = (columnId: string) => {
       // Logique pour changer l'état de tri et réorganiser les données
   };
   ```

2. **Mettre à jour le composant TableHeader**
   ```typescript
   // Ajouter des indicateurs de tri dans l'en-tête
   <TableHeader 
       columns={columns} 
       sortConfig={sortConfig} 
       onSort={handleSort} 
   />
   ```

### Étape 3: Préparation pour la Phase 4 (Comparaison N vs N-1)

1. **Mise à jour des styles pour accommoder les colonnes de comparaison**
   ```css
   /* Styles pour les colonnes de variation */
   .fad-table .variation-cell {
       position: relative;
   }
   
   .fad-table .variation-positive {
       color: var(--success);
   }
   
   .fad-table .variation-negative {
       color: var(--danger);
   }
   
   /* Indicateurs visuels */
   .fad-table .variation-indicator {
       display: inline-block;
       margin-left: 4px;
       width: 0;
       height: 0;
   }
   
   .fad-table .variation-indicator.up {
       border-left: 4px solid transparent;
       border-right: 4px solid transparent;
       border-bottom: 6px solid var(--success);
   }
   
   .fad-table .variation-indicator.down {
       border-left: 4px solid transparent;
       border-right: 4px solid transparent;
       border-top: 6px solid var(--danger);
   }
   ```

2. **Fonctions utilitaires pour les calculs de variation**
   ```typescript
   /**
    * Calcule le pourcentage de variation entre deux valeurs
    */
   export function calculateVariation(current: number, previous: number): number {
       if (!previous) return 0;
       return ((current - previous) / previous) * 100;
   }
   
   /**
    * Génère la classe CSS pour une cellule de variation
    */
   export function getVariationClass(variation: number): string {
       if (variation > 0) return "variation-positive";
       if (variation < 0) return "variation-negative";
       return "";
   }
   ```

## Résumé du travail restant

1. **Finaliser les animations**
   - Intégrer des animations fluides pour l'expansion/réduction
   - Améliorer le feedback visuel des interactions

2. **Ajouter le tri interactif**
   - Implémenter la logique de tri dans les colonnes
   - Ajouter des indicateurs visuels pour l'ordre de tri

3. **Préparer la Phase 4**
   - Mettre en place la structure pour les comparaisons
   - Créer les styles pour les variations
   - Implémenter les fonctions de calcul de variation

4. **Optimisations**
   - Améliorer les performances pour les grands jeux de données
   - Finaliser la documentation des composants
   - Effectuer des tests d'accessibilité 