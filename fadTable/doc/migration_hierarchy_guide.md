# Guide de Migration - Hiérarchie Flexible

## 🎯 **Aperçu Rapide**

Le widget FAD Table supporte maintenant une **hiérarchie flexible** permettant de configurer jusqu'à **10 niveaux** au lieu de la structure fixe Secteur/Atelier/Machine.

## 🔄 **Modes Disponibles**

### Mode Legacy (Existant) ✅
- Structure fixe : `Secteur` → `Atelier` → `Machine`
- Aucun changement requis dans vos projets existants
- Fonctionne automatiquement avec l'ancienne configuration

### Mode Flexible (Nouveau) 🆕  
- Jusqu'à 10 niveaux configurables
- Noms personnalisables pour chaque niveau
- Couleurs configurables par niveau

---

## 📋 **Guide de Migration Étape par Étape**

### **Étape 1 : Identifier Votre Structure Cible**

Définissez votre nouvelle hiérarchie. Exemples :

#### Exemple A : 5 Niveaux  
```
Site → Bâtiment → Étage → Zone → Capteur
```

#### Exemple B : 4 Niveaux
```
Région → Site → Secteur → Machine  
```

#### Exemple C : 2 Niveaux
```
Département → Équipement
```

### **Étape 2 : Préparer Vos Données**

Assurez-vous que votre entité NPE (Non-Persistante) contient :

```
Anciens attributs (legacy) :
- SecteurName (String) 
- AtelierName (String)
- MachineName (String)

Nouveaux attributs (flexible) :
- Niveau1Name (String) // Ex: "Site Paris"
- Niveau2Name (String) // Ex: "Bâtiment A" 
- Niveau3Name (String) // Ex: "Étage 3"
- ... jusqu'à Niveau10Name si nécessaire
- NomTerminal (String)  // Ex: "Capteur-001"
```

### **Étape 3 : Configuration dans Mendix Studio**

#### **A. Activer le Mode Flexible**
1. Ouvrir les propriétés du widget FAD Table
2. Cocher `✅ Utiliser la hiérarchie flexible`

#### **B. Configurer les Niveaux**
Pour chaque niveau désiré :

```
Niveau 1 :
- Niveau 1 - Nom : "Site"
- Niveau 1 - Attribut : [Sélectionner votre attribut]
- Niveau 1 - Obligatoire : ☐ (optionnel)
- Niveau 1 - Couleur : "#38a13c" (optionnel)

Niveau 2 :
- Niveau 2 - Nom : "Bâtiment" 
- Niveau 2 - Attribut : [Sélectionner votre attribut]
- Niveau 2 - Obligatoire : ☐ (optionnel)
- Niveau 2 - Couleur : "#3b82f6" (optionnel)

... continuer pour vos autres niveaux
```

#### **C. Configurer le Niveau Terminal**
```
Nom Nœud Terminal (NPE) : [Sélectionner l'attribut du dernier niveau]
```

### **Étape 4 : Laisser Vides les Niveaux Non Utilisés**

❗ **Important** : Laissez vides les niveaux que vous n'utilisez pas !

```
Si vous voulez 3 niveaux :
✅ Niveau 1 : "Site"  
✅ Niveau 2 : "Bâtiment"
✅ Niveau 3 : VIDE → Le niveau terminal sera utilisé
❌ Niveaux 4-10 : VIDES (ignorés automatiquement)
```

---

## 🎨 **Configuration des Couleurs (Optionnel)**

Par défaut, des couleurs sont assignées automatiquement :
- Niveau 1 : `#38a13c` (Vert)
- Niveau 2 : `#3b82f6` (Bleu)  
- Niveau 3 : `#f59e0b` (Orange)
- Niveau 4 : `#ef4444` (Rouge)
- etc.

Pour personnaliser, utiliser des codes couleur hexadécimaux :
```
Niveau 1 - Couleur : "#38a13c"
Niveau 2 - Couleur : "#1e40af"  
Niveau 3 - Couleur : "#dc2626"
```

---

## ✅ **Exemples de Configuration Complète**

### **Exemple 1 : Site → Bâtiment → Capteur**
```
✅ Utiliser la hiérarchie flexible : TRUE

Niveau 1 - Nom : "Site"
Niveau 1 - Attribut : SiteName
Niveau 1 - Obligatoire : FALSE
Niveau 1 - Couleur : "#38a13c"

Niveau 2 - Nom : "Bâtiment"  
Niveau 2 - Attribut : BuildingName
Niveau 2 - Obligatoire : FALSE
Niveau 2 - Couleur : "#3b82f6"

Niveaux 3-10 : VIDES

Nom Nœud Terminal : CapteurName
```

### **Exemple 2 : Vue Plate (Machines Seulement)**
```
✅ Utiliser la hiérarchie flexible : TRUE

Niveaux 1-10 : TOUS VIDES

Nom Nœud Terminal : MachineName
```

---

## 🚀 **Test et Validation**

### **Vérification Visuelle**
1. L'onglet hiérarchique affiche : `Vue Hiérarchique (X niveaux)`
2. Le placeholder de recherche mentionne vos noms de niveaux
3. Les couleurs de bordure correspondent à votre configuration
4. Le badge affiche le bon nombre de niveaux

### **Tests Fonctionnels**
- ✅ Expansion/réduction des nœuds
- ✅ Recherche avec développement automatique
- ✅ Export des données hiérarchiques  
- ✅ Calcul des totaux par niveau
- ✅ Compatibilité comparaison N-1

---

## 🔧 **Dépannage**

### **Problème : "Aucun niveau détecté"**
- Vérifiez que `Utiliser la hiérarchie flexible = TRUE`
- Assurez-vous d'avoir au moins un couple `Nom + Attribut` configuré

### **Problème : "Données manquantes"**  
- Vérifiez que vos attributs NPE contiennent bien les valeurs
- Testez avec `Niveau X - Obligatoire = FALSE` pour éviter les orphelins

### **Problème : "Styles incorrects"**
- Les couleurs personnalisées doivent être au format `#RRGGBB`
- Rechargez la page après modification des couleurs

---

## 🎯 **Avantages du Mode Flexible**

✅ **Évolutivité** : Adapte votre hiérarchie sans modification du code  
✅ **Réutilisabilité** : Le même widget pour différents cas d'usage  
✅ **Maintenance** : Configuration centralisée dans Mendix Studio  
✅ **Performance** : Génération optimisée des styles et de la hiérarchie  
✅ **UX** : Interface adaptative selon votre configuration

---

*📝 Guide créé le 22 Décembre 2024 - Version 1.0* 