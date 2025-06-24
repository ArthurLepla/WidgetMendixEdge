import { ReactElement, createElement, useState, useEffect, useCallback, useMemo } from "react";
import { AssetTableauContainerProps } from "../../typings/AssetTableauProps";
import { 
    WidgetState, 
    WidgetEvent, 
    WidgetStateContext, 
    transition, 
    createInitialContext, 
    WidgetStateError 
} from "./states";
import { logger } from "./observability";
import { 
    AssetNode, 
    DataSourceConfig, 
    WidgetConfiguration,
    AssetNodeBuilder,
    HierarchyFilterService,
    QuickStats 
} from "./types";
import { LevelBasedHierarchyView } from "./LevelBasedHierarchyView";
import { ModernToolbar } from "./ModernToolbar";
import { EnhancedDetailsPanel } from "./EnhancedDetailsPanel";





export function AssetTableauComponent(props: AssetTableauContainerProps): ReactElement {
    // État FSM principal
    const [stateContext, setStateContext] = useState<WidgetStateContext>(() => createInitialContext());
    
    // État de l'interface
    const [selectedNode, setSelectedNode] = useState<AssetNode | null>(null);
    const [showModifiedOnly, setShowModifiedOnly] = useState(false);

    // Configuration du widget
    const config: WidgetConfiguration = useMemo(() => ({
        mode: props.mode,
        maxLevels: props.maxLevels,
        permissions: {
            allowEdit: props.allowEdit || false,
            allowDelete: (props.allowDelete || false) && props.mode === 'dev',
            allowCreate: (props.allowCreate || false) && props.mode === 'dev'
        },
        showSearch: props.showSearch,
        showFilters: props.showFilters,
        expandedByDefault: props.expandedByDefault
    }), [props]);

    // Debug configuration
    console.debug('Widget configuration:', {
        mode: config.mode,
        permissions: config.permissions,
        isDevelopmentMode: config.mode === 'dev'
    });

    // Configuration des sources de données - ne prendre que les niveaux configurés
    const dataSources: DataSourceConfig[] = useMemo(() => {
        const configs = [];
        
        // Level 1 (toujours requis)
        if (props.level1DataSource) {
            configs.push({
                dataSource: props.level1DataSource,
                name: props.level1Name,
                level: 1,
                nameAttribute: props.level1NameAttribute,
                parentAttribute: props.level1ParentAttribute,
                unitAttribute: props.level1UnitAttribute
            });
        }
        
        // Level 2 (optionnel)
        if (props.level2DataSource && config.maxLevels >= 2) {
            configs.push({
                dataSource: props.level2DataSource,
                name: props.level2Name,
                level: 2,
                nameAttribute: props.level2NameAttribute,
                parentAttribute: props.level2ParentAttribute,
                unitAttribute: props.level2UnitAttribute
            });
        }
        
        // Level 3 (optionnel)
        if (props.level3DataSource && config.maxLevels >= 3) {
            configs.push({
                dataSource: props.level3DataSource,
                name: props.level3Name,
                level: 3,
                nameAttribute: props.level3NameAttribute,
                parentAttribute: props.level3ParentAttribute,
                unitAttribute: props.level3UnitAttribute
            });
        }
        
        // Level 4 (optionnel)
        if (props.level4DataSource && config.maxLevels >= 4) {
            configs.push({
                dataSource: props.level4DataSource,
                name: props.level4Name,
                level: 4,
                nameAttribute: props.level4NameAttribute,
                parentAttribute: props.level4ParentAttribute,
                unitAttribute: props.level4UnitAttribute
            });
        }
        
        // Level 5 (optionnel)
        if (props.level5DataSource && config.maxLevels >= 5) {
            configs.push({
                dataSource: props.level5DataSource,
                name: props.level5Name,
                level: 5,
                nameAttribute: props.level5NameAttribute,
                parentAttribute: props.level5ParentAttribute,
                unitAttribute: props.level5UnitAttribute
            });
        }
        
        return configs;
    }, [props, config.maxLevels]);

    // Transition d'état avec logging
    const executeTransition = useCallback((event: WidgetEvent, additionalContext: Partial<WidgetStateContext> = {}) => {
        const startTime = Date.now();
        const fromState = stateContext.currentState;
        
        logger.debug(`Attempting transition: ${fromState} + ${event}`, stateContext.correlationId, {
            fromState,
            event,
            additionalContext
        });

        const newStateOrError = transition(fromState, event, stateContext);
        
        if (newStateOrError instanceof WidgetStateError) {
            logger.error(`FSM Transition failed`, stateContext.correlationId, {
                fromState,
                event,
                error: newStateOrError.message
            });
            
            // En cas d'erreur de transition, on passe en état ERROR
            setStateContext(prev => ({
                ...prev,
                currentState: WidgetState.ERROR,
                error: newStateOrError.message,
                lastTransition: new Date()
            }));
            return;
        }

        const toState = newStateOrError;
        const duration = Date.now() - startTime;
        
        logger.logStateTransition(fromState, toState, event, stateContext.correlationId, duration);
        
        setStateContext(prev => ({
            ...prev,
            ...additionalContext,
            currentState: toState,
            error: undefined,
            lastTransition: new Date()
        }));
    }, [stateContext]);

    // Données converties en AssetNode[]
    const hierarchyData: AssetNode[] = useMemo(() => {
        if (stateContext.currentState !== WidgetState.READY) return [];
        
        const flatNodes: AssetNode[] = [];
        
        dataSources.forEach(config => {
            if (config.dataSource?.items) {
                config.dataSource.items.forEach((item, index) => {
                    const node = AssetNodeBuilder.fromMendixItem(item, config, index);
                    flatNodes.push(node);
                });
            }
        });
        
        return flatNodes;
    }, [dataSources, stateContext.currentState]);

    // Données filtrées
    const filteredData = useMemo(() => {
        let filtered = hierarchyData;
        
        // Filtre par recherche
        filtered = HierarchyFilterService.filterBySearch(
            filtered, 
            stateContext.searchTerm, 
            config.mode === 'dev'
        );
        
        // Filtre par modification
        filtered = HierarchyFilterService.filterByModified(filtered, showModifiedOnly);
        
        // Filtre par niveaux sélectionnés
        filtered = HierarchyFilterService.filterByLevel(filtered, stateContext.selectedFilters);
        
        return filtered;
    }, [hierarchyData, stateContext.searchTerm, stateContext.selectedFilters, showModifiedOnly, config.mode]);

    // Stats rapides
    const quickStats: QuickStats = useMemo(() => ({
        totalItems: hierarchyData.length,
        modifiedItems: hierarchyData.filter(node => node.modified).length,
        validationErrors: hierarchyData.filter(node => node.validated === false).length,
        visibleLevels: dataSources.length
    }), [hierarchyData, dataSources.length]);

    // Initialisation du widget
    useEffect(() => {
        logger.info('Widget initializing', stateContext.correlationId, {
            mode: config.mode,
            maxLevels: config.maxLevels,
            dataSourcesCount: dataSources.length,
            configuredLevels: dataSources.map(ds => ({ level: ds.level, name: ds.name, hasData: !!ds.dataSource }))
        });
        
        executeTransition(WidgetEvent.INITIALIZE);
    }, []);

    // Chargement des données quand on passe en LOADING_DATA
    useEffect(() => {
        if (stateContext.currentState === WidgetState.LOADING_DATA) {
            logger.info('Starting data load', stateContext.correlationId);
            
            const loadData = async () => {
                try {
                    await new Promise(resolve => setTimeout(resolve, 100)); // Simulation async
                    executeTransition(WidgetEvent.DATA_LOADED);
                } catch (error) {
                    logger.error('Data load failed', stateContext.correlationId, { error });
                    executeTransition(WidgetEvent.DATA_LOAD_FAILED);
                }
            };
            
            loadData();
        }
    }, [stateContext.currentState, stateContext.correlationId, executeTransition]);

    // Note: L'expansion par défaut est maintenant gérée directement dans LevelBasedHierarchyView

    // Handlers d'événements
    const handleSearchChange = useCallback((searchTerm: string) => {
        logger.debug('Search term changed', stateContext.correlationId, { searchTerm });
        setStateContext(prev => ({ ...prev, searchTerm }));
    }, [stateContext.correlationId]);

    const handleNodeSelect = useCallback((node: AssetNode) => {
        logger.debug('Node selected', stateContext.correlationId, { nodeId: node.id, nodeType: node.type });

        console.log('%c[DEBUG] Asset Selected in Grid:', 'color: #3293f3; font-weight: bold;', {
            id: node.id,
            name: node.name,
            type: node.type,
            level: node.level,
            unit: node.unit,
            parentId: node.parentId,
            modified: node.modified,
            validated: node.validated,
            childrenCount: node.children?.length || 0,
            metadata: node.metadata
        });

        setSelectedNode(node);
        setStateContext(prev => ({ ...prev, selectedNodeId: node.id }));
    }, [stateContext.correlationId]);

    // handleEditStart supprimé - l'édition inline ne nécessite plus de mode édition global

    const handleEditSave = useCallback(async (node: AssetNode, updates: Partial<AssetNode>) => {
        logger.debug('handleEditSave called', stateContext.correlationId, { 
            nodeId: node.id, 
            nodeName: node.name,
            updates,
            level: node.level
        });

        executeTransition(WidgetEvent.START_EDIT, { 
            editingNodeId: node.id,
            pendingSaveNode: node,
            pendingSaveUpdates: updates
        });
    }, [stateContext.correlationId, executeTransition]);

    // Gestion des transitions d'édition/sauvegarde séquentielles
    useEffect(() => {
        if (stateContext.currentState === WidgetState.EDITING && stateContext.pendingSaveNode) {
            logger.debug('State is now EDITING, starting save process', stateContext.correlationId);
            executeTransition(WidgetEvent.SAVE_EDIT);
        }
    }, [stateContext.currentState, stateContext.pendingSaveNode, stateContext.correlationId, executeTransition]);

    useEffect(() => {
        if (stateContext.currentState === WidgetState.SAVING && stateContext.pendingSaveNode && stateContext.pendingSaveUpdates) {
            logger.debug('State is now SAVING, performing actual save', stateContext.correlationId);
            
            const performSave = async () => {
                try {
                    const node = stateContext.pendingSaveNode!;
                    const updates = stateContext.pendingSaveUpdates!;
                    
                    // 1. Obtenir l'objet Mendix de l'asset sélectionné
                    const mendixObject = node.metadata.mendixObject;
                    if (!mendixObject) {
                        throw new Error("Mendix object not found in node metadata.");
                    }

                    // Logs de débogage pour diagnostiquer le problème
                    logger.debug(`Inspecting mendixObject`, stateContext.correlationId, {
                        nodeId: node.id,
                        nodeName: node.name,
                        nodeLevel: node.level,
                        mendixObjectType: typeof mendixObject,
                        mendixObjectConstructor: mendixObject.constructor.name,
                        mendixObjectId: mendixObject.id || 'NO_ID',
                        hasGetGuid: typeof mendixObject.getGuid === 'function',
                        objectKeys: Object.keys(mendixObject),
                        objectValues: Object.values(mendixObject).map(v => typeof v).slice(0, 5) // Premier 5 valeurs pour éviter overflow
                    });

                    // Test préliminaire avant d'utiliser getGuid()
                    let objectGuid: string;
                    try {
                        if (typeof mendixObject.getGuid === 'function') {
                            objectGuid = mendixObject.getGuid();
                        } else {
                            // Fallback si getGuid n'existe pas
                            objectGuid = mendixObject.id || 'unknown-guid';
                            logger.warn(`mendixObject.getGuid is not a function, using fallback id: ${objectGuid}`, stateContext.correlationId);
                        }
                    } catch (guidError) {
                        objectGuid = mendixObject.id || 'error-guid';
                        logger.error(`Error calling getGuid(), using fallback: ${guidError}`, stateContext.correlationId);
                    }

                    // 2. Déterminer l'action de sauvegarde selon le niveau
                    let updateAction;
                    switch (node.level) {
                        case 1:
                            updateAction = props.level1UpdateAction;
                            break;
                        case 2:
                            updateAction = props.level2UpdateAction;
                            break;
                        case 3:
                            updateAction = props.level3UpdateAction;
                            break;
                        case 4:
                            updateAction = props.level4UpdateAction;
                            break;
                        case 5:
                            updateAction = props.level5UpdateAction;
                            break;
                        default:
                            throw new Error(`No update action configured for level ${node.level}`);
                    }

                    if (!updateAction) {
                        throw new Error(`Update action for level ${node.level} is not configured.`);
                    }
                    
                    logger.debug(`Found update action for level ${node.level}`, stateContext.correlationId, {
                        hasAction: !!updateAction,
                        actionType: typeof updateAction
                    });
                    
                    // 3. Obtenir l'action spécifique à cet objet
                    const actionForObject = updateAction.get(mendixObject);
                    if (!actionForObject) {
                        throw new Error(`Update action for level ${node.level} is not available for this object.`);
                    }
                    
                    logger.debug(`Action for object obtained`, stateContext.correlationId, {
                        hasActionForObject: !!actionForObject,
                        canExecute: actionForObject.canExecute,
                        objectId: objectGuid
                    });
                    
                    if (!actionForObject.canExecute) {
                        throw new Error(`Update action for level ${node.level} cannot be executed.`);
                    }

                    // 4. Écrire la nouvelle valeur directement dans le buffer (pas de JSON)
                    // Le microflow attend juste la nouvelle valeur dans NewString
                    if (props.updateBufferAttribute && updates.name) {
                        logger.debug(`Writing new name directly to buffer: "${updates.name}"`, stateContext.correlationId);
                        
                        props.updateBufferAttribute.setValue(updates.name);
                    } else if (props.updateBufferAttribute && updates.unit) {
                        logger.debug(`Writing new unit directly to buffer: "${updates.unit}"`, stateContext.correlationId);
                        
                        props.updateBufferAttribute.setValue(updates.unit);
                    } else {
                        logger.warn(`No buffer configured or no name/unit to update!`, stateContext.correlationId);
                    }

                    // 5. Exécuter l'action Mendix - les nouvelles valeurs sont dans le buffer
                    logger.debug(`About to execute microflow for level ${node.level}`, stateContext.correlationId, {
                        objectGuid: objectGuid,
                        updates: updates,
                        bufferPopulated: !!props.updateBufferAttribute
                    });
                    
                    await actionForObject.execute();
                    
                    logger.info(`Microflow executed successfully for level ${node.level}`, stateContext.correlationId, {
                        objectGuid: objectGuid
                    });

                    // 4. Finaliser la transition
                    executeTransition(WidgetEvent.SAVE_SUCCESS, {
                        pendingSaveNode: undefined,
                        pendingSaveUpdates: undefined
                    });
                    
                    // 6. Recharger automatiquement les données pour refléter les changements  
                    logger.debug(`Reloading all data sources after successful save`, stateContext.correlationId);
                    dataSources.forEach(ds => {
                        if (ds.dataSource) {
                            ds.dataSource.reload();
                        }
                    });
                    
                    // 7. Déclencher l'action de refresh si configurée
                    if (props.onRefreshAction && props.onRefreshAction.canExecute) {
                        logger.debug(`Executing refresh action after save`, stateContext.correlationId);
                        await props.onRefreshAction.execute();
                    }
                    
                    // 8. Programmer la mise à jour du selectedNode après le rechargement des données
                    setTimeout(() => {
                        logger.debug(`Updating selectedNode with refreshed data after save`, stateContext.correlationId);
                        // Les données seront rechargées via useEffect et le selectedNode sera mis à jour automatiquement
                    }, 100);

                } catch (error) {
                    logger.error('Edit save failed', stateContext.correlationId, { 
                        nodeId: stateContext.pendingSaveNode!.id, 
                        error: error instanceof Error ? error.message : String(error) 
                    });
                    executeTransition(WidgetEvent.SAVE_FAILED, {
                        error: error instanceof Error ? error.message : "Erreur inconnue lors de la sauvegarde.",
                        pendingSaveNode: undefined,
                        pendingSaveUpdates: undefined
                    });
                }
            };
            
            performSave();
        }
    }, [stateContext, executeTransition, props, dataSources]);

    // Mettre à jour le selectedNode quand les données changent après sauvegarde
    useEffect(() => {
        if (selectedNode && stateContext.selectedNodeId) {
            // Rechercher le nœud mis à jour dans les nouvelles données
            const updatedNode = hierarchyData.find((node: AssetNode) => node.id === stateContext.selectedNodeId);
            if (updatedNode && updatedNode.name !== selectedNode.name) {
                logger.debug(`Updating selectedNode with fresh data`, stateContext.correlationId, {
                    oldName: selectedNode.name,
                    newName: updatedNode.name,
                    nodeId: updatedNode.id
                });
                setSelectedNode(updatedNode);
            }
        }
    }, [hierarchyData, selectedNode, stateContext.selectedNodeId, stateContext.correlationId]);

    // handleEditCancel supprimé - l'édition se fait maintenant dans EnhancedDetailsPanel

    // États de chargement pour la toolbar (avant le switch)
    const isToolbarLoading = stateContext.currentState === WidgetState.SAVING || 
                             stateContext.currentState === WidgetState.EDITING;

    // Affichage en fonction de l'état
    switch (stateContext.currentState) {
        case WidgetState.INITIALIZING:
            return (
                <div className="loading-state">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Initialisation du widget...</p>
                    </div>
                </div>
            );

        case WidgetState.LOADING_DATA:
            return (
                <div className="loading-state">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Chargement des données...</p>
                    </div>
                </div>
            );

        case WidgetState.EDITING:
            return (
                <div className="loading-state">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Préparation de l'édition...</p>
                    </div>
                </div>
            );

        case WidgetState.SAVING:
            return (
                <div className="loading-state">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Sauvegarde en cours...</p>
                    </div>
                </div>
            );

        case WidgetState.ERROR:
            return (
                <div className="error-state">
                    <div className="error-content">
                        <div className="error-icon">⚠️</div>
                        <p className="error-title">Erreur dans le widget</p>
                        <p className="error-message">{stateContext.error}</p>
                        <button 
                            onClick={() => executeTransition(WidgetEvent.RESET)}
                            className="error-retry-btn"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            );

        case WidgetState.READY:
        case WidgetState.VALIDATING:
        default:
            // États qui permettent l'affichage normal de l'interface
            break;
    }

    return (
        <div className="asset-tableau">
            <ModernToolbar
                searchTerm={stateContext.searchTerm}
                onSearchChange={handleSearchChange}
                showModifiedOnly={showModifiedOnly}
                onShowModifiedOnlyChange={setShowModifiedOnly}
                onExport={() => logger.info('Export requested', stateContext.correlationId)}
                isLoading={isToolbarLoading}
                totalItems={quickStats.totalItems}
                modifiedItems={quickStats.modifiedItems}
                correlationId={stateContext.correlationId}
            />
            
            <div className="main-content">
                <div className="hierarchy-panel">
                    <LevelBasedHierarchyView
                        nodes={filteredData}
                        dataSources={dataSources}
                        selectedNodeId={selectedNode?.id}
                        editingNode={null}
                        permissions={config.permissions}
                        isDevelopmentMode={config.mode === 'dev'}
                        searchTerm={stateContext.searchTerm}
                        expandedByDefault={config.expandedByDefault}
                        onNodeSelect={handleNodeSelect}
                    />
                </div>
                
                <div className="details-panel">
                    <EnhancedDetailsPanel
                        selectedNode={selectedNode}
                        permissions={config.permissions}
                        isDevelopmentMode={config.mode === 'dev'}
                        onEditSave={handleEditSave}
                        isSaveConfigured={!!props.level1UpdateAction}
                    />
                </div>
            </div>
        </div>
    );
}