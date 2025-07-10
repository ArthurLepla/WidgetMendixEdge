import { ReactElement, createElement } from "react";
import { 
    Download, 
    X, 
    Database,
    RefreshCw,
    Eye,
    EyeOff
} from "lucide-react";
import { logger } from "./observability";

interface ModernToolbarProps {
    searchTerm: string;
    onSearchChange: (searchTerm: string) => void;
    showModifiedOnly: boolean;
    onShowModifiedOnlyChange: (show: boolean) => void;
    onExport: () => void;
    isLoading?: boolean;
    totalItems?: number;
    modifiedItems?: number;
    correlationId?: string;
}

export function ModernToolbar({
    searchTerm,
    onSearchChange,
    showModifiedOnly,
    onShowModifiedOnlyChange,
    onExport,
    isLoading = false,
    totalItems = 0,
    modifiedItems = 0,
    correlationId = 'toolbar'
}: ModernToolbarProps): ReactElement {
    
    const clearSearch = () => {
        try {
            logger.debug('Search cleared', correlationId, { previousTerm: searchTerm });
            onSearchChange("");
        } catch (error) {
            logger.error('Search clear failed', correlationId, { error });
        }
    };

    const handleSearchChange = (value: string) => {
        try {
            logger.debug('Search term changed', correlationId, { 
                searchTerm: value, 
                previousTerm: searchTerm,
                length: value.length 
            });
            onSearchChange(value);
        } catch (error) {
            logger.error('Search change failed', correlationId, { error, searchTerm: value });
        }
    };

    const handleFilterToggle = () => {
        try {
            const newState = !showModifiedOnly;
            logger.debug('Filter toggled', correlationId, { 
                showModifiedOnly: newState,
                modifiedItems 
            });
            onShowModifiedOnlyChange(newState);
        } catch (error) {
            logger.error('Filter toggle failed', correlationId, { error });
        }
    };

    const handleExport = () => {
        try {
            logger.info('Export requested', correlationId, { 
                totalItems,
                modifiedItems,
                searchTerm,
                showModifiedOnly 
            });
            onExport();
        } catch (error) {
            logger.error('Export failed', correlationId, { error });
        }
    };
    
    return (
        <header className="modern-toolbar">
            <div className="toolbar-container">
                {/* Brand compact */}
                <div className="brand-compact">
                    <div className="brand-icon">
                        <Database className="icon-brand" />
                    </div>
                    <div className="brand-info">
                        <h1 className="app-title">Asset Tableau</h1>
                        <div className="metrics-compact">
                            {totalItems} asset{totalItems !== 1 ? 's' : ''}
                            {modifiedItems > 0 && (
                                <span className="modified-badge">{modifiedItems}</span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Search Ant Design style */}
                <div className="search-section">
                    <div className="ant-input-search-wrapper">
                        <div className="ant-input-wrapper ant-input-group">
                            <span className="ant-input-prefix">
                                <svg 
                                    viewBox="0 0 1024 1024" 
                                    className="search-icon"
                                    focusable="false" 
                                    aria-hidden="true"
                                >
                                    <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
                                </svg>
                            </span>
                            <input
                                className="ant-input"
                                placeholder="Rechercher des assets..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                disabled={isLoading}
                                type="text"
                            />
                            {searchTerm && (
                                <span className="ant-input-suffix">
                                    <button
                                        className="ant-input-clear-icon"
                                        onClick={clearSearch}
                                        disabled={isLoading}
                                        type="button"
                                        aria-label="Effacer"
                                    >
                                        <X className="clear-icon" />
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Actions compactes */}
                <div className="actions-compact">
                    {/* Loading indicator intégré */}
                    {isLoading && (
                        <div className="loading-spin-icon">
                            <RefreshCw className="spin-icon" />
                        </div>
                    )}
                    
                    {/* Filtre conditionnel */}
                    {modifiedItems > 0 && (
                        <button
                            onClick={handleFilterToggle}
                            className={`action-btn-compact filter-btn ${showModifiedOnly ? 'active' : ''}`}
                            disabled={isLoading}
                            title={showModifiedOnly 
                                ? "Afficher tous les assets" 
                                : `Filtrer les ${modifiedItems} modifiés`
                            }
                        >
                            {showModifiedOnly ? (
                                <EyeOff className="btn-icon-sm" />
                            ) : (
                                <Eye className="btn-icon-sm" />
                            )}
                            <span className="btn-text-sm">
                                {showModifiedOnly ? 'Tous' : 'Modifiés'}
                            </span>
                        </button>
                    )}
                    
                    {/* Export principal */}
                    <button 
                        onClick={handleExport}
                        className="action-btn-compact export-btn primary" 
                        disabled={isLoading || totalItems === 0}
                        title="Exporter les données"
                    >
                        <Download className="btn-icon-sm" />
                        <span className="btn-text-sm">Exporter</span>
                    </button>
                </div>
            </div>
            
            {/* Progress bar fine */}
            {isLoading && (
                <div className="progress-line">
                    <div className="progress-fill"></div>
                </div>
            )}
                 </header>
     );
} 