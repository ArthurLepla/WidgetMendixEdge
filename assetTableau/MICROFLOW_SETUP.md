# Configuration des Microflows pour AssetTableau

## Vue d'ensemble

Le widget AssetTableau utilise maintenant une architecture **directe et simplifiée** : l'objet asset sélectionné est passé **directement** comme paramètre au microflow, éliminant le besoin de récupération par ID.

## Architecture Simplifiée

```
DataSource(Assets) → AssetTableau Widget → Microflow(Asset directement) → Commit
                                    ↓
                                Pas de retrieve nécessaire !
```

## Configuration Mendix Studio Pro

### 1. Configuration du Widget
```xml
<AssetTableau
    level1DataSource="//Usine"
    level1NameAttribute="Name"
    level1UnitAttribute="Unit"  
    level1UpdateAction="MyModule.ACT_UpdateUsine"
    
    level2DataSource="//Secteur"
    level2NameAttribute="Name"
    level2UnitAttribute="Unit"
    level2UpdateAction="MyModule.ACT_UpdateSecteur"
    
    // ... autres niveaux
    
    // OPTIONNEL : pour debugging
    updateBufferAttribute="DebugInfo"
/>
```

### 2. Microflows Simplifiés

**ACT_UpdateUsine(UsineObject: Usine) : Boolean**

Le microflow reçoit **directement** l'objet Usine sélectionné !

```
1. [Input Parameter] UsineObject: Usine (Reçu automatiquement du widget)

2. [Change Object] UsineObject
   - Les modifications ont déjà été appliquées par le widget
   - Le microflow peut ajouter sa logique métier spécifique

3. [Commit Object] UsineObject

4. [Return] true
```

### 3. Exemple Concret

**Microflow : ACT_UpdateUsine**
- **Paramètre d'entrée** : `UsineToUpdate` (Type: Usine)
- **Logique** :
  ```
  1. Log Message: "Updating Usine: " + $UsineToUpdate/Name
  
  2. Change Object: $UsineToUpdate
     - (Les attributs ont déjà été modifiés par le widget)
     - Ajouter logique métier spécifique ici :
       * Validation des valeurs
       * Calculs automatiques  
       * Mise à jour de champs dérivés
       * Notifications
  
  3. Commit Object: $UsineToUpdate
  
  4. Return: true
  ```

### 4. Workflow Automatique

1. **Utilisateur** : Modifie un champ dans le widget (ex: nom d'une usine)
2. **Widget** : Applique automatiquement la modification à l'attribut
3. **Widget** : Appelle le microflow en passant l'objet Usine modifié
4. **Microflow** : Reçoit l'objet avec les modifications déjà appliquées
5. **Microflow** : Applique la logique métier et commit
6. **Widget** : Recharge les données automatiquement

## Avantages de cette Architecture

### ✅ **Simplicité Maximale**
- Pas besoin de retrieve par ID
- Pas de parsing JSON
- Paramètre direct dans le microflow

### ✅ **Performance Optimisée**  
- Une seule opération de commit
- Pas de requêtes supplémentaires
- Minimal overhead

### ✅ **Type Safety**
- Le microflow reçoit directement le bon type d'objet
- Pas d'erreurs de casting ou de conversion
- IntelliSense complet dans Mendix Studio

### ✅ **Logique Métier Centralisée**
- Le microflow se concentre sur la logique métier
- Validation et calculs dans un seul endroit
- Réutilisable pour d'autres interfaces

## Exemples par Niveau

### Level 1 - Usines
```
ACT_UpdateUsine(UsineToUpdate: Usine) : Boolean
- Peut valider la capacité totale
- Peut recalculer les KPIs de l'usine
- Peut notifier le responsable d'usine
```

### Level 2 - Secteurs  
```
ACT_UpdateSecteur(SecteurToUpdate: Secteur) : Boolean
- Peut vérifier la cohérence avec l'usine parent
- Peut mettre à jour les budgets du secteur
- Peut déclencher une réorganisation
```

### Level 3 - Ateliers
```
ACT_UpdateAtelier(AtelierToUpdate: Atelier) : Boolean
- Peut ajuster la planification de production
- Peut réaffecter les équipes
- Peut optimiser les flux logistiques
```

## Debug et Monitoring

### Buffer Optionnel
Si configuré, le widget peut écrire des informations de debug :
```json
{
  "level": 1,
  "nodeId": "12345", 
  "modifications": ["name", "unit"]
}
```

### Logs Recommandés
```
Log Message: "Asset update - Level: " + toString($Level) + ", Object: " + $ObjectName
```

## Migration depuis l'Ancienne Architecture

Si vous aviez des microflows avec retrieval par ID :

**Avant** :
```
ACT_Update(SmartUpdateString: SmartUpdateString)
1. Parse JSON from SmartUpdateString.NewString
2. Extract ID from JSON  
3. Retrieve object by ID
4. Apply changes
5. Commit
```

**Maintenant** :
```
ACT_UpdateUsine(UsineObject: Usine)
1. Apply business logic (changes already applied)
2. Commit
```

## Conclusion

Cette architecture est **drastiquement plus simple** :
- ✅ **80% moins de code** dans les microflows
- ✅ **Performance optimale** avec le minimum d'opérations
- ✅ **Type safety** garantie par Mendix
- ✅ **Maintenabilité maximale** avec une logique claire

Le widget gère automatiquement toute la complexité technique, les microflows se concentrent uniquement sur la logique métier spécifique à chaque type d'asset. 