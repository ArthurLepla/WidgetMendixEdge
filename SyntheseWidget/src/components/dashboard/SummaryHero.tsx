import { ReactElement, createElement } from "react";
import { Factory } from "lucide-react";

interface SummaryHeroProps {
    totalKwhEq: number;
    deltaPct: number;
    periodLabel: string;
    primaryColor?: string;
}

export function SummaryHero({
    totalKwhEq,
    deltaPct,
    periodLabel,
    primaryColor = "#18213e"
}: SummaryHeroProps): ReactElement {
    const isUp = deltaPct >= 0;
    const deltaColor = isUp ? "#0f9d58" : "#d93025";
    return (
        <div className="card-base" style={{ overflow: "hidden" }}>
            <div style={{ height: 4, width: "100%", backgroundColor: primaryColor }} />
            <div className="p-4">
                <div className="flex items-start gap-4">
                    <div className="icon-container" style={{ background: "#e2e8f0" }}>
                        <Factory className="icon-lg" style={{ color: primaryColor }} />
                    </div>
                    <div className="flex-1">
                        <div
                            className="text-xs"
                            style={{ color: primaryColor, textTransform: "uppercase", letterSpacing: 0.4 }}
                        >
                            Synthèse {periodLabel}
                        </div>
                        <div className="title-large" style={{ marginTop: 4, color: primaryColor }}>
                            {Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(totalKwhEq)}{" "}
                            <span className="text-lg" style={{ opacity: 0.7 }}>
                                kWh équiv.
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-2"
                            style={{ marginTop: 4, color: deltaColor, fontWeight: 600 }}
                        >
                            {isUp ? "▲" : "▼"} {deltaPct === 0 ? "–" : `${deltaPct.toFixed(1)}%`} vs N-1
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
