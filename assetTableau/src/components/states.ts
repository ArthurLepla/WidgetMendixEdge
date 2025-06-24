/**
 * Asset Tableau Widget States - Finite State Machine
 * Gère tous les états et transitions du widget de manière déterministe
 */

export enum WidgetState {
    INITIALIZING = 'INITIALIZING',
    LOADING_DATA = 'LOADING_DATA',
    READY = 'READY',
    EDITING = 'EDITING',
    SAVING = 'SAVING',
    ERROR = 'ERROR',
    VALIDATING = 'VALIDATING'
}

export enum WidgetEvent {
    INITIALIZE = 'INITIALIZE',
    DATA_LOADED = 'DATA_LOADED',
    DATA_LOAD_FAILED = 'DATA_LOAD_FAILED',
    START_EDIT = 'START_EDIT',
    SAVE_EDIT = 'SAVE_EDIT',
    CANCEL_EDIT = 'CANCEL_EDIT',
    SAVE_SUCCESS = 'SAVE_SUCCESS',
    SAVE_FAILED = 'SAVE_FAILED',
    START_VALIDATION = 'START_VALIDATION',
    VALIDATION_COMPLETE = 'VALIDATION_COMPLETE',
    RESET = 'RESET'
}

export interface WidgetStateContext {
    currentState: WidgetState;
    error?: string;
    editingNodeId?: string;
    pendingChanges: Map<string, any>;
    validationResults: Map<string, boolean>;
    searchTerm: string;
    selectedFilters: string[];
    expandedNodes: Set<string>;
    selectedNodeId?: string;
    correlationId: string;
    lastTransition: Date;
    // Propriétés pour gérer les transitions d'édition/sauvegarde
    pendingSaveNode?: any; // AssetNode
    pendingSaveUpdates?: any; // Partial<AssetNode>
}

export class WidgetStateError extends Error {
    constructor(
        message: string,
        public fromState: WidgetState,
        public event: WidgetEvent,
        public correlationId: string
    ) {
        super(`FSM Error [${correlationId}]: ${message} (${fromState} + ${event})`);
        this.name = 'WidgetStateError';
    }
}

/**
 * Transition pure function - no side effects
 * @param currentState Current state
 * @param event Incoming event
 * @param context Current context
 * @returns New state or Error
 */
export function transition(
    currentState: WidgetState,
    event: WidgetEvent,
    context: WidgetStateContext
): WidgetState | WidgetStateError {
    const correlationId = context.correlationId;
    
    switch (currentState) {
        case WidgetState.INITIALIZING:
            switch (event) {
                case WidgetEvent.INITIALIZE:
                    return WidgetState.LOADING_DATA;
                default:
                    return new WidgetStateError(
                        `Invalid transition`,
                        currentState,
                        event,
                        correlationId
                    );
            }
            
        case WidgetState.LOADING_DATA:
            switch (event) {
                case WidgetEvent.DATA_LOADED:
                    return WidgetState.READY;
                case WidgetEvent.DATA_LOAD_FAILED:
                    return WidgetState.ERROR;
                default:
                    return new WidgetStateError(
                        `Invalid transition`,
                        currentState,
                        event,
                        correlationId
                    );
            }
            
        case WidgetState.READY:
            switch (event) {
                case WidgetEvent.START_EDIT:
                    return WidgetState.EDITING;
                case WidgetEvent.START_VALIDATION:
                    return WidgetState.VALIDATING;
                case WidgetEvent.DATA_LOAD_FAILED:
                    return WidgetState.ERROR;
                default:
                    return new WidgetStateError(
                        `Invalid transition`,
                        currentState,
                        event,
                        correlationId
                    );
            }
            
        case WidgetState.EDITING:
            switch (event) {
                case WidgetEvent.SAVE_EDIT:
                    return WidgetState.SAVING;
                case WidgetEvent.CANCEL_EDIT:
                    return WidgetState.READY;
                default:
                    return new WidgetStateError(
                        `Invalid transition`,
                        currentState,
                        event,
                        correlationId
                    );
            }
            
        case WidgetState.SAVING:
            switch (event) {
                case WidgetEvent.SAVE_SUCCESS:
                    return WidgetState.READY;
                case WidgetEvent.SAVE_FAILED:
                    return WidgetState.ERROR;
                default:
                    return new WidgetStateError(
                        `Invalid transition`,
                        currentState,
                        event,
                        correlationId
                    );
            }
            
        case WidgetState.VALIDATING:
            switch (event) {
                case WidgetEvent.VALIDATION_COMPLETE:
                    return WidgetState.READY;
                default:
                    return new WidgetStateError(
                        `Invalid transition`,
                        currentState,
                        event,
                        correlationId
                    );
            }
            
        case WidgetState.ERROR:
            switch (event) {
                case WidgetEvent.RESET:
                    return WidgetState.LOADING_DATA;
                default:
                    return new WidgetStateError(
                        `Invalid transition`,
                        currentState,
                        event,
                        correlationId
                    );
            }
            
        default:
            return new WidgetStateError(
                `Unknown state`,
                currentState,
                event,
                correlationId
            );
    }
}

/**
 * Génère un ID de corrélation unique pour le traçage
 */
export function generateCorrelationId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Crée un contexte initial pour le widget
 */
export function createInitialContext(): WidgetStateContext {
    return {
        currentState: WidgetState.INITIALIZING,
        pendingChanges: new Map(),
        validationResults: new Map(),
        searchTerm: '',
        selectedFilters: [],
        expandedNodes: new Set(),
        correlationId: generateCorrelationId(),
        lastTransition: new Date()
    };
} 