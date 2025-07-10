import { useState, useEffect, useCallback } from "react";
import { LoadingService } from "./LoadingService";
import { EnergyType } from "../../typings/EnergyTypes";

/**
 * Hook personnalisé pour gérer l'état de chargement
 * Utilise le LoadingService pour assurer une cohérence à l'échelle de l'application
 */
export function useLoading() {
    // État local qui reflète l'état du service
    const [isLoading, setIsLoading] = useState(LoadingService.isLoading());
    // État local pour le message de chargement
    const [message, setMessage] = useState(LoadingService.getMessage());
    // État pour le type de loader
    const [useSimpleLoader, setUseSimpleLoader] = useState(LoadingService.getUseSimpleLoader());
    // État pour le type d'énergie
    const [energyType, setEnergyType] = useState<EnergyType>(LoadingService.getCurrentEnergyType());
    // État pour les erreurs
    const [error, setError] = useState(LoadingService.getLastError());
    
    // S'abonner aux changements d'état du service
    useEffect(() => {
        const unsubscribe = LoadingService.subscribe((loading) => {
            setIsLoading(loading);
            // Mettre à jour le message et le type de loader à chaque changement
            setMessage(LoadingService.getMessage());
            setUseSimpleLoader(LoadingService.getUseSimpleLoader());
            setEnergyType(LoadingService.getCurrentEnergyType());
            setError(LoadingService.getLastError());
        });
        
        // Nous ne terminons pas le loader ici, mais laissons le LoadingService s'en charger
        // Le service gère maintenant correctement les événements de navigation et de chargement de page
        
        return () => {
            unsubscribe();
        };
    }, []);
    
    // Fonction pour démarrer le chargement
    const startLoading = useCallback((message?: string, useSimpleLoader?: boolean, energyType?: EnergyType) => {
        LoadingService.startLoading(message, useSimpleLoader, energyType);
    }, []);
    
    // Fonction pour terminer le chargement
    const endLoading = useCallback(() => {
        LoadingService.endLoading();
    }, []);
    
    // Fonction pour exécuter une action avec chargement
    const withLoading = useCallback(async <T>(promise: Promise<T>, message?: string, energyType?: EnergyType): Promise<T> => {
        return LoadingService.withLoading(promise, message, energyType);
    }, []);
    
    // Fonction pour effacer une erreur
    const clearError = useCallback(() => {
        LoadingService.clearError();
    }, []);
    
    // Fonction pour exécuter une fonction Mendix avec loader
    const executeAction = useCallback((action?: any, message?: string, useSimpleLoader?: boolean, energyType?: EnergyType) => {
        if (!action || !action.canExecute) {
            console.warn("Attempted to execute an invalid Mendix action");
            return;
        }
        
        // Utiliser directement la méthode du service qui gère déjà tout
        LoadingService.executeAction(action, message, useSimpleLoader, energyType);
    }, []);
    
    return {
        isLoading,
        message,
        useSimpleLoader,
        energyType,
        error,
        startLoading,
        endLoading,
        withLoading,
        executeAction,
        clearError
    };
}