import { ReactElement, createElement } from "react";
import { CompareDataPreviewProps } from "../typings/CompareDataProps";
import { BarChart3 } from "lucide-react";

export function preview(props: CompareDataPreviewProps): ReactElement {
    const selectedAssetCount = props.assetsDataSource ? 1 : 0;
    const hasTimeSeriesData = !!props.timeSeriesDataSource;
    
    return (
        <div 
            className="widget-comparedata-preview"
            style={{
                padding: "1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                backgroundColor: "#f9fafb",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                textAlign: "center"
            }}
        >
            <BarChart3 size={48} style={{ color: "#6b7280", marginBottom: "1rem" }} />
            <div style={{ fontSize: "1.125rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                CompareData Widget
            </div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
                Widget de comparaison des données de consommation entre assets
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                {props.devMode ? "Mode développeur activé" : 
                 hasTimeSeriesData ? `${selectedAssetCount} source(s) de données configurée(s)` :
                 "Configurez vos sources de données pour voir la comparaison"}
            </div>
        </div>
    );
}