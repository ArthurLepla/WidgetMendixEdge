/**
 * Système de debug pour CompareData
 * Inspiré du système VueDetails mais adapté pour CompareData
 */

// Fonction pour extraire le niveau de debug depuis l'URL
const getDebugLevel = (): number => {
    if (typeof window === "undefined") return 0;
    
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get("debugCompare");
    
    if (debugParam === "1") return 1; // Debug standard
    if (debugParam === "2") return 2; // Debug verbeux
    
    return 0; // Pas de debug
};

const DEBUG_LEVEL = getDebugLevel();

/**
 * Debug niveau 1 - Logs standards
 */
export function debug(message: string, data?: any): void {
    if (DEBUG_LEVEL >= 1) {
        const timestamp = new Date().toLocaleTimeString();
        if (data !== undefined) {
            console.log(`[CompareData ${timestamp}] ${message}:`, data);
        } else {
            console.log(`[CompareData ${timestamp}] ${message}`);
        }
    }
}

/**
 * Debug niveau 2 - Logs verbeux
 */
export function verbose(message: string, data?: any): void {
    if (DEBUG_LEVEL >= 2) {
        const timestamp = new Date().toLocaleTimeString();
        if (data !== undefined) {
            console.log(`[CompareData VERBOSE ${timestamp}] ${message}:`, data);
        } else {
            console.log(`[CompareData VERBOSE ${timestamp}] ${message}`);
        }
    }
}

/**
 * Debug diagnostic - Toujours affiché en mode dev
 */
export function diag(message: string, data?: any): void {
    if (process.env.NODE_ENV === "development" || DEBUG_LEVEL >= 1) {
        const timestamp = new Date().toLocaleTimeString();
        if (data !== undefined) {
            console.warn(`[CompareData DIAG ${timestamp}] ${message}:`, data);
        } else {
            console.warn(`[CompareData DIAG ${timestamp}] ${message}`);
        }
    }
}

/**
 * Logs d'erreur - Toujours affichés
 */
export function error(message: string, err?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    if (err !== undefined) {
        console.error(`[CompareData ERROR ${timestamp}] ${message}:`, err);
    } else {
        console.error(`[CompareData ERROR ${timestamp}] ${message}`);
    }
}

/**
 * Utilitaire pour logger les performances
 */
export function perf(label: string, fn: () => void): void {
    if (DEBUG_LEVEL >= 2) {
        const start = performance.now();
        fn();
        const end = performance.now();
        console.log(`[CompareData PERF] ${label}: ${(end - start).toFixed(2)}ms`);
    } else {
        fn();
    }
}

/**
 * Helper pour activer le debug via console
 */
if (typeof window !== "undefined") {
    (window as any).enableCompareDataDebug = (level: number = 1) => {
        const url = new URL(window.location.href);
        url.searchParams.set("debugCompare", level.toString());
        window.location.href = url.toString();
    };
    
    (window as any).disableCompareDataDebug = () => {
        const url = new URL(window.location.href);
        url.searchParams.delete("debugCompare");
        window.location.href = url.toString();
    };
}