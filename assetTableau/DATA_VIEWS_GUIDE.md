# Guide d'Utilisation AssetTableau avec Data Views

## 🎯 Vue d'ensemble

Le widget **AssetTableau** utilise maintenant l'approche native Mendix avec **Data Views**, ce qui simplifie considérablement la configuration et garantit une meilleure intégration avec l'écosystème Mendix.

---

## 📋 Prérequis

### Entités Mendix Requises
Votre modèle de domaine doit contenir au minimum une entité principale (ex: `Usine`) :

```
Entity: Usine
- Name (String) - Attribut requis
- Unit (String) - Optionnel 
- ParentId (String) - Pour la hiérarchie
```

### Microflow de Sauvegarde
Un microflow simple pour traiter les modifications :

```
Microflow: ACT_AssetTableau_Save
Parameters: CurrentObject (Entity)
Logic:
1. Change Object → CurrentObject
2. Commit Object → CurrentObject  
3. Return → True
```

---

## 🏗️ Configuration dans Mendix Studio Pro

### 1. Placement du Widget

**⚠️ Important** : Le widget DOIT être placé dans une **Data View**

```xml
<!-- ✅ CORRECT -->
<DataView dataSource="MyModule.Usine">
    <AssetTableau
        level1DataSource="//MyModule.Usine"
        level1NameAttribute="Name"
        onSaveAction="MyModule.ACT_AssetTableau_Save"
    />
</DataView>

<!-- ❌ INCORRECT -->
<AssetTableau ... />  <!-- Sans Data View parente -->
```

### 2. Configuration des Propriétés

#### **Configuration Générale**
| Propriété | Valeur | Description |
|-----------|--------|-------------|
| `mode` | `dev` ou `prod` | Mode développement (tous champs) ou production (champs éditables uniquement) |
| `maxLevels` | `1-5` | Nombre de niveaux hiérarchiques à supporter |

#### **DataSource Level 1** (Obligatoire)
| Propriété | Exemple | Description |
|-----------|---------|-------------|
| `level1DataSource` | `//MyModule.Usine` | Source de données pour le niveau racine |
| `level1Name` | `"Usine"` | Nom d'affichage du niveau |
| `level1NameAttribute` | `Name` | Attribut contenant le nom |
| `level1UnitAttribute` | `Unit` | Attribut contenant l'unité (optionnel) |
| `level1ParentAttribute` | `ParentId` | Pour la hiérarchie (optionnel) |

#### **DataSource Level 2-5** (Optionnels)
Même structure que Level 1, remplacer `level1` par `level2`, `level3`, etc.

#### **Actions**
| Propriété | Exemple | Description |
|-----------|---------|-------------|
| `onSaveAction` | `MyModule.ACT_AssetTableau_Save` | Microflow appelé lors de la sauvegarde |
| `onDeleteAction` | `MyModule.ACT_AssetTableau_Delete` | Pour la suppression (optionnel) |
| `onCreateAction` | `MyModule.ACT_AssetTableau_Create` | Pour la création (optionnel) |

#### **Permissions**
| Propriété | Valeur | Description |
|-----------|--------|-------------|
| `allowEdit` | `true/false` | Autoriser l'édition inline |
| `allowDelete` | `true/false` | Autoriser la suppression (dev uniquement) |
| `allowCreate` | `true/false` | Autoriser la création (dev uniquement) |

---

## 🔧 Configuration Avancée

### 1. Hiérarchie Multi-Niveaux

Pour une hiérarchie **Usine → Secteur → Atelier** :

```xml
<AssetTableau
    maxLevels="3"
    
    <!-- Level 1: Usine -->
    level1DataSource="//MyModule.Usine"
    level1Name="Usine"
    level1NameAttribute="Name"
    level1UnitAttribute="Unit"
    
    <!-- Level 2: Secteur -->  
    level2DataSource="//MyModule.Secteur"
    level2Name="Secteur"
    level2NameAttribute="Name"
    level2ParentAttribute="UsineId"
    
    <!-- Level 3: Atelier -->
    level3DataSource="//MyModule.Atelier"
    level3Name="Atelier"
    level3NameAttribute="Name"  
    level3ParentAttribute="SecteurId"
    
    <!-- Actions -->
    onSaveAction="MyModule.ACT_AssetTableau_Save"
/>
```

### 2. Microflows Avancés

#### Microflow de Sauvegarde avec Validation
```
ACT_AssetTableau_Save(CurrentObject: Entity) : Boolean
1. Validation:
   - Empty String Check on Name
   - Business Rules Validation
2. Change Object → CurrentObject
3. Commit Object → CurrentObject
4. Refresh in Client → true
5. Return → true
```

#### Microflow avec Gestion d'Erreurs
```
ACT_AssetTableau_Save(CurrentObject: Entity) : Boolean
Try:
1. Change Object → CurrentObject
2. Commit Object → CurrentObject
3. Show Message → "Sauvegarde réussie"
4. Return → true
Catch:
1. Show Message → "Erreur: " + $latestError
2. Return → false
```

---

## 🎨 Utilisation Interface

### 1. Navigation
- **Hierarchy Panel** (gauche) : Arbre hiérarchique par niveaux
- **Details Panel** (droite) : Détails et édition du nœud sélectionné
- **Toolbar** (haut) : Recherche, filtres, statistiques

### 2. Édition Inline
1. Sélectionner un asset dans la hiérarchie
2. Dans le panel de détails, cliquer sur les champs éditables
3. Modifier les valeurs
4. Cliquer **"Sauvegarder"** ou **"Annuler"**

### 3. Modes d'Affichage
- **Mode Production** : Seuls les champs configurés comme éditables
- **Mode Développement** : Tous les attributs + métadonnées système

---

## 🚀 Exemples d'Implémentation

### Exemple 1 : Configuration Simple
```xml
<!-- Data View pour Usine -->
<DataView dataSource="MyModule.Usine">
    <AssetTableau
        mode="prod"
        maxLevels="1"
        level1DataSource="//MyModule.Usine"
        level1Name="Usines"
        level1NameAttribute="Name"
        level1UnitAttribute="Unit"
        onSaveAction="MyModule.ACT_SaveUsine"
        allowEdit="true"
        allowDelete="false"
        allowCreate="false"
    />
</DataView>
```

### Exemple 2 : Configuration Multi-Niveaux Complète
```xml
<DataView dataSource="MyModule.Usine">
    <AssetTableau
        mode="dev"
        maxLevels="5"
        
        <!-- Usine -->
        level1DataSource="//MyModule.Usine"
        level1Name="Usine"
        level1NameAttribute="Name"
        level1UnitAttribute="Unit"
        
        <!-- Secteur -->
        level2DataSource="//MyModule.Secteur" 
        level2Name="Secteur"
        level2NameAttribute="Name"
        level2ParentAttribute="UsineId"
        
        <!-- Atelier -->
        level3DataSource="//MyModule.Atelier"
        level3Name="Atelier" 
        level3NameAttribute="Name"
        level3ParentAttribute="SecteurId"
        
        <!-- ETH -->
        level4DataSource="//MyModule.ETH"
        level4Name="ETH"
        level4NameAttribute="Name"
        level4ParentAttribute="AtelierId"
        
        <!-- Machine -->
        level5DataSource="//MyModule.Machine"
        level5Name="Machine"
        level5NameAttribute="Name"
        level5ParentAttribute="ETHId"
        level5UnitAttribute="Unit"
        
        <!-- Actions -->
        onSaveAction="MyModule.ACT_AssetTableau_Save"
        onDeleteAction="MyModule.ACT_AssetTableau_Delete"
        onCreateAction="MyModule.ACT_AssetTableau_Create"
        
        <!-- Permissions -->
        allowEdit="true"
        allowDelete="true"
        allowCreate="true"
        
        <!-- UI -->
        showSearch="true"
        showFilters="true"
        expandedByDefault="false"
    />
</DataView>
```

---

## 🔍 Debugging et Logging

### Console du Navigateur
Le widget produit des logs détaillés :

```javascript
// Logs de transitions FSM
[AssetTableau] FSM Transition: INITIALIZING → LOADING_DATA

// Logs d'édition
[AssetTableau] Edit save requested for node: usine-123

// Logs de données
[AssetTableau] Data loaded: 5 levels, 150 total items
```

### Mode Développement
En mode `dev`, le panel de détails affiche :
- **Métadonnées système** : Configuration interne
- **Tous les attributs** : Y compris les champs calculés
- **Actions de debug** : Duplication, suppression

---

## ⚠️ Limitations et Bonnes Pratiques

### Limitations
1. **Data View obligatoire** : Le widget ne peut pas fonctionner sans contexte d'entité
2. **Action unique** : Une seule action de sauvegarde pour tous les niveaux
3. **Attributs string** : Les attributs doivent être de type String

### Bonnes Pratiques
1. **Validation côté microflow** : Toujours valider les données dans le microflow
2. **Permissions Mendix** : Utiliser les rôles de sécurité Mendix standard
3. **Performance** : Limiter le nombre d'entités affichées (pagination recommandée)
4. **Hiérarchie** : Utiliser des associations Mendix plutôt que des IDs string

---

## 🆘 Résolution de Problèmes

### Problème : "Widget ne s'affiche pas"
**Solution** : Vérifier que le widget est dans une Data View avec une source de données valide.

### Problème : "Édition non disponible"
**Solution** : 
1. Vérifier `allowEdit="true"`
2. Vérifier que `onSaveAction` est configuré
3. Vérifier les permissions Mendix sur l'entité

### Problème : "Hiérarchie ne s'affiche pas"
**Solution** :
1. Vérifier les `parentAttribute` 
2. S'assurer que les relations parent-enfant sont correctes
3. Vérifier que `maxLevels` est suffisant

### Problème : "Erreur de sauvegarde"
**Solution** :
1. Vérifier que le microflow `onSaveAction` existe
2. Vérifier les paramètres du microflow (doit accepter l'entité courante)
3. Contrôler les logs de la console pour plus de détails

---

## 📞 Support

Pour toute question ou problème :
1. Consulter les logs de la console du navigateur
2. Vérifier la configuration selon ce guide
3. Tester avec une configuration minimale d'abord

---

*Guide mis à jour pour AssetTableau v2.0-dataviews* 