import React, { useState, useRef, useEffect, useMemo, useCallback, createElement } from 'react';
import './TreeSelect.css';
import { ChevronDown, ChevronRight, X, Check, Search, Circle, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListValue, ListAttributeValue, EditableValue, ActionValue, ObjectItem } from 'mendix';

// Types pour les nœuds de l'arbre
export interface TreeNode {
  id: string;
  originalId: string; // ✅ NOUVEAU: ID original de Mendix
  uniqueId: string;   // ✅ NOUVEAU: ID unique pour éviter les conflits
  label: string;
  children?: TreeNode[];
  originalItem?: ObjectItem;
  level: number;
  parentName?: string; // ✅ CORRIGÉ: string | undefined (pas null)
  path: string;       // ✅ NOUVEAU: Chemin complet pour débugger
}

// Props du composant TreeSelect
export interface TreeSelectProps {
  // Props de base
  class?: string;
  style?: React.CSSProperties;
  
  // Props de données Mendix
  itemsDataSource?: ListValue;
  itemNameAttribute?: ListAttributeValue<string>;
  parentNameAttribute?: ListAttributeValue<string>;
  levelAttribute?: ListAttributeValue<string>;
  selectedItemsAttribute?: EditableValue<string>;
  
  // Configuration
  allowMultipleSelection?: boolean;
  placeholder?: string;
  variant?: 'default' | 'minimal' | 'modern';
  
  // Events
  onChange?: ActionValue;
  onSelectionChange?: ActionValue;
}

// Composant TreeNode
interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  selectedIds: string[];
  expandedIds: string[];
  onSelect: (originalId: string, node: TreeNode) => void; // ✅ CORRIGÉ: Utilise originalId
  onToggle: (uniqueId: string) => void; // ✅ CORRIGÉ: Utilise uniqueId
  multiSelect?: boolean;
  searchTerm?: string;
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
  node,
  level,
  selectedIds,
  expandedIds,
  onSelect,
  onToggle,
  multiSelect = false,
  searchTerm = ''
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.includes(node.uniqueId); // ✅ CORRIGÉ: Utilise uniqueId
  const isSelected = selectedIds.includes(node.originalId); // ✅ CORRIGÉ: Utilise originalId
  
  // Filtrage pour la recherche
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

  // Ne pas afficher le nœud s'il ne correspond pas à la recherche
  if (searchTerm !== '' && !isMatchingSearch && !hasMatchingChildren) {
    return null;
  }

  const handleToggleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🔄 Toggle clicked for: ${node.label} (uniqueId: ${node.uniqueId})`); // ✅ DEBUG
    onToggle(node.uniqueId); // ✅ CORRIGÉ: Utilise uniqueId
  }, [node.uniqueId, node.label, onToggle]);

  const handleNodeClick = useCallback(() => {
    console.log(`👆 Node selected: ${node.label} (originalId: ${node.originalId})`); // ✅ DEBUG
    onSelect(node.originalId, node); // ✅ CORRIGÉ: Utilise originalId
  }, [node.originalId, node.label, node, onSelect]);

  return (
    <div>
      <motion.div
        className={`tree-node ${isSelected ? 'tree-node--selected' : ''}`}
        style={{ paddingLeft: `${level * 24 + 12}px` }} // ✅ AMÉLIORÉ: Plus d'espace
        onClick={handleNodeClick}
        whileHover={{ scale: 1.01 }} // ✅ AMÉLIORÉ: Animation subtile
        whileTap={{ scale: 0.99 }}
        layout // ✅ AMÉLIORÉ: Animation layout fluide
      >
        {/* Toggle button ou spacer */}
        {hasChildren ? (
          <motion.button
            className={`tree-node__toggle ${isExpanded ? 'tree-node__toggle--expanded' : ''}`}
            onClick={handleToggleClick}
            type="button"
            whileHover={{ scale: 1.1 }} // ✅ AMÉLIORÉ: Animation hover
            whileTap={{ scale: 0.9 }}
            aria-label={isExpanded ? `Réduire ${node.label}` : `Développer ${node.label}`}
          >
            <ChevronRight size={16} />
          </motion.button>
        ) : (
          <div className="tree-node__spacer" />
        )}
        
        {/* Icône pour différencier parent/enfant */}
        <motion.div 
          className="tree-node__icon"
          animate={{ 
            rotate: hasChildren && isExpanded ? 5 : 0, // ✅ AMÉLIORÉ: Animation subtile
            scale: isSelected ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          {hasChildren ? (
            <Layers size={18} />
          ) : (
            <Circle size={10} />
          )}
        </motion.div>
        
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
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
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
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1] // ✅ AMÉLIORÉ: Courbe d'animation plus fluide
            }}
            style={{ overflow: 'hidden' }}
          >
            {node.children!.map((child) => (
              <TreeNodeComponent
                key={child.uniqueId} // ✅ CORRIGÉ: Utilise uniqueId comme key
                node={child}
                level={level + 1}
                selectedIds={selectedIds}
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

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
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

// ✅ NOUVEAU: Fonction pour créer des IDs uniques
const createUniqueId = (path: string, originalId: string): string => {
  return `${path}::${originalId}`.replace(/[^a-zA-Z0-9:]/g, '_');
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<TreeNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ✅ CORRIGÉ: Construction de l'arbre avec IDs uniques
  const treeData = useMemo<TreeNode[]>(() => {
    if (!itemsDataSource?.items || !itemNameAttribute) return [];

    console.log('🌳 Rebuilding tree data...'); // ✅ DEBUG
    
    const items = itemsDataSource.items;
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // ✅ PREMIÈRE PASSE: Créer tous les nœuds avec IDs uniques
    items.forEach((item) => { // ✅ CORRIGÉ: Supprimé index inutilisé
      const originalId = item.id;
      const label = itemNameAttribute.get(item).value || '';
      const parentName = parentNameAttribute?.get(item).value || undefined; // ✅ CORRIGÉ: null -> undefined
      const level = levelAttribute ? Number(levelAttribute.get(item).value) || 0 : 0;
      
      // ✅ NOUVEAU: Créer un chemin unique basé sur le label et le niveau
      const path = parentName ? `${parentName}/${label}` : label;
      const uniqueId = createUniqueId(path, originalId);

      const node: TreeNode = {
        id: originalId, // Gardé pour compatibilité
        originalId,
        uniqueId,
        label,
        children: [],
        originalItem: item,
        level,
        parentName, // ✅ CORRIGÉ: undefined au lieu de null
        path
      };

      console.log(`📝 Created node: ${label} (uniqueId: ${uniqueId}, originalId: ${originalId})`); // ✅ DEBUG
      nodeMap.set(label, node);
    });

    // ✅ DEUXIÈME PASSE: Construire la hiérarchie
    nodeMap.forEach(node => {
      if (node.parentName && nodeMap.has(node.parentName)) {
        const parent = nodeMap.get(node.parentName)!;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
        console.log(`🔗 Linked ${node.label} to parent ${parent.label}`); // ✅ DEBUG
      } else {
        rootNodes.push(node);
        console.log(`🌿 Added ${node.label} as root node`); // ✅ DEBUG
      }
    });

    // ✅ TROISIÈME PASSE: Tri récursif des nœuds
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
    console.log(`✅ Tree built with ${rootNodes.length} root nodes`); // ✅ DEBUG
    return rootNodes;
  }, [itemsDataSource, itemNameAttribute, parentNameAttribute, levelAttribute]);

  // Auto-expand des nœuds racine au premier chargement
  useEffect(() => {
    if (treeData.length > 0 && expandedIds.length === 0) {
      const rootIds = treeData.map(node => node.uniqueId); // ✅ CORRIGÉ: Utilise uniqueId
      console.log('🌱 Auto-expanding root nodes:', rootIds); // ✅ DEBUG
      setExpandedIds(rootIds);
    }
  }, [treeData, expandedIds.length]);

  // Initialisation de la sélection depuis Mendix
  useEffect(() => {
    if (selectedItemsAttribute?.value) {
      try {
        const selected = JSON.parse(selectedItemsAttribute.value);
        if (Array.isArray(selected)) {
          console.log('📋 Setting selected items:', selected); // ✅ DEBUG
          setSelectedIds(selected);
          
          // Trouver les nœuds correspondants par originalId
          const findNodesByOriginalId = (nodes: TreeNode[], ids: string[]): TreeNode[] => {
            const result: TreeNode[] = [];
            const searchInNodes = (nodeList: TreeNode[]) => {
              nodeList.forEach(node => {
                if (ids.includes(node.originalId)) {
                  result.push(node);
                }
                if (node.children) {
                  searchInNodes(node.children);
                }
              });
            };
            searchInNodes(nodes);
            return result;
          };
          
          setSelectedNodes(findNodesByOriginalId(treeData, selected));
        }
      } catch (error) {
        console.warn('TreeSelect: Invalid selectedItemsAttribute format', error);
      }
    }
  }, [selectedItemsAttribute?.value, treeData]);

  // ✅ CORRIGÉ: Fonction pour trouver un nœud par originalId
  const findNodeByOriginalId = useCallback((nodes: TreeNode[], originalId: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.originalId === originalId) return node;
      if (node.children) {
        const found = findNodeByOriginalId(node.children, originalId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // ✅ CORRIGÉ: Handle select avec originalId
  const handleSelect = useCallback((originalId: string, node: TreeNode) => {
    console.log(`🎯 Selecting node: ${node.label} (originalId: ${originalId})`); // ✅ DEBUG
    
    let newSelectedIds: string[];
    let newSelectedNodes: TreeNode[];

    if (allowMultipleSelection) {
      newSelectedIds = selectedIds.includes(originalId)
        ? selectedIds.filter(selectedId => selectedId !== originalId)
        : [...selectedIds, originalId];
      
      newSelectedNodes = newSelectedIds.map(selectedId => 
        findNodeByOriginalId(treeData, selectedId)
      ).filter(Boolean) as TreeNode[];
    } else {
      newSelectedIds = [originalId];
      newSelectedNodes = [node];
      setIsOpen(false);
    }

    setSelectedIds(newSelectedIds);
    setSelectedNodes(newSelectedNodes);

    // Mettre à jour l'attribut Mendix
    if (selectedItemsAttribute) {
      selectedItemsAttribute.setValue(JSON.stringify(newSelectedIds));
    }

    // Déclencher les actions Mendix
    if (onChange?.canExecute) onChange.execute();
    if (onSelectionChange?.canExecute) onSelectionChange.execute();
  }, [allowMultipleSelection, selectedIds, findNodeByOriginalId, treeData, selectedItemsAttribute, onChange, onSelectionChange]);

  // ✅ CORRIGÉ: Handle toggle avec uniqueId
  const handleToggle = useCallback((uniqueId: string) => {
    console.log(`🔄 Toggling node with uniqueId: ${uniqueId}`); // ✅ DEBUG
    
    setExpandedIds(prev => {
      const newExpanded = prev.includes(uniqueId)
        ? prev.filter(expandedId => expandedId !== uniqueId)
        : [...prev, uniqueId];
      
      console.log('📂 New expanded state:', newExpanded); // ✅ DEBUG
      return newExpanded;
    });
  }, []);

  const removeSelected = useCallback((originalId: string) => {
    const newSelectedIds = selectedIds.filter(selectedId => selectedId !== originalId);
    const newSelectedNodes = newSelectedIds.map(selectedId => 
      findNodeByOriginalId(treeData, selectedId)
    ).filter(Boolean) as TreeNode[];

    setSelectedIds(newSelectedIds);
    setSelectedNodes(newSelectedNodes);

    if (selectedItemsAttribute) {
      selectedItemsAttribute.setValue(JSON.stringify(newSelectedIds));
    }

    if (onChange?.canExecute) onChange.execute();
    if (onSelectionChange?.canExecute) onSelectionChange.execute();
  }, [selectedIds, findNodeByOriginalId, treeData, selectedItemsAttribute, onChange, onSelectionChange]);

  // Fermeture au clic à l'extérieur
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

  // Focus sur la recherche à l'ouverture
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 150); // ✅ AMÉLIORÉ: Plus de délai
    }
  }, [isOpen]);

  // ✅ AMÉLIORÉ: Auto-expansion lors de la recherche avec debounce
  useEffect(() => {
    if (searchTerm && treeData.length > 0) {
      const timer = setTimeout(() => {
        const expandedForSearch: string[] = [];
        
        const collectExpandedNodes = (nodes: TreeNode[]) => {
          nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
              const hasMatchingDescendant = node.children.some(child =>
                child.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (child.children && child.children.some(grandChild =>
                  grandChild.label.toLowerCase().includes(searchTerm.toLowerCase())
                ))
              );
              
              if (hasMatchingDescendant) {
                expandedForSearch.push(node.uniqueId); // ✅ CORRIGÉ: Utilise uniqueId
                collectExpandedNodes(node.children);
              }
            }
          });
        };
        
        collectExpandedNodes(treeData);
        setExpandedIds(prev => [...new Set([...prev, ...expandedForSearch])]);
      }, 200); // ✅ AMÉLIORÉ: Debounce de 200ms

      return () => clearTimeout(timer);
    }
  }, [searchTerm, treeData]);

  const getDisplayText = () => {
    if (selectedNodes.length === 0) return placeholder;
    if (!allowMultipleSelection) return selectedNodes[0].label;
    if (selectedNodes.length === 1) return selectedNodes[0].label;
    return `${selectedNodes.length} éléments sélectionnés`;
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className={`tree-select ${className}`} style={style} ref={dropdownRef}>
      <motion.div
        className={`tree-select__trigger tree-select__trigger--${variant}`}
        onClick={handleTriggerClick}
        whileHover={{ borderColor: '#d1d5db' }} // ✅ AMÉLIORÉ: Animation hover
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
                    key={node.originalId} // ✅ CORRIGÉ: Utilise originalId
                    className="tree-select__tag"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    layout
                  >
                    {node.label}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelected(node.originalId); // ✅ CORRIGÉ: Utilise originalId
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
            <ChevronDown size={16} />
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="tree-select__dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* ✅ CORRIGÉ: Barre de recherche avec meilleur espacement */}
            <div className="tree-select__search">
              <Search size={18} className="tree-select__search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="tree-select__search-input"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  className="tree-select__search-clear"
                  onClick={clearSearch}
                  type="button"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Arbre */}
            <div className="tree-select__tree">
              {treeData.length === 0 ? (
                <div className="tree-select__empty">Aucune donnée disponible</div>
              ) : (
                treeData.map((node) => (
                  <TreeNodeComponent
                    key={node.uniqueId} // ✅ CORRIGÉ: Utilise uniqueId comme key
                    node={node}
                    level={0}
                    selectedIds={selectedIds}
                    expandedIds={expandedIds}
                    onSelect={handleSelect}
                    onToggle={handleToggle}
                    multiSelect={allowMultipleSelection}
                    searchTerm={searchTerm}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreeSelect;