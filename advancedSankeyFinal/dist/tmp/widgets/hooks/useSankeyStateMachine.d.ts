import { SankeyState, SankeyEvent, SankeyStateContext } from '../types/SankeyStates';
export interface UseSankeyStateMachineReturn {
    currentState: SankeyState;
    context: SankeyStateContext;
    transition: (event: SankeyEvent, newContext?: Partial<SankeyStateContext>) => boolean;
    canTransition: (event: SankeyEvent) => boolean;
    getPossibleEvents: () => SankeyEvent[];
    reset: () => void;
    isLoading: boolean;
    isProcessing: boolean;
    isRendered: boolean;
    hasError: boolean;
    isEmpty: boolean;
    stateDescription: string;
}
export declare function useSankeyStateMachine(initialContext?: Partial<SankeyStateContext>, debugMode?: boolean): UseSankeyStateMachineReturn;
export declare function useSankeyStateDebugger(stateMachine: UseSankeyStateMachineReturn, enabled?: boolean): void;
export declare function useSankeyStateAutomation(stateMachine: UseSankeyStateMachineReturn, props: {
    hierarchyConfig?: any[];
    startDate?: any;
    endDate?: any;
    selectedEnergies?: string;
}): void;
//# sourceMappingURL=useSankeyStateMachine.d.ts.map