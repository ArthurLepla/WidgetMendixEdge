// États et transitions pour la machine à états finis du widget Sankey
export type SankeyState = 
    | 'IDLE'
    | 'LOADING'
    | 'PROCESSING'
    | 'FILTERED'
    | 'RENDERED'
    | 'ERROR'
    | 'EMPTY';

export type SankeyEvent = 
    | 'START_LOADING'
    | 'DATA_RECEIVED'
    | 'PROCESSING_COMPLETE'
    | 'FILTER_APPLIED'
    | 'RENDER_COMPLETE'
    | 'ERROR_OCCURRED'
    | 'NO_DATA_FOUND'
    | 'RESET';

export interface SankeyStateContext {
    data: any;
    error?: string;
    selectedNode?: string | null;
    energyFilter?: string;
    hasDataForPeriod?: boolean;
    processingStep?: number;
    totalSteps?: number;
}

export interface StateTransition {
    from: SankeyState;
    event: SankeyEvent;
    to: SankeyState;
    guard?: (context: SankeyStateContext) => boolean;
    action?: (context: SankeyStateContext) => SankeyStateContext;
}

// Définition des transitions valides
export const SANKEY_TRANSITIONS: StateTransition[] = [
    // Depuis IDLE
    { from: 'IDLE', event: 'START_LOADING', to: 'LOADING' },
    
    // Depuis LOADING
    { from: 'LOADING', event: 'DATA_RECEIVED', to: 'PROCESSING' },
    { from: 'LOADING', event: 'ERROR_OCCURRED', to: 'ERROR' },
    { from: 'LOADING', event: 'NO_DATA_FOUND', to: 'EMPTY' },
    
    // Depuis PROCESSING
    { from: 'PROCESSING', event: 'PROCESSING_COMPLETE', to: 'FILTERED' },
    { from: 'PROCESSING', event: 'ERROR_OCCURRED', to: 'ERROR' },
    { from: 'PROCESSING', event: 'NO_DATA_FOUND', to: 'EMPTY' },
    
    // Depuis FILTERED
    { from: 'FILTERED', event: 'FILTER_APPLIED', to: 'FILTERED' },
    { from: 'FILTERED', event: 'RENDER_COMPLETE', to: 'RENDERED' },
    { from: 'FILTERED', event: 'ERROR_OCCURRED', to: 'ERROR' },
    
    // Depuis RENDERED
    { from: 'RENDERED', event: 'FILTER_APPLIED', to: 'FILTERED' },
    { from: 'RENDERED', event: 'START_LOADING', to: 'LOADING' },
    { from: 'RENDERED', event: 'ERROR_OCCURRED', to: 'ERROR' },
    
    // Depuis ERROR
    { from: 'ERROR', event: 'RESET', to: 'IDLE' },
    { from: 'ERROR', event: 'START_LOADING', to: 'LOADING' },
    
    // Depuis EMPTY
    { from: 'EMPTY', event: 'RESET', to: 'IDLE' },
    { from: 'EMPTY', event: 'START_LOADING', to: 'LOADING' },
];

// Machine à états finis
export class SankeyStateMachine {
    private currentState: SankeyState = 'IDLE';
    private context: SankeyStateContext = { data: null };
    private listeners: Array<(state: SankeyState, context: SankeyStateContext) => void> = [];

    constructor(initialContext?: Partial<SankeyStateContext>) {
        if (initialContext) {
            this.context = { ...this.context, ...initialContext };
        }
    }

    getCurrentState(): SankeyState {
        return this.currentState;
    }

    getContext(): SankeyStateContext {
        return { ...this.context };
    }

    // Ajouter un listener pour les changements d'état
    onStateChange(listener: (state: SankeyState, context: SankeyStateContext) => void): void {
        this.listeners.push(listener);
    }

    // Supprimer un listener
    removeStateChangeListener(listener: (state: SankeyState, context: SankeyStateContext) => void): void {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // Notifier tous les listeners
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.currentState, this.context);
            } catch (error) {
                console.error('Erreur dans le listener de changement d\'état:', error);
            }
        });
    }

    // Transition vers un nouvel état
    transition(event: SankeyEvent, newContext?: Partial<SankeyStateContext>): boolean {
        const validTransition = SANKEY_TRANSITIONS.find(
            t => t.from === this.currentState && t.event === event
        );

        if (!validTransition) {
            console.warn(`🚫 Transition invalide: ${this.currentState} + ${event}`);
            return false;
        }

        // Vérifier les conditions de garde si elles existent
        if (validTransition.guard && !validTransition.guard(this.context)) {
            console.warn(`🚫 Condition de garde non respectée: ${this.currentState} + ${event}`);
            return false;
        }

        // Mettre à jour le contexte
        if (newContext) {
            this.context = { ...this.context, ...newContext };
        }

        // Exécuter l'action si elle existe
        if (validTransition.action) {
            this.context = validTransition.action(this.context);
        }

        const previousState = this.currentState;
        this.currentState = validTransition.to;

        console.log(`🔄 Transition FSM: ${previousState} → ${this.currentState} (${event})`);
        
        // Notifier les listeners
        this.notifyListeners();

        return true;
    }

    // Réinitialiser la machine à états
    reset(): void {
        this.currentState = 'IDLE';
        this.context = { data: null };
        console.log('🔄 Machine à états réinitialisée');
        this.notifyListeners();
    }

    // Vérifier si une transition est possible
    canTransition(event: SankeyEvent): boolean {
        return SANKEY_TRANSITIONS.some(
            t => t.from === this.currentState && t.event === event
        );
    }

    // Obtenir les événements possibles depuis l'état actuel
    getPossibleEvents(): SankeyEvent[] {
        return SANKEY_TRANSITIONS
            .filter(t => t.from === this.currentState)
            .map(t => t.event);
    }
}

// Utilitaires pour le debugging
export const getStateDescription = (state: SankeyState): string => {
    switch (state) {
        case 'IDLE': return 'En attente de données';
        case 'LOADING': return 'Chargement des données';
        case 'PROCESSING': return 'Traitement des données';
        case 'FILTERED': return 'Données filtrées';
        case 'RENDERED': return 'Diagramme affiché';
        case 'ERROR': return 'Erreur détectée';
        case 'EMPTY': return 'Aucune donnée disponible';
        default: return 'État inconnu';
    }
};

export const getEventDescription = (event: SankeyEvent): string => {
    switch (event) {
        case 'START_LOADING': return 'Début du chargement';
        case 'DATA_RECEIVED': return 'Données reçues';
        case 'PROCESSING_COMPLETE': return 'Traitement terminé';
        case 'FILTER_APPLIED': return 'Filtre appliqué';
        case 'RENDER_COMPLETE': return 'Rendu terminé';
        case 'ERROR_OCCURRED': return 'Erreur survenue';
        case 'NO_DATA_FOUND': return 'Aucune donnée trouvée';
        case 'RESET': return 'Réinitialisation';
        default: return 'Événement inconnu';
    }
}; 