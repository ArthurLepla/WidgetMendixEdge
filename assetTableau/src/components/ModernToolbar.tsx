import { ReactElement, createElement } from "react";
import { Download, Filter, X } from "lucide-react";
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
        <div className="modern-toolbar">
            <div className="toolbar-section toolbar-left">
                {/* Enhanced Search Bar */}
                <div className="enhanced-search-container">
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder="Rechercher un asset..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="enhanced-search-input"
                            disabled={isLoading}
                        />
                        {searchTerm && (
                            <button
                                className="search-clear-btn"
                                onClick={clearSearch}
                                title="Effacer la recherche"
                                disabled={isLoading}
                            >
                                <X className="clear-icon" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Actions Section */}
            <div className="toolbar-section toolbar-right">
                {/* Stats Counter */}
                <div className="toolbar-stats">
                    <span className="stats-text">
                        {totalItems} assets{modifiedItems > 0 && ` • ${modifiedItems} modifiés`}
                    </span>
                </div>

                {/* Modified Filter Button */}
                <button
                    onClick={handleFilterToggle}
                    className={`action-btn filter-toggle-btn ${showModifiedOnly ? 'filter-toggle-active' : ''}`}
                    disabled={isLoading}
                    title={`Afficher uniquement les éléments modifiés (${modifiedItems})`}
                >
                    <Filter className="btn-icon" />
                    <span className="btn-text">Modifiés {modifiedItems > 0 && `(${modifiedItems})`}</span>
                    {showModifiedOnly && <div className="active-indicator"></div>}
                </button>
                
                {/* Export Button */}
                <button 
                    onClick={handleExport}
                    className="action-btn export-btn-enhanced" 
                    title="Exporter les données"
                    disabled={isLoading}
                >
                    <Download className="btn-icon" />
                    <span className="btn-text">Exporter</span>
                </button>
                
                {/* Loading Indicator */}
                {isLoading && (
                    <div className="toolbar-loading">
                        <div className="loading-spinner-sm"></div>
                        <span className="loading-text-sm">Chargement...</span>
                    </div>
                )}
            </div>
        </div>
    );
} 