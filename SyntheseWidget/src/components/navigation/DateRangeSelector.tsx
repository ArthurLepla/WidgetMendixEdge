import { ReactElement, createElement, useState } from "react";
import { Calendar, Info } from "lucide-react";
// Custom date range picker retiré

export interface DateRangeSelectorProps {
    onPreset: (key: "7d" | "30d" | "mtd" | "m-1" | "ytd" | "n-1" | "custom") => void;
    activeKey: "7d" | "30d" | "mtd" | "m-1" | "ytd" | "n-1" | "custom";
    dateDebut?: Date;
    dateFin?: Date;
}

const formatDate = (date?: Date): string => {
    if (!date) return "N/A";
    return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getPreviousPeriodDates = (
    period: "day" | "week" | "month",
    dateDebut?: Date,
    dateFin?: Date
): { debut: string; fin: string } => {
    if (!dateDebut || !dateFin) return { debut: "N/A", fin: "N/A" };
    const previousDebut = new Date(dateDebut);
    const previousFin = new Date(dateFin);
    switch (period) {
        case "day":
            previousDebut.setDate(previousDebut.getDate() - 1);
            previousFin.setDate(previousFin.getDate() - 1);
            break;
        case "week":
            previousDebut.setDate(previousDebut.getDate() - 7);
            previousFin.setDate(previousFin.getDate() - 7);
            break;
        case "month":
            previousDebut.setMonth(previousDebut.getMonth() - 1);
            previousFin.setMonth(previousFin.getMonth() - 1);
            break;
    }
    return { debut: formatDate(previousDebut), fin: formatDate(previousFin) };
};

export const DateRangeSelector = ({ onPreset, activeKey, dateDebut, dateFin }: DateRangeSelectorProps): ReactElement => {
    const mapKeyToPeriod = (key: string): "day" | "week" | "month" =>
        key === "7d" ? "week" : key === "30d" || key === "mtd" || key === "m-1" ? "month" : "day";
    const previousPeriod = getPreviousPeriodDates(mapKeyToPeriod(activeKey), dateDebut, dateFin);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const toggleTooltip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsTooltipVisible(!isTooltipVisible);
    };

    // Custom range retiré du sélecteur

    return (
        <div className="period-analysis-container">
            <div className="period-analysis-header">
                <div className="selector-icon-wrapper">
                    <Calendar className="selector-icon" />
                </div>
                <div className="period-content">
                    <h3 className="period-title">Période d'analyse</h3>
                    <p className="period-subtitle">
                        Période précédente: {previousPeriod.debut} - {previousPeriod.fin}
                    </p>
                </div>
                <button className="info-btn" onClick={toggleTooltip} title="Informations">
                    <Info className="info-icon" />
                </button>
            </div>

            {isTooltipVisible && (
                <div className="info-tooltip">
                    <p className="tooltip-text">
                        Les données de consommation sont comparées automatiquement avec la période
                        équivalente précédente pour calculer les variations.
                    </p>
                </div>
            )}

            <div className="period-selector">
                {/* Boutons presets normaux */}
                {[
                    { key: "7d", label: "7 jours" },
                    { key: "30d", label: "30 jours" },
                    { key: "mtd", label: "Mois en cours" },
                    { key: "m-1", label: "M-1" },
                    { key: "ytd", label: "YTD" },
                    { key: "n-1", label: "N-1" }
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        className={`period-btn ${activeKey === key ? "active" : ""}`}
                        onClick={() => onPreset(key as any)}
                    >
                        {label}
                    </button>
                ))}
                
                {/* Plage personnalisée retirée */}
            </div>
        </div>
    );
};
