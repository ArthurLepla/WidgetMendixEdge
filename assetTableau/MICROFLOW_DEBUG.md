# Debug : Microflow non déclenché

## Problème
Le microflow configuré dans `level1UpdateAction` ne se déclenche pas lors de l'édition.

## Diagnostic étape par étape

### 1. Vérifier la configuration du widget

Dans Mendix Studio Pro, vérifiez :

```
Propriétés du widget AssetTableau :
✅ level1DataSource = "//Usine" (ou votre entité niveau 1)
✅ level1UpdateAction = "MyModule.ACT_UpdateUsine" (votre microflow)
✅ level1NameAttribute = "Name" (attribut à modifier)
```

### 2. Vérifier les logs du widget

Avec la nouvelle version, vous devriez voir ces logs dans la console :

```
[DEBUG] Found update action for level 1
[DEBUG] Action for object obtained { canExecute: true, objectId: "..." }
[DEBUG] About to execute microflow for level 1
[INFO] Microflow executed successfully for level 1
```

### 3. Vérifier le microflow

**Votre microflow doit avoir :**
- **Nom** : `ACT_UpdateUsine` (ou le nom configuré)
- **Paramètre d'entrée** : `UsineObject` de type `Usine`
- **Type de retour** : `Boolean`

**Structure minimale :**
```
1. [Log Message] "Microflow ACT_UpdateUsine called with: " + $UsineObject/Name
2. [Change Object] $UsineObject
   - Name = ... (les modifications que vous voulez appliquer)
3. [Commit Object] $UsineObject  
4. [Return] true
```

### 4. Problèmes courants

#### A. Action non configurée
**Erreur** : `Update action for level 1 is not configured`
**Solution** : Vérifier que `level1UpdateAction` est bien configuré dans le widget

#### B. Action non disponible pour l'objet
**Erreur** : `Update action for level 1 is not available for this object`
**Solution** : L'action doit être liée au bon DataSource

#### C. Action non exécutable
**Erreur** : `Update action for level 1 cannot be executed`
**Solutions possibles** :
- L'utilisateur n'a pas les droits d'exécution du microflow
- Le microflow a des paramètres incorrects
- Le microflow est désactivé

### 5. Test pas à pas

1. **Recompilez le widget** : `npm run build`
2. **Actualisez votre application Mendix**
3. **Ouvrez la console du navigateur** (F12)
4. **Editez un asset niveau 1** et observez les logs

### 6. Création d'un microflow de test

Créez ce microflow simple pour tester :

**ACT_UpdateUsine_Test**
```
Paramètre : UsineToUpdate (Usine)

1. [Log Message] 
   Text: "🔥 MICROFLOW APPELÉ ! Usine: " + $UsineToUpdate/Name
   Level: Info

2. [Show Message]
   Title: "Microflow Test"  
   Message: "Le microflow a été appelé avec l'objet : " + $UsineToUpdate/Name

3. [Return] true
```

Configurez ce microflow de test dans `level1UpdateAction` et testez.

### 7. Structure JSON dans le buffer (optionnel)

Si vous avez configuré `updateBufferAttribute`, vous devriez voir dans cet attribut :
```json
{
  "nodeId": "17451448556163318",
  "nodeName": "Usine", 
  "level": 1,
  "attributeUpdates": {
    "name": "UsineTest"
  }
}
```

## Logs attendus (succès)

```
[DEBUG] handleEditSave called { nodeId: "...", level: 1 }
[DEBUG] Found update action for level 1 { hasAction: true }
[DEBUG] Action for object obtained { canExecute: true }  
[DEBUG] About to execute microflow for level 1
[INFO] Microflow executed successfully for level 1
```

## Actions correctives

1. **Si aucun log n'apparaît** → Problème de configuration widget
2. **Si "action not configured"** → Vérifier level1UpdateAction
3. **Si "cannot execute"** → Vérifier droits utilisateur + microflow
4. **Si le microflow ne s'exécute pas** → Créer microflow de test simple 