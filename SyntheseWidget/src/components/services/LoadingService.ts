import { Color, EnergyType } from "../../typings/EnergyTypes";

// Variables des couleurs par type d'énergie
export const ENERGY_COLORS: Record<EnergyType, Color> = {
    electricity: "#38a13c",
    gas: "#F9BE01",
    water: "#3293f3",
    air: "#66D8E6"
};

// Durée du timeout (en millisecondes)
export const LOADING_TIMEOUT = 15000;

// Délai avant de terminer le loader après que la page soit complètement chargée (en millisecondes)
export const COMPLETE_PAGE_DELAY = 1500;

// Type pour les fonctions subscriber
type LoadingSubscriber = (isLoading: boolean) => void;

// Type pour les messages d'erreur
interface LoadingError {
    message: string;
    errorType: 'timeout' | 'navigation' | 'execution' | 'unknown';
    timestamp: number;
}

/**
 * Service singleton pour gérer l'état de chargement à l'échelle de l'application
 * Centralise la gestion du loader pour assurer la cohérence
 */
export class LoadingService {
    private static instance: LoadingService;
    private subscribers: LoadingSubscriber[] = [];
    private loading: boolean = false;
    private loadingTimeout: number | null = null;
    private message: string = "Chargement en cours...";
    private currentEnergyType: EnergyType = "electricity";
    private useSimpleLoader: boolean = false;
    private lastError: LoadingError | null = null;
    private navigationInProgress: boolean = false;
    private lastActionTime: number = 0;
    private startTime: number = 0;
    private actionQueue: number = 0; // Compteur pour suivre les actions en cours
    
    /**
     * Constructeur privé pour le pattern singleton
     */
    private constructor() {
        this.setupGlobalNavigationListeners();
    }
    
    /**
     * Obtenir l'instance unique du service
     */
    private static getInstance(): LoadingService {
        if (!LoadingService.instance) {
            LoadingService.instance = new LoadingService();
        }
        return LoadingService.instance;
    }
    
    /**
     * Configure les écouteurs d'événements de navigation globaux
     * pour Mendix et le document
     */
    private setupGlobalNavigationListeners(): void {
        // Capturer les requêtes réseau pour détecter les activités liées à Mendix
        this.setupNetworkActivityTracking();
        
        // Intercepter la navigation Mendix
        if (window.dojoConfig) {
            const originalBeforeNavigate = window.dojoConfig.beforeNavigate;
            const originalAfterNavigate = window.dojoConfig.afterNavigate;
            
            // Avant la navigation - marquer le début
            window.dojoConfig.beforeNavigate = (...args: any[]) => {
                console.log("[LoadingService] beforeNavigate triggered");
                this.navigationInProgress = true;
                this.lastActionTime = Date.now();
                
                // Appeler l'original si existant
                if (typeof originalBeforeNavigate === "function") {
                    originalBeforeNavigate(...args);
                }
            };
            
            // Après la navigation - marquer mais ne pas désactiver
            window.dojoConfig.afterNavigate = (...args: any[]) => {
                console.log("[LoadingService] afterNavigate triggered");
                this.lastActionTime = Date.now();
                
                // Appeler l'original si existant
                if (typeof originalAfterNavigate === "function") {
                    originalAfterNavigate(...args);
                }
                
                // Planifier une vérification différée pour s'assurer que tout est chargé
                setTimeout(() => {
                    this.checkAndEndNavigation();
                }, COMPLETE_PAGE_DELAY);
            };
        }
        
        // Écouter l'événement de readyState pour s'assurer que la page est chargée
        const handleReadyStateChange = () => {
            if (document.readyState === 'complete') {
                console.log("[LoadingService] Document readyState complete");
                this.lastActionTime = Date.now();
                
                // Programmation d'une vérification différée
                setTimeout(() => {
                    this.checkAndEndNavigation();
                }, COMPLETE_PAGE_DELAY);
            }
        };
        
        document.addEventListener('readystatechange', handleReadyStateChange);
        
        // Écouter les événements DOM qui indiquent que la page est interactive
        window.addEventListener('load', () => {
            console.log("[LoadingService] Window load event");
            this.lastActionTime = Date.now();
            
            setTimeout(() => {
                this.checkAndEndNavigation();
            }, COMPLETE_PAGE_DELAY / 2);
        });
        
        // Créer un MutationObserver pour détecter les changements significatifs dans le DOM
        this.setupDOMChangeDetection();
    }
    
    /**
     * Configure la détection des requêtes réseau pour suivre l'activité Mendix
     */
    private setupNetworkActivityTracking(): void {
        // Intercepter les requêtes XMLHttpRequest qui sont couramment utilisées par Mendix
        const originalXhrOpen = XMLHttpRequest.prototype.open;
        const originalXhrSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(...args: any[]) {
            const service = LoadingService.getInstance();
            service.actionQueue++;
            
            this.addEventListener('loadend', function() {
                service.actionQueue--;
                service.lastActionTime = Date.now();
                console.log("[LoadingService] XHR completed, remaining:", service.actionQueue);
                
                // Vérifier si toutes les requêtes sont terminées
                if (service.actionQueue <= 0) {
                    setTimeout(() => {
                        service.checkAndEndNavigation();
                    }, 500);
                }
            });
            
            return originalXhrOpen.apply(this, args);
        };
        
        XMLHttpRequest.prototype.send = function(...args: any[]) {
            console.log("[LoadingService] XHR sent");
            return originalXhrSend.apply(this, args);
        };
        
        // Intercepter les requêtes fetch qui pourraient aussi être utilisées
        if (window.fetch) {
            const originalFetch = window.fetch;
            window.fetch = function(...args: any[]) {
                const service = LoadingService.getInstance();
                service.actionQueue++;
                
                console.log("[LoadingService] Fetch request started");
                
                return originalFetch.apply(this, args).then(
                    (response) => {
                        service.actionQueue--;
                        service.lastActionTime = Date.now();
                        console.log("[LoadingService] Fetch completed, remaining:", service.actionQueue);
                        
                        if (service.actionQueue <= 0) {
                            setTimeout(() => {
                                service.checkAndEndNavigation();
                            }, 500);
                        }
                        
                        return response;
                    },
                    (error) => {
                        service.actionQueue--;
                        service.lastActionTime = Date.now();
                        console.log("[LoadingService] Fetch error, remaining:", service.actionQueue);
                        
                        if (service.actionQueue <= 0) {
                            setTimeout(() => {
                                service.checkAndEndNavigation();
                            }, 500);
                        }
                        
                        throw error;
                    }
                );
            };
        }
    }
    
    /**
     * Configure un MutationObserver pour détecter les changements significatifs dans le DOM
     */
    private setupDOMChangeDetection(): void {
        if (typeof MutationObserver === 'undefined') return;
        
        // Observer les changements dans le corps du document
        const observer = new MutationObserver((mutations) => {
            // Filtrer pour des changements significatifs (ajout d'éléments importants)
            const significantChanges = mutations.some(mutation => 
                mutation.type === 'childList' && 
                mutation.addedNodes.length > 0
            );
            
            if (significantChanges) {
                this.lastActionTime = Date.now();
                console.log("[LoadingService] Significant DOM changes detected");
            }
        });
        
        // Observer le body quand il est disponible
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            // Si le body n'est pas encore disponible, attendre qu'il le soit
            const bodyCheckInterval = setInterval(() => {
                if (document.body) {
                    observer.observe(document.body, { childList: true, subtree: true });
                    clearInterval(bodyCheckInterval);
                }
            }, 100);
        }
    }
    
    /**
     * Vérifie si la navigation est terminée et termine le loader si c'est le cas
     */
    private checkAndEndNavigation(): void {
        // Vérifier si nous sommes en chargement et si une navigation est en cours
        if (!this.loading || !this.navigationInProgress) {
            return;
        }
        
        const now = Date.now();
        const timeSinceLastAction = now - this.lastActionTime;
        const totalLoadingTime = now - this.startTime;
        
        console.log(`[LoadingService] Checking navigation status:
            - Time since last action: ${timeSinceLastAction}ms
            - Total loading time: ${totalLoadingTime}ms
            - Actions in queue: ${this.actionQueue}`);
        
        // Vérifier si le temps écoulé depuis la dernière action est suffisant
        // et s'il n'y a pas d'actions en attente
        if (timeSinceLastAction >= 1000 && this.actionQueue <= 0) {
            console.log("[LoadingService] Navigation completed, ending loader");
            this.navigationInProgress = false;
            LoadingService.endLoading();
            return;
        }
        
        // Si trop de temps s'est écoulé depuis le début, terminer le loader
        if (totalLoadingTime >= LOADING_TIMEOUT) {
            console.warn(`[LoadingService] Navigation timeout after ${LOADING_TIMEOUT}ms`);
            this.navigationInProgress = false;
            this.setError({
                message: "L'opération a pris trop de temps",
                errorType: 'timeout',
                timestamp: now
            });
            LoadingService.endLoading();
            return;
        }
        
        // Sinon, planifier une autre vérification
        setTimeout(() => {
            this.checkAndEndNavigation();
        }, 500);
    }
    
    /**
     * S'abonner aux changements d'état de chargement
     */
    public static subscribe(callback: LoadingSubscriber): () => void {
        const service = LoadingService.getInstance();
        service.subscribers.push(callback);
        
        // Retourner une fonction pour se désabonner
        return () => {
            const index = service.subscribers.indexOf(callback);
            if (index !== -1) {
                service.subscribers.splice(index, 1);
            }
        };
    }
    
    /**
     * Notifier tous les abonnés du changement d'état
     */
    private notifySubscribers(): void {
        this.subscribers.forEach(callback => callback(this.loading));
    }
    
    /**
     * Démarrer le chargement
     */
    public static startLoading(message?: string, useSimpleLoader?: boolean, energyType?: EnergyType): void {
        const service = LoadingService.getInstance();
        
        // Clear any existing timeout
        if (service.loadingTimeout !== null) {
            window.clearTimeout(service.loadingTimeout);
            service.loadingTimeout = null;
        }
        
        // Enregistrer le moment de début
        service.startTime = Date.now();
        service.lastActionTime = service.startTime;
        
        // Mettre à jour l'état
        service.loading = true;
        if (message !== undefined) service.message = message;
        if (energyType !== undefined) service.currentEnergyType = energyType;
        if (useSimpleLoader !== undefined) service.useSimpleLoader = useSimpleLoader;
        
        // Notifier les abonnés
        service.notifySubscribers();
        
        // Démarrer le timeout de sécurité global
        service.loadingTimeout = window.setTimeout(() => {
            console.warn(`[LoadingService] Global timeout after ${LOADING_TIMEOUT}ms: "${service.message}"`);
            service.setError({
                message: "L'opération a pris trop de temps",
                errorType: 'timeout',
                timestamp: Date.now()
            });
            service.navigationInProgress = false;
            LoadingService.endLoading();
        }, LOADING_TIMEOUT);
        
        console.log(`[LoadingService] Loading started: "${service.message}"`);
    }
    
    /**
     * Terminer le chargement
     */
    public static endLoading(): void {
        const service = LoadingService.getInstance();
        
        // Clear le timeout si existant
        if (service.loadingTimeout !== null) {
            window.clearTimeout(service.loadingTimeout);
            service.loadingTimeout = null;
        }
        
        // Calculer le temps total de chargement pour les logs
        const loadingTime = Date.now() - service.startTime;
        
        // Mettre à jour l'état
        service.loading = false;
        service.navigationInProgress = false;
        
        // Notifier les abonnés
        service.notifySubscribers();
        
        console.log(`[LoadingService] Loading ended after ${loadingTime}ms`);
    }
    
    /**
     * Définir une erreur de chargement
     */
    private setError(error: LoadingError): void {
        this.lastError = error;
        console.error(`[LoadingService] Error: ${error.message} (${error.errorType})`);
    }
    
    /**
     * Obtenir la dernière erreur
     */
    public static getLastError(): LoadingError | null {
        return LoadingService.getInstance().lastError;
    }
    
    /**
     * Réinitialiser l'erreur
     */
    public static clearError(): void {
        LoadingService.getInstance().lastError = null;
    }
    
    /**
     * Vérifier si le chargement est actif
     */
    public static isLoading(): boolean {
        return LoadingService.getInstance().loading;
    }
    
    /**
     * Obtenir le message de chargement actuel
     */
    public static getMessage(): string {
        return LoadingService.getInstance().message;
    }
    
    /**
     * Obtenir le type d'énergie actuel
     */
    public static getCurrentEnergyType(): EnergyType {
        return LoadingService.getInstance().currentEnergyType;
    }
    
    /**
     * Obtenir la couleur associée au type d'énergie actuel
     */
    public static getCurrentEnergyColor(): Color {
        const energyType = LoadingService.getInstance().currentEnergyType;
        return ENERGY_COLORS[energyType];
    }
    
    /**
     * Obtenir si le loader simple est utilisé
     */
    public static getUseSimpleLoader(): boolean {
        return LoadingService.getInstance().useSimpleLoader;
    }
    
    /**
     * Exécuter une promise avec affichage du loader
     */
    public static async withLoading<T>(promise: Promise<T>, message?: string, energyType?: EnergyType): Promise<T> {
        const service = LoadingService.getInstance();
        
        try {
            // Marquer le début du chargement
            LoadingService.startLoading(message, false, energyType);
            
            // Considérer cela comme une action qui pourrait déclencher une navigation
            service.navigationInProgress = true;
            
            // Ajouter à la file d'attente pour suivre l'exécution
            service.actionQueue++;
            
            const result = await promise;
            
            // Diminuer le compteur d'actions
            service.actionQueue--;
            service.lastActionTime = Date.now();
            
            // Ne pas terminer le loader ici, laisser checkAndEndNavigation le faire
            // Cela permet de gérer correctement les cas où le promise déclenche une navigation
            if (service.actionQueue <= 0) {
                setTimeout(() => {
                    service.checkAndEndNavigation();
                }, 500);
            }
            
            return result;
        } catch (error) {
            // Diminuer le compteur d'actions en cas d'erreur
            service.actionQueue--;
            service.lastActionTime = Date.now();
            
            service.setError({
                message: error instanceof Error ? error.message : "Une erreur est survenue",
                errorType: 'execution',
                timestamp: Date.now()
            });
            
            // En cas d'erreur, on termine le loader immédiatement
            service.navigationInProgress = false;
            LoadingService.endLoading();
            
            throw error;
        }
    }
    
    /**
     * Utilitaire pour exécuter une action Mendix avec loader
     */
    public static executeAction(action?: any, message?: string, useSimpleLoader?: boolean, energyType?: EnergyType): void {
        if (!action || !action.canExecute) {
            console.warn("[LoadingService] Attempted to execute an invalid Mendix action");
            return;
        }
        
        const service = LoadingService.getInstance();
        
        // Marquer le début du chargement
        LoadingService.startLoading(message, useSimpleLoader, energyType);
        
        // Marquer qu'une navigation peut être en cours
        service.navigationInProgress = true;
        
        // Ajouter à la file d'attente
        service.actionQueue++;
        
        try {
            // Exécuter l'action Mendix
            console.log("[LoadingService] Executing Mendix action");
            action.execute();
            
            // Diminuer le compteur, mais ne pas terminer le loader
            // Le loader sera terminé par checkAndEndNavigation quand toutes les requêtes seront terminées
            service.actionQueue--;
            service.lastActionTime = Date.now();
            
        } catch (error) {
            // Diminuer le compteur en cas d'erreur
            service.actionQueue--;
            service.lastActionTime = Date.now();
            
            service.setError({
                message: error instanceof Error ? error.message : "Erreur lors de l'exécution de l'action",
                errorType: 'execution',
                timestamp: Date.now()
            });
            
            // En cas d'erreur, on termine le loader immédiatement
            service.navigationInProgress = false;
            LoadingService.endLoading();
            
            console.error("[LoadingService] Error executing Mendix action:", error);
        }
    }
}

// Déclarer les types Mendix pour TypeScript
declare global {
    interface Window {
        dojoConfig?: {
            beforeNavigate?: (...args: any[]) => void;
            afterNavigate?: (...args: any[]) => void;
        };
    }
}