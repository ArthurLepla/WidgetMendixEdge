/**
 * Types et interfaces pour la hiérarchie flexible
 * Permet de supporter x niveaux hiérarchiques configurables
 */

import { ListAttributeValue } from "mendix";
import { FadTableContainerProps } from "../../typings/FadTableProps";

// Configuration d'un niveau hiérarchique
export interface HierarchyLevelConfig {
    index: number; // Index du niveau (1, 2, 3...)
    id: string; // ID unique généré (level_1, level_2...)
    name: string; // Nom d'affichage ("Secteur", "Site", "Bâtiment")
    attribute: ListAttributeValue<string>; // Attribut Mendix pour ce niveau
    isRequired: boolean; // Si ce niveau est obligatoire
    color: string; // Couleur de bordure pour le style
}

// Configuration complète de la hiérarchie
export interface FlexibleHierarchyConfig {
    levels: HierarchyLevelConfig[]; // Liste des niveaux configurés
    leafNodeName: string; // Nom du niveau terminal ("Machine", "Capteur")
    leafNodeAttribute: ListAttributeValue<string>; // Attribut du niveau terminal
    useFlexibleMode: boolean; // Mode flexible activé ou mode legacy
}

// Nœud générique pour la hiérarchie flexible
export interface FlexibleHierarchicalNode {
    id: string;
    levelId: string; // ID du niveau (level_1, level_2, leaf)
    levelIndex: number; // Position dans la hiérarchie (0, 1, 2...)
    levelName: string; // Nom du niveau ("Secteur", "Site")
    name: string; // Nom de l'élément ("Secteur A", "Site Paris")
    data: any | null; // Données originales (null pour nœuds intermédiaires)
    children: FlexibleHierarchicalNode[];
    isExpanded: boolean;
    parent?: FlexibleHierarchicalNode;

    // Styles dynamiques
    styles: {
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
        fontWeight: number;
    };

    // Totaux calculés
    monthlyTotals: { [key: string]: number };
    yearTotal: number;
    previousMonthlyTotals?: { [key: string]: number };
    previousYearTotal?: number;
}

// Utilitaires pour extraire la configuration depuis les props
export const extractHierarchyConfig = (props: FadTableContainerProps): FlexibleHierarchyConfig => {
    const levels: HierarchyLevelConfig[] = [];

    // Couleurs par défaut
    const defaultColors = [
        "#38a13c",
        "#3b82f6",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
        "#84cc16",
        "#f97316",
        "#ec4899",
        "#6366f1"
    ];

    // Extraire les niveaux configurés
    for (let i = 1; i <= 10; i++) {
        const levelName = props[`hierarchyLevel${i}Name` as keyof FadTableContainerProps] as string;
        const levelAttr = props[`hierarchyLevel${i}Attr` as keyof FadTableContainerProps] as ListAttributeValue<string>;
        const levelRequired = props[`hierarchyLevel${i}Required` as keyof FadTableContainerProps] as boolean;
        const levelColor = props[`hierarchyLevel${i}Color` as keyof FadTableContainerProps] as string;

        // Un niveau est configuré SEULEMENT si on a au moins le nom ET l'attribut
        if (levelName && levelName.trim() !== "" && levelAttr) {
            levels.push({
                index: i,
                id: `level_${i}`,
                name: levelName.trim(),
                attribute: levelAttr,
                isRequired: levelRequired || false,
                color: levelColor && levelColor.trim() !== "" ? levelColor.trim() : defaultColors[i - 1]
            });
        }
    }

    // Déterminer le niveau terminal
    const leafNodeName = props.useFlexibleHierarchy ? "Élément Terminal" : "Machine";

    const leafNodeAttribute = props.useFlexibleHierarchy
        ? props.attrLeafNodeName
        : props.attrMachineName || props.attrLeafNodeName;

    return {
        levels,
        leafNodeName,
        leafNodeAttribute,
        useFlexibleMode: props.useFlexibleHierarchy
    };
};

// Vérifier la compatibilité avec le mode legacy
export const isLegacyMode = (props: FadTableContainerProps): boolean => {
    return (
        !props.useFlexibleHierarchy &&
        (props.attrMachineName !== undefined ||
            props.attrAtelierName !== undefined ||
            props.attrSecteurName !== undefined)
    );
};

// Convertir la configuration legacy vers le mode flexible pour compatibilité
export const convertLegacyToFlexible = (props: FadTableContainerProps): FlexibleHierarchyConfig => {
    const levels: HierarchyLevelConfig[] = [];

    // Ajouter Secteur si présent
    if (props.attrSecteurName) {
        levels.push({
            index: 1,
            id: "level_1",
            name: "Secteur",
            attribute: props.attrSecteurName,
            isRequired: false,
            color: "#38a13c"
        });
    }

    // Ajouter Atelier si présent
    if (props.attrAtelierName) {
        levels.push({
            index: 2,
            id: "level_2",
            name: "Atelier",
            attribute: props.attrAtelierName,
            isRequired: false,
            color: "#3b82f6"
        });
    }

    return {
        levels,
        leafNodeName: "Machine",
        leafNodeAttribute: props.attrMachineName || props.attrLeafNodeName,
        useFlexibleMode: false
    };
};

// Générer les styles CSS dynamiques pour les niveaux
export const generateLevelStyles = (config: FlexibleHierarchyConfig): string => {
    let styles = "";

    config.levels.forEach((level, index) => {
        const className = `hierarchy-level-${level.index}`;
        const borderWidth = Math.max(4 - index, 1); // Décroissant : 4px, 3px, 2px, 1px...
        const fontWeight = Math.max(700 - index * 100, 400); // Décroissant : 700, 600, 500, 400...

        styles += `
            .${className} {
                background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
                font-weight: ${fontWeight} !important;
                border-left: ${borderWidth}px solid ${level.color} !important;
            }
        `;
    });

    // Style pour les nœuds terminaux
    styles += `
        .hierarchy-leaf-node {
            border-left: 2px solid #e2e8f0 !important;
        }
    `;

    return styles;
};
