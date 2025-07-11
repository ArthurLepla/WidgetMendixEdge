import React, { useState, useRef, useEffect, useMemo, useCallback, createElement } from 'react';
import './TreeSelect.css';
import { ChevronDown, ChevronRight, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListValue, ListAttributeValue, EditableValue, ActionValue, ObjectItem } from 'mendix';
import { ValueStatus } from "mendix";

// Types pour les nœuds de l'arbre
export interface TreeNode {
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

// Props du composant TreeSelect
export interface TreeSelectProps {
  class?: string;
  style?: React.CSSProperties;
  itemsDataSource?: ListValue;
  itemNameAttribute?: ListAttributeValue<string>;
  parentNameAttribute?: ListAttributeValue<string>;
  levelAttribute?: ListAttributeValue<string>;
  selectedItemsAttribute?: EditableValue<string>;
  allowMultipleSelection?: boolean;
  placeholder?: string;
  variant?: 'default' | 'minimal' | 'modern';
  onChange?: ActionValue;
  onSelectionChange?: ActionValue;
}

// Composant TreeNode
interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  selectedLabels: string[];
  expandedIds: string[];
  onSelect: (label: string) => void;
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
    onSelect(node.label);
  }, [node.label, onSelect]);

  if (searchTerm !== '' && !isMatchingSearch && !hasMatchingChildren) {
    return null;
  }

  return (
    <div>
      <motion.div
        className={`tree-node ${isSelected ? 'tree-node--selected' : ''}`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
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

// Fonction pour créer des IDs uniques
const createUniqueId = (path: string, originalId: string, index: number): string => {
  return `${path}_${index}_${originalId}`.replace(/[^a-zA-Z0-9_]/g, '_');
};

// Composant TreeSelect principal
export const TreeSelect: React.FC<TreeSelectProps> = ({
  class: className = '',
  style,
  itemsDataSource,
  itemNameAttribute,
  parentNameAttribute,
  levelAttribute,
  selectedItemsAttribute,
  allowMultipleSelection = false,
  placeholder = 'Sélectionner un élément...',
  variant = 'minimal',
  onChange,
  onSelectionChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<TreeNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Construction de l'arbre avec IDs uniques
  const treeData = useMemo<TreeNode[]>(() => {
    if (!itemsDataSource?.items || !itemNameAttribute) {
      console.log('[TreeSelect] No data source or name attribute');
      return [];
    }
    
    console.log('[TreeSelect] Building tree with', itemsDataSource.items.length, 'items');
    
    const items = itemsDataSource.items;
    const nodesByLabel = new Map<string, TreeNode[]>();
    const rootNodes: TreeNode[] = [];

    // Première passe: Créer tous les nœuds
    items.forEach((item, index) => {
      const originalId = item.id;
      const label = itemNameAttribute.get(item).value || '';
      const parentName = parentNameAttribute?.get(item).value || undefined;
      const level = levelAttribute ? Number(levelAttribute.get(item).value) || 0 : 0;
      
      const path = parentName ? `${parentName}/${label}` : label;
      const uniqueId = createUniqueId(path, originalId, index);

      const node: TreeNode = {
        id: originalId,
        originalId,
        uniqueId,
        label,
        children: [],
        originalItem: item,
        level,
        parentName,
        path
      };

      // Stocker dans un tableau pour gérer les doublons
      if (!nodesByLabel.has(label)) {
        nodesByLabel.set(label, []);
      }
      nodesByLabel.get(label)!.push(node);
      
      console.log(`[TreeSelect] Created node: ${label} (uniqueId: ${uniqueId})`);
    });

    // Deuxième passe: Construire la hiérarchie
    nodesByLabel.forEach((nodes) => {
      nodes.forEach(node => {
        if (node.parentName && nodesByLabel.has(node.parentName)) {
          // Prendre le premier parent trouvé
          const parentNodes = nodesByLabel.get(node.parentName)!;
          const parent = parentNodes[0];
          if (!parent.children) parent.children = [];
          parent.children.push(node);
          console.log(`[TreeSelect] Linked ${node.label} to parent ${parent.label}`);
        } else {
          rootNodes.push(node);
          console.log(`[TreeSelect] Added ${node.label} as root`);
        }
      });
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
    console.log(`[TreeSelect] Tree built with ${rootNodes.length} root nodes`);
    return rootNodes;
  }, [itemsDataSource, itemNameAttribute, parentNameAttribute, levelAttribute]);

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
      console.log('[TreeSelect] Auto-expanding roots:', rootIds);
      setExpandedIds(rootIds);
    }
  }, [treeData]);

  // Initialisation depuis Mendix
  useEffect(() => {
    const rawValue = selectedItemsAttribute?.value;
    console.log("[TreeSelect] Initializing with raw value:", rawValue);
    if (selectedItemsAttribute?.status === ValueStatus.Available && rawValue) {
        const labels = rawValue.split(',').map(s => s.trim()).filter(Boolean);
        
        if (JSON.stringify(labels) !== JSON.stringify(selectedLabels)) {
            console.log("[TreeSelect] Initialized selected labels:", labels);
            setSelectedLabels(labels);
        }
    }
  }, [selectedItemsAttribute?.status, selectedItemsAttribute?.value]);

  // Fonction pour trouver un nœud par son label
  const findNodeByLabel = useCallback((nodes: TreeNode[], label: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.label === label) return node;
      if (node.children) {
        const found = findNodeByLabel(node.children, label);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Mettre à jour les `selectedNodes` lorsque les labels ou les données de l'arbre changent
  useEffect(() => {
    if (treeData.length > 0) {
        const newSelectedNodes = selectedLabels
            .map(label => findNodeByLabel(treeData, label))
            .filter((n): n is TreeNode => n !== null);
        
        setSelectedNodes(newSelectedNodes);
    }
  }, [selectedLabels, treeData, findNodeByLabel]);

  // Handle selection
  const handleSelect = useCallback((label: string) => {
    console.log(`[TreeSelect] Selecting: ${label}`);
    
    let newSelectedLabels: string[];
    
    if (allowMultipleSelection) {
      if (selectedLabels.includes(label)) {
        newSelectedLabels = selectedLabels.filter(l => l !== label);
      } else {
        newSelectedLabels = [...selectedLabels, label];
      }
    } else {
      newSelectedLabels = [label];
      setIsOpen(false);
    }

    console.log('[TreeSelect] New selection:', newSelectedLabels);
    setSelectedLabels(newSelectedLabels);
    
    // Mise à jour Mendix
    if (selectedItemsAttribute && selectedItemsAttribute.status === "available") {
      const value = newSelectedLabels.join(',');
      console.log("[TreeSelect] Setting Mendix attribute:", value);
      selectedItemsAttribute.setValue(value);
    }

    // Actions
    if (onChange?.canExecute) {
      console.log('[TreeSelect] Executing onChange action');
      onChange.execute();
    }
    if (onSelectionChange?.canExecute) {
      console.log('[TreeSelect] Executing onSelectionChange action');
      onSelectionChange.execute();
    }
  }, [allowMultipleSelection, selectedLabels, selectedItemsAttribute, onChange, onSelectionChange]);

  // Handle toggle
  const handleToggle = useCallback((uniqueId: string) => {
    console.log(`[TreeSelect] Toggling: ${uniqueId}`);
    setExpandedIds(prev => {
      if (prev.includes(uniqueId)) {
        return prev.filter(id => id !== uniqueId);
      } else {
        return [...prev, uniqueId];
      }
    });
  }, []);

  // Remove selected
  const removeSelected = useCallback((labelToRemove: string) => {
    console.log(`[TreeSelect] Removing: ${labelToRemove}`);
    
    const newSelectedLabels = selectedLabels.filter(label => label !== labelToRemove);
    setSelectedLabels(newSelectedLabels);

    if (selectedItemsAttribute && selectedItemsAttribute.status === "available") {
      selectedItemsAttribute.setValue(newSelectedLabels.join(','));
    }

    if (onChange?.canExecute) onChange.execute();
    if (onSelectionChange?.canExecute) onSelectionChange.execute();
  }, [selectedLabels, selectedItemsAttribute, onChange, onSelectionChange]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

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
        setExpandedIds(prev => [...new Set([...prev, ...expandedForSearch])]);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [searchTerm, treeData]);

  const getDisplayText = () => {
    if (selectedNodes.length === 0) return placeholder;
    if (!allowMultipleSelection) return selectedNodes[0].label;
    if (selectedNodes.length === 1) return selectedNodes[0].label;
    return `${selectedNodes.length} éléments sélectionnés`;
  };

  return (
    <div className={`tree-select ${className}`} style={style} ref={dropdownRef}>
      <motion.div
        className={`tree-select__trigger tree-select__trigger--${variant}`}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.995 }}
      >
        <div className="tree-select__trigger-content">
          <div className="tree-select__trigger-text">
            <span className={selectedNodes.length === 0 ? 'tree-select__placeholder' : 'tree-select__value'}>
              {getDisplayText()}
            </span>
            
            {allowMultipleSelection && selectedNodes.length > 1 && (
              <div className="tree-select__tags">
                {selectedNodes.slice(0, 2).map((node) => (
                  <motion.span
                    key={node.originalId}
                    className="tree-select__tag"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    {node.label}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelected(node.label);
                      }}
                      className="tree-select__tag-remove"
                      type="button"
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
                {selectedNodes.length > 2 && (
                  <span className="tree-select__tag-count">
                    +{selectedNodes.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <motion.div 
            className="tree-select__arrow" 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="tree-select__dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="tree-select__search">
              <div className="tree-select__search-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="tree-select__search-input"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
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
              {treeData.length === 0 ? (
                <div className="tree-select__empty">Aucune donnée disponible</div>
              ) : hasVisibleNodes ? (
                treeData.map((node) => (
                  <TreeNodeComponent
                    key={node.uniqueId}
                    node={node}
                    level={0}
                    selectedLabels={selectedLabels}
                    expandedIds={expandedIds}
                    onSelect={handleSelect}
                    onToggle={handleToggle}
                    multiSelect={allowMultipleSelection}
                    searchTerm={searchTerm}
                  />
                ))
              ) : (
                <div className="tree-select__empty">Aucun résultat trouvé</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreeSelect;