# Utilitaires CompareData - État et Plan de Nettoyage

## ✅ Nettoyage terminé

### Fichiers supprimés
- `improvedDataProcessing.ts` (347 lignes) - système de traitement avancé non utilisé
- `debugDataLogger.ts` (318 lignes) - système de logging complexe non utilisé  
- `ipeValidation.ts` (197 lignes) - validation IPE séparée non utilisée
- `energyConfig.ts` (49 lignes) - système d'unités obsolète

### Systèmes unifiés
- **Couleurs** : Supprimé `getAssetColor()` de `energy.ts`, gardé `colorUtils.ts`
- **Debug** : Unifié dans `debugLogger.ts`, supprimé le debug local de `use-feature-toggle.ts`
- **Unités** : Unifié vers `energy.ts` + `smartUnitUtils.ts` + `unitConverter.ts`

## 🚨 Problèmes restants identifiés

### 1. Types d'énergie dupliqués
- `types.ts` : `EnergyType = "Elec" | "Gaz" | "Eau" | "Air"`
- `energy.ts` : `EnergyType = "Elec" | "Gaz" | "Eau" | "Air"`
- **Conflit** : Deux définitions identiques !

### 2. Fichier `lib/utils.ts` non utilisé
- 85 lignes de code
- Aucune importation dans le projet
- **Obsolète** !

### 3. Redondance dans `types.ts`
- Contient des types génériques qui pourraient être dans `energy.ts`
- **Simplification possible** !

## 📋 Plan de nettoyage final

### Phase 1 : Suppression de `lib/utils.ts`
- Fichier non utilisé, peut être supprimé

### Phase 2 : Unification des types
- **Option A** : Supprimer `types.ts`, tout mettre dans `energy.ts`
- **Option B** : Garder `types.ts` pour les types génériques, `energy.ts` pour les types spécifiques

### Phase 3 : Vérification finale
- S'assurer qu'il n'y a plus de conflits
- Tester le build

## 🎯 Objectif final
- **1 fichier de types** : `energy.ts` (types spécifiques) + `types.ts` (types génériques) OU tout dans `energy.ts`
- **Fichiers supprimés** : `lib/utils.ts`
- **Systèmes unifiés** : Plus de duplications
