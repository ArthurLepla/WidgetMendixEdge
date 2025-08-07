# Feature Toggle Granularite_Manuelle

## Vue d'ensemble

La feature toggle **Granularite_Manuelle** permet de contrôler dynamiquement l'affichage et l'édition de la granularité dans le widget Detailswidget sans nécessiter de redéploiement.

## Architecture

### Contrôle unique par feature toggle

Le système utilise maintenant uniquement les features toggles pour contrôler les fonctionnalités :

1. **Granularite_Manuelle** : `allowManualGranularity = isGranulariteManuelleEnabled`
2. **Double_IPE** : `isDoubleIPEActive = isDoubleIPEEnabled && hasIPE2Data`

### Comportements

#### Granularite_Manuelle
| Granularite_Manuelle | Résultat |
|---------------------|----------|
| `true` | ✅ Contrôle avancé affiché |
| `false` | ❌ Badge simple affiché |

#### Double_IPE
| Double_IPE | Données IPE 2 | Résultat |
|------------|---------------|----------|
| `true` | Configurées | ✅ Toggle IPE 1/IPE 2 visible |
| `true` | Non configurées | ❌ Mode simple IPE (fallback) |
| `false` | Configurées | ❌ Mode simple IPE |
| `false` | Non configurées | ❌ Mode simple IPE |

## Configuration Mendix

### 1. Entité FeatureToggle

Assurez-vous d'avoir une entité `FeatureToggle` avec :
- `FeatureName` (Enum) : Contient les noms des features
- `IsEnabled` (Boolean) : Statut de la feature

### 2. Enum Features

Ajoutez la valeur `Granularite_Manuelle` à votre enum `Features` :

```
Features:
- Double_IPE
- Rapport_MWF
- Granularite_Manuelle  ← Nouvelle valeur
```

### 3. Configuration du Widget

Dans Studio Pro, configurez le widget Detailswidget :

1. **Datasource FeatureToggle** :
   - Type : `Retrieve`
   - Entity : `FeatureToggle`
   - XPath : `[IsEnabled = true]`

2. **Attribut FeatureName** :
   - Sélectionnez l'attribut `FeatureName` de l'entité `FeatureToggle`

### 4. Microflow de rafraîchissement (optionnel)

Pour éviter la latence, créez un microflow "Refresh FeatureCache" :

```
1. Retrieve FeatureToggle where [IsEnabled = true]
2. Commit (sans événements)
```

## Utilisation

### Activation de la feature

1. Créez une nouvelle entrée dans `FeatureToggle` :
   - `FeatureName` : `Granularite_Manuelle`
   - `IsEnabled` : `true`

2. Actualisez la page contenant le widget

3. Le contrôle de granularité avancé devient disponible

### Désactivation de la feature

1. Modifiez l'entrée dans `FeatureToggle` :
   - `IsEnabled` : `false`

2. Actualisez la page

3. Le widget affiche uniquement le badge simple

## Hook utilitaire

### Utilisation basique

```typescript
import { useGranulariteManuelleToggle } from "./hooks/use-feature-toggle";

const isEnabled = useGranulariteManuelleToggle(featureList, featureNameAttr);
```

### Hook générique pour d'autres features

```typescript
import { useFeatureToggle } from "./hooks/use-feature-toggle";

const isDoubleIPEEnabled = useFeatureToggle(featureList, featureNameAttr, "Double_IPE");
const isRapportMWFEnabled = useFeatureToggle(featureList, featureNameAttr, "Rapport_MWF");
```

### Hook spécialisé pour Double IPE

```typescript
import { useDoubleIPEToggle } from "./hooks/use-feature-toggle";

const isDoubleIPEEnabled = useDoubleIPEToggle(featureList, featureNameAttr);
```

## Snippet Mendix réutilisable

Créez un snippet pour la datasource FeatureToggle :

### Snippet : FeatureToggleDataSource

**Datasource :**
- Type : `Retrieve`
- Entity : `FeatureToggle`
- XPath : `[IsEnabled = true]`

**Attribut :**
- `FeatureName` (Enum)

**Utilisation :**
1. Incluez le snippet dans chaque page utilisant des feature toggles
2. Mappez la datasource et l'attribut dans vos widgets

## Tests

### Test 1 : Feature activée

1. Créez une entrée `Granularite_Manuelle = true`
2. Actualisez la page
3. Le contrôle avancé doit être affiché

### Test 2 : Feature désactivée

1. Modifiez l'entrée `Granularite_Manuelle = false`
2. Actualisez la page
3. Seul le badge simple doit être affiché

## Dépannage

### Problème : Feature ne se charge pas

**Cause possible :** Datasource non configurée
**Solution :** Vérifiez que la datasource `featureList` est mappée

### Problème : Feature ne réagit pas

**Cause possible :** Attribut non mappé
**Solution :** Vérifiez que `featureNameAttr` pointe vers `FeatureName`

### Problème : Comportement incohérent

**Cause possible :** Cache navigateur
**Solution :** Actualisez la page (Ctrl+F5)

## Extensions futures

### Autres features toggles

Le même pattern peut être appliqué pour :

- **Double_IPE** : ✅ **IMPLÉMENTÉ** - Contrôle l'affichage du mode double IPE
- **Rapport_MWF** : Active les rapports MWF
- **Export_Avance** : Contrôle les options d'export avancées

### Hook global

```typescript
// src/hooks/use-features.ts
export function useFeatures(featureList: ListValue, featureNameAttr: ListAttributeValue<string>) {
  return {
    granulariteManuelle: useFeatureToggle(featureList, featureNameAttr, "Granularite_Manuelle"),
    doubleIPE: useFeatureToggle(featureList, featureNameAttr, "Double_IPE"),
    rapportMWF: useFeatureToggle(featureList, featureNameAttr, "Rapport_MWF"),
  };
}
```

### Utilisation des hooks spécialisés

```typescript
import { 
  useGranulariteManuelleToggle,
  useDoubleIPEToggle 
} from "./hooks/use-feature-toggle";

const isGranulariteEnabled = useGranulariteManuelleToggle(featureList, featureNameAttr);
const isDoubleIPEEnabled = useDoubleIPEToggle(featureList, featureNameAttr);
```

## Performance

- **useMemo** : Optimise les recalculs de features
- **Fallback** : Comportement sécurisé si les features ne sont pas chargées
- **Cache** : Les features sont mises en cache côté client

## Sécurité

- **Validation** : Seules les features avec `IsEnabled = true` sont considérées
- **Fallback** : En cas d'erreur, le comportement par défaut est désactivé
- **Contrôle unique** : Seules les features toggles contrôlent l'affichage des fonctionnalités
- **Validation des données** : Double IPE vérifie que les données IPE 2 sont configurées
