import { createElement } from "react";
import { Big } from "big.js";
import { Zap, Droplets, Wind, Flame, Gauge, Factory } from "lucide-react";
import "./IPECard.css";
import { energyConfigs } from "../utils/energy";
import { DynamicValue } from "mendix";

interface IPECardProps {
    icon?: DynamicValue<any>;
    title?: string;
    value?: Big;
    unit?: string;
    color?: string;
    type: "elec" | "gaz" | "eau" | "air" | "ipe" | "consumption" | "production";
}

const PRODUCTION_COLOR = "#FF9800"; // Couleur orange pour la production
const PRODUCTION_BACKGROUND = "rgba(255, 152, 0, 0.1)"; // Background orange avec opacité

export function IPECard({title, value, unit, type, color }: IPECardProps): JSX.Element {
    const getIcon = () => {
        switch (type) {
            case "elec":
                return <Zap size={56} color={energyConfigs.electricity.color} />;
            case "gaz":
                return <Flame size={56} color={energyConfigs.gas.color} />;
            case "eau":
                return <Droplets size={56} color={energyConfigs.water.color} />;
            case "air":
                return <Wind size={56} color={energyConfigs.air.color} />;
            case "ipe":
                return <Gauge size={56} color={energyConfigs.IPE.color} />;
            case "consumption":
                return <Zap size={56} color={color || energyConfigs.electricity.color} />;
            case "production":
                return <Factory size={56} color={PRODUCTION_COLOR} />;
        }
    };

    const getBackgroundColor = () => {
        const getAlpha = (color: string) => {
            return color + "1A"; // 1A en hexadécimal = 10% d'opacité
        };

        switch (type) {
            case "elec":
                return energyConfigs.electricity.BackgroundIconColor;
            case "gaz":
                return energyConfigs.gas.BackgroundIconColor;
            case "eau":
                return energyConfigs.water.BackgroundIconColor;
            case "air":
                return energyConfigs.air.BackgroundIconColor;
            case "ipe":
                return energyConfigs.IPE.BackgroundIconColor;
            case "consumption":
                return color ? getAlpha(color) : energyConfigs.electricity.BackgroundIconColor;
            case "production":
                return PRODUCTION_BACKGROUND;
        }
    };

    const getUnitColor = () => {
        switch (type) {
            case "elec":
                return energyConfigs.electricity.color;
            case "gaz":
                return energyConfigs.gas.color;
            case "eau":
                return energyConfigs.water.color;
            case "air":
                return energyConfigs.air.color;
            case "ipe":
                return energyConfigs.IPE.color;
            case "consumption":
                return color || energyConfigs.electricity.color;
            case "production":
                return PRODUCTION_COLOR;
        }
    };

    return (
        <div className="ipe-card">
            <div className="ipe-card-content">
                <div className="ipe-card-header">
                    <div className="ipe-card-icon-container" style={{ backgroundColor: getBackgroundColor() }}>
                        {getIcon()}
                    </div>
                    <div className="ipe-card-title">{title}</div>
                </div>
                <div className="ipe-card-value-container">
                    <div className="ipe-card-value">{value?.toFixed(2)}</div>
                    {unit && <div className="ipe-card-unit" style={{ color: getUnitColor() }}>{unit}</div>}
                </div>
            </div>
        </div>
    );
} 