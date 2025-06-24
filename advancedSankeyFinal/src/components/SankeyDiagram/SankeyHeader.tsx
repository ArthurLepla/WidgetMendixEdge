import React, { createElement } from "react";
import { ENERGY_CONFIG } from "../../utils/constants";
import { SelectedEnergiesEnum } from "../../../typings/AdvancedSankeyV2Props";
import { formatPeriod, formatDuration } from "../../utils/dateFormatter";

interface SankeyHeaderProps {
    title?: string;
    selectedEnergies: SelectedEnergiesEnum;
    startDate?: Date;
    endDate?: Date;
}

export const SankeyHeader: React.FC<SankeyHeaderProps> = ({
    title = "Flux d'Énergie",
    selectedEnergies,
    startDate,
    endDate
}) => {
    const getEnergyTitle = () => {
        if (selectedEnergies === "all") {
            return title;
        }

        const energyLabels = {
            elec: "Électricité",
            gaz: "Gaz",
            eau: "Eau",
            air: "Air Comprimé"
        };

        return `${title} - ${energyLabels[selectedEnergies]}`;
    };

    return (
        <div className="sankey-header">
            <div className="sankey-header-content">
                <div className="sankey-title-container">
                    {selectedEnergies !== "all" && ENERGY_CONFIG[selectedEnergies] && (
                        <div className="energy-icon">
                            {createElement(ENERGY_CONFIG[selectedEnergies].icon, {
                                size: 28,
                                color: ENERGY_CONFIG[selectedEnergies].color,
                                strokeWidth: 2
                            })}
                        </div>
                    )}
                    <h2 className="sankey-title">
                        {getEnergyTitle()}
                    </h2>
                </div>
                {startDate && endDate && (
                    <p className="sankey-period">
                        <span className="period-label">Période :</span>
                        <span className="period-dates">
                            {formatPeriod(startDate, endDate, { style: 'medium' })}
                        </span>
                        <span className="period-duration">
                            ({formatDuration(startDate, endDate)})
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
}; 