# Guide de Test - Features Toggles

## Vue d'ensemble

Ce guide permet de tester les deux features toggles implémentées dans le widget Detailswidget :

1. **Granularite_Manuelle** : Contrôle l'affichage du contrôle de granularité avancé
2. **Double_IPE** : Contrôle l'affichage du mode double IPE avec toggle

## Prérequis

### Configuration Mendix

1. **Entité FeatureToggle** configurée avec :
   - `FeatureName` (Enum) : Contient les noms des features
   - `IsEnabled` (Boolean) : Statut de la feature

2. **Enum Features** avec les valeurs :
   - `Granularite_Manuelle`
   - `Double_IPE`

3. **Widget Detailswidget** configuré avec :
   - Datasource `featureList` → `FeatureToggle` avec XPath `[IsEnabled = true]`
   - Attribut `featureNameAttr` → `FeatureName`

## Tests Feature Toggle Granularite_Manuelle

### Test 1 : Feature désactivée

**Configuration :**
- Créer/modifier l'entrée `FeatureToggle` :
  - `FeatureName` : `Granularite_Manuelle`
  - `IsEnabled` : `false`

**Résultat attendu :**
- ✅ Badge simple affiché : "Granularité : 5 minutes"
- ❌ Pas de bouton de configuration (⚙️)
- ❌ Pas de popover de granularité avancée

### Test 2 : Feature activée

**Configuration :**
- Modifier l'entrée `FeatureToggle` :
  - `IsEnabled` : `true`

**Résultat attendu :**
- ✅ Bouton de configuration visible (⚙️)
- ✅ Popover de granularité avancée accessible
- ✅ Contrôles Auto/Strict fonctionnels
- ✅ Sélecteurs de valeur et unité disponibles

### Test 3 : Changement dynamique

**Étapes :**
1. Démarrer avec `Granularite_Manuelle = true`
2. Vérifier que le contrôle avancé est visible
3. Changer `IsEnabled = false` en base de données
4. Actualiser la page (F5)

**Résultat attendu :**
- ✅ Le contrôle avancé disparaît
- ✅ Le badge simple apparaît
- ✅ Aucun redéploiement nécessaire

## Tests Feature Toggle Double_IPE

### Test 1 : Feature désactivée

**Configuration :**
- Créer/modifier l'entrée `FeatureToggle` :
  - `FeatureName` : `Double_IPE`
  - `IsEnabled` : `false`

**Résultat attendu :**
- ✅ Mode simple IPE affiché
- ❌ Pas de toggle IPE 1/IPE 2
- ❌ Pas de données IPE 2 chargées
- ✅ Seules les cartes IPE 1 visibles

### Test 2 : Feature activée

**Configuration :**
- Modifier l'entrée `FeatureToggle` :
  - `IsEnabled` : `true`
- **Important** : S'assurer que les données IPE 2 sont configurées dans Studio Pro

**Résultat attendu :**
- ✅ Toggle IPE 1/IPE 2 visible
- ✅ Données IPE 2 chargées
- ✅ Cartes IPE 2 visibles
- ✅ Changement d'IPE fonctionnel

### Test 3 : Feature activée mais données IPE 2 non configurées

**Configuration :**
- `Double_IPE = true` en base de données
- **Mais** : Données IPE 2 non configurées dans Studio Pro

**Résultat attendu :**
- ✅ Mode simple IPE affiché (fallback automatique)
- ❌ Pas de toggle IPE 1/IPE 2
- ❌ Pas de données IPE 2 chargées
- ✅ Logs de debug montrent `hasIPE2Data: false`

### Test 4 : Changement dynamique

**Étapes :**
1. Démarrer avec `Double_IPE = true` et données IPE 2 configurées
2. Vérifier que le toggle IPE 1/IPE 2 est visible
3. Changer `IsEnabled = false` en base de données
4. Actualiser la page (F5)

**Résultat attendu :**
- ✅ Le toggle IPE 1/IPE 2 disparaît
- ✅ Mode simple IPE affiché
- ✅ Seules les données IPE 1 chargées

## Tests Combinés

### Test 1 : Les deux features activées

**Configuration :**
- `Granularite_Manuelle = true`
- `Double_IPE = true`
- Données IPE 2 configurées

**Résultat attendu :**
- ✅ Contrôle de granularité avancé visible
- ✅ Toggle IPE 1/IPE 2 visible
- ✅ Toutes les fonctionnalités disponibles

### Test 2 : Une seule feature activée

**Configuration :**
- `Granularite_Manuelle = true`
- `Double_IPE = false`
- Données IPE 2 configurées

**Résultat attendu :**
- ✅ Contrôle de granularité avancé visible
- ❌ Toggle IPE 1/IPE 2 non visible
- ✅ Mode simple IPE affiché

### Test 3 : Aucune feature activée

**Configuration :**
- `Granularite_Manuelle = false`
- `Double_IPE = false`
- Données IPE 2 configurées

**Résultat attendu :**
- ❌ Contrôle de granularité avancé non visible
- ❌ Toggle IPE 1/IPE 2 non visible
- ✅ Badge simple de granularité
- ✅ Mode simple IPE

## Debug et Logs

### Console Browser

Ouvrir la console du navigateur (F12) pour voir les logs de debug :

```javascript
// Logs de debug des features toggles
🔍 DEBUG Feature Toggle: {
    isGranulariteManuelleEnabled: true,
    isDoubleIPEEnabled: false,
    ipeModeProp: "double",
    isDoubleIPEActive: false,
    featureListStatus: "Available",
    featureListItems: 1,
    allowManualGranularity: true
}

// Logs de debug du toggle IPE
=== DEBUG TOGGLE IPE ===
ipeMode: "double"
isDoubleIPEActive: false
showIPEToggle: false
ipe1Name: "IPE 1"
ipe2Name: "IPE 2"
activeIPE: 1
onIPEToggle: true
========================
```

### Interprétation des logs

- **`featureListStatus`** : Doit être "Available" pour que les features fonctionnent
- **`featureListItems`** : Nombre de features activées en base
- **`isDoubleIPEActive`** : Résultat du contrôle en cascade (`ipeMode === "double" && isDoubleIPEEnabled`)
- **`showIPEToggle`** : Doit correspondre à `isDoubleIPEActive`

## Dépannage

### Problème : Features ne se chargent pas

**Symptômes :**
- Logs montrent `featureListStatus: "Loading"` ou `featureListItems: 0`
- Aucune feature ne fonctionne

**Solutions :**
1. Vérifier la datasource `featureList` dans Studio Pro
2. Vérifier l'XPath `[IsEnabled = true]`
3. Vérifier que l'attribut `featureNameAttr` est mappé
4. Actualiser la page (Ctrl+F5)

### Problème : Feature ne réagit pas

**Symptômes :**
- Feature activée en base mais pas d'effet visible
- Logs montrent `isGranulariteManuelleEnabled: false`

**Solutions :**
1. Vérifier que l'entrée `FeatureToggle` existe
2. Vérifier que `FeatureName` correspond exactement (sensible à la casse)
3. Vérifier que `IsEnabled = true`
4. Actualiser la page

### Problème : Comportement incohérent

**Symptômes :**
- Interface change partiellement
- Certains éléments visibles, d'autres non

**Solutions :**
1. Vider le cache navigateur (Ctrl+Shift+Delete)
2. Actualiser en mode incognito
3. Vérifier les logs de debug
4. Redémarrer le serveur Mendix si nécessaire

## Validation Finale

### Checklist de validation

- [ ] **Granularite_Manuelle** : Contrôle avancé apparaît/disparaît selon le statut
- [ ] **Double_IPE** : Toggle IPE 1/IPE 2 apparaît/disparaît selon le statut
- [ ] **Changements dynamiques** : Actualisation de page suffit
- [ ] **Logs de debug** : Informations cohérentes en console
- [ ] **Performance** : Pas de dégradation de performance
- [ ] **UX** : Transitions fluides, pas de clignotements

### Tests de charge

- [ ] **Multiple features** : Les deux features activées simultanément
- [ ] **Changements rapides** : Activation/désactivation rapide des features
- [ ] **Navigation** : Changement de page puis retour
- [ ] **Session longue** : Utilisation prolongée du widget

## Conclusion

Les features toggles permettent un contrôle dynamique et flexible du widget sans nécessiter de redéploiement. Cette approche améliore significativement l'agilité opérationnelle et facilite les tests A/B.
