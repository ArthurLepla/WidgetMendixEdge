/**
 * Tests unitaires pour la FSM Asset Tableau Widget
 * Objectif: 100% coverage des transitions d'état
 */

import { 
    WidgetState, 
    WidgetEvent, 
    transition, 
    createInitialContext, 
    WidgetStateError,
    generateCorrelationId
} from "../states";

describe('Asset Tableau Widget FSM', () => {
    let context: any;

    beforeEach(() => {
        context = createInitialContext();
    });

    describe('Initial State', () => {
        test('should start in INITIALIZING state', () => {
            expect(context.currentState).toBe(WidgetState.INITIALIZING);
            expect(context.correlationId).toMatch(/^widget-\d+-\w+$/);
        });

        test('should generate unique correlation IDs', () => {
            const id1 = generateCorrelationId();
            const id2 = generateCorrelationId();
            expect(id1).not.toBe(id2);
        });
    });

    describe('INITIALIZING State Transitions', () => {
        test('should transition from INITIALIZING to LOADING_DATA on INITIALIZE', () => {
            const result = transition(WidgetState.INITIALIZING, WidgetEvent.INITIALIZE, context);
            expect(result).toBe(WidgetState.LOADING_DATA);
        });

        test('should reject invalid transitions from INITIALIZING', () => {
            const result = transition(WidgetState.INITIALIZING, WidgetEvent.DATA_LOADED, context);
            expect(result).toBeInstanceOf(WidgetStateError);
            expect((result as WidgetStateError).message).toContain('Invalid transition');
        });
    });

    describe('LOADING_DATA State Transitions', () => {
        test('should transition from LOADING_DATA to READY on DATA_LOADED', () => {
            const result = transition(WidgetState.LOADING_DATA, WidgetEvent.DATA_LOADED, context);
            expect(result).toBe(WidgetState.READY);
        });

        test('should transition from LOADING_DATA to ERROR on DATA_LOAD_FAILED', () => {
            const result = transition(WidgetState.LOADING_DATA, WidgetEvent.DATA_LOAD_FAILED, context);
            expect(result).toBe(WidgetState.ERROR);
        });

        test('should reject invalid transitions from LOADING_DATA', () => {
            const result = transition(WidgetState.LOADING_DATA, WidgetEvent.START_EDIT, context);
            expect(result).toBeInstanceOf(WidgetStateError);
        });
    });

    describe('READY State Transitions', () => {
        test('should transition from READY to EDITING on START_EDIT', () => {
            const result = transition(WidgetState.READY, WidgetEvent.START_EDIT, context);
            expect(result).toBe(WidgetState.EDITING);
        });

        test('should transition from READY to VALIDATING on START_VALIDATION', () => {
            const result = transition(WidgetState.READY, WidgetEvent.START_VALIDATION, context);
            expect(result).toBe(WidgetState.VALIDATING);
        });

        test('should transition from READY to ERROR on DATA_LOAD_FAILED', () => {
            const result = transition(WidgetState.READY, WidgetEvent.DATA_LOAD_FAILED, context);
            expect(result).toBe(WidgetState.ERROR);
        });

        test('should reject invalid transitions from READY', () => {
            const result = transition(WidgetState.READY, WidgetEvent.SAVE_SUCCESS, context);
            expect(result).toBeInstanceOf(WidgetStateError);
        });
    });

    describe('EDITING State Transitions', () => {
        test('should transition from EDITING to SAVING on SAVE_EDIT', () => {
            const result = transition(WidgetState.EDITING, WidgetEvent.SAVE_EDIT, context);
            expect(result).toBe(WidgetState.SAVING);
        });

        test('should transition from EDITING to READY on CANCEL_EDIT', () => {
            const result = transition(WidgetState.EDITING, WidgetEvent.CANCEL_EDIT, context);
            expect(result).toBe(WidgetState.READY);
        });

        test('should reject invalid transitions from EDITING', () => {
            const result = transition(WidgetState.EDITING, WidgetEvent.DATA_LOADED, context);
            expect(result).toBeInstanceOf(WidgetStateError);
        });
    });

    describe('SAVING State Transitions', () => {
        test('should transition from SAVING to READY on SAVE_SUCCESS', () => {
            const result = transition(WidgetState.SAVING, WidgetEvent.SAVE_SUCCESS, context);
            expect(result).toBe(WidgetState.READY);
        });

        test('should transition from SAVING to ERROR on SAVE_FAILED', () => {
            const result = transition(WidgetState.SAVING, WidgetEvent.SAVE_FAILED, context);
            expect(result).toBe(WidgetState.ERROR);
        });

        test('should reject invalid transitions from SAVING', () => {
            const result = transition(WidgetState.SAVING, WidgetEvent.START_EDIT, context);
            expect(result).toBeInstanceOf(WidgetStateError);
        });
    });

    describe('VALIDATING State Transitions', () => {
        test('should transition from VALIDATING to READY on VALIDATION_COMPLETE', () => {
            const result = transition(WidgetState.VALIDATING, WidgetEvent.VALIDATION_COMPLETE, context);
            expect(result).toBe(WidgetState.READY);
        });

        test('should reject invalid transitions from VALIDATING', () => {
            const result = transition(WidgetState.VALIDATING, WidgetEvent.START_EDIT, context);
            expect(result).toBeInstanceOf(WidgetStateError);
        });
    });

    describe('ERROR State Transitions', () => {
        test('should transition from ERROR to LOADING_DATA on RESET', () => {
            const result = transition(WidgetState.ERROR, WidgetEvent.RESET, context);
            expect(result).toBe(WidgetState.LOADING_DATA);
        });

        test('should reject invalid transitions from ERROR', () => {
            const result = transition(WidgetState.ERROR, WidgetEvent.START_EDIT, context);
            expect(result).toBeInstanceOf(WidgetStateError);
        });
    });

    describe('WidgetStateError', () => {
        test('should create proper error with correlation ID', () => {
            const error = new WidgetStateError(
                'Test error',
                WidgetState.READY,
                'INVALID_EVENT' as any,
                'test-correlation-id'
            );

            expect(error.message).toContain('Test error');
            expect(error.message).toContain('test-correlation-id');
            expect(error.fromState).toBe(WidgetState.READY);
            expect(error.correlationId).toBe('test-correlation-id');
        });
    });

    describe('Edge Cases', () => {
        test('should handle unknown state', () => {
            const result = transition('UNKNOWN_STATE' as any, WidgetEvent.INITIALIZE, context);
            expect(result).toBeInstanceOf(WidgetStateError);
            expect((result as WidgetStateError).message).toContain('Unknown state');
        });

        test('should maintain immutability of context', () => {
            const originalContext = { ...context };
            transition(WidgetState.INITIALIZING, WidgetEvent.INITIALIZE, context);
            expect(context).toEqual(originalContext);
        });

        test('should prevent race condition: DATA_LOADED from INITIALIZING', () => {
            // This was the bug: DATA_LOADED sent while still in INITIALIZING state
            const result = transition(WidgetState.INITIALIZING, WidgetEvent.DATA_LOADED, context);
            expect(result).toBeInstanceOf(WidgetStateError);
            expect((result as WidgetStateError).message).toContain('Invalid transition');
            expect((result as WidgetStateError).fromState).toBe(WidgetState.INITIALIZING);
            expect((result as WidgetStateError).event).toBe(WidgetEvent.DATA_LOADED);
        });
    });

    describe('Complete Workflow', () => {
        test('should support complete edit workflow', () => {
            // INITIALIZING → LOADING_DATA
            let state = transition(WidgetState.INITIALIZING, WidgetEvent.INITIALIZE, context);
            expect(state).toBe(WidgetState.LOADING_DATA);

            // LOADING_DATA → READY
            state = transition(state as WidgetState, WidgetEvent.DATA_LOADED, context);
            expect(state).toBe(WidgetState.READY);

            // READY → EDITING
            state = transition(state as WidgetState, WidgetEvent.START_EDIT, context);
            expect(state).toBe(WidgetState.EDITING);

            // EDITING → SAVING
            state = transition(state as WidgetState, WidgetEvent.SAVE_EDIT, context);
            expect(state).toBe(WidgetState.SAVING);

            // SAVING → READY
            state = transition(state as WidgetState, WidgetEvent.SAVE_SUCCESS, context);
            expect(state).toBe(WidgetState.READY);
        });

        test('should support error recovery workflow', () => {
            // Simulate error
            let state = transition(WidgetState.LOADING_DATA, WidgetEvent.DATA_LOAD_FAILED, context);
            expect(state).toBe(WidgetState.ERROR);

            // Recovery
            state = transition(state as WidgetState, WidgetEvent.RESET, context);
            expect(state).toBe(WidgetState.LOADING_DATA);
        });
    });
}); 