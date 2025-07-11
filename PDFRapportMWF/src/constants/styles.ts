import { palette } from "./config";

// Styles pour l'interface du widget
export const widgetStyles = {
    container: {
        backgroundColor: "#ffffff",
        border: `1px solid ${palette.gray[200]}`,
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        maxWidth: "800px",
        margin: "0 auto"
    },
    header: {
        display: "flex",
        alignItems: "center",
        marginBottom: "32px",
        paddingBottom: "16px",
        borderBottom: `2px solid ${palette.primary}`
    },
    headerIcon: {
        marginRight: "12px",
        color: palette.primary
    },
    headerTitle: {
        fontSize: "24px",
        fontWeight: "700",
        color: palette.primary,
        margin: 0
    },
    progressSection: {
        marginBottom: "32px"
    },
    dateSection: {
        padding: "24px",
        backgroundColor: palette.gray[50],
        borderRadius: "12px",
        border: `1px solid ${palette.gray[200]}`,
        marginBottom: "24px"
    },
    dateSectionTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: palette.gray[800],
        marginBottom: "16px",
        display: "flex",
        alignItems: "center"
    },
    dateSectionWithError: {
        borderColor: palette.error,
        backgroundColor: `${palette.error}05`
    },
    skeletonSection: {
        padding: "24px",
        backgroundColor: palette.gray[50],
        borderRadius: "12px",
        border: `1px solid ${palette.gray[200]}`,
        marginBottom: "24px"
    },
    statusSection: {
        marginBottom: "24px"
    },
    statusCard: {
        padding: "16px 20px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        fontSize: "16px",
        fontWeight: "500",
        transition: "all 0.3s ease"
    },
    statusIdle: {
        backgroundColor: palette.gray[50],
        border: `1px solid ${palette.gray[200]}`,
        color: palette.gray[700]
    },
    statusLoading: {
        backgroundColor: `${palette.primary}10`,
        border: `1px solid ${palette.primary}30`,
        color: palette.primary
    },
    statusSuccess: {
        backgroundColor: `${palette.success}10`,
        border: `1px solid ${palette.success}30`,
        color: palette.success
    },
    statusError: {
        backgroundColor: `${palette.error}10`,
        border: `1px solid ${palette.error}30`,
        color: palette.error
    },
    statusIcon: {
        marginRight: "12px"
    },
    button: {
        display: "inline-flex",
        alignItems: "center",
        padding: "12px 24px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        textDecoration: "none",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        outline: "none",
        minWidth: "140px",
        justifyContent: "center"
    },
    buttonPrimary: {
        backgroundColor: palette.primary,
        color: "white"
    },
    buttonPrimaryHover: {
        backgroundColor: "#0f172a",
        transform: "translateY(-1px)",
        boxShadow: "0 8px 16px rgba(0,0,0,0.15)"
    },
    buttonSuccess: {
        backgroundColor: palette.success,
        color: "white"
    },
    buttonSuccessHover: {
        backgroundColor: "#059669",
        transform: "translateY(-1px)", 
        boxShadow: "0 8px 16px rgba(0,0,0,0.15)"
    },
    buttonSecondary: {
        backgroundColor: "transparent",
        color: palette.gray[600],
        border: `2px solid ${palette.gray[300]}`
    },
    buttonSecondaryHover: {
        backgroundColor: palette.gray[50],
        borderColor: palette.gray[400],
        color: palette.gray[700]
    },
    buttonDisabled: {
        backgroundColor: palette.gray[200],
        color: palette.gray[400],
        cursor: "not-allowed"
    },
    buttonIcon: {
        marginRight: "8px"
    },
    loadingSpinner: {
        animation: "spin 1s linear infinite"
    },
    errorDetails: {
        marginTop: "12px",
        padding: "12px",
        backgroundColor: `${palette.error}05`,
        borderRadius: "6px",
        fontSize: "14px",
        color: palette.gray[600]
    },
    validationError: {
        fontSize: "13px",
        color: palette.error,
        marginTop: "6px",
        display: "flex",
        alignItems: "center",
        fontWeight: "500"
    },
    helpText: {
        fontSize: "12px",
        color: palette.gray[500],
        marginTop: "4px",
        fontStyle: "italic"
    },
    stepIndicator: {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        color: palette.gray[600],
        marginBottom: "12px"
    },
    stepNumber: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: palette.primary,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        marginRight: "8px"
    },
    dataPreview: {
        padding: "16px",
        backgroundColor: palette.gray[50],
        border: `1px solid ${palette.gray[200]}`,
        borderRadius: "8px",
        marginBottom: "16px"
    },
    dataPreviewTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: palette.gray[700],
        marginBottom: "8px",
        display: "flex",
        alignItems: "center"
    },
    dataPreviewStats: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
        gap: "12px"
    },
    dataPreviewStat: {
        textAlign: "center" as const,
        padding: "8px",
        backgroundColor: "white",
        borderRadius: "6px",
        border: `1px solid ${palette.gray[200]}`
    },
    dataPreviewNumber: {
        fontSize: "18px",
        fontWeight: "bold",
        color: palette.primary,
        display: "block"
    },
    dataPreviewLabel: {
        fontSize: "12px",
        color: palette.gray[600],
        marginTop: "2px"
    }
}; 