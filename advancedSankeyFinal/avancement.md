# 📋 Avancement du Projet AdvancedSankey

## 30 juin 2025 - Nettoyage des propriétés obsolètes

### ⌛ Changement :
**Suppression des propriétés non utilisées** dans le fichier XML du widget pour simplifier l'interface et éviter la confusion.

**Propriétés retirées** :
- `showPercentages` : Propriété non utilisée dans le code (les pourcentages sont affichés automatiquement sur les liens)
- `clickedNodeAttribute` : Propriété obsolète remplacée par `clickedAssetAttribute` pour la vue détaillée

**Propriétés conservées** (toutes utilisées) :
- Configuration des flux : `energyFlowDataSource`, `sourceAssetAttribute`, `targetAssetAttribute`, `flowValueAttribute`, `percentageAttribute`
- Configuration énergétique : `energyType`, `metricType`
- Affichage : `title`, `width`, `height`, `showValues`
- Interactions : `onNodeClick`, `onNodeDetails`, `clickedAssetAttribute`
- Développement : `showDebugTools`

### 🤔 Analyse :
**Impact Maintenabilité** : Simplification de l'interface de configuration du widget, suppression de la confusion potentielle avec des propriétés non fonctionnelles. Les types TypeScript sont automatiquement mis à jour.

**Impact UX** : Interface plus claire pour les développeurs Mendix, moins de propriétés à configurer inutilement.

### 💜 Prochaines étapes :
- Vérifier que le build fonctionne correctement après le nettoyage
- Optionnel : ajouter des validations pour s'assurer que toutes les propriétés requises sont configurées

## 30 juin 2025 - Implémentation Vue Détaillée (Ctrl+clic)

### ⌛ Changement additionnel (interaction unifiée + fiabilité MF) :
- Uniformisation: **Ctrl+clic partout** pour ouvrir la vue détaillée. Le clic simple conserve uniquement la navigation (si enfants), sinon aucune action.
- Fiabilité: exécution du microflow `onNodeDetails` au tick suivant après mise à jour de `selectedAssetNameAttribute` (via `requestAnimationFrame`) afin d'éviter une course où la valeur n'est pas encore visible côté microflow.

### 🤔 Analyse :
Évite toute ambiguïté d’UX; supprime les effets de bord où les datasources de page s’exécutaient avant que le nom sélectionné ne soit propagé. En cas de besoin, on pourra augmenter le délai (setTimeout 0–10ms) ou forcer un commit côté microflow avant l’ouverture de page.

### ⌛ Changement :
**Nouvelle fonctionnalité d'interaction** : Ajout d'un système de vue détaillée accessible via Ctrl+clic sur les nœuds du Sankey.

**Modifications apportées** :
- **XML Widget** : Ajout de 2 nouvelles propriétés :
  - `onNodeDetails` : Action Mendix pour ouvrir la vue détaillée
  - `clickedAssetAttribute` : Attribut pour stocker l'asset correspondant au nœud cliqué
- **SankeyChart** : Gestion du Ctrl+clic avec logique intelligente :
  - Clic normal : drill-down si enfants, sinon vue détaillée
  - Ctrl+clic : vue détaillée quel que soit le nœud
  - Tous les nœuds sont maintenant cliquables (curseur pointer)
- **Tooltips** : Ajout de hints contextuels "Clic: navigation • Ctrl+clic: vue détaillée"
- **Mapping Asset** : Fonction `findAssetForNode()` pour récupérer l'asset correspondant depuis les EnergyFlowNode

### 🤔 Analyse :
**Impact UX** : L'utilisateur peut maintenant naviguer dans le Sankey ET accéder aux vues détaillées depuis le même widget, avec une interaction intuitive (Ctrl+clic). Les hints visuels guident l'utilisateur sans surcharge d'interface.

**Impact Maintenabilité** : Architecture propre avec séparation des responsabilités. Le mapping asset est fait côté widget, permettant une intégration flexible avec les microflows Mendix. Les types TypeScript sont correctement mis à jour.

**Impact Scalabilité** : La solution s'adapte automatiquement selon que le nœud a des enfants ou non, évitant les clics inutiles sur les feuilles.

### 💜 Prochaines étapes :
- Tester l'intégration avec les microflows Mendix
- Optionnel : ajouter un indicateur visuel (icône) sur les nœuds feuilles pour suggérer la vue détaillée
- Considérer l'ajout d'un double-clic comme alternative au Ctrl+clic

## 13 août 2025 - Centrage SVG + Labels non chevauchants

### ⌛ Changement :
- Ajout d'un `viewBox` et `preserveAspectRatio="xMidYMid meet"` sur le `<svg>` dans `SankeyChart` pour un viewport cohérent et un centrage fiable.
- Marges horizontales et verticales clampées (8% de la largeur, bornées à 40–120 px; 24–80 px en hauteur) pour éviter une zone vide excessive à droite.
- Troncature mesurée côté D3 des labels avec `getComputedTextLength()` et recherche binaire; masquage automatique si la hauteur du nœud < 14 px.

### 🤔 Analyse :
Ces ajustements alignent la largeur connue du layout D3 avec celle du viewport SVG (problème observé: `svg width: 100%` vs `extent` trop étroit). Le graphe est désormais correctement centré et occupe mieux l'espace horizontal. Les labels ne se chevauchent plus grâce à la troncature calculée côté D3 (les règles CSS d'ellipsis sur `<text>` n'étant pas appliquées par les navigateurs). L'impact est strictement visuel et améliore la lisibilité sans modifier la logique métier.

### 💜 Prochaines étapes :
- Optionnel: ajouter une routine d'anti-collision des labels (léger décalage Y) pour les cas extrêmes.
- Rendre la troncature et les seuils configurables via les props du widget.

### ⌛ Changement additionnel (sécurité données 0):
- Filtrage des liens de valeur 0 lors de la navigation et dans le rendu d3 (`useNavigationState` et `SankeyChart`) pour éviter des états D3 invalides et positions NaN.

### 🤔 Analyse :
Certaines vues remontaient des liens à 0 (ex: `USINE -> FACILITIES (0)`), ce qui peut conduire à des layouts non définis dans `d3-sankey`. En excluant ces liens non significatifs, on garantit la stabilité du calcul tout en conservant la lisibilité.

## 13 août 2025 - UX Breadcrumb (suppression de la redondance à l’ouverture)

### ⌛ Changement :
- Initialisation de la navigation directement sur la racine réelle si elle est identifiable (unique `level === 0` ou nom `ALIMENTATION PRINCIPALE`).
- Breadcrumb ajusté: quand une racine réelle est présente, on n’affiche pas le crumb "Vue d'ensemble" au démarrage.

### 🤔 Analyse :
L’ouverture montrait systématiquement "Vue d'ensemble" puis, après clic, "Vue d'ensemble > ALIMENTATION PRINCIPALE > …". Cette redondance brouille la lecture. En initialisant sur la racine réelle et en adaptant le breadcrumb, l’expérience est plus logique: on commence directement au bon niveau.

### 💜 Prochaines étapes :
- Rendre ce comportement configurable (prop: `startAtRealRoot: boolean`).

### ⌛ Changement complémentaire :
- Fallback synthétique des liens lors de la navigation si `links.length === 0` entre la racine courante et ses enfants: création de liens epsilon pour éviter un layout invalide et garder la lisibilité.

### 🤔 Analyse :
Certaines branches reportent uniquement des valeurs 0 en premier niveau (USINE → FACILITIES/PRODUCTION/SUPPORT). D3 ne positionne pas les nœuds sans liens; le fallback construit des liens visuels basés sur la somme entrante de chaque enfant (ou un epsilon), assurant un affichage stable.

## 13 août 2025 - Anti-chevauchement labels/liens

### ⌛ Changement :
- Placement des labels sur des “pistes” gauche/droite hors des nœuds, à l’opposé des liens, avec connecteurs subtils.
- Troncature mesurée; évitement de collision vertical glouton pour maintenir les espacements.
- Retrait de l’arrière-plan précédent.

### 🤔 Analyse :
Solution légère, sans dépendances. Améliore la lisibilité dans les vues denses; peut être étendu par un algorithme itératif si besoin.

## 30 juin 2025 - Correction TypeScript d3-sankey Import

### ⌛ Changement :
**Correction TypeScript** : Résolution de l'erreur TypeScript `Property 'sankeyCenter' does not exist on type 'typeof import("d3")'` en utilisant l'import direct de `sankeyCenter` depuis `d3-sankey` au lieu de l'accès via namespace `d3`.

### 🤔 Analyse :
**Impact Maintenabilité** : Correction d'une erreur de type qui empêchait la compilation TypeScript. L'utilisation correcte des imports spécifiques de `d3-sankey` améliore la clarté du code et évite les confusions entre les différents modules D3.

### 🔜 Prochaines étapes :
- Vérifier qu'aucune autre erreur TypeScript similaire n'existe dans le projet
- S'assurer que tous les imports D3 utilisent les modules appropriés

## 12 août 2025 - Migration EnergyFlowNode en préservant le visuel

### ⌛ Changement :
- Intégration du nouveau backend EnergyFlowNode via `useVisualSankeyData` et `VisualDataAdapter`
- Refactor de `SankeyChart` (types explicites `VisualNode/VisualLink`, export par défaut) en conservant les classes CSS existantes (`sankey-node`, `sankey-link`, `sankey-label`, `sankey-chart`)
- Simplification de `AdvancedSankeyV2.tsx` pour consommer les données adaptées tout en gardant la structure DOM et les styles (`sankey-container`, `sankey-header`, etc.)

### 🤔 Analyse :
- Maintenabilité : séparation nette données/affichage, adaptation unique EnergyFlowNode → visuel. Le front reste stable et réutilisable.
- Scalabilité : types alignés Mendix (`ListValue`, `ListAttributeValue`, `ValueStatus`) et calculs d3 isolés; la migration n’impacte pas le CSS ni le layout.

### 🔜 Prochaines étapes :
- Réintroduire le breadcrumb et le DisplayModeSwitch (consommation/coût) pour parité visuelle à 100% selon le plan.
- Optionnel: remettre le tooltip portal (actuellement tooltip local conservé) si nécessaire.
- Lancer build complet et tests visuels pour vérifier identité du rendu.

## 16 juin 2025 - Suppression du Repository Git

### ⌛ Changement :
**SUPPRESSION TRACKING GIT** : Suppression complète du tracking git du dossier `advancedSankeyFinal` pour le transformer en dossier de développement local non versionné.

**Actions effectuées** :
- Ajout de `advancedSankeyFinal/` au `.gitignore` du repository parent
- Suppression du dossier du cache git avec `git rm -r --cached advancedSankeyFinal`
- Commit des changements : "Remove advancedSankeyFinal from git tracking"
- Suppression des fichiers de configuration git locaux (`.gitignore`, `.gitattributes`, `.prettierignore`)

**Raison du changement** :
Le dossier `advancedSankeyFinal` était tracké comme un submodule ou sous-dossier du repository principal, mais doit maintenant être développé indépendamment sans contrôle de version git.

### 🤔 Analyse :
**Impact Maintenabilité** : La suppression du tracking git simplifie la gestion du projet en éliminant les conflits potentiels de versioning entre le repository parent et le sous-projet. Le développement devient plus flexible sans les contraintes de git.

**Impact Scalability** : Le projet peut maintenant évoluer indépendamment sans impacter le repository principal. Cette approche convient mieux pour un développement rapide de prototype ou des expérimentations.

### 🔜 Prochaines étapes :
1. Continuer le développement sans contraintes git
2. Évaluer si une réintégration git sera nécessaire à terme
3. Maintenir la documentation d'avancement même sans git

---

## 27 janvier 2025 - Correction Affichage Enfants de Nœuds Orphelins

### ⌛ Changement :
**Correction Affichage des Enfants de Nœuds Orphelins** : Résolution d'un bug majeur qui empêchait l'affichage correct des enfants lors de la navigation vers un nœud orphelin. Les nœuds enfants apparaissaient superposés, sans liens.

### 🤔 Analyse :
**Impact Fiabilité** : Cette correction assure que les liens hiérarchiques sont toujours valides, même si les noms de données contiennent des variations. La navigation dans l'intégralité du graphe, y compris les branches orphelines, est maintenant robuste et fiable.

### 🔜 Prochaines étapes :
1.  Tester la navigation sur un jeu de données contenant des nœuds orphelins avec des enfants pour valider la correction.
2.  S'assurer qu'aucun autre service ne construit des identifiants de manière incohérente.

---

## 27 janvier 2025 - Extension Support Hiérarchique (5 Niveaux)

### ⌛ Changement :
**EXTENSION HIÉRARCHIE MULTI-NIVEAUX** : Ajout du support pour les hiérarchies à 5 niveaux (0 à 4) en réponse à une limitation configurative identifiée par l'utilisateur.

### 🤔 Analyse :
**Impact Scalabilité** : Le widget peut maintenant gérer des structures organisationnelles plus complexes avec jusqu'à 5 niveaux hiérarchiques. Cette extension répond aux besoins d'entreprises ayant des structures plus profondes (Entreprise → Division → Site → Atelier → Machine → Équipement par exemple).

### 🔜 Prochaines étapes :
1. Tester la configuration avec des données réelles sur 5 niveaux
2. Valider que la règle R3 fonctionne correctement avec les nouveaux attributs
3. Documenter les bonnes pratiques de configuration pour les hiérarchies profondes

---

## 26 janvier 2025 - Correction Crash Navigation (Données Invalides D3)

### ⌛ Changement :
**CORRECTION CRASH CRITIQUE** : Résolution d'un crash de type `invalid array length` qui se produisait dans la librairie D3 lors de la navigation vers un nœud enfant.

### 🤔 Analyse :
**Impact Fiabilité** : Élimine un crash critique qui bloquait une fonctionnalité essentielle du widget (la navigation). La robustesse du rendu est grandement améliorée en garantissant que D3 ne reçoit que des données saines et cohérentes.

### 🔜 Prochaines étapes :
1.  Tester intensivement la navigation (montée, descente, clics sur orphelins) pour s'assurer qu'aucun autre cas de crash ne subsiste.
2.  Valider la cohérence de l'affichage après plusieurs étapes de navigation.

---

## 26 janvier 2025 - Refactorisation du Rendu et Tri des Nœuds

### ⌛ Changement :
**REFACTORISATION MAJEURE DU RENDU D3** : Correction des problèmes de centrage du diagramme et de l'organisation des nœuds pour une lisibilité et une clarté optimales.

### 🤔 Analyse :
**Impact Maintenabilité** : La logique de rendu est considérablement simplifiée. En supprimant la double gestion des positions (transformation + viewBox), le code est plus facile à comprendre et à maintenir. La logique de tri est centralisée et explicite.

### 🔜 Prochaines étapes :
1.  Confirmer que le tri des nœuds est correct sur des jeux de données plus complexes.
2.  Vérifier la réactivité du `viewBox` lors du redimensionnement de la fenêtre.

---

## 26 janvier 2025 - Amélioration du Rendu D3

### ⌛ Changement :
**AMÉLIORATION DU RENDU VISUEL** : Ajustement de la logique de rendu D3 pour résoudre trois problèmes de mise en page signalés par l'utilisateur :

### 🤔 Analyse :
**Impact Maintenabilité** : La logique de positionnement des libellés est maintenant plus simple et plus robuste. En se basant sur la position relative des nœuds (`x0 < innerWidth / 2`), le code est plus déclaratif et moins sujet aux erreurs de cas particuliers (comme pour les orphelins).

### 🔜 Prochaines étapes :
1.  Valider le rendu avec différents jeux de données pour s'assurer que les améliorations sont cohérentes.
2.  Monitorer les performances pour s'assurer que le nouvel alignement n'impacte pas le temps de rendu sur des diagrammes très larges.

---

## 25 janvier 2025 - Corrections Services Critiques (Multiple)

### ⌛ Changement :
**CORRECTIONS MULTIPLES DE SERVICES** : Résolution de problèmes critiques dans 4 services pour améliorer la robustesse et la conformité aux règles métier.

### 🤔 Analyse :
**Impact Scalabilité** : Élimination des risques de crash et des comportements non-déterministes. Les mécanismes d'immutabilité permettent une mémorisation React efficace même avec de gros datasets.

### 🔜 Prochaines étapes :
1. Tests avec données réelles pour valider les corrections R3
2. Vérification que la mémorisation React fonctionne correctement
3. Validation des performances avec les nouveaux clonages immutables

---

## 25 janvier 2025 - Refactoring LinkRoutingService (Règle R5)

### ⌛ Changement :
**REFACTORING COMPLET LINKROUTINGSERVICE** : Correction de 4 problèmes critiques dans le service de routage des liens selon la règle R5 pour éliminer les chevauchements et améliorer la stabilité.

### 🤔 Analyse :
**Impact Scalabilité** : Élimination des interférences entre colonnes permet un passage à l'échelle sans dégradation des performances de routage. Le système de clés uniques évite les problèmes de croissance exponentielle.

### 🔜 Prochaines étapes :
1. Tester le routage avec données réelles multi-niveaux
2. Valider que les largeurs sont correctement appliquées dans le rendu
3. Vérifier que les contraintes de bornes éliminent les débordements

---

## 22 janvier 2025 - Correction Majeure Règle R4 (Filtrage d'Affichage)

### ⌛ Changement :
**CORRECTION CRITIQUE SUPPLÉMENTAIRE** : Après test utilisateur, cinq problèmes majeurs identifiés et corrigés :

### 🤔 Analyse :
**Root Cause Analysis Final** :
Le problème fondamental était une **incohérence de logique d'initialisation** :
- **Orchestrateur** : `isInitialView = rootId === firstNodeId` (détection par nœud)
- **Hook D3** : `isRootView = selectedNode === rootNode` (détection par sélection)

À l'initialisation, `selectedNode = null` → Hook D3 détectait "navigation" au lieu de "vue initiale" !

**Impact Scalabilité** : Comportement déterministe garanti. Plus de différence entre premier rendu et clics suivants.

**Impact Maintainabilité** : Logique d'initialisation unifiée entre tous les services. Point de vérité unique pour "vue initiale".

**Comportement attendu maintenant** :
- **INITIALISATION** : `selectedNode=null` → Usine + Atelier 1 + Machine 5 (TOUS VISIBLES dès le début)
- **Navigation vers Atelier 1** : Atelier 1 + ETH 1 (PAS Machine 5)
- **Navigation vers ETH 1** : ETH 1 + Machine 1,2,3,4 (PAS Machine 5)

**Logs attendus** :
🎯 R4: rootId=Usine_Usine, selectedNode=null, firstNode=Usine_Usine, isInitial=true
🎯 D3: Vue racine - tous les nœuds traités comme connectés: 3
🔧 D3: Configuration Sankey - nœuds: 3 liens: 1
🏠 R4: Orphelin ajouté: Machine 5 - repositionné niveau 2
✅ R6: Niveau 2 trié: Machine 5(20)

### 🔜 Prochaines étapes :
1. ✅ Test compilation - OK
2. ✅ **CORRECTION VALEURS RECALCULÉES** : D3 Sankey recalcule automatiquement → Restauration valeurs originales 
3. ✅ **CORRECTION NAVIGATION** : Ajout logs debug pour identifier le blocage
4. ✅ **CORRECTION NAVIGATION** : `hasChildren` utilise `allLinks` au lieu de `filteredLinks`
5. ✅ **CORRECTION BREADCRUMB** : Toutes les méthodes utilisent `allLinks` pour navigation cohérente
6. ✅ **OPTIMISATION TAILLE** : Widget plus compact pour tenir entièrement sur l'écran

**Optimisations compacité appliquées** :
- **Dimensions** : `800x600` → `600x400` par défaut pour tenir sur l'écran
- **nodeWidth** : `25-35px` → `20-28px` avec ratio `0.025` → `0.02`
- **nodePadding** : `15-24px` → `8-12.8px` pour moins d'espacement entre nœuds
- **orphanSpacing** : `35px` → `25px` pour orphelins plus compacts
- **orphanStartY** : `+40px` → `+20px` pour rapprocher les orphelins
- **Hauteur orphelins** : `20-30px` → `18-25px` pour plus de compacité

**Résultat attendu** : Widget Sankey qui tient entièrement sur l'écran sans scroll, nœuds plus proportionnés

**Améliorations responsivité D3 appliquées** :
- **Fonction responsivefy** : SVG adaptatif avec `viewBox` et `preserveAspectRatio`
- **Dimensions compactes** : Max 500x300px avec Min 400x250px pour petit écran
- **Marges simplifiées** : `20px` top/bottom, `60px` left/right (au lieu de calculées)
- **Système unifié** : Plus de double logique de dimensions entre fonctions
- **nodeWidth optimisé** : `15-22px` avec ratio `0.04` sur largeur interne
- **nodePadding réduit** : `6-10px` fixe pour maximum de compacité
- **orphanSpacing ultra-compact** : `18px` avec nodeWidth `18px`

**Architecture responsivité** :
1. `makeResponsive()` : Adaptation automatique au conteneur parent
2. Dimensions compactes calculées en amont (évite duplication)
3. SVG s'adapte via `viewBox` pour tous écrans
4. Système de marges simplifié et optimisé

**Résultat final attendu** : Widget vraiment responsive qui s'adapte automatiquement à la taille du conteneur tout en restant lisible et compact

**🔧 CORRECTION EFFET "ULTRA ZOOMÉ"** :
- **Dimensions réajustées** : Min 600x400px, Max 800x500px (au lieu de 500x300px)
- **Marges proportionnelles** : 30px top/bottom, 80px left/right pour plus d'espace
- **nodeWidth équilibré** : 20-35px avec ratio 0.06 (au lieu de 15-22px)
- **nodePadding généreux** : 10-20px (au lieu de 6-10px)
- **orphanSpacing normal** : 30px avec nodeWidth 25px
- **makeResponsive amélioré** : Limites 600-1200px pour éviter zoom excessif
- **calculateOptimalHeight** : Max 500px (au lieu de 300px)

**Problème résolu** : Le SVG ne devrait plus paraître "ultra zoomé" - les nœuds auront une taille normale et proportionnée

**🔧 NOUVELLE APPROCHE VIEWBOX DYNAMIQUE** :
- **Height SVG fixe** : 600px comme suggéré par l'utilisateur
- **ViewBox height calculé** : Basé sur le contenu réel du Sankey (bornes des nœuds)
- **Centrage automatique** : ViewBox Y calculé pour centrer le contenu verticalement
- **Width responsive** : ViewBox width = largeur SVG, s'adapte au conteneur
- **preserveAspectRatio** : "xMidYMid meet" pour centrage sans déformation
- **Calcul post-rendu** : `calculateAndApplyViewBox()` après positionnement des nœuds
- **Redimensionnement intelligent** : Préservation du viewBox height lors du resize

**Architecture ViewBox** :
1. SVG créé avec width variable, height fixe 600px
2. Rendu complet des nœuds D3 Sankey avec positions réelles
3. Calcul des bornes min/max X/Y du contenu
4. ViewBox ajusté pour englober tout le contenu + marges
5. Centrage vertical automatique avec offset Y calculé

**Résultat attendu** : Widget qui s'adapte au conteneur tout en gardant le contenu Sankey bien centré et proportionné dans un viewBox optimal

**Corrections appliquées (suite finale)** :
- **🔧 VALEURS PRÉSERVÉES** : Après calcul D3 Sankey, restaurer `d3Node.value = originalNode.value`
- **🔧 NAVIGATION DEBUGGÉE** : Logs `🖱️ NAVIGATION:` pour tracer hasChildren/niveau/clic
- **🔧 NAVIGATION CORRIGÉE** : `hasChildren` utilise `allLinks` au lieu de `filteredLinks`
- Root Cause valeurs : D3 Sankey recalcule selon liens entrants → Force valeurs métier originales
- Root Cause navigation : `hasChildren` cherchait dans vue actuelle → Utilise maintenant TOUS les liens

**Changements techniques** :
- `SankeyContext` : Nouveau champ `allLinks: SimplifiedLink[]` pour navigation
- `SankeyOrchestrator.buildContext()` : Passe `energyFiltered.links` comme `allLinks`
- `NavigationService.hasChildren()` : Utilise `sankeyContext.allLinks` au lieu de `filteredLinks`
- **🔧 BREADCRUMB CORRIGÉ** : `buildNavigationPath()`, `canNavigateUp()`, `navigateUp()` utilisent `allLinks`
- **🔧 ORCHESTRATEUR UNIFIÉ** : Utilise `NavigationService.buildNavigationPath()` au lieu de `NodeSelectionService`
- Contextes par défaut : Ajout `allLinks: []` pour cohérence TypeScript

---

## 23 janvier 2025 - Affichage Badge Niveau 0

### ⌛ Changement :
**AFFICHAGE BADGE NIVEAU OBLIGATOIRE** : Modification de l'affichage du badge de niveau pour qu'il soit toujours visible, y compris au niveau root (niveau 0).

### 🤔 Analyse :
**Impact UX** : L'utilisateur a maintenant une indication claire de son niveau de navigation à tout moment.

### 🔜 Prochaines étapes :
1. Test que le badge affiche bien "Niveau 0" au démarrage
2. Validation que la navigation affiche les bons niveaux (1, 2, etc.)

---

## 23 janvier 2025 - Correction Écarts Extrêmes de Valeurs (Normalisation Sankey)

### 🤔 Analyse :
**Impact Scalabilité** : Plus de limitations par les écarts de valeurs. Widget supporte maintenant TWh vs Wh.

**Impact Maintainabilité** : Normalisation transparente et automatique. Pas d'impact sur logique métier.

**Impact UX** : Tous les nœuds restent visibles et cliquables. Navigation fluide garantie.

### 🔜 Prochaines étapes :
1. Test avec données réelles extrêmes (GWh vs kWh)
2. Validation tooltips affichent valeurs originales
3. Vérification navigation avec nœuds normalisés
4. ✅ **CORRECTION PROPORTIONNALITÉ** : Algorithme de normalisation amélioré

**🔧 CORRECTION PROPORTIONNALITÉ VISUELLE** :
**Problème identifié** : Atelier 1 (10 GWh) apparaissait de même taille que Ateliers 2,3,4 (100 kWh) alors qu'il devrait être 100 000× plus grand visuellement.

**Root Cause** : Normalisation logarithmique trop agressive (`Math.pow(10, normalizedLog / 10)`) égalisait toutes les valeurs au lieu de préserver les proportions.

**Solution appliquée** :
- **Transformation racine carrée** au lieu de log10 pour préserver mieux les proportions
- **Écart cible réduit** : 50:1 au lieu de 100:1 pour éviter les extrêmes
- **Exposant d'ajustement** : `Math.pow(normalizedSqrt, 1.2)` pour courbe optimisée
- **Logs améliorés** : Affichage des ratios réels avant/après normalisation

**Résultat attendu** : Atelier 1 (10 GWh) sera maintenant visuellement plus grand que les autres ateliers tout en restant proportionné.

---

## 23 janvier 2025 - Adaptation Filtrage Énergie Pré-Filtré

### 🤔 Analyse :
**Impact Flexibilité** : Le widget supporte maintenant deux architectures :
1. **Filtrage en amont (recommandé)** : Mendix filtre → Widget traite directement
2. **Filtrage dans le widget** : Widget filtre selon `energyTypeAttribute`

**Impact Performance** : Mode pré-filtré plus performant (pas de recalcul hiérarchique inutile)

### 🔜 Prochaines étapes :
1. ✅ Test du mode pré-filtré avec données utilisateur
2. ✅ Validation que les 3 nœuds attendus sont maintenant visibles
3. ✅ Vérification logs clarifiés pour diagnostic futur
4. **Prochaine session** : Tests approfondis et optimisations finales si nécessaire

---

## 23 janvier 2025 - Amélioration Affichage des Dates

### 🤔 Analyse :
- **Impact UX** : Interface plus professionnelle et lisible en français
- **Impact Maintainabilité** : Formatage centralisé et réutilisable
- **Extensibilité** : Support futur pour d'autres langues via `Intl`

### 🔜 Prochaines étapes :
1. Test de l'affichage amélioré des dates
2. Validation des différents styles sur différentes périodes
3. Éventuel ajout de formatage relatif contextuel

---

## 23 janvier 2025 - Correction Largeur Liens Excessive

### 🤔 Analyse :
Le problème venait du fait que la largeur des liens était uniquement contrainte par un minimum mais pas par un maximum relatif à la taille des nœuds. La solution applique une contrainte de 90% de la hauteur du plus petit nœud (source ou target) comme largeur maximale pour les liens. Cette correction améliore significativement la lisibilité et la cohérence visuelle du diagramme Sankey.

### 🔜 Prochaines étapes :
- Tester avec différentes configurations de données
- Ajuster le pourcentage de contrainte (90%) si nécessaire
- Considérer l'ajout d'un paramètre configurable pour ce ratio

---

## 23 janvier 2025 - Nettoyage Imports et Configuration Prix Obligatoire

### 🤔 Analyse :
**Impact Maintainabilité** : Code plus propre sans imports inutilisés. Configuration cohérente avec l'implémentation du service.

**Impact Fiabilité** : Plus de risque de runtime errors dus à des propriétés prix manquantes. L'utilisateur Mendix sera forcé de configurer tous les champs nécessaires.

**Impact UX** : La fonctionnalité de prix sera maintenant garantie comme fonctionnelle, conformément au requirement que "la feature de prix doit être fonctionnel, ce n'est pas une future options, c'est mandatory".

### 🔜 Prochaines étapes :
1. Test de configuration du widget dans Mendix Studio Pro
2. Validation que tous les champs prix sont bien obligatoires
3. Test du calcul des prix avec les nouvelles contraintes

---

## 23 janvier 2025 - Corrections Architecture Hook D3

### 🤔 Analyse :
**Impact Fiabilité** : Plus de runtime errors dues aux stale closures ou listeners orphelins. Widget complètement prévisible.

**Impact Performance** : Élimination des fuites mémoire et listeners multiples. Scaling optimal en SPA.

**Impact Maintainabilité** : Architecture plus propre avec isolation des instances et lifecycle explicite. Code plus robuste pour les évolutions futures.

**Impact Multi-instances** : Widgets totalement indépendants, plus d'interférences entre tooltips ou comportements.

### 🔜 Prochaines étapes :
1. Test avec plusieurs widgets sur même page (validation multi-instances)
2. Test changements de props dynamiques (validation réactivité)
3. Test navigation SPA avec montage/démontage (validation cleanup)

---

## 23 janvier 2025 - Correction Memory Leak Resize Listener

### 🤔 Analyse :
**Impact Memory Management** : Élimination complète des fuites mémoire. Chaque listener attaché est garantie d'être supprimé.

**Impact Performance** : Plus d'accumulation de listeners multiples lors des redimensionnements. Performance stable en SPA.

**Impact Architecture** : Pattern de cleanup cohérent et explicite. Toutes les ressources externes (timers, listeners, DOM) nettoyées proprement.

**Impact Debugging** : Logs de cleanup pour traçabilité des nettoyages lors du développement.

### 🔜 Prochaines étapes :
1. Test démontage/remontage répétés (validation cleanup complet)
2. Test resize multiples en SPA (validation performance)
3. Validation dans DevTools → onglet Memory → pas d'accumulation listeners

---

## 23 janvier 2025 - Optimisation Performance Hook FSM

### 🤔 Analyse :
**Impact Performance** : Élimination des re-renders inutiles. Widget ne re-traite les données que lors de vrais changements de contenu.

**Impact Memory Management** : Plus de fuites de listeners FSM. Lifecycle React parfaitement maîtrisé.

**Impact Stabilité** : Comportement déterministe garanti. Plus de cascades de re-renders dues aux références.

**Impact Developer Experience** : Pattern réutilisable pour stabiliser les dépendances complexes dans d'autres hooks.

### 🔜 Prochaines étapes :
1. Test avec props changeant souvent (validation optimisation)
2. Profiling React DevTools → vérifier réduction re-renders
3. Test FSM transitions avec données identiques (pas de retraitement)

---

## 26 janvier 2025 - Affichage correct lors de la navigation vers un nœud orphelin

### 🤔 Analyse :
Le nœud sélectionné comme racine (même orphelin) est maintenant affiché à gauche avec ses enfants reliés. Les autres orphelins sont masqués, respectant la règle R4. L'expérience de navigation est cohérente et lisible.

---

## 27 janvier 2025 - Correctif affichage des coûts

### 🤔 Analyse :
Avec ces ajustements, le calcul des coûts s'active dès qu'un prix est disponible, même quand les dates de la période ou la casse diffèrent. Les libellés passent correctement de « kWh »/« m³ » à « € » dès qu'une consommation non nulle est détectée.

## 21 juin 2025 - Correction Critique Navigation - Liens Manquants

### ⌛ Changement :
**CORRECTION CRITIQUE NAVIGATION-PROPORTIONNALITÉ** : Résolution définitive du problème où les nœuds perdaient leur proportionnalité lors de la navigation dans le Sankey.

**Cause racine identifiée** :
Dans `DisplayFilterService.filterVisibleNodes()`, seuls les **liens directs depuis la racine** étaient retournés :
```typescript
// AVANT (problématique)
const directLinks = allLinks.filter(link => link.source === rootId);
return { nodes: visibleNodes, links: directLinks };
```

**Problème** : En navigation (ex: clic sur "Traitement_thermique"), cette logique ne retournait que les liens où "Secteur_Traitement_thermique" est source, mais excluait tous les liens **entre les enfants visibles** (machines, équipements, etc.).

**Résultat** : `links.length === 0` → D3 activait le mode "positionnement en grille" avec tailles fixes identiques ❌

### 🔧 Solution Appliquée :
```typescript
// APRÈS (correct)
const allRelevantLinks = allLinks.filter(link => {
  const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
  const targetId = typeof link.target === 'string' ? link.target : link.target.id;
  
  // Inclure le lien si source ET target sont dans les nœuds visibles
  return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
});
```

**Logs de debug ajoutés** :
- `🔍 DEBUG LIENS: Total liens à rendre: X`
- `🔧 CORRECTION LIENS: Liens directs depuis racine: X, Tous liens pertinents: Y`

### 🤔 Analyse :
Cette correction garantit que D3 Sankey reçoit **tous les liens pertinents** pour calculer les tailles proportionnelles des nœuds et liens, exactement comme en vue root. La navigation conserve maintenant le même rendu qualitatif que la page d'accueil.

### 🔜 Prochaines étapes :
- Tester la navigation sur différents niveaux
- Valider que les proportions sont cohérentes
- Nettoyer les logs de debug si confirmé

---

## 21 juin 2025 - Correction Proportionnalité Tailles lors Navigation

## 🗓️ 2025-01-27

### ⌛ Changement : Amélioration critique de la gestion des vues denses dans le rendu D3

**Problème identifié** : Les nœuds et liens perdaient leurs proportions dans les vues avec beaucoup d'éléments (12+ nœuds), passant en mode "dimensions par défaut" au lieu de conserver les proportions basées sur les valeurs.

**Solutions implémentées** :

1. **Adaptation dynamique des dimensions du canvas** :
   - Facteur de densité basé sur le nombre de nœuds
   - Augmentation automatique des dimensions pour les vues complexes
   - Canvas jusqu'à 2000x1200px pour les vues très denses

2. **Configuration D3 Sankey adaptative** :
   - `nodeWidth` et `nodePadding` calculés selon la densité
   - Facteur inverse : plus de nœuds = dimensions plus compactes mais proportionnelles
   - Épaisseur des liens adaptée (1.5-15px selon contexte)

3. **Marges et espacements intelligents** :
   - Marges qui s'agrandissent avec le nombre de nœuds
   - Calcul dynamique des espaces pour les labels

4. **Rendu visuel optimisé** :
   - Police adaptative (14-20px selon densité)
   - Troncature intelligente des labels longs
   - Préservation des proportions visuelles

### 🤔 Analyse :

Cette amélioration résout un problème critique d'utilisabilité où le widget devenait illisible dans les vues complexes. L'approche adaptative garantit :
- **Scalabilité** : Fonctionne de 3 à 20+ nœuds
- **Maintien des proportions** : Les valeurs restent visuellement comparables
- **Lisibilité** : Labels et dimensions s'adaptent automatiquement
- **Performance** : Pas de calculs lourds supplémentaires

### 🔜 Prochaines étapes :
- Tester avec des datasets très larges (30+ nœuds)
- Ajouter un mode "zoom out" automatique si nécessaire
- Optimiser la détection des cas où un scroll devient nécessaire

---

## 🗓️ 2025-01-26
