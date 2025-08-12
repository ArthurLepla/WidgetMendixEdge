import { ReactElement, createElement, useState } from "react";
import { Zap, Flame, Droplet, Wind, Info, X } from "lucide-react";
import { Big } from "big.js";
import { EnergyType } from "../utils/energy";
import { energyConfigs } from "../utils/energy";
import { formatSmartValue, BaseUnit, getSmartUnit } from "../utils/unitConverter";
import "./MachineCard.css";

export interface MachineCardProps {
    name: string;
    currentValue: Big;
    maxValue: Big;
    minValue: Big;
    sumValue: Big;
    type: EnergyType;
    viewMode: "energetic" | "ipe";
    baseUnit?: BaseUnit;
    // Nouvelles propriétés pour le calcul IPE
    totalConsommationIPE?: Big;
    totalProduction?: Big;
    ipeValue?: Big;
    // Unité calculée au niveau container (ex: kWh/kg ou kWh/pcs)
    unit?: string;
}

const getIcon = (type: EnergyType, className: string): ReactElement => {
    const config = energyConfigs[type];
    switch (type) {
        case "Elec":
            return createElement(Zap, { className, style: { color: config.color } });
        case "Gaz":
            return createElement(Flame, { className, style: { color: config.color } });
        case "Eau":
            return createElement(Droplet, { className, style: { color: config.color } });
        case "Air":
            return createElement(Wind, { className, style: { color: config.color } });
        default:
            return createElement(Zap, { className, style: { color: config.color } });
    }
};

// Modal component pour afficher les détails du calcul IPE
const IPEInfoModal = ({ 
    isOpen,
    onClose,
    machineName,
    totalConsommationIPE,
    totalProduction,
    ipeValue,
    energyType,
    baseUnit
}: {
    isOpen: boolean;
    onClose: () => void;
    machineName: string;
    totalConsommationIPE: Big;
    totalProduction: Big;
    ipeValue: Big;
    energyType: EnergyType;
    baseUnit?: BaseUnit;
}) => {
    if (!isOpen) return null;

    const config = energyConfigs[energyType];

    return createElement("div", {
        className: "ipe-modal-overlay",
        onClick: onClose
    },
        createElement("div", {
            className: "ipe-modal-container",
            onClick: (e: any) => e.stopPropagation()
        },
            // Header
            createElement("div", { className: "ipe-modal-header" },
                createElement("h3", { className: "ipe-modal-title" },
                    `Calcul IPE - ${machineName}`
                ),
                createElement("button", { 
                    onClick: onClose,
                    className: "ipe-modal-close-btn"
                }, createElement(X, { size: 24 }))
            ),

            // Contenu du calcul
            createElement("div", { className: "ipe-modal-content" },
                createElement("div", { className: "ipe-calculation-section" },
                    createElement("h4", { className: "ipe-section-title" }, "Détail du calcul :"),
                    
                    createElement("div", { className: "ipe-calculation-details" },
                        createElement("div", { className: "ipe-calculation-row" },
                            createElement("span", { className: "ipe-label" }, "Consommation totale :"),
                            createElement("span", { className: "ipe-value" },
                                formatSmartValue(totalConsommationIPE, energyType, "energetic", baseUnit)
                            )
                        ),
                        
                        createElement("div", { className: "ipe-calculation-row" },
                            createElement("span", { className: "ipe-label" }, "Production totale :"),
                            createElement("span", { className: "ipe-value" },
                                `${totalProduction.toFixed(2)} pièces`
                            )
                        ),
                        
                        createElement("hr", { className: "ipe-divider" }),
                        
                        createElement("div", { className: "ipe-result-box" },
                            createElement("div", { className: "ipe-result-content" },
                                createElement("div", { className: "ipe-formula-label" }, "IPE ="),
                                createElement("div", { className: "ipe-formula" },
                                    `${formatSmartValue(totalConsommationIPE, energyType, "energetic", baseUnit)} ÷ ${totalProduction.toFixed(2)}`
                                ),
                                createElement("div", { className: "ipe-equals" }, "="),
                                createElement("div", { 
                                    className: "ipe-final-value",
                                    style: { color: config.color }
                                }, formatSmartValue(ipeValue, energyType, "ipe", baseUnit)),
                                createElement("div", { className: "ipe-unit" },
                                    config.ipeUnit || "kWh/pièce"
                                )
                            )
                        )
                    )
                ),

                createElement("div", { className: "ipe-info-box" },
                    createElement("div", { className: "ipe-info-content" },
                        createElement("div", { className: "ipe-info-title" }, "💡 IPE = Indicateur de Performance Énergétique"),
                        createElement("div", { className: "ipe-info-text" }, "Plus la valeur est faible, meilleure est l'efficacité énergétique de la machine.")
                    )
                )
            ),

            // Footer
            createElement("div", { className: "ipe-modal-footer" },
                createElement("button", { 
                    onClick: onClose,
                    className: "ipe-modal-close-button"
                }, "Fermer")
            )
        )
    );
};

export const MachineCard = ({ 
    name,
    maxValue,
    minValue,
    sumValue,
    type,
    viewMode,
    baseUnit = "auto",
    totalConsommationIPE,
    totalProduction,
    ipeValue,
    unit
}: MachineCardProps): ReactElement => {
    const [showIPEModal, setShowIPEModal] = useState(false);
    const config = energyConfigs[type];
    const hasData = !sumValue.eq(0);

    const format = (value: Big): string => {
        if (viewMode === "ipe" && unit) {
            const converted = getSmartUnit(value, type, viewMode, baseUnit).value; // valeur brute en IPE
            const decimals = 2;
            return `${converted.toFixed(decimals)} ${unit}`;
        }
        return formatSmartValue(value, type, viewMode, baseUnit);
    };

    const formattedSum = format(sumValue);
    const formattedMin = format(minValue);
    const formattedMax = format(maxValue);

    const canShowIPEInfo = viewMode === "ipe" && 
                          totalConsommationIPE && 
                          totalProduction && 
                          ipeValue && 
                          !totalProduction.eq(0);

    return createElement("div", null,
        createElement("div", { className: "card-base relative" },
            // Bouton info IPE dans le coin supérieur droit
            canShowIPEInfo && createElement("button", {
                onClick: () => setShowIPEModal(true),
                className: "absolute top-3 right-3 p-1-5 rounded-full bg-gray-100 hover-bg-gray-200 transition-colors z-10",
                title: "Voir le détail du calcul IPE"
            }, createElement(Info, { size: 16, className: "text-gray-600" })),

            createElement("div", { className: "flex items-center gap-4" },
                createElement("div", { 
                    className: "machine-card-icon", 
                    style: { backgroundColor: `${config.color}20` } 
                }, getIcon(type, "w-10 h-10 sm-w-12 sm-h-12 lg-w-14 lg-h-14")),
                createElement("h3", { className: "title-medium flex-1 leading-tight text-gray-900 pr-8" }, name)
            ),
            createElement("div", { className: "mt-4" },
                createElement("div", { 
                    className: "value-large", 
                    style: { color: config.color } 
                }, hasData ? formattedSum : "N/A"),
                createElement("div", { className: "mt-4 grid grid-cols-2 gap-4 min-max-container" },
                    createElement("div", { className: "text-center" },
                        createElement("div", { className: "text-sm min-max-label" }, "Min"),
                        createElement("div", { className: "font-semibold min-max-value" }, formattedMin)
                    ),
                    createElement("div", { className: "text-center" },
                        createElement("div", { className: "text-sm min-max-label" }, "Max"),
                        createElement("div", { className: "font-semibold min-max-value" }, formattedMax)
                    )
                )
            )
        ),

        // Modal pour les détails IPE
        canShowIPEInfo && createElement(IPEInfoModal, {
            isOpen: showIPEModal,
            onClose: () => setShowIPEModal(false),
            machineName: name,
            totalConsommationIPE: totalConsommationIPE!,
            totalProduction: totalProduction!,
            ipeValue: ipeValue!,
            energyType: type,
            baseUnit: baseUnit
        })
    );
};