import { ReactElement, createElement, useState } from "react";
import { AssetNode, DataSourceConfig } from "./types";
import { ChevronDown, ChevronRight, Home, Building, Package, Server, Zap, Filter } from "lucide-react";

interface LevelBasedHierarchyViewProps {
    nodes: AssetNode[];
    dataSources: DataSourceConfig[];
    selectedNodeId?: string;
    editingNode?: AssetNode | null;
    permissions: {
        allowEdit: boolean;
        allowDelete: boolean;
        allowCreate: boolean;
    };
    isDevelopmentMode: boolean;
    searchTerm: string;
    expandedByDefault: boolean;
    onNodeSelect: (node: AssetNode) => void;
    // onEditStart supprimé - l'édition se fait maintenant entièrement en inline
}

const LEVEL_ICON_MAP = {
    1: Home,
    2: Building,
    3: Package,
    4: Server,
    5: Zap
};

const LEVEL_COLOR_MAP = {
    1: "var(--at-color-primary)",
    2: "var(--at-color-electric)",
    3: "var(--at-color-gas)",
    4: "var(--at-color-water)",
    5: "var(--at-color-air)"
};

export function LevelBasedHierarchyView({
    nodes,
    dataSources,
    selectedNodeId,
    permissions: _permissions, // unused après suppression des boutons d'édition
    isDevelopmentMode,
    searchTerm,
    expandedByDefault,
    onNodeSelect
}: LevelBasedHierarchyViewProps): ReactElement {
    
    // Initialiser expandedLevels selon la configuration
    const [expandedLevels, setExpandedLevels] = useState<Set<number>>(() => {
        if (expandedByDefault) {
            // Si expandedByDefault = true, déplier tous les niveaux disponibles
            return new Set(dataSources.map(ds => ds.level));
        }
        // Sinon, tout replié par défaut
        return new Set();
    });
    const [levelFilters, setLevelFilters] = useState<Set<number>>(new Set());
    
    // Create dynamic level config based on dataSources
    const levelConfig = dataSources.reduce((acc, ds) => {
        acc[ds.level] = {
            icon: LEVEL_ICON_MAP[ds.level as keyof typeof LEVEL_ICON_MAP] || Package,
            label: ds.name || `Niveau ${ds.level}`,
            color: LEVEL_COLOR_MAP[ds.level as keyof typeof LEVEL_COLOR_MAP] || "var(--at-color-primary)"
        };
        return acc;
    }, {} as Record<number, { icon: any; label: string; color: string }>);
    
    // Filtrer et organiser les nœuds par niveau
    const filteredNodes = nodes.filter(node => 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Grouper par niveau
    const nodesByLevel = filteredNodes.reduce((acc, node) => {
        if (!acc[node.level]) {
            acc[node.level] = [];
        }
        acc[node.level].push(node);
        return acc;
    }, {} as Record<number, AssetNode[]>);
    
    // Obtenir les niveaux triés
    const levels = Object.keys(nodesByLevel)
        .map(Number)
        .sort((a, b) => a - b);
        
    const toggleLevel = (level: number) => {
        const newExpanded = new Set(expandedLevels);
        if (newExpanded.has(level)) {
            newExpanded.delete(level);
        } else {
            newExpanded.add(level);
        }
        setExpandedLevels(newExpanded);
    };
    
    const toggleLevelFilter = (level: number) => {
        const newFilters = new Set(levelFilters);
        if (newFilters.has(level)) {
            newFilters.delete(level);
        } else {
            newFilters.add(level);
        }
        setLevelFilters(newFilters);
    };
    
    const renderAssetNode = (node: AssetNode): ReactElement => {
        const isSelected = selectedNodeId === node.id;
        const currentLevelConfig = levelConfig[node.level];
        const Icon = currentLevelConfig?.icon || Package;
        
        return (
            <div
                key={node.id}
                className={`asset-card ${isSelected ? 'asset-card-selected' : ''}`}
                onClick={() => onNodeSelect(node)}
            >
                <div className="asset-card-header">
                    <div className="asset-icon" style={{ color: currentLevelConfig?.color }}>
                        <Icon className="icon" />
                    </div>
                    <div className="asset-content">
                        <div className="asset-name">{node.name}</div>
                        <div className="asset-meta">
                            <span className="asset-type">{node.type}</span>
                            {node.unit && (
                                <div className="unit-container">
                                    <span className="separator">•</span>
                                    <span className="asset-unit">{node.unit}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {node.modified && (
                        <div className="modified-indicator" title="Modifié">
                            <div className="modified-dot"></div>
                        </div>
                    )}
                    {/* Bouton édition supprimé - édition inline directe dans le panneau de détails */}
                </div>
                
                {isDevelopmentMode && (
                    <div className="asset-debug-info">
                        <span>ID: {node.id}</span>
                        {node.parentId && <span>Parent: {node.parentId}</span>}
                        <span>Validé: {node.validated ? '✓' : '✗'}</span>
                    </div>
                )}
            </div>
        );
    };
    
    // Renderiser le message d'erreur pour les résultats vides
    const renderEmptyContent = (): ReactElement => {
        return (
            <div className="level-hierarchy-empty">
                <div className="empty-content">
                    <div className="empty-icon">🏭</div>
                    <h3>Aucun asset trouvé</h3>
                    <p>
                        {searchTerm 
                            ? `Aucun résultat pour "${searchTerm}"`
                            : "Aucune donnée disponible pour cette configuration"
                        }
                    </p>
                    {searchTerm && (
                        <div className="empty-hint">
                            Essayez de modifier votre recherche ou vérifiez les filtres appliqués
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    return (
        <div className="level-hierarchy-container">
            {/* Filtres rapides par niveau - toujours affichés */}
            <div className="level-filters">
                <div className="filter-label">
                    <Filter className="filter-icon" />
                    Filtres par niveau :
                </div>
                <div className="filter-pills">
                    {dataSources.map(ds => {
                        const config = levelConfig[ds.level];
                        const Icon = config?.icon || Package;
                        const isActive = levelFilters.has(ds.level);
                        const nodeCount = nodesByLevel[ds.level]?.length || 0;
                        
                        return (
                            <button
                                key={ds.level}
                                className={`filter-pill ${isActive ? 'filter-pill-active' : ''}`}
                                onClick={() => toggleLevelFilter(ds.level)}
                                style={{ 
                                    '--pill-color': config?.color,
                                    borderColor: isActive ? config?.color : undefined
                                } as any}
                            >
                                <Icon className="pill-icon" />
                                {config?.label || `Niveau ${ds.level}`}
                                <span className="pill-count">({nodeCount})</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            
            {/* Sections par niveau - ou message d'erreur si vide */}
            <div className="level-sections">
                {levels.length === 0 ? (
                    renderEmptyContent()
                ) : (
                    levels.map(level => {
                        const levelNodes = nodesByLevel[level];
                        const config = levelConfig[level];
                        const Icon = config?.icon || Package;
                        const isExpanded = expandedLevels.has(level);
                        const isFiltered = levelFilters.size > 0 && !levelFilters.has(level);
                        
                        if (isFiltered) return null;
                        
                        return (
                            <div key={level} className="level-section">
                                <div 
                                    className="level-header"
                                    onClick={() => toggleLevel(level)}
                                    style={{ borderLeftColor: config?.color } as any}
                                >
                                    <div className="level-header-content">
                                        <div className="level-icon" style={{ color: config?.color }}>
                                            <Icon className="icon" />
                                        </div>
                                        <div className="level-info">
                                            <h3 className="level-title">
                                                {config?.label || `Niveau ${level}`}
                                            </h3>
                                            <div className="level-meta">
                                                {levelNodes.length} élément{levelNodes.length > 1 ? 's' : ''}
                                                {levelNodes.filter(n => n.modified).length > 0 && (
                                                    <span className="modified-count">
                                                        • {levelNodes.filter(n => n.modified).length} modifié{levelNodes.filter(n => n.modified).length > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button className={`expand-btn ${isExpanded ? 'expand-btn-expanded' : ''}`}>
                                        {isExpanded ? <ChevronDown className="icon" /> : <ChevronRight className="icon" />}
                                    </button>
                                </div>
                                
                                {isExpanded && (
                                    <div className="level-content">
                                        <div className="asset-grid">
                                            {levelNodes.map(node => renderAssetNode(node))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
} 