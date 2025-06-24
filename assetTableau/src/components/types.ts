/**
 * Business Domain Types for Asset Tableau Widget
 * Types métier selon l'architecture hexagonale - domaine au centre
 */

import { ListValue, ListAttributeValue, ObjectItem, EditableValue } from "mendix";

export type AssetNodeType = 'Usine' | 'Secteur' | 'Atelier' | 'ETH' | 'Machine';

export interface AssetNode {
    id: string;
    name: string;
    type: AssetNodeType;
    level: number;
    parentId?: string;
    unit?: string;
    modified: boolean;
    validated?: boolean;
    metadata: AssetNodeMetadata;
    children?: AssetNode[];
}

export interface AssetNodeMetadata {
    mendixObject: ObjectItem;
    dataSourceConfig: DataSourceConfig;
    // EditableValue pour les attributs éditables
    editableValues?: {
        name?: EditableValue<string>;
        unit?: EditableValue<string>;
        parent?: EditableValue<string>;
    };
    // Pour l'édition, nous utiliserons l'API mx.data avec l'ObjectItem
}

export interface DataSourceConfig {
    dataSource: ListValue;
    name: string;
    level: number;
    // Attributs principaux (lecture + édition)
    nameAttribute?: ListAttributeValue<string>;
    parentAttribute?: ListAttributeValue<string>;
    unitAttribute?: ListAttributeValue<string>;
}

export interface HierarchyPermissions {
    allowEdit: boolean;
    allowDelete: boolean;
    allowCreate: boolean;
}

export interface WidgetConfiguration {
    mode: 'dev' | 'prod';
    maxLevels: number;
    permissions: HierarchyPermissions;
    showSearch: boolean;
    showFilters: boolean;
    expandedByDefault: boolean;
}

export interface ValidationResult {
    nodeId: string;
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface QuickStats {
    totalItems: number;
    modifiedItems: number;
    validationErrors: number;
    visibleLevels: number;
}

/**
 * Builder pour créer des nœuds AssetNode depuis les données Mendix
 */
export class AssetNodeBuilder {
    static fromMendixItem(item: ObjectItem, config: DataSourceConfig, index: number): AssetNode {
        // Extraction des valeurs d'attributs depuis les ListAttributeValue
        const name = config.nameAttribute?.get(item)?.value || `Unnamed ${config.name} ${index + 1}`;
        const parentId = config.parentAttribute?.get(item)?.value || undefined;
        const unit = config.unitAttribute?.get(item)?.value || undefined;
        
        // Création des EditableValue pour les attributs configurés
        const editableValues: {
            name?: EditableValue<string>;
            unit?: EditableValue<string>;
            parent?: EditableValue<string>;
        } = {};

        // Créer EditableValue pour le nom si l'attribut est configuré
        if (config.nameAttribute) {
            editableValues.name = config.nameAttribute.get(item);
        }

        // Créer EditableValue pour l'unité si l'attribut est configuré
        if (config.unitAttribute) {
            editableValues.unit = config.unitAttribute.get(item);
        }

        // Créer EditableValue pour le parent si l'attribut est configuré
        if (config.parentAttribute) {
            editableValues.parent = config.parentAttribute.get(item);
        }
        
        // Debug logging
        console.debug(`AssetNodeBuilder.fromMendixItem:`, {
            itemId: item.id,
            configLevel: config.level,
            extractedName: name,
            extractedParentId: parentId,
            extractedUnit: unit,
            hasNameAttribute: !!config.nameAttribute,
            hasUnitAttribute: !!config.unitAttribute,
            editableValuesCreated: {
                name: !!editableValues.name,
                unit: !!editableValues.unit,
                parent: !!editableValues.parent
            }
        });

        const assetNode: AssetNode = {
            id: item.id,
            name,
            type: AssetNodeBuilder.determineType(config.level, config.name),
            level: config.level,
            parentId,
            unit,
            children: [],
            modified: false,
            validated: true,
            metadata: {
                mendixObject: item,
                dataSourceConfig: config,
                editableValues
            }
        };

        return assetNode;
    }

    private static getNodeType(configName: string, level: number): AssetNodeType {
        const normalizedName = configName.toLowerCase();
        
        if (normalizedName.includes('usine')) return 'Usine';
        if (normalizedName.includes('secteur')) return 'Secteur';
        if (normalizedName.includes('atelier')) return 'Atelier';
        if (normalizedName.includes('eth')) return 'ETH';
        if (normalizedName.includes('machine')) return 'Machine';
        
        // Fallback basé sur le niveau
        const typeMap: Record<number, AssetNodeType> = {
            1: 'Usine',
            2: 'Secteur',
            3: 'Atelier',
            4: 'ETH',
            5: 'Machine'
        };
        
        return typeMap[level] || 'Usine'; // Fallback corrigé
    }

    private static determineType(level: number, name: string): AssetNodeType {
        if (level === 1) return 'Usine';
        if (level === 2) return 'Secteur';
        if (level === 3) return 'Atelier';
        if (level === 4) return 'ETH';
        if (level === 5) return 'Machine';
        return this.getNodeType(name, level);
    }
}

/**
 * Service pour filtrer et rechercher dans les nœuds
 */
export class HierarchyFilterService {
    static filterBySearch(nodes: AssetNode[], searchTerm: string, isDev = false): AssetNode[] {
        if (!searchTerm.trim()) return nodes;
        
        const term = searchTerm.toLowerCase();
        
        return nodes.filter(node => {
            // Recherche dans le nom
            if (node.name.toLowerCase().includes(term)) return true;
            
            // En mode dev, recherche dans toutes les propriétés
            if (isDev) {
                return Object.values(node).some(value => 
                    String(value).toLowerCase().includes(term)
                );
            }
            
            return false;
        });
    }

    static filterByModified(nodes: AssetNode[], showModifiedOnly: boolean): AssetNode[] {
        if (!showModifiedOnly) return nodes;
        return nodes.filter(node => node.modified);
    }

    static filterByLevel(nodes: AssetNode[], selectedLevels: string[]): AssetNode[] {
        if (selectedLevels.length === 0) return nodes;
        
        const levelNumbers = selectedLevels
            .map(level => level.replace('level-', ''))
            .map(Number)
            .filter(n => !isNaN(n));
            
        return nodes.filter(node => levelNumbers.includes(node.level));
    }
}

/**
 * Service pour construire la hiérarchie parent-enfant
 */
export class HierarchyBuilderService {
    static buildHierarchy(flatNodes: AssetNode[]): AssetNode[] {
        const nodeMap = new Map<string, AssetNode>();
        const rootNodes: AssetNode[] = [];

        // Créer la map des nœuds
        flatNodes.forEach(node => {
            nodeMap.set(node.id, { ...node, children: [] });
        });

        // Construire la hiérarchie
        flatNodes.forEach(node => {
            const currentNode = nodeMap.get(node.id)!;
            
            if (node.parentId && nodeMap.has(node.parentId)) {
                const parent = nodeMap.get(node.parentId)!;
                if (!parent.children) parent.children = [];
                parent.children.push(currentNode);
            } else {
                rootNodes.push(currentNode);
            }
        });

        return rootNodes;
    }

    static flattenHierarchy(hierarchyNodes: AssetNode[]): AssetNode[] {
        const result: AssetNode[] = [];
        
        function traverse(nodes: AssetNode[]) {
            nodes.forEach(node => {
                result.push(node);
                if (node.children) {
                    traverse(node.children);
                }
            });
        }
        
        traverse(hierarchyNodes);
        return result;
    }
} 