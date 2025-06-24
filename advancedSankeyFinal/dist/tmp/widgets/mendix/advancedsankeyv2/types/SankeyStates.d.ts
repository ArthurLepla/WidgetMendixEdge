export type SankeyState = 'IDLE' | 'LOADING' | 'PROCESSING' | 'FILTERED' | 'RENDERED' | 'ERROR' | 'EMPTY';
export type SankeyEvent = 'START_LOADING' | 'DATA_RECEIVED' | 'PROCESSING_COMPLETE' | 'FILTER_APPLIED' | 'RENDER_COMPLETE' | 'ERROR_OCCURRED' | 'NO_DATA_FOUND' | 'RESET';
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
export declare const SANKEY_TRANSITIONS: StateTransition[];
export declare class SankeyStateMachine {
    private currentState;
    private context;
    private listeners;
    constructor(initialContext?: Partial<SankeyStateContext>);
    getCurrentState(): SankeyState;
    getContext(): SankeyStateContext;
    onStateChange(listener: (state: SankeyState, context: SankeyStateContext) => void): void;
    removeStateChangeListener(listener: (state: SankeyState, context: SankeyStateContext) => void): void;
    private notifyListeners;
    transition(event: SankeyEvent, newContext?: Partial<SankeyStateContext>): boolean;
    reset(): void;
    canTransition(event: SankeyEvent): boolean;
    getPossibleEvents(): SankeyEvent[];
}
export declare const getStateDescription: (state: SankeyState) => string;
export declare const getEventDescription: (event: SankeyEvent) => string;
//# sourceMappingURL=SankeyStates.d.ts.map