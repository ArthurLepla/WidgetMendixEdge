/**
 * Observability Module - Structured Logging for Asset Tableau Widget
 * Suit les principes d'OpenTelemetry pour la traçabilité
 */

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    correlationId: string;
    context: Record<string, any>;
    component: string;
    userId?: string;
    sessionId?: string;
}

export interface StateTransitionLog extends LogEntry {
    fromState: string;
    toState: string;
    event: string;
    duration?: number;
}

export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    correlationId: string;
    timestamp: Date;
    tags: Record<string, string>;
}

class Logger {
    private logs: LogEntry[] = [];
    private metrics: PerformanceMetric[] = [];
    private maxLogs = 1000; // Limite en mémoire

    /**
     * Log générique avec structure
     */
    private log(level: LogLevel, message: string, correlationId: string, context: Record<string, any> = {}) {
        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            message,
            correlationId,
            context,
            component: 'AssetTableau',
            userId: this.getCurrentUserId(),
            sessionId: this.getSessionId()
        };

        this.logs.push(entry);
        
        // Nettoie les vieux logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Output vers console en dev (avec structure lisible)
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${entry.timestamp.toISOString()}] ${level} [${correlationId}] ${message}`, context);
        }

        // En production, on enverrait vers un service de logging
        // this.sendToRemoteLogging(entry);
    }

    debug(message: string, correlationId: string, context: Record<string, any> = {}) {
        this.log(LogLevel.DEBUG, message, correlationId, context);
    }

    info(message: string, correlationId: string, context: Record<string, any> = {}) {
        this.log(LogLevel.INFO, message, correlationId, context);
    }

    warn(message: string, correlationId: string, context: Record<string, any> = {}) {
        this.log(LogLevel.WARN, message, correlationId, context);
    }

    error(message: string, correlationId: string, context: Record<string, any> = {}) {
        this.log(LogLevel.ERROR, message, correlationId, context);
    }

    /**
     * Log spécialisé pour les transitions d'état FSM
     */
    logStateTransition(
        fromState: string,
        toState: string,
        event: string,
        correlationId: string,
        duration?: number,
        context: Record<string, any> = {}
    ) {
        const transitionLog: StateTransitionLog = {
            timestamp: new Date(),
            level: LogLevel.INFO,
            message: `State transition: ${fromState} → ${toState} (${event})`,
            correlationId,
            context: {
                ...context,
                fromState,
                toState,
                event,
                duration
            },
            component: 'AssetTableau.FSM',
            userId: this.getCurrentUserId(),
            sessionId: this.getSessionId(),
            fromState,
            toState,
            event,
            duration
        };

        this.logs.push(transitionLog);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(
                `🔄 [${transitionLog.timestamp.toISOString()}] FSM [${correlationId}] ${fromState} → ${toState} (${event})${duration ? ` in ${duration}ms` : ''}`,
                context
            );
        }
    }

    /**
     * Enregistre une métrique de performance
     */
    recordMetric(name: string, value: number, unit: string, correlationId: string, tags: Record<string, string> = {}) {
        const metric: PerformanceMetric = {
            name,
            value,
            unit,
            correlationId,
            timestamp: new Date(),
            tags
        };

        this.metrics.push(metric);

        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 [${metric.timestamp.toISOString()}] METRIC [${correlationId}] ${name}: ${value} ${unit}`, tags);
        }
    }

    /**
     * Mesure automatiquement la durée d'une opération
     */
    async measureOperation<T>(
        operationName: string,
        correlationId: string,
        operation: () => Promise<T>,
        tags: Record<string, string> = {}
    ): Promise<T> {
        const startTime = Date.now();
        
        this.debug(`Starting operation: ${operationName}`, correlationId, { operationName, ...tags });
        
        try {
            const result = await operation();
            const duration = Date.now() - startTime;
            
            this.recordMetric(`operation.${operationName}.duration`, duration, 'ms', correlationId, {
                ...tags,
                status: 'success'
            });
            
            this.info(`Operation completed: ${operationName}`, correlationId, { 
                operationName, 
                duration, 
                status: 'success',
                ...tags 
            });
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            
            this.recordMetric(`operation.${operationName}.duration`, duration, 'ms', correlationId, {
                ...tags,
                status: 'error'
            });
            
            this.error(`Operation failed: ${operationName}`, correlationId, { 
                operationName, 
                duration, 
                error: error instanceof Error ? error.message : String(error),
                status: 'error',
                ...tags 
            });
            
            throw error;
        }
    }

    /**
     * Récupère les logs récents pour debugging
     */
    getRecentLogs(correlationId?: string, limit = 100): LogEntry[] {
        let filteredLogs = this.logs;
        
        if (correlationId) {
            filteredLogs = this.logs.filter(log => log.correlationId === correlationId);
        }
        
        return filteredLogs.slice(-limit);
    }

    /**
     * Récupère les métriques récentes
     */
    getRecentMetrics(correlationId?: string, limit = 100): PerformanceMetric[] {
        let filteredMetrics = this.metrics;
        
        if (correlationId) {
            filteredMetrics = this.metrics.filter(metric => metric.correlationId === correlationId);
        }
        
        return filteredMetrics.slice(-limit);
    }

    /**
     * Exporte les logs pour analysis
     */
    exportLogs(correlationId?: string): string {
        const logs = this.getRecentLogs(correlationId);
        return JSON.stringify(logs, null, 2);
    }

    /**
     * Nettoie les logs anciens
     */
    cleanup() {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h
        this.logs = this.logs.filter(log => log.timestamp > cutoff);
        this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff);
    }

    private getCurrentUserId(): string | undefined {
        // En vrai, on récupérerait depuis le contexte Mendix
        return 'current-user-id';
    }

    private getSessionId(): string | undefined {
        // En vrai, on récupérerait depuis le contexte Mendix
        return 'current-session-id';
    }
}

// Instance singleton pour usage global
export const logger = new Logger();

/**
 * Decorator pour automatiquement logger les appels de méthodes
 */
export function LoggedMethod(correlationIdKey = 'correlationId') {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const correlationId = (this as any)[correlationIdKey] || 'unknown';
            const methodName = `${target.constructor.name}.${propertyName}`;
            
            return logger.measureOperation(
                methodName,
                correlationId,
                () => method.apply(this, args),
                { class: target.constructor.name, method: propertyName }
            );
        };
    };
} 