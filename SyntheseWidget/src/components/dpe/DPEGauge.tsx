import { ReactElement, createElement, useState } from "react";
import { Gauge, TrendingUp, AlertTriangle, Settings, Info } from "lucide-react";

interface DPEGaugeProps {
    grade: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    kwhValue: number;
    primaryColor?: string;
    thresholds?: {
        A: number;
        B: number;
        C: number;
        D: number;
        E: number;
        F: number;
    };
    period?: "day" | "week" | "month";
    customColors?: Partial<Record<"A" | "B" | "C" | "D" | "E" | "F" | "G", string>>;
}

const SCALE = ["A", "B", "C", "D", "E", "F", "G"] as const;

// Palette alignée avec DPE.tsx
const DPE_COLORS: Record<string, string> = {
    A: "#319834",
    B: "#33CC33",
    C: "#CBEF43",
    D: "#FFF833",
    E: "#FDD733",
    F: "#FF9234",
    G: "#FF4234"
};

const GRADE_LABELS: Record<string, string> = {
    A: "Excellente",
    B: "Très bonne",
    C: "Bonne",
    D: "Moyenne",
    E: "Médiocre",
    F: "Mauvaise",
    G: "Très mauvaise"
};

const getPerformanceIcon = (grade: string) => {
    if (["A", "B"].includes(grade)) return <TrendingUp className="performance-icon-svg" />;
    if (["C", "D"].includes(grade)) return <Gauge className="performance-icon-svg" />;
    return <AlertTriangle className="performance-icon-svg" />;
};

export function DPEGauge({
    grade,
    kwhValue,
    primaryColor = "#18213e",
    thresholds = {
        A: 200,
        B: 400,
        C: 600,
        D: 800,
        E: 1000,
        F: 1200
    },
    period = "day",
    customColors
}: DPEGaugeProps): ReactElement {
    const [showThresholds, setShowThresholds] = useState(false);
    const colorMap = { ...DPE_COLORS, ...(customColors || {}) } as Record<string, string>;
    const getColor = (label: (typeof SCALE)[number]) => colorMap[label];
    const currentColor = getColor(grade);

    return (
        <div className="dpe-card-modern">
            <div className="dpe-header-modern">
                <div className="dpe-icon-wrapper" style={{ background: `${primaryColor}08` }}>
                    <Gauge className="dpe-icon-modern" style={{ color: primaryColor }} />
                </div>
                <div className="dpe-content">
                    <div className="dpe-title-modern" style={{ color: primaryColor }}>
                        Performance Énergétique
                    </div>
                    <div className="dpe-subtitle-modern">Indice DPE de l'installation</div>
                </div>
                <div
                    className="dpe-grade-modern"
                    style={{
                        background: `linear-gradient(135deg, ${currentColor}15 0%, ${currentColor}25 100%)`,
                        border: `2px solid ${currentColor}30`
                    }}
                >
                    <div className="dpe-grade-letter-modern" style={{ color: currentColor }}>
                        {grade}
                    </div>
                    <div className="dpe-grade-status">{GRADE_LABELS[grade]}</div>
                </div>
            </div>

            <div className="dpe-scale-modern">
                {SCALE.map(letter => (
                    <div
                        key={letter}
                        className={`dpe-scale-bar ${letter === grade ? "current" : ""}`}
                        style={{
                            background:
                                letter === grade
                                    ? `linear-gradient(135deg, ${getColor(letter)} 0%, ${getColor(letter)}dd 100%)`
                                    : getColor(letter),
                            opacity: letter === grade ? 1 : 0.7
                        }}
                        title={`Niveau ${letter} - ${GRADE_LABELS[letter]}`}
                    >
                        <span
                            className="scale-letter"
                            style={{
                                color: ["C", "D", "E"].includes(letter) ? "#374151" : "#ffffff",
                                fontWeight: letter === grade ? 700 : 600
                            }}
                        >
                            {letter}
                        </span>
                        {letter === grade && <div className="scale-indicator" style={{ background: currentColor }} />}
                    </div>
                ))}
            </div>

            <div className="dpe-metrics-modern">
                <div className="dpe-metric-modern">
                    <div className="metric-label">Intensité énergétique</div>
                    <div className="metric-value" style={{ color: currentColor }}>
                        {Intl.NumberFormat().format(kwhValue)}
                        <span className="metric-unit">kWh éq.</span>
                    </div>
                </div>
                <div className="dpe-performance-modern">
                    <div className="performance-icon" style={{ color: currentColor }}>
                        {getPerformanceIcon(grade)}
                    </div>
                    <div className="performance-text" style={{ color: currentColor }}>
                        {GRADE_LABELS[grade]}
                    </div>
                </div>
                <button
                    className="dpe-settings-btn"
                    onClick={() => setShowThresholds(!showThresholds)}
                    title="Voir les seuils DPE"
                >
                    <Settings className="settings-icon" />
                </button>
            </div>

            {/* Panneau des seuils */}
            {showThresholds && (
                <div className="dpe-thresholds-panel">
                    <div className="thresholds-header">
                        <Info className="info-icon-small" />
                        <span className="thresholds-title">Seuils DPE - Période: {period}</span>
                    </div>
                    <div className="thresholds-grid">
                        {Object.entries(thresholds).map(([level, threshold]) => {
                            const color = DPE_COLORS[level];
                            const isCurrent = level === grade;
                            return (
                                <div
                                    key={level}
                                    className={`threshold-item ${isCurrent ? "current" : ""}`}
                                    style={{ borderLeftColor: color }}
                                >
                                    <div className="threshold-level" style={{ color }}>
                                        {level}
                                    </div>
                                    <div className="threshold-info">
                                        <div className="threshold-label">{GRADE_LABELS[level]}</div>
                                        <div className="threshold-value">
                                            ≤ {Intl.NumberFormat().format(threshold)} kWh
                                        </div>
                                    </div>
                                    {isCurrent && (
                                        <div className="current-indicator" style={{ background: color }}>
                                            Actuel
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div className="threshold-item">
                            <div className="threshold-level" style={{ color: DPE_COLORS.G }}>
                                G
                            </div>
                            <div className="threshold-info">
                                <div className="threshold-label">{GRADE_LABELS.G}</div>
                                <div className="threshold-value">
                                    &gt; {Intl.NumberFormat().format(thresholds.F)} kWh
                                </div>
                            </div>
                            {grade === "G" && (
                                <div className="current-indicator" style={{ background: DPE_COLORS.G }}>
                                    Actuel
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
