# Guide Complet : Manipulation des Attributs Mendix dans les Widgets

## Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Types d'attributs Mendix](#types-dattributs-mendix)
3. [Structure des Props TypeScript](#structure-des-props-typescript)
4. [Lecture des attributs](#lecture-des-attributs)
5. [Écriture des attributs](#écriture-des-attributs)
6. [Gestion des états et cycle de vie](#gestion-des-états-et-cycle-de-vie)
7. [Validation et gestion d'erreurs](#validation-et-gestion-derreurs)
8. [Actions Mendix](#actions-mendix)
9. [Exemple complet d'implémentation](#exemple-complet-dimplémentation)
10. [Bonnes pratiques](#bonnes-pratiques)

---

## Vue d'ensemble

Dans Mendix, les widgets interagissent avec les données via des **attributs** qui sont des références typées vers les propriétés des entités. Ces attributs suivent un pattern strict de lecture/écriture avec gestion d'états.

### Concepts clés :
- **ValueStatus** : État de l'attribut (Loading, Available, Unavailable)
- **Immutabilité** : Les attributs retournent de nouveaux objets lors des modifications
- **Type safety** : TypeScript assure la cohérence des types
- **Cycle de vie** : Synchronisation avec le moteur Mendix

---

## Types d'attributs Mendix

### 1. Attributs simples
```typescript
// Types de base supportés
EditableValue<string>    // Texte
EditableValue<boolean>   // Booléen
EditableValue<Date>      // Date/DateTime
EditableValue<Big>       // Nombre décimal (Big.js)
EditableValue<number>    // Nombre entier
```

### 2. Attributs d'énumération
```typescript
EditableValue<string>    // Clé de l'énumération
// Les énumérations Mendix sont stockées comme string
```

### 3. Attributs de référence
```typescript
ReferenceValue          // Référence vers une autre entité
ReferenceSetValue       // Référence multiple
```

---

## Structure des Props TypeScript

### Interface principale du widget
```typescript
export interface SaisieContainerProps {
    // Attributs de l'entité principale
    energyAttribute: EditableValue<string>;
    priceAttribute: EditableValue<Big>;
    unitAttribute: EditableValue<string>;
    startDateAttribute: EditableValue<Date>;
    endDateAttribute: EditableValue<Date>;
    
    // DataSource pour l'historique
    historyDataSource: ListValue;
    
    // Attributs des éléments d'historique
    historyEnergyAttribute: ListAttributeValue<string>;
    historyPriceAttribute: ListAttributeValue<Big>;
    historyUnitAttribute: ListAttributeValue<string>;
    historyStartDateAttribute: ListAttributeValue<Date>;
    historyEndDateAttribute: ListAttributeValue<Date>;
    historyCreationDateAttribute: ListAttributeValue<Date>;
    
    // Actions Mendix
    onSaveAction: ActionValue;
    onDeleteAction: ListActionValue;
    
    // Propriétés de style
    backgroundColor?: string;
    textColor?: string;
    style: CSSProperties;
    class: string;
    name: string;
}
```

### Types importants
```typescript
import { 
    ValueStatus, 
    EditableValue, 
    ListValue, 
    ListAttributeValue,
    ListActionValue,
    ActionValue,
    ObjectItem 
} from "mendix";
```

---

## Lecture des attributs

### 1. Vérification du statut
```typescript
// Toujours vérifier le statut avant d'accéder à la valeur
if (energyAttribute?.status === ValueStatus.Available) {
    const value = energyAttribute.value as string;
    console.log("Valeur d'énergie:", value);
}

// États possibles :
// - ValueStatus.Loading : Données en cours de chargement
// - ValueStatus.Available : Données disponibles
// - ValueStatus.Unavailable : Données non disponibles
```

### 2. Lecture avec valeurs par défaut
```typescript
const [selectedEnergy, setSelectedEnergy] = useState<string | undefined>(
    energyAttribute?.status === ValueStatus.Available 
        ? (energyAttribute.value as string) 
        : undefined
);
```

### 3. Lecture d'attributs de liste (DataSource)
```typescript
// Vérifier d'abord le DataSource
if (historyDataSource?.status === ValueStatus.Available && historyDataSource.items) {
    // Parcourir les éléments
    historyDataSource.items.forEach((item: ObjectItem) => {
        // Accéder aux attributs de chaque élément
        const energyValue = historyEnergyAttribute?.get(item)?.value as string;
        const priceValue = historyPriceAttribute?.get(item)?.value as Big;
        const dateValue = historyStartDateAttribute?.get(item)?.value as Date;
        
        console.log("Item:", { energyValue, priceValue, dateValue });
    });
}
```

---

## Écriture des attributs

### 1. Vérification des permissions
```typescript
const canEditPrice = priceAttribute?.status === ValueStatus.Available && 
                     !priceAttribute.readOnly;

if (!canEditPrice) {
    console.warn("Prix non modifiable");
    return;
}
```

### 2. Écriture simple
```typescript
// Pour un string/enum
energyAttribute.setValue("Elec");

// Pour un nombre (Big.js requis pour les décimaux)
import Big from "big.js";
const priceValue = new Big("10.50");
priceAttribute.setValue(priceValue);

// Pour une date
const selectedDate = new Date();
startDateAttribute.setValue(selectedDate);

// Pour un booléen
booleanAttribute.setValue(true);
```

### 3. Validation avant écriture
```typescript
const handleSave = useCallback(() => {
    // 1. Validation de l'action
    if (!onSaveAction || !onSaveAction.canExecute) {
        showToast("Action non disponible", "error");
        return;
    }
    
    // 2. Validation des champs requis
    if (!selectedEnergy) {
        showToast("Veuillez sélectionner un type d'énergie", "error");
        return;
    }
    
    // 3. Validation du format des données
    let priceValue: Big;
    try {
        priceValue = new Big(price.trim());
        if (priceValue.lt(0)) {
            showToast("Le prix ne peut pas être négatif", "error");
            return;
        }
    } catch (error) {
        showToast("Format de prix invalide", "error");
        return;
    }
    
    // 4. Vérification des permissions d'écriture
    const canEditPrice = priceAttribute?.status === ValueStatus.Available && 
                         !priceAttribute.readOnly;
    if (!canEditPrice) {
        showToast("Prix non modifiable", "error");
        return;
    }
    
    // 5. Écriture des attributs
    energyAttribute.setValue(selectedEnergy);
    priceAttribute.setValue(priceValue);
    unitAttribute.setValue(selectedUnit);
    startDateAttribute.setValue(dateRange[0].startDate);
    endDateAttribute.setValue(dateRange[0].endDate);
    
    // 6. Exécution de l'action Mendix
    onSaveAction.execute();
    
    // 7. Feedback utilisateur
    showToast("Données enregistrées avec succès", "success");
}, [/* dépendances */]);
```

---

## Gestion des états et cycle de vie

### 1. Synchronisation avec useEffect
```typescript
// Synchronisation des props Mendix vers l'état local
useEffect(() => {
    if (priceAttribute?.status === ValueStatus.Available && priceAttribute.value) {
        setPrice(priceAttribute.value.toString());
    } else {
        setPrice("");
    }
}, [priceAttribute?.status, priceAttribute?.value]);

// Synchronisation des dates
useEffect(() => {
    const start = startDateAttribute?.status === ValueStatus.Available 
        ? startDateAttribute.value 
        : null;
    const end = endDateAttribute?.status === ValueStatus.Available 
        ? endDateAttribute.value 
        : null;
    
    const validStartDate = start instanceof Date ? start : new Date();
    const validEndDate = end instanceof Date ? end : new Date();

    setDateRange([{
        startDate: validStartDate,
        endDate: validEndDate,
        key: 'selection'
    }]);
}, [
    startDateAttribute?.status, 
    startDateAttribute?.value, 
    endDateAttribute?.status, 
    endDateAttribute?.value
]);
```

### 2. Gestion du loading
```typescript
const [isLoading, setIsLoading] = useState<boolean>(true);

useEffect(() => {
    const dataIsLoading = 
        energyAttribute?.status === ValueStatus.Loading || 
        priceAttribute?.status === ValueStatus.Loading || 
        unitAttribute?.status === ValueStatus.Loading ||
        startDateAttribute?.status === ValueStatus.Loading || 
        endDateAttribute?.status === ValueStatus.Loading ||
        (historyDataSource && historyDataSource.status === ValueStatus.Loading);
        
    setIsLoading(dataIsLoading === true);
    
    if (!dataIsLoading) {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }
}, [
    energyAttribute?.status, 
    priceAttribute?.status, 
    // ... autres dépendances
]);
```

---

## Validation et gestion d'erreurs

### 1. Validation métier complexe
```typescript
// Exemple : Validation de chevauchement de dates
useEffect(() => {
    if (!historyDataSource?.items || !dateRange[0]?.startDate || !selectedEnergy) {
        setDateOverlapWarning("");
        return;
    }

    const newStartDate = startOfDay(dateRange[0].startDate);
    const newEndDate = startOfDay(dateRange[0].endDate);

    const overlaps = historyDataSource.items.some((item: ObjectItem) => {
        const itemEnergy = historyEnergyAttribute?.get(item)?.value as string;
        if (itemEnergy !== selectedEnergy) return false;

        const existingStart = historyStartDateAttribute?.get(item)?.value as Date;
        const existingEnd = historyEndDateAttribute?.get(item)?.value as Date;

        if (!existingStart || !existingEnd) return false;

        return areIntervalsOverlapping(
            { start: newStartDate, end: newEndDate },
            { start: startOfDay(existingStart), end: startOfDay(existingEnd) },
            { inclusive: true }
        );
    });

    if (overlaps) {
        setDateOverlapWarning("Attention: La période chevauche une période existante.");
    } else {
        setDateOverlapWarning("");
    }
}, [selectedEnergy, dateRange, historyDataSource, /* autres dépendances */]);
```

### 2. Gestion d'erreurs avec Toast
```typescript
const showToast = (message: string, type: "success" | "error" | "info" = "info"): void => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
    
    setTimeout(() => {
        setToastOpen(false);
    }, 3000);
};
```

---

## Actions Mendix

### 1. Actions simples
```typescript
// Vérification et exécution
if (onSaveAction && onSaveAction.canExecute) {
    onSaveAction.execute();
} else {
    console.warn("Action de sauvegarde non disponible");
}
```

### 2. Actions sur des éléments de liste
```typescript
// Pour les actions qui s'appliquent à un élément spécifique d'une liste
const handleDeleteClick = (item: HistoryItem) => {
    if (props.onDeleteAction) {
        const deleteActionInstance = props.onDeleteAction.get(item.originalObjectItem);
        if (deleteActionInstance.canExecute) {
            deleteActionInstance.execute();
            showToast("Élément supprimé avec succès", "success");
        } else {
            showToast("Impossible de supprimer l'élément", "error");
        }
    }
};
```

---

## Exemple complet d'implémentation

### Widget simple de modification d'attribut
```typescript
import React, { useState, useEffect, useCallback } from "react";
import { ValueStatus, EditableValue, ActionValue } from "mendix";
import Big from "big.js";

interface SimpleWidgetProps {
    nameAttribute: EditableValue<string>;
    priceAttribute: EditableValue<Big>;
    onSaveAction: ActionValue;
}

export function SimpleWidget(props: SimpleWidgetProps): React.ReactElement {
    const { nameAttribute, priceAttribute, onSaveAction } = props;
    
    // États locaux
    const [name, setName] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    // Synchronisation des props vers l'état local
    useEffect(() => {
        if (nameAttribute?.status === ValueStatus.Available) {
            setName(nameAttribute.value || "");
        }
    }, [nameAttribute?.status, nameAttribute?.value]);
    
    useEffect(() => {
        if (priceAttribute?.status === ValueStatus.Available) {
            setPrice(priceAttribute.value?.toString() || "");
        }
    }, [priceAttribute?.status, priceAttribute?.value]);
    
    // Gestion du loading
    useEffect(() => {
        const loading = nameAttribute?.status === ValueStatus.Loading ||
                       priceAttribute?.status === ValueStatus.Loading;
        setIsLoading(loading);
    }, [nameAttribute?.status, priceAttribute?.status]);
    
    // Fonction de sauvegarde
    const handleSave = useCallback(() => {
        // Validation de l'action
        if (!onSaveAction?.canExecute) {
            alert("Impossible de sauvegarder");
            return;
        }
        
        // Validation des champs
        if (!name.trim()) {
            alert("Nom requis");
            return;
        }
        
        // Validation et conversion du prix
        let priceValue: Big;
        try {
            priceValue = new Big(price);
            if (priceValue.lt(0)) {
                alert("Prix invalide");
                return;
            }
        } catch {
            alert("Format de prix invalide");
            return;
        }
        
        // Vérification des permissions
        if (nameAttribute?.status === ValueStatus.Available && !nameAttribute.readOnly) {
            nameAttribute.setValue(name);
        }
        
        if (priceAttribute?.status === ValueStatus.Available && !priceAttribute.readOnly) {
            priceAttribute.setValue(priceValue);
        }
        
        // Exécution de l'action
        onSaveAction.execute();
        
    }, [name, price, nameAttribute, priceAttribute, onSaveAction]);
    
    if (isLoading) {
        return <div>Chargement...</div>;
    }
    
    return (
        <div>
            <input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom"
                disabled={nameAttribute?.readOnly}
            />
            <input 
                type="number"
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Prix"
                disabled={priceAttribute?.readOnly}
            />
            <button onClick={handleSave}>
                Sauvegarder
            </button>
        </div>
    );
}
```

---

## Bonnes pratiques

### 1. Gestion des états
- ✅ Toujours vérifier `ValueStatus` avant d'accéder aux valeurs
- ✅ Utiliser des valeurs par défaut appropriées
- ✅ Gérer les états de loading explicitement
- ❌ Ne jamais accéder directement à `attribute.value` sans vérification

### 2. Permissions et sécurité
- ✅ Vérifier `readOnly` avant toute modification
- ✅ Vérifier `canExecute` avant d'exécuter une action
- ✅ Valider côté client ET laisser Mendix valider côté serveur
- ❌ Assumer que les attributs sont toujours modifiables

### 3. Performance
- ✅ Utiliser `useCallback` pour les fonctions de manipulation
- ✅ Optimiser les dépendances des `useEffect`
- ✅ Éviter les rendus inutiles avec `useMemo`
- ❌ Recréer des fonctions à chaque rendu

### 4. Types et validation
- ✅ Utiliser TypeScript strictement
- ✅ Valider les formats de données (dates, nombres)
- ✅ Gérer les erreurs explicitement
- ❌ Faire confiance aux données sans validation

### 5. Actions Mendix
- ✅ Fournir un feedback utilisateur après les actions
- ✅ Gérer les cas d'échec des actions
- ✅ Réinitialiser les formulaires après succès si approprié
- ❌ Oublier de vérifier `canExecute`

### 6. Synchronisation
- ✅ Synchroniser les props Mendix vers l'état local
- ✅ Gérer les changements externes des données
- ✅ Nettoyer les timers et effets de bord
- ❌ Créer des boucles infinies de synchronisation

---

## Conclusion

La manipulation d'attributs Mendix dans les widgets suit un pattern strict mais puissant qui garantit la cohérence des données et la sécurité. La clé du succès réside dans :

1. **Respect du cycle de vie** : ValueStatus → Validation → Modification → Action
2. **Gestion rigoureuse des erreurs** : Toujours prévoir les cas d'échec
3. **Type safety** : Utiliser TypeScript pour éviter les erreurs
4. **Feedback utilisateur** : Informer l'utilisateur des succès et échecs
5. **Performance** : Optimiser les rendus et synchronisations

Cette approche garantit des widgets robustes, maintenables et conformes aux standards Mendix. 