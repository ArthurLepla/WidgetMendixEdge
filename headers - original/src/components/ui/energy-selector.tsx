/* eslint-disable prettier/prettier */
import { createElement, useState } from "react";
import { cn } from "../../lib/utils";
import { Zap, Flame, Droplet, Wind } from "lucide-react";
import { ActionValue } from "mendix";

export type EnergyType = "electricity" | "gas" | "water" | "air" | "none";

export interface EnergySelectorProps {
    className?: string;
    value?: EnergyType;
    electricityEnabled?: boolean;
    gasEnabled?: boolean;
    waterEnabled?: boolean;
    airEnabled?: boolean;
    onElectricitySelect?: ActionValue;
    onGasSelect?: ActionValue;
    onWaterSelect?: ActionValue;
    onAirSelect?: ActionValue;
}

const energyConfig = {
    electricity: {
        icon: Zap,
        activeColor: "tw-text-[#38a13c]",
        label: "Électricité",
        enabledProp: "electricityEnabled" as const
    },
    gas: {
        icon: Flame,
        activeColor: "tw-text-[#F9BE01]",
        label: "Gaz",
        enabledProp: "gasEnabled" as const
    },
    water: {
        icon: Droplet,
        activeColor: "tw-text-[#3293f3]",
        label: "Eau",
        enabledProp: "waterEnabled" as const
    },
    air: {
        icon: Wind,
        activeColor: "tw-text-[#66D8E6]",
        label: "Air",
        enabledProp: "airEnabled" as const
    }
} as const;

export function EnergySelector({
    className,
    value = "none",
    electricityEnabled = true,
    gasEnabled = true,
    waterEnabled = true,
    airEnabled = true,
    onElectricitySelect,
    onGasSelect,
    onWaterSelect,
    onAirSelect
}: EnergySelectorProps): JSX.Element {
    const [activeEnergy, setActiveEnergy] = useState<EnergyType>(value);

    const enabledProps = { electricityEnabled, gasEnabled, waterEnabled, airEnabled };

    const handleClick = (type: Exclude<EnergyType, "none">) => {
        const energyIsEnabled = enabledProps[energyConfig[type].enabledProp];
        if (!energyIsEnabled) {
            return;
        }

        setActiveEnergy(type);

        switch (type) {
            case "electricity":
                if (onElectricitySelect?.canExecute) {
                    onElectricitySelect.execute();
                }
                break;
            case "gas":
                if (onGasSelect?.canExecute) {
                    onGasSelect.execute();
                }
                break;
            case "water":
                if (onWaterSelect?.canExecute) {
                    onWaterSelect.execute();
                }
                break;
            case "air":
                if (onAirSelect?.canExecute) {
                    onAirSelect.execute();
                }
                break;
        }
    };

    return createElement("div",
        { className: cn("tw-flex tw-items-center tw-gap-4", className) },
        (Object.entries(energyConfig) as Array<[Exclude<EnergyType, "none">, typeof energyConfig[keyof typeof energyConfig]]>).map(
            ([type, config]) => {
                const isSelected = activeEnergy === type;
                const energyIsEnabled = enabledProps[config.enabledProp];

                return createElement("button", {
                    key: type,
                    onClick: () => handleClick(type),
                    disabled: !energyIsEnabled,
                    className: cn(
                        "tw-p-3 tw-rounded-lg tw-transition-all tw-duration-300",
                        isSelected && energyIsEnabled ? config.activeColor : "tw-text-primary/60",
                        energyIsEnabled ? "hover:tw-text-primary/80" : "tw-opacity-50 tw-cursor-not-allowed",
                        !energyIsEnabled && isSelected ? "!tw-text-gray-400" : ""
                    ),
                    title: config.label + (energyIsEnabled ? "" : " (Désactivé)")
                }, createElement(config.icon));
            }
        )
    );
}