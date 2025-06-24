# 🔍 Guide de débogage - Problème de rendu visuel Sankey

## Problème identifié
- ✅ **Logique métier** : Fonctionne parfaitement (valeurs cohérentes)
- ❌ **Rendu visuel** : Rien ne s'affiche ou diagramme invisible

## Étapes de diagnostic

### 1. 🎯 Activer le mode debug
Dans Mendix Studio Pro, activez `showDebugTools: true` sur votre widget.

### 2. 🔍 Vérifier les nouveaux logs de debug
Après compilation, vous devriez voir ces nouveaux logs :

```
🔍 DEBUG DIMENSIONS: { effectiveWidth, effectiveHeight, innerWidth, innerHeight }
🔍 DEBUG RENDU D3: { sankeyDataNodes, connectedNodes, orphanNodes, nodeWidth, nodePadding }
🔍 DEBUG DONNÉES D3: { processedNodes, processedLinks, processedLinksDetails }
🔍 DEBUG RÉSULTAT D3: { d3NodesLength, firstNodePosition, firstLinkWidth }
🔍 DEBUG LIEN Usine_Usine → Atelier_Atelier 1: { value, d3Width, minWidth, finalWidth }
```

### 3. 📊 Vérifier l'onglet debug dans l'interface
Le widget affiche maintenant un panneau de debug détaillé avec :
- Données Sankey (nœuds, liens, niveaux)
- Dimensions & État (largeur, hauteur, état de traitement)
- Détail expandable des nœuds et liens

### 4. 🔧 Corrections appliquées

#### A. **Mapping des indices D3** ✅
- Correction du mapping source/target dans les liens
- Validation des références avant traitement D3
- Clonage des nœuds pour éviter les mutations

#### B. **Largeurs de liens garanties** ✅
- Largeur minimale même si D3 calcule 0
- Couleur directe au lieu de gradient
- Logs détaillés pour chaque lien

#### C. **Dimensions sécurisées** ✅
- Marges adaptatives (15% de la largeur)
- Largeur/hauteur minimales garanties
- Logs des dimensions calculées

#### D. **Validation des données** ✅
- Vérification que les nœuds existent avant traitement
- Messages d'erreur explicites
- Valeur minimale 0.1 pour éviter liens invisibles

### 5. 🎯 Points à vérifier dans les nouveaux logs

| Log à chercher | Signification | Action si problème |
|---------------|---------------|-------------------|
| `❌ ERREUR D3: Aucun nœud connecté` | Pas de nœuds pour D3 | Vérifier le filtrage |
| `⚠️ AVERTISSEMENT D3: Aucun lien` | Pas de liens entre nœuds | Vérifier les relations |
| `firstNodePosition: null` | D3 n'a pas calculé de position | Problème données D3 |
| `finalWidth: 0` | Lien invisible | Problème calcul largeur |

### 6. 🚀 Si le problème persiste

#### Vérifications DOM :
1. **Ouvrir DevTools** → Onglet Elements
2. Chercher `<svg class="sankey-chart">` 
3. Vérifier si les éléments `<g class="nodes">` et `<g class="links">` existent
4. Vérifier les attributs `transform` et `d` des paths

#### Vérifications CSS :
1. Confirmer que le conteneur a une hauteur > 0
2. Vérifier qu'aucun `overflow: hidden` ne cache le contenu
3. S'assurer que le SVG n'est pas en `display: none`

### 7. 📞 Informations à fournir pour support

Si le problème persiste, partager :
1. **Tous les nouveaux logs de debug** (🔍 DEBUG...)
2. **Contenu du panneau debug** dans l'interface
3. **Capture d'écran** des DevTools montrant le DOM SVG
4. **Dimensions** du conteneur widget dans Mendix

---

## 🎯 Résultat attendu

Après ces corrections, vous devriez voir :
- **2 rectangles colorés** (Usine en bleu, Atelier en vert)
- **1 lien gris** entre eux avec largeur proportionnelle
- **Labels** avec noms et valeurs (80 kWh)
- **Navigation breadcrumb** en haut

Si vous ne voyez toujours rien, les nouveaux logs de debug nous indiqueront exactement où est le problème. 