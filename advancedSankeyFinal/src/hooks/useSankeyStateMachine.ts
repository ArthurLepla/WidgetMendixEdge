import { useEffect, useRef, useState, useMemo } from 'react';
import { 
    SankeyStateMachine, 
    SankeyState, 
    SankeyEvent, 
    SankeyStateContext,
    getStateDescription,
    getEventDescription
} from '../types/SankeyStates';

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

export function useSankeyStateMachine(
    initialContext?: Partial<SankeyStateContext>,
    debugMode: boolean = false
): UseSankeyStateMachineReturn {
    const stateMachineRef = useRef<SankeyStateMachine | null>(null);
    const [currentState, setCurrentState] = useState<SankeyState>('IDLE');
    const [context, setContext] = useState<SankeyStateContext>({ data: null });

    // Initialiser la machine à états
    useEffect(() => {
        if (!stateMachineRef.current) {
            stateMachineRef.current = new SankeyStateMachine(initialContext);
            
            // Ajouter un listener pour synchroniser l'état React
            const stateChangeListener = (newState: SankeyState, newContext: SankeyStateContext) => {
                setCurrentState(newState);
                setContext(newContext);
                
                if (debugMode) {
                    console.log(`🎯 État FSM mis à jour: ${getStateDescription(newState)}`, {
                        state: newState,
                        context: newContext
                    });
                }
            };
            
            stateMachineRef.current.onStateChange(stateChangeListener);
            
            // Initialiser l'état React avec l'état actuel de la machine
            setCurrentState(stateMachineRef.current.getCurrentState());
            setContext(stateMachineRef.current.getContext());

            // 🔧 CORRECTION MEMORY LEAK: Nettoyer le listener lors du démontage
            return () => {
                if (stateMachineRef.current) {
                    stateMachineRef.current.removeStateChangeListener(stateChangeListener);
                    if (debugMode) {
                        console.log('🧹 Listener de changement d\'état supprimé');
                    }
                }
            };
        }
    }, [initialContext, debugMode]);

    // Fonction de transition avec logging
    const transition = (event: SankeyEvent, newContext?: Partial<SankeyStateContext>): boolean => {
        if (!stateMachineRef.current) {
            console.error('Machine à états non initialisée');
            return false;
        }

        if (debugMode) {
            console.log(`🔄 Tentative de transition: ${getEventDescription(event)}`, {
                currentState,
                event,
                newContext
            });
        }

        const success = stateMachineRef.current.transition(event, newContext);
        
        if (!success && debugMode) {
            console.warn(`❌ Transition échouée: ${currentState} + ${event}`);
        }

        return success;
    };

    // Vérifier si une transition est possible
    const canTransition = (event: SankeyEvent): boolean => {
        if (!stateMachineRef.current) return false;
        return stateMachineRef.current.canTransition(event);
    };

    // Obtenir les événements possibles
    const getPossibleEvents = (): SankeyEvent[] => {
        if (!stateMachineRef.current) return [];
        return stateMachineRef.current.getPossibleEvents();
    };

    // Réinitialiser la machine
    const reset = (): void => {
        if (!stateMachineRef.current) return;
        
        if (debugMode) {
            console.log('🔄 Réinitialisation de la machine à états');
        }
        
        stateMachineRef.current.reset();
    };

    // États dérivés pour faciliter l'utilisation
    const isLoading = currentState === 'LOADING';
    const isProcessing = currentState === 'PROCESSING';
    const isRendered = currentState === 'RENDERED';
    const hasError = currentState === 'ERROR';
    const isEmpty = currentState === 'EMPTY';
    const stateDescription = getStateDescription(currentState);

    // Nettoyage global lors du démontage du composant
    useEffect(() => {
        return () => {
            if (stateMachineRef.current) {
                if (debugMode) {
                    console.log('🧹 Nettoyage final de la machine à états Sankey');
                }
                // Réinitialiser la référence pour éviter les fuites
                stateMachineRef.current = null;
            }
        };
    }, [debugMode]);

    return {
        currentState,
        context,
        transition,
        canTransition,
        getPossibleEvents,
        reset,
        isLoading,
        isProcessing,
        isRendered,
        hasError,
        isEmpty,
        stateDescription
    };
}

// Hook utilitaire pour le debugging des transitions
export function useSankeyStateDebugger(
    stateMachine: UseSankeyStateMachineReturn,
    enabled: boolean = false
) {
    useEffect(() => {
        if (!enabled) return;

        const logStateInfo = () => {
            console.group('🔍 Debug Machine à États Sankey');
            console.log('État actuel:', stateMachine.currentState);
            console.log('Description:', stateMachine.stateDescription);
            console.log('Contexte:', stateMachine.context);
            console.log('Événements possibles:', stateMachine.getPossibleEvents());
            console.log('États dérivés:', {
                isLoading: stateMachine.isLoading,
                isProcessing: stateMachine.isProcessing,
                isRendered: stateMachine.isRendered,
                hasError: stateMachine.hasError,
                isEmpty: stateMachine.isEmpty
            });
            console.groupEnd();
        };

        logStateInfo();
    }, [stateMachine.currentState, enabled]);
}

// Hook pour automatiser certaines transitions basées sur les props
export function useSankeyStateAutomation(
    stateMachine: UseSankeyStateMachineReturn,
    props: {
        hierarchyConfig?: any[];
        startDate?: any;
        endDate?: any;
        selectedEnergies?: string;
    }
) {
    const { transition, currentState, canTransition } = stateMachine;

    // 🔧 CORRECTION PERFORMANCE: Créer des valeurs stables pour éviter re-renders excessifs
    const hierarchyConfigStable = useMemo(() => {
        // Sérialiser la config pour comparer le contenu plutôt que la référence
        return props.hierarchyConfig ? JSON.stringify(props.hierarchyConfig) : null;
    }, [props.hierarchyConfig]);

    const startDateStable = useMemo(() => {
        // Extraire une valeur primitive de l'objet Date
        return props.startDate?.getTime() || null;
    }, [props.startDate]);

    const endDateStable = useMemo(() => {
        // Extraire une valeur primitive de l'objet Date
        return props.endDate?.getTime() || null;
    }, [props.endDate]);

    // Démarrer le chargement automatiquement quand les props changent
    useEffect(() => {
        if (currentState === 'IDLE' && canTransition('START_LOADING')) {
            transition('START_LOADING', {
                energyFilter: props.selectedEnergies
            });
        }
    }, [hierarchyConfigStable, startDateStable, endDateStable, props.selectedEnergies, currentState, canTransition, transition]);

    // Gérer les erreurs automatiquement
    useEffect(() => {
        if (currentState === 'ERROR') {
            const timer = setTimeout(() => {
                if (canTransition('RESET')) {
                    transition('RESET');
                }
            }, 5000); // Auto-reset après 5 secondes

            return () => clearTimeout(timer);
        }
    }, [currentState, canTransition, transition]);
} 