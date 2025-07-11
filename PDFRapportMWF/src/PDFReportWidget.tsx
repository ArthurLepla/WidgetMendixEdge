// Add this at the top of the file or in a .d.ts file in the typings folder
declare global {
    interface Window {
        mendix: any; // You can refine 'any' to a more specific type if you have one
    }
}

import { ReactElement, useEffect, createElement } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PDFReportWidgetContainerProps } from "../typings/PDFReportWidgetProps";
import { Calendar, Download, RefreshCw, FileText, AlertCircle, Settings, Lightbulb, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Imports des modules refactorisés
import { 
    palette, 
    fadeInUp, 
    scaleIn 
} from "./constants/config";
import { widgetStyles } from "./constants/styles";
import { useFSMState } from "./hooks/useFSMState";
import { useDataProcessing } from "./hooks/useDataProcessing";
import { initializePDFFonts, getDefaultPDFFileName } from "./utils/pdfSetup";
import { DateRangePicker } from "./components/ui/DateRangePicker";
import { Skeleton } from "./components/ui/Skeleton";
import { Statistic } from "./components/ui/Statistic";
import { CustomStepper } from "./components/ui/CustomStepper";
import { PDFDocumentLayout } from "./components/pdf/PDFDocumentLayout";

// CSS pour l'animation de rotation (spinning)
const spinKeyframes = `
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

@keyframes slideInFromLeft {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Injecter les keyframes dans le DOM une seule fois
if (typeof window !== 'undefined' && !document.getElementById('pdf-widget-styles')) {
    const style = document.createElement('style');
    style.id = 'pdf-widget-styles';
    style.textContent = spinKeyframes;
    document.head.appendChild(style);
}

export function PDFReportWidget(
    props: PDFReportWidgetContainerProps
): ReactElement {
    const {
        name,
        class: className,
        style,
        tabIndex,
        reportTitle,
        reportDescription,
        companyLogo,
        fetchDataAction,
        reportLevels,
        dateStart,
        dateEnd
    } = props;

    // Initialisation des polices PDF
    useEffect(() => {
        initializePDFFonts();
    }, []);

    // Hook FSM simplifié
    const {
        currentStep,
        errorMessage,
        dateValidationError,
        hasValidDates,
        isProcessing,
        canStartProcess,
        shouldUseFetchAction,
        startDataLoading,
        startProcessingData,
        setToReadyForDownload,
        setToError,
        retry
    } = useFSMState(fetchDataAction, dateStart?.value, dateEnd?.value);

    // Hook de traitement des données avec gestion automatique des transitions
    const { isLoading, treeData, dataPreview } = useDataProcessing(
        reportLevels,
        currentStep,
        (hasData: boolean) => {
            if (currentStep === "fetchingInitialData") {
                // Transition automatique vers processing
                startProcessingData();
            } else if (currentStep === "processingPdfData") {
                // Finalisation du processus
                setToReadyForDownload(hasData);
            }
        },
        setToError
    );

    // Gestion du déclenchement de fetchDataAction
    useEffect(() => {
        if (currentStep === "fetchingInitialData" && shouldUseFetchAction) {
            console.log("PDFReportWidget: Exécution de fetchDataAction");
            if (fetchDataAction && fetchDataAction.canExecute) {
                fetchDataAction.execute();
            }
        }
    }, [currentStep, shouldUseFetchAction, fetchDataAction]);

    // Gestion des changements de dates
    const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
        const [startDate, endDate] = dates;
        if (dateStart && dateEnd) {
            // Toujours mettre à jour les valeurs, même si elles sont null
            // Ceci est crucial pour le bouton clear (croix) d'Ant Design
            // Mendix EditableValue accepte undefined pour "clear" mais pas null
            dateStart.setValue(startDate !== null ? startDate : undefined);
            dateEnd.setValue(endDate !== null ? endDate : undefined);
            
            console.log("PDFReportWidget: Dates mises à jour", { 
                startDate: startDate?.toLocaleDateString(), 
                endDate: endDate?.toLocaleDateString() 
            });
        }
    };

    // URL du logo (géré par Mendix)
    const logoUrl = companyLogo?.value?.uri || '';

    /**
     * Détermine le texte et l'action du bouton principal
     */
    const getMainButtonConfig = () => {
        // Validation des données pour le PDF
        const hasValidDataForPDF = treeData && treeData.length > 0 && 
            dateStart?.value && dateEnd?.value && reportTitle;

        // Bouton de téléchargement PDF
        if (currentStep === "readyForDownload") {
            if (!hasValidDataForPDF) {
                return {
                    type: 'disabled' as const,
                    text: 'Données insuffisantes',
                    icon: <AlertCircle size={20} style={widgetStyles.buttonIcon} />,
                    style: widgetStyles.buttonDisabled,
                    disabled: true
                };
            }
            
            return {
                type: 'download' as const,
                text: 'Télécharger le PDF',
                icon: <Download size={20} style={widgetStyles.buttonIcon} />,
                style: widgetStyles.buttonSuccess,
                disabled: false
            };
        }

        // Bouton de chargement des données
        if (canStartProcess) {
            return {
                type: 'load' as const,
                text: shouldUseFetchAction ? 'Charger les Données' : 'Générer le Rapport',
                icon: <RefreshCw size={20} style={widgetStyles.buttonIcon} />,
                style: widgetStyles.buttonPrimary,
                disabled: false
            };
        }

        // États de traitement
        if (isProcessing) {
            return {
                type: 'processing' as const,
                text: currentStep === "fetchingInitialData" ? 'Chargement des données...' : 'Traitement en cours...',
                icon: (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <RefreshCw size={20} style={widgetStyles.buttonIcon} />
                    </motion.div>
                ),
                style: widgetStyles.buttonDisabled,
                disabled: true
            };
        }

        // État d'erreur
        if (currentStep === "error") {
            return {
                type: 'retry' as const,
                text: 'Réessayer',
                icon: <RefreshCw size={20} style={widgetStyles.buttonIcon} />,
                style: widgetStyles.buttonSecondary,
                disabled: false
            };
        }

        // État par défaut (pas de dates valides)
        return {
            type: 'disabled' as const,
            text: 'Sélectionnez une période',
            icon: <Calendar size={20} style={widgetStyles.buttonIcon} />,
            style: widgetStyles.buttonDisabled,
            disabled: true
        };
    };

    const buttonConfig = getMainButtonConfig();

    /**
     * Gestion du clic sur le bouton principal
     */
    const handleMainButtonClick = () => {
        switch (buttonConfig.type) {
            case 'load':
                startDataLoading();
                break;
            case 'retry':
                retry();
                break;
            case 'download':
            case 'processing':
            case 'disabled':
            default:
                // Pas d'action
                break;
        }
    };

    return (
        <div
            className={className}
            style={style}
            tabIndex={tabIndex}
            data-widget-name={name}
        >
            <motion.div 
                style={widgetStyles.container}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <motion.div 
                    style={widgetStyles.header}
                    {...fadeInUp}
                >
                    <FileText size={28} style={widgetStyles.headerIcon} />
                    <h1 style={widgetStyles.headerTitle}>{reportTitle}</h1>
                </motion.div>

                {/* Progress Steps */}
                <motion.div 
                    style={widgetStyles.progressSection}
                    {...fadeInUp}
                    transition={{ delay: 0.1 }}
                >
                    <CustomStepper 
                        currentStep={currentStep}
                        hasValidDates={hasValidDates || false}
                        isProcessing={isProcessing}
                    />
                </motion.div>

                {/* Date Selection */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key="date-selection"
                        style={{
                            ...widgetStyles.dateSection,
                            ...(dateValidationError ? widgetStyles.dateSectionWithError : {})
                        }}
                        {...fadeInUp}
                        transition={{ delay: 0.2 }}
                    >
                        <div style={widgetStyles.dateSectionTitle}>
                            <Calendar size={18} style={{ marginRight: "8px" }} />
                            Sélectionnez la période d'analyse
                        </div>
                        
                        <DateRangePicker
                            value={[dateStart?.value || null, dateEnd?.value || null]}
                            onChange={handleDateRangeChange}
                            disabled={isProcessing}
                        />
                        
                        {dateValidationError && (
                            <motion.div 
                                style={widgetStyles.validationError}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <AlertCircle size={16} style={{ marginRight: "6px" }} />
                                {dateValidationError}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Configuration Info */}
                {shouldUseFetchAction && (
                    <motion.div
                        style={{
                            padding: "16px",
                            backgroundColor: palette.gray[50],
                            border: `1px solid ${palette.gray[200]}`,
                            borderRadius: "8px",
                            marginBottom: "16px"
                        }}
                        {...fadeInUp}
                        transition={{ delay: 0.25 }}
                    >
                        <div style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: palette.gray[700],
                            marginBottom: "8px",
                            display: "flex",
                            alignItems: "center"
                        }}>
                            <Settings size={16} style={{ marginRight: "8px" }} />
                            Mode de fonctionnement
                        </div>
                        <div style={{
                            fontSize: "13px",
                            color: palette.gray[600],
                            display: "flex",
                            alignItems: "center"
                        }}>
                            <Lightbulb size={14} style={{ marginRight: "6px", color: palette.warning }} />
                            Chargement via action configurée - cliquez sur "Charger les Données" pour récupérer les informations
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            key="loading"
                            style={{
                                padding: "20px",
                                backgroundColor: palette.gray[50],
                                borderRadius: "8px",
                                marginBottom: "16px"
                            }}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Skeleton height="120px" />
                            <div style={{
                                textAlign: "center" as const,
                                fontSize: "14px",
                                color: palette.gray[600],
                                marginTop: "12px"
                            }}>
                                Traitement des données en cours...
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error State */}
                <AnimatePresence>
                    {currentStep === "error" && errorMessage && (
                        <motion.div
                            key="error"
                            style={{
                                padding: "16px",
                                backgroundColor: `${palette.error}10`,
                                border: `1px solid ${palette.error}30`,
                                borderRadius: "8px",
                                marginBottom: "16px"
                            }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: palette.error,
                                marginBottom: "8px",
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <AlertCircle size={18} style={{ marginRight: "8px" }} />
                                Erreur
                            </div>
                            <div style={{
                                fontSize: "14px",
                                color: palette.error
                            }}>{errorMessage}</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Data Preview */}
                <AnimatePresence>
                    {dataPreview && currentStep === "readyForDownload" && (
                        <motion.div 
                            key="preview"
                            style={widgetStyles.dataPreview}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div style={widgetStyles.dataPreviewTitle}>
                                <BarChart3 size={16} style={{ marginRight: "8px", verticalAlign: "text-bottom" }} />
                                Aperçu des données chargées
                            </div>
                            <div style={widgetStyles.dataPreviewStats}>
                                <motion.div {...scaleIn} transition={{ delay: 0.4 }}>
                                    <Statistic 
                                        title="Secteurs" 
                                        value={dataPreview.secteurs}
                                        valueStyle={{ color: palette.primary }}
                                    />
                                </motion.div>
                                <motion.div {...scaleIn} transition={{ delay: 0.5 }}>
                                    <Statistic 
                                        title="Ateliers" 
                                        value={dataPreview.ateliers}
                                        valueStyle={{ color: palette.electric }}
                                    />
                                </motion.div>
                                <motion.div {...scaleIn} transition={{ delay: 0.6 }}>
                                    <Statistic 
                                        title="Machines" 
                                        value={dataPreview.machines}
                                        valueStyle={{ color: palette.gas }}
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Action Button */}
                <motion.div 
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "24px"
                    }}
                    {...fadeInUp}
                    transition={{ delay: 0.2 }}
                >
                    <AnimatePresence mode="wait">
                        {buttonConfig.type === 'download' ? (
                            <motion.div
                                key="pdf-download"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {(() => {
                                    // Debug: Vérifier les données avant génération PDF
                                    console.log("=== PDF GENERATION DEBUG ===");
                                    console.log("reportTitle:", reportTitle);
                                    console.log("reportDescription:", reportDescription?.value);
                                    console.log("logoUrl:", logoUrl);
                                    console.log("treeData:", treeData ? `${treeData.length} items` : "null/undefined");
                                    console.log("dateStart:", dateStart?.value);
                                    console.log("dateEnd:", dateEnd?.value);
                                    console.log("currentStep:", currentStep);
                                    console.log("buttonConfig:", buttonConfig);
                                    console.log("===========================");
                                    
                                    return (
                                        <motion.div
                                            whileHover={{ 
                                                scale: 1.05, 
                                                boxShadow: "0 12px 24px rgba(0,0,0,0.15)" 
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                display: "inline-block",
                                                borderRadius: "12px",
                                                overflow: "hidden"
                                            }}
                                        >
                                            <PDFDownloadLink
                                                document={
                                                    <PDFDocumentLayout
                                                        reportTitle={reportTitle}
                                                        reportDescription={reportDescription?.value}
                                                        logoUrl={logoUrl}
                                                        treeData={treeData}
                                                        dateStart={dateStart?.value}
                                                        dateEnd={dateEnd?.value}
                                                    />
                                                }
                                                fileName={getDefaultPDFFileName()}
                                                style={{
                                                    ...widgetStyles.button,
                                                    ...buttonConfig.style,
                                                    fontSize: "18px",
                                                    padding: "16px 32px",
                                                    minWidth: "280px",
                                                    textDecoration: "none",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: "none",
                                                    borderRadius: "12px",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                                }}
                                            >
                                                {({ blob, url, loading, error }) => {
                                                    console.log("PDFDownloadLink state:", { blob: !!blob, url: !!url, loading, error });
                                                    
                                                    if (error) {
                                                        console.error("PDF Generation Error:", error);
                                                        return (
                                                            <span style={{ color: palette.error }}>
                                                                <AlertCircle size={20} style={widgetStyles.buttonIcon} />
                                                                Erreur PDF
                                                            </span>
                                                        );
                                                    }
                                                    
                                                    if (loading) {
                                                        return (
                                                            <span>
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                    style={{ display: "inline-block", marginRight: "8px" }}
                                                                >
                                                                    <RefreshCw size={20} />
                                                                </motion.div>
                                                                Génération...
                                                            </span>
                                                        );
                                                    }
                                                    
                                                    return (
                                                        <span>
                                                            {buttonConfig.icon}
                                                            {buttonConfig.text}
                                                        </span>
                                                    );
                                                }}
                                            </PDFDownloadLink>
                                        </motion.div>
                                    );
                                })()}
                            </motion.div>
                        ) : (
                            <motion.button
                                key={buttonConfig.type}
                                onClick={handleMainButtonClick}
                                disabled={buttonConfig.disabled}
                                style={{
                                    ...widgetStyles.button,
                                    ...buttonConfig.style,
                                    fontSize: "18px",
                                    padding: "16px 32px",
                                    minWidth: "280px",
                                    borderRadius: "12px",
                                    boxShadow: buttonConfig.disabled ? "none" : "0 4px 12px rgba(0,0,0,0.15)"
                                }}
                                whileHover={!buttonConfig.disabled ? { 
                                    scale: 1.05, 
                                    boxShadow: "0 12px 24px rgba(0,0,0,0.15)" 
                                } : {}}
                                whileTap={!buttonConfig.disabled ? { scale: 0.95 } : {}}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {buttonConfig.icon}
                                {buttonConfig.text}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
} 