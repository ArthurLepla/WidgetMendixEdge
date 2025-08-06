import * as React from 'react';
import { ReactElement, createElement, useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Row, Col, Card, Table, Tag, Space, Empty, Spin, Typography } from "antd";
import { File, Zap, Flame, Droplet, Wind, ChevronRight, X, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ValueStatus, ListAttributeValue, ListReferenceValue, ListReferenceSetValue, ObjectItem, DynamicValue } from "mendix";
import type { AdminPanelContainerProps } from "../../typings/AdminPanelProps";
import "./TreeSelect.css";

const { Title } = Typography;

interface AssetsTabProps extends AdminPanelContainerProps {
    selectedAsset: any;
    onSelectAsset: (asset: any) => void;
}

// Types pour les nœuds de l'arbre
interface TreeNode {
  id: string;
  originalId: string;
  uniqueId: string;
  label: string;
  children?: TreeNode[];
  originalItem?: ObjectItem;
  level: number;
  parentName?: string;
  path: string;
}

// Type union pour les références (associations ou attributs string)
type RefLike =
  | ListReferenceValue            // association 1–1
  | ListReferenceSetValue         // association 1–*
  | ListAttributeValue<string>;   // (optionnel) compat GUID string

// Helper pour lire les IDs depuis une référence (association ou attribut)
function getRefIds(ref: RefLike | undefined, item: ObjectItem): string[] {
  if (!ref) return [];
  
  // Discrimination par `type` (propre aux associations)
  const anyRef = ref as any;
  if (anyRef.type === "Reference") {
    const dv = (ref as ListReferenceValue).get(item) as DynamicValue<ObjectItem>;
    const obj = dv?.value;
    return obj?.id ? [String(obj.id)] : [];
  }
  if (anyRef.type === "ReferenceSet") {
    const dv = (ref as ListReferenceSetValue).get(item) as DynamicValue<ObjectItem[]>;
    const arr = dv?.value ?? [];
    return arr.map(o => String(o.id));
  }
  // Fallback compat : ancien attribut string (GUID)
  const dv = (ref as ListAttributeValue<string>).get(item);
  const guid = dv?.value;
  return guid ? [String(guid)] : [];
}

// Fonction pour créer des IDs uniques
const createUniqueId = (path: string, originalId: string, index: number): string => {
  return `${path}_${index}_${originalId}`.replace(/[^a-zA-Z0-9_]/g, '_');
};

// Composant pour highlight du texte de recherche
const HighlightText: React.FC<{ text: string; searchTerm: string }> = ({ text, searchTerm }) => {
  if (!searchTerm) return <span>{text}</span>;

  const escapeRegex = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const escapedSearchTerm = escapeRegex(searchTerm.trim());
  if (escapedSearchTerm === '') return <span>{text}</span>;

  const parts = text.split(new RegExp(`(${escapedSearchTerm})`, 'gi'));
  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark key={index} className="tree-select__highlight">{part}</mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};

// Composant TreeNode
interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  selectedLabels: string[];
  expandedIds: string[];
  onSelect: (node: TreeNode) => void;
  onToggle: (uniqueId: string) => void;
  multiSelect?: boolean;
  searchTerm?: string;
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
  node,
  level,
  selectedLabels,
  expandedIds,
  onSelect,
  onToggle,
  multiSelect = false,
  searchTerm = ''
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.includes(node.uniqueId);
  const isSelected = selectedLabels.includes(node.label);
  
  const isMatchingSearch = searchTerm === '' || 
    node.label.toLowerCase().includes(searchTerm.toLowerCase());
  
  const hasMatchingChildren = useMemo(() => {
    if (!hasChildren || searchTerm === '') return false;
    
    const checkChildren = (children: TreeNode[]): boolean => {
      return children.some(child => 
        child.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (child.children && checkChildren(child.children))
      );
    };
    
    return checkChildren(node.children!);
  }, [node.children, searchTerm, hasChildren]);

  const handleToggleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(node.uniqueId);
  }, [node.uniqueId, onToggle]);

  const handleNodeClick = useCallback(() => {
    onSelect(node);
  }, [node, onSelect]);

  if (searchTerm !== '' && !isMatchingSearch && !hasMatchingChildren) {
    return null;
  }

  return (
    <div>
      <motion.div
        className={`tree-node ${isSelected ? 'tree-node--selected' : ''}`}
        style={{ paddingLeft: `${level * 20 + 8}px` } as React.CSSProperties}
        onClick={handleNodeClick}
        whileTap={{ scale: 0.99 }}
        layout
      >
        {hasChildren ? (
          <button
            className={`tree-node__toggle ${isExpanded ? 'tree-node__toggle--expanded' : ''}`}
            onClick={handleToggleClick}
            type="button"
            aria-label={isExpanded ? `Réduire ${node.label}` : `Développer ${node.label}`}
          >
            <ChevronRight size={14} />
          </button>
        ) : (
          <div className="tree-node__spacer" />
        )}
        
        <span className="tree-node__label">
          {searchTerm !== '' && isMatchingSearch ? (
            <HighlightText text={node.label} searchTerm={searchTerm} />
          ) : (
            node.label
          )}
        </span>
        
        <AnimatePresence mode="wait">
          {isSelected && (
            <motion.div
              className="tree-node__check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Check size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence initial={false}>
        {hasChildren && (isExpanded || (searchTerm !== '' && hasMatchingChildren)) && (
          <motion.div
            className="tree-node__children"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {node.children!.map((child) => (
              <TreeNodeComponent
                key={child.uniqueId}
                node={child}
                level={level + 1}
                selectedLabels={selectedLabels}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggle={onToggle}
                multiSelect={multiSelect}
                searchTerm={searchTerm}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function AssetsTab(props: AssetsTabProps): ReactElement {
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Construction de l'arbre avec notre logique robuste
    const treeData = useMemo<TreeNode[]>(() => {
        if (!props.assetsDatasource?.items || !props.assetName) {
            console.log('[AssetsTab] No data source or name attribute');
            return [];
        }
        
        console.log('[AssetsTab] Building tree with', props.assetsDatasource.items.length, 'items');
        
        const items = props.assetsDatasource.items;
        const assetMap = new Map<string, TreeNode>();
        const rootNodes: TreeNode[] = [];

        // Première passe: Créer tous les nœuds
        items.forEach((item, index) => {
            const originalId = item.id;
            const label = props.assetName.get(item).displayValue || '';
            
            // Utiliser le helper pour extraire les IDs depuis les associations
            const parentIds = getRefIds(props.assetParent, item);
            const parentId = parentIds[0]; // Prendre le premier parent (mono-ref)
            
            const levelIds = getRefIds(props.assetLevel, item);
            const levelId = levelIds[0]; // Prendre le premier level (mono-ref)
            const level = levelId ? Number(levelId) || 0 : 0;
            
            const path = parentId ? `${parentId}/${label}` : label;
            const uniqueId = createUniqueId(path, originalId, index);

            const node: TreeNode = {
                id: originalId,
                originalId,
                uniqueId,
                label,
                children: [],
                originalItem: item,
                level,
                parentName: parentId,
                path
            };

            assetMap.set(originalId, node);
            console.log(`[AssetsTab] Created node: ${label} (uniqueId: ${uniqueId}, parentId: ${parentId})`);
        });

        // Deuxième passe: Construire la hiérarchie
        items.forEach(item => {
            const node = assetMap.get(item.id);
            if (!node) return;
            
            // Utiliser le helper pour extraire l'ID parent depuis l'association
            const parentIds = getRefIds(props.assetParent, item);
            const parentId = parentIds[0]; // Prendre le premier parent (mono-ref)
            
            if (parentId && assetMap.has(parentId)) {
                // Add to parent's children
                const parent = assetMap.get(parentId);
                if (parent && parent.children) {
                    parent.children.push(node);
                }
                console.log(`[AssetsTab] Linked ${node.label} to parent ${parent?.label}`);
            } else {
                // Root asset
                rootNodes.push(node);
                console.log(`[AssetsTab] Added ${node.label} as root`);
            }
        });

        // Trier les nœuds
        const sortNodes = (nodes: TreeNode[]) => {
            nodes.sort((a, b) => {
                if (a.level !== b.level) return a.level - b.level;
                return a.label.localeCompare(b.label);
            });
            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    sortNodes(node.children);
                }
            });
        };

        sortNodes(rootNodes);
        console.log(`[AssetsTab] Tree built with ${rootNodes.length} root nodes`);
        return rootNodes;
    }, [props.assetsDatasource, props.assetName, props.assetParent, props.assetLevel]);

    const hasVisibleNodes = useMemo(() => {
        if (!searchTerm) {
            return treeData.length > 0;
        }
        const checkVisibility = (nodes: TreeNode[]): boolean => {
            return nodes.some(node => {
                const isMatching = node.label.toLowerCase().includes(searchTerm.toLowerCase());
                const childrenVisible = node.children ? checkVisibility(node.children) : false;
                return isMatching || childrenVisible;
            });
        };
        return checkVisibility(treeData);
    }, [treeData, searchTerm]);

    // Auto-expand des nœuds racine
    useEffect(() => {
        if (treeData.length > 0 && expandedIds.length === 0) {
            const rootIds = treeData.map(node => node.uniqueId);
            console.log('[AssetsTab] Auto-expanding roots:', rootIds);
            setExpandedIds(rootIds);
        }
    }, [treeData]);

    // Handle selection
    const handleSelect = useCallback((node: TreeNode) => {
        console.log(`[AssetsTab] Selecting: ${node.label}`);
        
        const newSelectedLabels = [node.label];
        setSelectedLabels(newSelectedLabels);
        
        // Callback pour passer l'asset sélectionné
        if (node.originalItem) {
            props.onSelectAsset(node.originalItem);
        }
    }, [props]);

    // Handle toggle
    const handleToggle = useCallback((uniqueId: string) => {
        console.log(`[AssetsTab] Toggling: ${uniqueId}`);
        setExpandedIds(prev => {
            if (prev.includes(uniqueId)) {
                return prev.filter(id => id !== uniqueId);
            } else {
                return [...prev, uniqueId];
            }
        });
    }, []);

    // Auto-expand lors de la recherche
    useEffect(() => {
        if (searchTerm && treeData.length > 0) {
            const timer = setTimeout(() => {
                const expandedForSearch: string[] = [];
                
                const collectExpandedNodes = (nodes: TreeNode[]) => {
                    nodes.forEach(node => {
                        if (node.children && node.children.length > 0) {
                            const hasMatch = node.children.some(child =>
                                child.label.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            
                            if (hasMatch) {
                                expandedForSearch.push(node.uniqueId);
                                collectExpandedNodes(node.children);
                            }
                        }
                    });
                };
                
                collectExpandedNodes(treeData);
                setExpandedIds(prev => {
                    const newSet = new Set([...prev, ...expandedForSearch]);
                    return Array.from(newSet);
                });
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [searchTerm, treeData]);

    // Get variables for selected asset with robust association handling
    const variablesData = useMemo(() => {
        if (!props.selectedAsset || !props.variablesDatasource || 
            props.variablesDatasource.status !== ValueStatus.Available) {
            return [];
        }

        const selectedId = String(props.selectedAsset.id);

        // Filter variables for selected asset with robust association handling
        return (props.variablesDatasource.items || [])
            .filter(item => {
                // Utiliser le helper getRefIds pour extraire l'ID de l'association
                const variableAssetIds = getRefIds(props.variableAsset, item);
                return variableAssetIds.includes(selectedId);
            })
            .map(item => ({
                key: item.id,
                name: props.variableName?.get(item)?.displayValue || "",
                unit: props.variableUnit?.get(item)?.displayValue || "",
                type: props.variableType?.get(item)?.displayValue || ""
            }));
    }, [props.selectedAsset, props.variablesDatasource, props.variableName, props.variableUnit, props.variableType, props.variableAsset]);

    const getEnergyTags = (item: any) => {
        if (!item) return [];
        
        const tags = [];
        if (props.assetIsElec?.get(item)?.value === true) {
            tags.push(<Tag icon={<Zap size={12} />} className="tag-electric" key="elec" />);
        }
        if (props.assetIsGaz?.get(item)?.value === true) {
            tags.push(<Tag icon={<Flame size={12} />} className="tag-gas" key="gas" />);
        }
        if (props.assetIsEau?.get(item)?.value === true) {
            tags.push(<Tag icon={<Droplet size={12} />} className="tag-water" key="water" />);
        }
        if (props.assetIsAir?.get(item)?.value === true) {
            tags.push(<Tag icon={<Wind size={12} />} className="tag-air" key="air" />);
        }
        return tags;
    };

    const variableColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            width: 100,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type: string) => {
                // Traduire les types d'énergie en français
                const energyTypeMap: { [key: string]: string } = {
                    'Electric': 'Électrique',
                    'Gas': 'Gaz',
                    'Water': 'Eau',
                    'Air': 'Air',
                    'electric': 'Électrique',
                    'gas': 'Gaz',
                    'water': 'Eau',
                    'air': 'Air'
                };
                const translatedType = energyTypeMap[type] || type;
                return <Tag color="blue">{translatedType}</Tag>;
            }
        }
    ];

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
                <Card 
                    title="Assets Hierarchy"
                    className="assets-tree-card"
                >
                    {props.assetsDatasource?.status === ValueStatus.Loading ? (
                        <Spin />
                    ) : treeData.length > 0 ? (
                        <div className="tree-select">
                            <div className="tree-select__search">
                                <div className="tree-select__search-wrapper">
                                    <Search size={16} className="tree-select__search-icon" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="tree-select__search-input"
                                        placeholder="Rechercher des assets..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            className="tree-select__search-clear"
                                            onClick={() => setSearchTerm('')}
                                            type="button"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="tree-select__tree">
                                {hasVisibleNodes ? (
                                    treeData.map((node) => (
                                        <TreeNodeComponent
                                            key={node.uniqueId}
                                            node={node}
                                            level={0}
                                            selectedLabels={selectedLabels}
                                            expandedIds={expandedIds}
                                            onSelect={handleSelect}
                                            onToggle={handleToggle}
                                            multiSelect={false}
                                            searchTerm={searchTerm}
                                        />
                                    ))
                                ) : (
                                    <div className="tree-select__empty">Aucun résultat trouvé</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Empty description="No assets found" />
                    )}
                </Card>
            </Col>
            
            <Col xs={24} md={16}>
                <motion.div
                    key={props.selectedAsset?.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card 
                        title={props.selectedAsset ? (
                            <Space>
                                <File size={20} />
                                <span>
                                    {props.assetName?.get(props.selectedAsset)?.displayValue || "Asset Details"}
                                </span>
                            </Space>
                        ) : "Select an Asset"}
                        className="asset-details-card"
                    >
                        {props.selectedAsset ? (
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <div>
                                    <Title level={5}>Energy Types</Title>
                                    <Space wrap>
                                        {getEnergyTags(props.selectedAsset)}
                                    </Space>
                                </div>
                                
                                <div>
                                    <Title level={5}>Variables</Title>
                                    <Table
                                        dataSource={variablesData}
                                        columns={variableColumns}
                                        pagination={false}
                                        size="small"
                                        className="variables-table"
                                    />
                                </div>
                            </Space>
                        ) : (
                            <Empty description="Please select an asset from the hierarchy" />
                        )}
                    </Card>
                </motion.div>
            </Col>
        </Row>
    );
}