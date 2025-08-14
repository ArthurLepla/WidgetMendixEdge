import { ReactElement, createElement, useState } from "react";
import { Zap, Flame, Droplet, Wind, TrendingUp, TrendingDown, Minus, Eye, EyeOff } from "lucide-react";

export interface ByLevelRow {
    level: string;
    electricity: number;
    gas: number;
    water: number;
    air: number;
    electricityPrev?: number;
    gasPrev?: number;
    waterPrev?: number;
    airPrev?: number;
}

interface ByLevelTableProps {
    rows: ByLevelRow[];
    primaryColor?: string;
}

const ENERGY_CONFIGS = {
    electricity: { icon: Zap, color: "#38a13c", bgColor: "rgba(56, 161, 60, 0.1)" },
    gas: { icon: Flame, color: "#F9BE01", bgColor: "rgba(249, 190, 1, 0.1)" },
    water: { icon: Droplet, color: "#3293f3", bgColor: "rgba(50, 147, 243, 0.1)" },
    air: { icon: Wind, color: "#66D8E6", bgColor: "rgba(102, 216, 230, 0.1)" }
};

export function ByLevelTable({ rows, primaryColor = "#18213e" }: ByLevelTableProps): ReactElement {
    const [showVariations, setShowVariations] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const totals = rows.reduce(
        (acc, r) => ({
            electricity: acc.electricity + r.electricity,
            gas: acc.gas + r.gas,
            water: acc.water + r.water,
            air: acc.air + r.air,
            electricityPrev: acc.electricityPrev + (r.electricityPrev || 0),
            gasPrev: acc.gasPrev + (r.gasPrev || 0),
            waterPrev: acc.waterPrev + (r.waterPrev || 0),
            airPrev: acc.airPrev + (r.airPrev || 0)
        }),
        { electricity: 0, gas: 0, water: 0, air: 0, electricityPrev: 0, gasPrev: 0, waterPrev: 0, airPrev: 0 }
    );

    const fmt = (n: number) => Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

    const getVariationIcon = (current: number, previous: number) => {
        if (previous === 0) return <Minus className="inline w-3 h-3 text-gray-400" />;
        const change = ((current - previous) / previous) * 100;
        if (Math.abs(change) < 1) return <Minus className="inline w-3 h-3 text-gray-400" />;
        return change > 0 ? (
            <TrendingUp className="inline w-3 h-3 text-red-500" />
        ) : (
            <TrendingDown className="inline w-3 h-3 text-green-500" />
        );
    };

    const getVariationText = (current: number, previous: number) => {
        if (previous === 0) return "—";
        const change = ((current - previous) / previous) * 100;
        const color = Math.abs(change) < 1 ? "#6b7280" : change > 0 ? "#ef4444" : "#10b981";
        return (
            <span style={{ color, fontSize: "0.75rem", fontWeight: 500 }}>
                {change > 0 ? "+" : ""}
                {change.toFixed(1)}%
            </span>
        );
    };

    return (
        <div className="card-base">
            <div className="table-header">
                <div className="title-medium" style={{ color: primaryColor }}>
                    Détail par niveau
                </div>
                <button
                    className="btn-ghost btn-sm"
                    onClick={() => setShowVariations(!showVariations)}
                    style={{ color: primaryColor }}
                >
                    {showVariations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showVariations ? "Masquer variations" : "Voir variations"}
                </button>
            </div>

            <div className="table-container">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-cell-header sticky-col" style={{ color: primaryColor }}>
                                    Niveau
                                </th>
                                {Object.entries(ENERGY_CONFIGS).map(([key, config]) => {
                                    const IconComponent = config.icon;
                                    return (
                                        <th
                                            key={key}
                                            className="table-cell-header text-center"
                                            style={{ color: config.color }}
                                        >
                                            <div className="header-content">
                                                <IconComponent className="w-4 h-4" />
                                                <span className="header-label">
                                                    {key === "electricity"
                                                        ? "Élec."
                                                        : key === "gas"
                                                        ? "Gaz"
                                                        : key === "water"
                                                        ? "Eau"
                                                        : "Air"}
                                                </span>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr
                                    key={row.level}
                                    className={`table-row ${hoveredRow === row.level ? "row-hovered" : ""} ${
                                        index % 2 === 0 ? "row-even" : "row-odd"
                                    }`}
                                    onMouseEnter={() => setHoveredRow(row.level)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td
                                        className="table-cell-data sticky-col level-cell"
                                        style={{ color: primaryColor }}
                                    >
                                        <div
                                            className="level-badge"
                                            style={{ background: `${primaryColor}15`, color: primaryColor }}
                                        >
                                            {row.level}
                                        </div>
                                    </td>

                                    <td className="table-cell-data text-center">
                                        <div className="metric-cell">
                                            <div
                                                className="metric-value"
                                                style={{ color: ENERGY_CONFIGS.electricity.color }}
                                            >
                                                {fmt(row.electricity)}
                                            </div>
                                            {showVariations && row.electricityPrev !== undefined && (
                                                <div className="metric-variation">
                                                    {getVariationIcon(row.electricity, row.electricityPrev)}
                                                    {getVariationText(row.electricity, row.electricityPrev)}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="table-cell-data text-center">
                                        <div className="metric-cell">
                                            <div className="metric-value" style={{ color: ENERGY_CONFIGS.gas.color }}>
                                                {fmt(row.gas)}
                                            </div>
                                            {showVariations && row.gasPrev !== undefined && (
                                                <div className="metric-variation">
                                                    {getVariationIcon(row.gas, row.gasPrev)}
                                                    {getVariationText(row.gas, row.gasPrev)}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="table-cell-data text-center">
                                        <div className="metric-cell">
                                            <div className="metric-value" style={{ color: ENERGY_CONFIGS.water.color }}>
                                                {fmt(row.water)}
                                            </div>
                                            {showVariations && row.waterPrev !== undefined && (
                                                <div className="metric-variation">
                                                    {getVariationIcon(row.water, row.waterPrev)}
                                                    {getVariationText(row.water, row.waterPrev)}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="table-cell-data text-center">
                                        <div className="metric-cell">
                                            <div className="metric-value" style={{ color: ENERGY_CONFIGS.air.color }}>
                                                {fmt(row.air)}
                                            </div>
                                            {showVariations && row.airPrev !== undefined && (
                                                <div className="metric-variation">
                                                    {getVariationIcon(row.air, row.airPrev)}
                                                    {getVariationText(row.air, row.airPrev)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            <tr className="table-row totals-row">
                                <td className="table-cell-data sticky-col totals-cell" style={{ color: primaryColor }}>
                                    <div
                                        className="totals-badge"
                                        style={{ background: primaryColor, color: "#ffffff" }}
                                    >
                                        Total
                                    </div>
                                </td>

                                <td className="table-cell-data text-center totals-cell">
                                    <div className="metric-cell">
                                        <div
                                            className="metric-value-total"
                                            style={{ color: ENERGY_CONFIGS.electricity.color }}
                                        >
                                            {fmt(totals.electricity)}
                                        </div>
                                        {showVariations && (
                                            <div className="metric-variation">
                                                {getVariationIcon(totals.electricity, totals.electricityPrev)}
                                                {getVariationText(totals.electricity, totals.electricityPrev)}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="table-cell-data text-center totals-cell">
                                    <div className="metric-cell">
                                        <div className="metric-value-total" style={{ color: ENERGY_CONFIGS.gas.color }}>
                                            {fmt(totals.gas)}
                                        </div>
                                        {showVariations && (
                                            <div className="metric-variation">
                                                {getVariationIcon(totals.gas, totals.gasPrev)}
                                                {getVariationText(totals.gas, totals.gasPrev)}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="table-cell-data text-center totals-cell">
                                    <div className="metric-cell">
                                        <div
                                            className="metric-value-total"
                                            style={{ color: ENERGY_CONFIGS.water.color }}
                                        >
                                            {fmt(totals.water)}
                                        </div>
                                        {showVariations && (
                                            <div className="metric-variation">
                                                {getVariationIcon(totals.water, totals.waterPrev)}
                                                {getVariationText(totals.water, totals.waterPrev)}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="table-cell-data text-center totals-cell">
                                    <div className="metric-cell">
                                        <div className="metric-value-total" style={{ color: ENERGY_CONFIGS.air.color }}>
                                            {fmt(totals.air)}
                                        </div>
                                        {showVariations && (
                                            <div className="metric-variation">
                                                {getVariationIcon(totals.air, totals.airPrev)}
                                                {getVariationText(totals.air, totals.airPrev)}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
