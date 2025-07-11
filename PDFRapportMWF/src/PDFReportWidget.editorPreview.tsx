import { ReactElement, createElement } from "react";
import { Calendar, RefreshCw, Download, Settings, Clock, Lightbulb } from "lucide-react";
import { PDFReportWidgetPreviewProps } from "../typings/PDFReportWidgetProps";

// Palette de couleurs cohérente avec l'interface principale
const previewPalette = {
    primary: "#18213e",
    electric: "#38a13c",
    gas: "#f9be01", 
    water: "#3293f3",
    air: "#66d8e6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    gray: {
        50: "#f9fafb",
        100: "#f3f4f6", 
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937"
    }
};

// Styles pour la prévisualisation
const previewStyles = {
    container: {
        backgroundColor: "#ffffff",
        border: `1px solid ${previewPalette.gray[200]}`,
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        maxWidth: "700px",
        margin: "10px"
    },
    header: {
        display: "flex",
        alignItems: "center",
        marginBottom: "32px",
        paddingBottom: "16px",
        borderBottom: `2px solid ${previewPalette.primary}`
    },
    headerIcon: {
        width: "28px",
        height: "28px",
        marginRight: "12px",
        backgroundColor: previewPalette.primary,
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "14px",
        fontWeight: "bold"
    },
    headerTitle: {
        fontSize: "24px",
        fontWeight: "700",
        color: previewPalette.primary,
        margin: 0
    },
    // Steps indicator styles
    stepsContainer: {
        marginBottom: "32px"
    },
    stepsWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px",
        backgroundColor: previewPalette.gray[50],
        borderRadius: "10px",
        border: `1px solid ${previewPalette.gray[200]}`
    },
    step: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        flex: 1,
        position: "relative" as const
    },
    stepIcon: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "bold",
        marginBottom: "8px"
    },
    stepIconActive: {
        backgroundColor: previewPalette.primary,
        color: "white"
    },
    stepIconComplete: {
        backgroundColor: previewPalette.success,
        color: "white"
    },
    stepIconWaiting: {
        backgroundColor: previewPalette.gray[200],
        color: previewPalette.gray[500]
    },
    stepTitle: {
        fontSize: "13px",
        fontWeight: "600",
        color: previewPalette.gray[800],
        textAlign: "center" as const,
        lineHeight: "1.2"
    },
    stepDescription: {
        fontSize: "11px",
        color: previewPalette.gray[600],
        textAlign: "center" as const,
        marginTop: "2px"
    },
    stepConnector: {
        position: "absolute" as const,
        top: "16px",
        left: "60%",
        right: "-40%",
        height: "2px",
        backgroundColor: previewPalette.gray[200]
    },
    configSection: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        marginBottom: "20px",
        padding: "16px",
        backgroundColor: previewPalette.gray[50],
        borderRadius: "8px",
        border: `1px solid ${previewPalette.gray[200]}`
    },
    configItem: {
        display: "flex",
        flexDirection: "column" as const,
        fontSize: "14px"
    },
    configLabel: {
        fontWeight: "600",
        color: previewPalette.gray[700],
        marginBottom: "4px"
    },
    configValue: {
        color: previewPalette.gray[600],
        fontSize: "13px"
    },
    statusCard: {
        padding: "12px 16px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        fontWeight: "500",
        backgroundColor: previewPalette.gray[50],
        border: `1px solid ${previewPalette.gray[200]}`,
        color: previewPalette.gray[700],
        marginBottom: "16px"
    },
    statusIcon: {
        width: "16px",
        height: "16px",
        backgroundColor: previewPalette.gray[600],
        borderRadius: "50%",
        marginRight: "10px"
    },
    actionSection: {
        display: "flex",
        gap: "10px"
    },
    button: {
        display: "inline-flex",
        alignItems: "center",
        padding: "10px 20px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "600",
        textDecoration: "none",
        border: "none",
        cursor: "pointer",
        minWidth: "120px",
        justifyContent: "center"
    },
    buttonPrimary: {
        backgroundColor: previewPalette.primary,
        color: "white"
    },
    buttonSuccess: {
        backgroundColor: previewPalette.success,
        color: "white"
    },
    buttonIcon: {
        width: "14px",
        height: "14px",
        backgroundColor: "currentColor",
        borderRadius: "2px",
        marginRight: "6px",
        opacity: 0.8
    },
    previewNote: {
        fontSize: "12px",
        color: previewPalette.gray[600],
        fontStyle: "italic",
        textAlign: "center" as const,
        marginTop: "16px",
        padding: "8px",
        backgroundColor: previewPalette.gray[50],
        borderRadius: "4px"
    },
    stepIndicator: {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        color: previewPalette.gray[600],
        marginBottom: "12px",
        marginTop: "16px"
    },
    stepNumber: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: previewPalette.primary,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        marginRight: "8px"
    },
    stepNumberSuccess: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: previewPalette.success,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        marginRight: "8px"
    },
    dateSection: {
        padding: "24px",
        backgroundColor: previewPalette.gray[50],
        borderRadius: "12px",
        border: `1px solid ${previewPalette.gray[200]}`,
        marginBottom: "24px"
    },
    dateSectionTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: previewPalette.gray[800],
        marginBottom: "16px",
        display: "flex",
        alignItems: "center"
    },
    dateRangePickerPreview: {
        width: "100%",
        height: "48px",
        padding: "12px 16px",
        border: `2px solid ${previewPalette.gray[200]}`,
        borderRadius: "8px",
        fontSize: "15px",
        backgroundColor: "white",
        color: previewPalette.gray[600],
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative" as const
    },
    dateRangeText: {
        color: previewPalette.gray[600]
    },
    datePickerIcon: {
        width: "16px",
        height: "16px",
        backgroundColor: previewPalette.gray[400],
        borderRadius: "2px"
    },

    helpText: {
        fontSize: "11px",
        color: previewPalette.gray[500],
        marginTop: "4px",
        fontStyle: "italic"
    },
    dataPreview: {
        padding: "20px",
        backgroundColor: previewPalette.gray[50],
        border: `1px solid ${previewPalette.gray[200]}`,
        borderRadius: "12px",
        marginBottom: "20px"
    },
    dataPreviewTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: previewPalette.gray[700],
        marginBottom: "16px",
        display: "flex",
        alignItems: "center"
    },
    dataPreviewStats: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px"
    },
    dataPreviewStat: {
        textAlign: "center" as const,
        padding: "16px 12px",
        backgroundColor: "white",
        borderRadius: "8px",
        border: `1px solid ${previewPalette.gray[200]}`,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    dataPreviewNumber: {
        fontSize: "24px",
        fontWeight: "bold",
        display: "block",
        marginBottom: "4px"
    },
    dataPreviewNumberPrimary: {
        color: previewPalette.primary
    },
    dataPreviewNumberElectric: {
        color: previewPalette.electric
    },
    dataPreviewNumberGas: {
        color: previewPalette.gas
    },
    dataPreviewLabel: {
        fontSize: "12px",
        color: previewPalette.gray[600],
        fontWeight: "500"
    },
    skeletonPreview: {
        padding: "20px",
        backgroundColor: previewPalette.gray[50],
        borderRadius: "12px",
        border: `1px solid ${previewPalette.gray[200]}`,
        marginBottom: "20px"
    },
    skeletonBar: {
        height: "12px",
        backgroundColor: previewPalette.gray[200],
        borderRadius: "6px",
        marginBottom: "8px",
        animation: "pulse 1.5s ease-in-out infinite"
    },
    skeletonBarWide: {
        width: "80%"
    },
    skeletonBarMedium: {
        width: "60%"
    },
    skeletonBarNarrow: {
        width: "40%"
    }
};

// CSS animation pour le skeleton
const animationStyles = `
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
`;

// Injection du CSS d'animation
if (typeof document !== 'undefined') {
    const existingStyle = document.querySelector('style[data-preview="pdf-widget"]');
    if (!existingStyle) {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = animationStyles;
        styleSheet.setAttribute('data-preview', 'pdf-widget');
        document.head.appendChild(styleSheet);
    }
}

export function preview({ 
    reportTitle,
    reportLevels,
    dateStart,
    dateEnd,
    fetchDataAction
}: PDFReportWidgetPreviewProps): ReactElement {
    
    const levelCount = reportLevels ? reportLevels.length : 0;
    const hasAction = fetchDataAction !== null;
    const hasDateConfig = dateStart && dateEnd;
    const isCompleteConfig = hasAction && levelCount > 0;
    
    return (
        <div style={previewStyles.container}>
            {/* Header */}
            <div style={previewStyles.header}>
                <div style={previewStyles.headerIcon}><Download size={24} /></div>
                <h1 style={previewStyles.headerTitle}>{reportTitle || "Rapport PDF"}</h1>
            </div>

            {/* Progress Steps */}
            <div style={previewStyles.stepsContainer}>
                <div style={previewStyles.stepsWrapper}>
                    <div style={previewStyles.step}>
                        <div style={{
                            ...previewStyles.stepIcon,
                            ...previewStyles.stepIconActive
                        }}><Calendar size={16} /></div>
                        <div style={previewStyles.stepTitle}>Période</div>
                        <div style={previewStyles.stepDescription}>Sélection des dates</div>
                        <div style={previewStyles.stepConnector}></div>
                    </div>
                    <div style={previewStyles.step}>
                        <div style={{
                            ...previewStyles.stepIcon,
                            ...(isCompleteConfig ? previewStyles.stepIconActive : previewStyles.stepIconWaiting)
                        }}><RefreshCw size={16} /></div>
                        <div style={previewStyles.stepTitle}>Données</div>
                        <div style={previewStyles.stepDescription}>Chargement & traitement</div>
                        <div style={previewStyles.stepConnector}></div>
                    </div>
                    <div style={previewStyles.step}>
                        <div style={{
                            ...previewStyles.stepIcon,
                            ...(isCompleteConfig ? previewStyles.stepIconComplete : previewStyles.stepIconWaiting)
                        }}><Download size={16} /></div>
                        <div style={previewStyles.stepTitle}>Rapport</div>
                        <div style={previewStyles.stepDescription}>Génération PDF</div>
                    </div>
                </div>
            </div>

            {/* Date Selection with modern DatePicker preview */}
            <div style={previewStyles.dateSection}>
                <div style={previewStyles.dateSectionTitle}>
                    <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Sélectionnez la période d'analyse
                </div>
                <div style={previewStyles.dateRangePickerPreview}>
                    <span style={previewStyles.dateRangeText}>
                        {hasDateConfig ? `${dateStart} — ${dateEnd}` : "Sélectionnez la plage de dates"}
                    </span>
                    <div style={previewStyles.datePickerIcon}></div>
                </div>
                <div style={previewStyles.helpText}>
                    <Lightbulb size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    DatePicker moderne avec validation intégrée • Chargement automatique après changement de dates • Maximum 365 jours
                </div>
            </div>

            {/* Configuration Status */}
            <div style={previewStyles.configSection}>
                <div style={previewStyles.configItem}>
                    <div style={previewStyles.configLabel}>
                        <Settings size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Configuration du Widget
                    </div>
                    <div style={previewStyles.configValue}>
                        {levelCount > 0 ? `${levelCount} niveau${levelCount > 1 ? 's' : ''}` : "⚠️ Niveaux non configurés"} • 
                        {hasAction ? "✅ Action configurée" : "⚠️ Pas d'action"} • 
                        Énergies: Élec/Gaz/Air • React DatePicker • PDF Ready
                    </div>
                </div>
            </div>

            {/* Skeleton Loading State (quand chargement) */}
            {isCompleteConfig && (
                <div style={previewStyles.skeletonPreview}>
                    <div style={{...previewStyles.skeletonBar, ...previewStyles.skeletonBarWide}}></div>
                    <div style={{...previewStyles.skeletonBar, ...previewStyles.skeletonBarMedium}}></div>
                    <div style={{...previewStyles.skeletonBar, ...previewStyles.skeletonBarNarrow}}></div>
                    <div style={previewStyles.helpText}>
                        <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Simulation du Skeleton Loading pendant le traitement
                    </div>
                </div>
            )}

            {/* Modern Status Card */}
            <div style={{
                ...previewStyles.statusCard,
                backgroundColor: isCompleteConfig ? previewPalette.success + "20" : previewPalette.warning + "20",
                borderColor: isCompleteConfig ? previewPalette.success : previewPalette.warning
            }}>
                <div style={{
                    ...previewStyles.statusIcon,
                    backgroundColor: isCompleteConfig ? previewPalette.success : previewPalette.warning
                }}></div>
                {isCompleteConfig ? 
                    "✅ Configuration complète - Prêt à charger les données" : 
                    "⚙️ Configuration incomplète - Vérifiez les paramètres"}
            </div>

            {/* Data Preview with Statistics (si tout configuré) */}
            {isCompleteConfig && (
                createElement("div", { style: previewStyles.dataPreview },
                    createElement("div", { style: previewStyles.dataPreviewTitle },
                        "📊 Aperçu des données chargées (simulation)"
                    ),
                    createElement("div", { style: previewStyles.dataPreviewStats },
                        createElement("div", { style: previewStyles.dataPreviewStat },
                            createElement("span", { 
                                style: {...previewStyles.dataPreviewNumber, ...previewStyles.dataPreviewNumberPrimary} 
                            }, "12"),
                            createElement("div", { style: previewStyles.dataPreviewLabel }, "Secteurs")
                        ),
                        createElement("div", { style: previewStyles.dataPreviewStat },
                            createElement("span", { 
                                style: {...previewStyles.dataPreviewNumber, ...previewStyles.dataPreviewNumberElectric} 
                            }, "38"),
                            createElement("div", { style: previewStyles.dataPreviewLabel }, "Ateliers")
                        ),
                        createElement("div", { style: previewStyles.dataPreviewStat },
                            createElement("span", { 
                                style: {...previewStyles.dataPreviewNumber, ...previewStyles.dataPreviewNumberGas} 
                            }, "156"),
                            createElement("div", { style: previewStyles.dataPreviewLabel }, "Machines")
                        )
                    )
                )
            )}

            {/* Actions modernes avec animations */}
            <div style={previewStyles.actionSection}>
                {hasAction && (
                    <button style={{
                        ...previewStyles.button, 
                        ...previewStyles.buttonPrimary,
                        opacity: isCompleteConfig ? 1 : 0.6
                    }}>
                        <div style={previewStyles.buttonIcon}></div>
                        {isCompleteConfig ? "Charger les Données" : "Configuration requise"}
                    </button>
                )}
                {isCompleteConfig && (
                    <button style={{...previewStyles.button, ...previewStyles.buttonSuccess}}>
                        <div style={previewStyles.buttonIcon}></div>
                        Télécharger PDF
                    </button>
                )}
            </div>

            {/* Note de prévisualisation moderne */}
            <div style={previewStyles.previewNote}>
                Interface UX/UI moderne : Custom Stepper • React DatePicker • Micro-animations Framer Motion • Skeleton custom • Bundle optimisé
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/PDFReportWidget.css");
}