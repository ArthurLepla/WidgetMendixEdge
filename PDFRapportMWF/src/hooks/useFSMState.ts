import { useState, useEffect, useRef } from "react";
import { ComponentStep } from "../types/widget";
import { validateDates } from "../utils/formatting";

/**
 * Hook FSM simplifié pour le widget PDF Report
 * 
 * Flux simplifié :
 * 1. IDLE: Attente de configuration (dates valides)
 * 2. LOADING: Chargement/traitement des données  
 * 3. READY: Prêt pour téléchargement PDF
 * 4. ERROR: Erreur lors du processus
 */
export function useFSMState(
    fetchDataAction: any,
    dateStart?: Date,
    dateEnd?: Date
) {
    const [currentStep, setCurrentStep] = useState<ComponentStep>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [dateValidationError, setDateValidationError] = useState<string | null>(null);
    
    // Ref pour tracker les dates utilisées lors du dernier chargement
    const lastLoadedDatesRef = useRef<{ start?: Date, end?: Date } | null>(null);

    // Validation des dates à chaque changement
    useEffect(() => {
        const error = validateDates(dateStart, dateEnd);
        setDateValidationError(error);
        
        // CAS SPÉCIAL : Si on était prêt et qu'on supprime les dates (croix du DatePicker)
        if (currentStep === "readyForDownload") {
            // Si les dates deviennent null/undefined ou invalides, retourner en idle
            if (!dateStart || !dateEnd || error) {
                setCurrentStep("idle");
                console.log("PDFReportWidget: Dates supprimées/invalides depuis état prêt, retour à la sélection");
                
                if (!dateStart && !dateEnd) {
                    // Cas spécifique : suppression via croix du DatePicker
                    setErrorMessage("Période supprimée. Veuillez sélectionner une nouvelle période pour générer un rapport.");
                } else if (error) {
                    // Cas général : dates invalides
                    setErrorMessage("Période invalide. Veuillez corriger la période pour générer un rapport.");
                }
                
                setTimeout(() => setErrorMessage(null), 5000);
                return;
            }

            // Détecter changement de dates après chargement des données
            if (lastLoadedDatesRef.current) {
                const lastStart = lastLoadedDatesRef.current.start?.getTime();
                const lastEnd = lastLoadedDatesRef.current.end?.getTime();
                const currentStart = dateStart?.getTime();
                const currentEnd = dateEnd?.getTime();

                // Si les dates ont changé par rapport à celles utilisées pour charger les données
                if (lastStart !== currentStart || lastEnd !== currentEnd) {
                    setCurrentStep("idle");
                    console.log("PDFReportWidget: Période modifiée, rechargement nécessaire");
                    setErrorMessage("La période a été modifiée. Cliquez sur 'Charger les Données' pour actualiser le rapport avec la nouvelle période.");
                    setTimeout(() => setErrorMessage(null), 6000);
                }
            }
        }
    }, [dateStart, dateEnd, currentStep]);

    // Getters pour l'état
    const hasValidDates = Boolean(dateStart && dateEnd && !dateValidationError);
    const isProcessing = currentStep === "fetchingInitialData" || currentStep === "processingPdfData";
    const canStartProcess = hasValidDates && !isProcessing && currentStep === "idle";
    
    // Détermine s'il faut utiliser fetchDataAction ou traiter directement reportLevels
    const shouldUseFetchAction = Boolean(fetchDataAction && fetchDataAction.canExecute);

    /**
     * Démarre le processus de chargement des données
     * Point d'entrée unique et clair pour l'utilisateur
     */
    const startDataLoading = () => {
        if (!canStartProcess) {
            console.warn("PDFReportWidget: Impossible de démarrer - conditions non remplies");
            return;
        }

        // Sauvegarder les dates utilisées pour ce chargement
        lastLoadedDatesRef.current = {
            start: dateStart ? new Date(dateStart) : undefined,
            end: dateEnd ? new Date(dateEnd) : undefined
        };

        setErrorMessage(null);
        
        if (shouldUseFetchAction) {
            console.log("PDFReportWidget: Démarrage via fetchDataAction");
            setCurrentStep("fetchingInitialData");
            // Le fetchDataAction sera déclenché par le composant parent
        } else {
            console.log("PDFReportWidget: Démarrage traitement direct des reportLevels");
            setCurrentStep("processingPdfData");
        }
    };

    /**
     * Transition vers le traitement des données (après fetchDataAction)
     */
    const startProcessingData = () => {
        console.log("PDFReportWidget: Transition vers traitement des données");
        setCurrentStep("processingPdfData");
        setErrorMessage(null);
    };

    /**
     * Finalise le processus avec succès
     */
    const setToReadyForDownload = (hasData: boolean) => {
        if (!hasValidDates) {
            console.warn("PDFReportWidget: Dates invalides, impossible de finaliser");
            setToError("Dates de période invalides");
            return;
        }

        if (!hasData) {
            setToError("Aucune donnée trouvée pour la période sélectionnée");
            return;
        }

        console.log("PDFReportWidget: Données prêtes pour téléchargement");
        setCurrentStep("readyForDownload");
        setErrorMessage(null);
    };

    /**
     * Gestion des erreurs
     */
    const setToError = (message: string) => {
        console.error("PDFReportWidget: Erreur -", message);
        setCurrentStep("error");
        setErrorMessage(message);
    };

    /**
     * Reset complet de l'état
     */
    const resetToIdle = () => {
        console.log("PDFReportWidget: Reset vers état initial");
        setCurrentStep("idle");
        setErrorMessage(null);
        lastLoadedDatesRef.current = null; // Reset des dates de référence
    };

    /**
     * Retry après erreur
     */
    const retry = () => {
        console.log("PDFReportWidget: Tentative de retry");
        resetToIdle();
        // L'utilisateur devra re-cliquer sur le bouton
    };

    return {
        // État actuel
        currentStep,
        errorMessage,
        dateValidationError,
        
        // Statuts calculés
        hasValidDates,
        isProcessing,
        canStartProcess,
        shouldUseFetchAction,
        
        // Actions
        startDataLoading,
        startProcessingData,
        setToReadyForDownload,
        setToError,
        resetToIdle,
        retry
    };
} 