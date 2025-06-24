import { ReactElement, createElement } from "react";
import { RankingPreviewProps } from "../typings/RankingProps";
import { TrendingUpIcon } from "lucide-react";
import { ENERGY_CONFIG } from "./Ranking";

export function preview({ title, mode }: RankingPreviewProps): ReactElement {
    // Utiliser la configuration en fonction du mode sélectionné, défaut: Elec
    const energyConfig = mode && ENERGY_CONFIG[mode] ? ENERGY_CONFIG[mode] : ENERGY_CONFIG.Elec;
    const IconComponent = energyConfig.icon;

    const dummyMachines = [
        { name: "Machine A", consumption: 1500, unit: energyConfig.unit },
        { name: "Machine B", consumption: 1200, unit: energyConfig.unit },
        { name: "Machine C", consumption: 800, unit: energyConfig.unit },
        { name: "Machine D", consumption: 500, unit: energyConfig.unit }
    ];

    return (
        <div className="ranking-widget">
            <div className="widget-header">
                <h2 className="widget-title" style={{ color: energyConfig.titleColor }}>
                    <TrendingUpIcon style={{ color: energyConfig.iconColor }} />
                    {title || `Classement de Consommation - ${energyConfig.label}`}
                </h2>
            </div>
            <table className="ranking-table">
                <thead>
                    <tr>
                        <th>Rang</th>
                        <th>Machine</th>
                        <th>Consommation</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    {dummyMachines.map((machine, index) => (
                        <tr key={index}>
                            <td className="rank">{index + 1}</td>
                            <td>{machine.name}</td>
                            <td className="consumption">
                                <div className="consumption-value">
                                    <IconComponent size={16} style={{ color: energyConfig.iconColor }} />
                                    {machine.consumption} {machine.unit}
                                </div>
                            </td>
                            <td>
                                <span className={`badge ${index === 0 ? "high" : index < 2 ? "medium" : "low"}`}>
                                    {index === 0 ? "Élevée" : index < 2 ? "Moyenne" : "Basse"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/Ranking.css");
}