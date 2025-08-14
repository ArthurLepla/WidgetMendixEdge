import { ReactElement, createElement } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./DonutEnergyChart.css";

type EnergyKey = "all" | "electricity" | "gas" | "water" | "air";

interface DonutEnergyChartProps {
    title: string;
    data: { name: string; value: number }[];
    colors?: string[];
    activeEnergy?: EnergyKey;
    onEnergyChange?: (k: EnergyKey) => void;
}

const DEFAULT_COLORS = ["#38a13c", "#F9BE01", "#3293f3", "#66D8E6"];
const KEY_BY_INDEX = ["electricity", "gas", "water", "air"] as const;

export function DonutEnergyChart({ 
    title, 
    data, 
    colors = DEFAULT_COLORS,
    activeEnergy = "all",
    onEnergyChange
}: DonutEnergyChartProps): ReactElement {
    const total = data.reduce((a, d) => a + (d.value || 0), 0);
    const muted = (i: number) => activeEnergy !== "all" && KEY_BY_INDEX[i] !== activeEnergy;

    return (
        <div className="card-base donut-energy" role="group" aria-label={title}>
            <div className="title-medium" style={{ marginBottom: "0.75rem", color: "#18213e" }}>{title}</div>
            <div style={{ width: "100%", height: 260, position: "relative" }}>
                {total === 0 ? (
                    <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#64748b" }}>
                        Aucune donnée sur cette période
                    </div>
                ) : (
                    <div>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    onClick={(_, idx) => onEnergyChange?.(KEY_BY_INDEX[idx])}
                                >
                                    {data.map((_, idx) => (
                                        <Cell
                                            key={`cell-${idx}`}
                                            fill={colors[idx % colors.length]}
                                            opacity={muted(idx) ? 0.4 : 1}
                                            cursor="pointer"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: 8 }}
                                    formatter={(v: any, n: any) => [
                                        `${Intl.NumberFormat("fr-FR").format(v as number)}`,
                                        n as string
                                    ]}
                                />
                                <Legend verticalAlign="bottom" height={24} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Label central */}
                        <div style={{
                            position: "absolute", 
                            inset: 0,
                            display: "grid", 
                            placeItems: "center",
                            pointerEvents: "none"
                        }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 12, color: "#64748b" }}>Total</div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>
                                    {Intl.NumberFormat("fr-FR").format(total)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


