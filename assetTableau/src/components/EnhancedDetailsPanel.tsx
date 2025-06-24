import { ReactElement, createElement, useState, useEffect } from "react";
import { 
    Home, Package, Building, Server, Zap, Save, X, 
    Eye, EyeOff, AlertTriangle, CheckCircle, Clock,
    Copy, Trash2, Plus
} from "lucide-react";
import { AssetNode, AssetNodeType, HierarchyPermissions } from "./types";

interface EnhancedDetailsPanelProps {
    selectedNode: AssetNode | null;
    permissions: HierarchyPermissions;
    isDevelopmentMode: boolean;
    onEditSave?: (node: AssetNode, updates: Partial<AssetNode>) => Promise<void>;
    onDuplicate?: (node: AssetNode) => void;
    onDelete?: (node: AssetNode) => void;
    isSaveConfigured: boolean;
}

export function EnhancedDetailsPanel({
    selectedNode,
    permissions,
    isDevelopmentMode,
    onEditSave,
    onDuplicate,
    onDelete,
    isSaveConfigured
}: EnhancedDetailsPanelProps): ReactElement {

    const [editValues, setEditValues] = useState<Partial<AssetNode>>({});
    const [showAllFields, setShowAllFields] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const getNodeIcon = (type: AssetNodeType) => {
        switch (type) {
            case 'Usine': return <Home className="icon" />;
            case 'Secteur': return <Package className="icon" />;
            case 'Atelier': return <Building className="icon" />;
            case 'ETH': return <Server className="icon" />;
            case 'Machine': return <Zap className="icon" />;
            default: return <Package className="icon" />;
        }
    };

    const getStatusIcon = (node: AssetNode) => {
        if (!node.validated) return <AlertTriangle className="status-icon warning" />;
        if (node.modified) return <Clock className="status-icon modified" />;
        return <CheckCircle className="status-icon validated" />;
    };

    const getStatusText = (node: AssetNode) => {
        if (!node.validated) return "Nécessite validation";
        if (node.modified) return "Modifié";
        return "Validé";
    };

    const getStatusClass = (node: AssetNode) => {
        if (!node.validated) return "status-warning";
        if (node.modified) return "status-modified";
        return "status-validated";
    };

    // Reset des valeurs d'édition quand on change de nœud
    useEffect(() => {
        setEditValues({});
        setHasUnsavedChanges(false);

        if (selectedNode) {
            console.log('%c[DEBUG] Details Panel Received Node:', 'color: #f9be01; font-weight: bold;', {
                node: selectedNode,
                permissions,
                isDevelopmentMode
            });
        }
    }, [selectedNode, permissions, isDevelopmentMode]);

    const handleFieldChange = (key: string, value: any) => {
        setEditValues(prev => ({ ...prev, [key]: value }));
        setHasUnsavedChanges(true);
    };

    const handleSaveChanges = async () => {
        if (!selectedNode || !onEditSave || !hasUnsavedChanges) return;
        
        try {
            await onEditSave(selectedNode, editValues);
            setEditValues({});
            setHasUnsavedChanges(false);
            // Note: Le parent devra refresh le widget après le commit Mendix
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
        }
    };

    const handleCancelChanges = () => {
        setEditValues({});
        setHasUnsavedChanges(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && hasUnsavedChanges) {
            e.preventDefault();
            handleSaveChanges();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelChanges();
        }
    };

    if (!selectedNode) {
        return (
            <div className="details-panel-empty">
                <div className="empty-state">
                    <div className="empty-icon">
                        <Package className="icon" />
                    </div>
                    <h3 className="empty-title">Aucun asset sélectionné</h3>
                </div>
            </div>
        );
    }

    const editableFields = isDevelopmentMode 
        ? ['name', 'type', 'unit', 'level', 'parentId'] 
        : ['name', 'unit'];

    // Déterminer les champs réellement éditables
    const getFieldEditability = (key: string) => {
        if (!permissions.allowEdit || !isSaveConfigured) {
            return false;
        }
        
        const config = selectedNode!.metadata.dataSourceConfig;
        
        switch (key) {
            case 'name':
                return !!config.nameAttribute;
            case 'unit':
                return !!config.unitAttribute;
            default:
                return isDevelopmentMode && editableFields.includes(key);
        }
    };

    const displayableFields = Object.entries(selectedNode)
        .filter(([key]) => !['id', 'children', 'metadata'].includes(key))
        .filter(([key, fieldValue]) => {
            // Exclure les champs undefined ou vides
            if (fieldValue === undefined || fieldValue === null || fieldValue === '') return false;
            
            // Logique d'affichage existante
            return showAllFields || editableFields.includes(key) || key === 'type' || key === 'level';
        });

    return (
        <div className="enhanced-details-panel">
            {/* Header */}
            <div className="details-header">
                <div className="asset-header-info">
                    <div className="asset-icon-container">
                        {getNodeIcon(selectedNode.type)}
                    </div>
                    <div className="asset-title-section">
                        <h2 className="asset-title">{selectedNode.name}</h2>
                        <div className="asset-subtitle">
                            <span className="asset-type-badge">{selectedNode.type}</span>
                            <span className="level-indicator">Niveau {selectedNode.level}</span>
                            {selectedNode.unit && (
                                <span className="unit-indicator">{selectedNode.unit}</span>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className={`status-badge ${getStatusClass(selectedNode)}`}>
                    {getStatusIcon(selectedNode)}
                    <span className="status-text">{getStatusText(selectedNode)}</span>
                </div>
            </div>

            {/* Quick Actions - supprimées au profit de l'édition inline */}
            {isDevelopmentMode && (
                <div className="quick-actions">
                    <div className="dev-actions">
                        {onDuplicate && (
                            <button 
                                onClick={() => onDuplicate(selectedNode)}
                                className="quick-action-btn secondary"
                                title="Dupliquer cet asset"
                            >
                                <Copy className="btn-icon" />
                            </button>
                        )}
                        {permissions.allowDelete && onDelete && (
                            <button 
                                onClick={() => onDelete(selectedNode)}
                                className="quick-action-btn danger"
                                title="Supprimer cet asset"
                            >
                                <Trash2 className="btn-icon" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Properties Section */}
            <div className="properties-section">
                <div className="section-header">
                    <h3 className="section-title">Propriétés</h3>
                    {isDevelopmentMode && (
                        <button 
                            onClick={() => setShowAllFields(!showAllFields)}
                            className="toggle-fields-btn"
                            title={showAllFields ? "Masquer les champs avancés" : "Afficher tous les champs"}
                        >
                            {showAllFields ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
                            <span>{showAllFields ? "Masquer" : "Tout voir"}</span>
                        </button>
                    )}
                </div>
                
                <div className="properties-grid">
                    {displayableFields.map(([key, value]) => {
                        const isEditable = getFieldEditability(key);
                        const currentValue = editValues[key as keyof AssetNode] ?? value;
                        
                        return (
                            <div key={key} className="property-row">
                                <label className="property-label">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                <div className="property-value">
                                    {isEditable ? (
                                        <input
                                            type={typeof value === 'number' ? 'number' : 'text'}
                                            value={String(currentValue)}
                                            className="property-input inline-edit"
                                            onChange={(e) => handleFieldChange(key, e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={`Entrez ${key} (Enter pour sauvegarder, Escape pour annuler)`}
                                        />
                                    ) : (
                                        <span className="property-display readonly">
                                            {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Metadata Section (Dev mode only) */}
            {isDevelopmentMode && selectedNode.metadata && showAllFields && (
                <div className="metadata-section">
                    <div className="section-header">
                        <h3 className="section-title">Métadonnées système</h3>
                    </div>
                    <div className="metadata-content">
                        <pre className="metadata-json">
                            {JSON.stringify(selectedNode.metadata, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* Related Assets (if applicable) */}
            {selectedNode.children && selectedNode.children.length > 0 && (
                <div className="related-section">
                    <div className="section-header">
                        <h3 className="section-title">Assets liés</h3>
                        <span className="count-badge">{selectedNode.children.length}</span>
                    </div>
                    <div className="related-list">
                        {selectedNode.children.slice(0, 5).map(child => (
                            <div key={child.id} className="related-item">
                                <div className="related-icon">
                                    {getNodeIcon(child.type)}
                                </div>
                                <div className="related-info">
                                    <span className="related-name">{child.name}</span>
                                    <span className="related-type">{child.type}</span>
                                </div>
                            </div>
                        ))}
                        {selectedNode.children.length > 5 && (
                            <div className="more-indicator">
                                <Plus className="icon" />
                                <span>{selectedNode.children.length - 5} autres...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Action Buttons - Apparaissent seulement quand il y a des changements */}
            {hasUnsavedChanges && (
                <div className="floating-actions">
                    <div className="floating-actions-content">
                        <span className="changes-indicator">
                            Modifications non sauvegardées
                        </span>
                        <div className="action-buttons">
                            <button 
                                onClick={handleSaveChanges}
                                className="floating-btn save"
                                title="Sauvegarder les modifications"
                            >
                                <Save className="btn-icon" />
                                <span>Sauvegarder</span>
                            </button>
                            <button 
                                onClick={handleCancelChanges}
                                className="floating-btn cancel"
                                title="Annuler les modifications"
                            >
                                <X className="btn-icon" />
                                <span>Annuler</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 