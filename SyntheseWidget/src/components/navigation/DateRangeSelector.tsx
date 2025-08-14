import { ReactElement, createElement, useState, useEffect } from "react";
import { Calendar, Info } from "lucide-react";
import { DateRangePickerV2 } from "./DateRangePickerV2";

export interface DateRangeSelectorProps {
    onPreset: (key: "7d" | "30d" | "mtd" | "m-1" | "ytd" | "n-1" | "custom") => void;
    activeKey: "7d" | "30d" | "mtd" | "m-1" | "ytd" | "n-1" | "custom";
    dateDebut?: Date;
    dateFin?: Date;
    onCustomDateChange?: (dateDebut: Date, dateFin: Date) => void;
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

export const DateRangeSelector = ({
    onPreset,
    activeKey,
    dateDebut,
    dateFin,
    onCustomDateChange
}: DateRangeSelectorProps): ReactElement => {
    const mapKeyToPeriod = (key: string): "day" | "week" | "month" =>
        key === "7d" ? "week" : key === "30d" || key === "mtd" || key === "m-1" ? "month" : "day";
    const previousPeriod = getPreviousPeriodDates(mapKeyToPeriod(activeKey), dateDebut, dateFin);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const toggleTooltip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsTooltipVisible(!isTooltipVisible);
    };

    const handleCustomApply = (startDate: Date, endDate: Date) => {
        if (onCustomDateChange) {
            onCustomDateChange(startDate, endDate);
        }
        onPreset("custom");
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest(".tooltip-container")) setIsTooltipVisible(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div className="date-range-selector-container">
            <div className="modern-selector-card">
                <div className="selector-header">
                    <div className="selector-icon-wrapper">
                        <Calendar className="selector-icon" />
                    </div>
                    <div className="selector-content">
                        <div className="selector-title-row">
                            <h2 className="selector-title">Période d'analyse</h2>
                            <div className="tooltip-wrapper">
                                <Info className="info-icon" onClick={toggleTooltip} />
                                <div className={`period-tooltip ${isTooltipVisible ? "visible" : ""}`}>
                                    <div className="tooltip-section">
                                        <div className="tooltip-header">
                                            <div className="tooltip-dot current"></div>
                                            <span className="tooltip-label">Période actuelle</span>
                                        </div>
                                        <div className="tooltip-dates">
                                            <div className="date-row">
                                                <span className="date-label">Début :</span>
                                                <span className="date-value">{formatDate(dateDebut)}</span>
                                            </div>
                                            <div className="date-row">
                                                <span className="date-label">Fin :</span>
                                                <span className="date-value">{formatDate(dateFin)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tooltip-section">
                                        <div className="tooltip-header">
                                            <div className="tooltip-dot previous"></div>
                                            <span className="tooltip-label">Période précédente</span>
                                        </div>
                                        <div className="tooltip-dates">
                                            <div className="date-row">
                                                <span className="date-label">Début :</span>
                                                <span className="date-value">{previousPeriod.debut}</span>
                                            </div>
                                            <div className="date-row">
                                                <span className="date-label">Fin :</span>
                                                <span className="date-value">{previousPeriod.fin}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="period-buttons">
                    <button
                        onClick={() => onPreset("7d")}
                        className={`period-btn ${activeKey === "7d" ? "active" : ""}`}
                    >
                        7 jours
                    </button>
                    <button
                        onClick={() => onPreset("30d")}
                        className={`period-btn ${activeKey === "30d" ? "active" : ""}`}
                    >
                        30 jours
                    </button>
                    <button
                        onClick={() => onPreset("mtd")}
                        className={`period-btn ${activeKey === "mtd" ? "active" : ""}`}
                    >
                        Mois en cours
                    </button>
                    <button
                        onClick={() => onPreset("m-1")}
                        className={`period-btn ${activeKey === "m-1" ? "active" : ""}`}
                    >
                        M-1
                    </button>
                    <button
                        onClick={() => onPreset("ytd")}
                        className={`period-btn ${activeKey === "ytd" ? "active" : ""}`}
                    >
                        YTD
                    </button>
                    <button
                        onClick={() => onPreset("n-1")}
                        className={`period-btn ${activeKey === "n-1" ? "active" : ""}`}
                    >
                        N-1
                    </button>
                    {/* Personnalisé intégré en dropdown via DateRangePickerV2 */}
                    <DateRangePickerV2
                        className={`drp-as-period${activeKey === "custom" ? " drp-active" : ""}`}
                        placeholder="Personnalisé"
                        onCustomDateChange={handleCustomApply}
                    />
                </div>
            </div>
        </div>
    );
};
