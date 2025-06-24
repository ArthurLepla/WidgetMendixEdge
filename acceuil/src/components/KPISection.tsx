import { ReactElement, createElement, useState, useEffect } from "react";
import { Zap, Flame, Droplets, Wind } from "lucide-react";
import { Big } from "big.js";
import { ListValue, ListAttributeValue, ValueStatus } from "mendix";
import "../ui/KPISection.css";
import { formatFlexibleEnergyValue, getDefaultUnit, BaseUnit } from "../utils/energyConverter";

interface KPICardProps {
    title: string;
    dataSource?: ListValue;
    valueAttribute?: ListAttributeValue<Big>;
    type: "electricity" | "gas" | "water" | "air";
    baseUnit?: BaseUnit;
}

interface KPISectionProps {
    electricityDataSource?: ListValue;
    electricityValueAttribute?: ListAttributeValue<Big>;
    electricityUnit: "kWh" | "m3";
    
    gasDataSource?: ListValue;
    gasValueAttribute?: ListAttributeValue<Big>;
    gasUnit: "kWh" | "m3";
    
    waterDataSource?: ListValue;
    waterValueAttribute?: ListAttributeValue<Big>;
    waterUnit: "kWh" | "m3";
    
    airDataSource?: ListValue;
    airValueAttribute?: ListAttributeValue<Big>;
    airUnit: "kWh" | "m3";
}

// Suppression de l'ancienne fonction formatEnergyValue car remplacée par formatFlexibleEnergyValue

const ENERGY_CONFIG = {
    electricity: {
        color: "#38a13c",
        iconColor: "#38a13c",
        titleColor: "#38a13c",
        bgHover: "rgba(56, 161, 60, 0.1)",
        unit: "kWh"
    },
    gas: {
        color: "#F9BE01",
        iconColor: "#F9BE01",
        titleColor: "#F9BE01",
        bgHover: "rgba(249, 190, 1, 0.1)",
        unit: "m³"
    },
    water: {
        color: "#3293f3",
        iconColor: "#3293f3",
        titleColor: "#3293f3",
        bgHover: "rgba(50, 147, 243, 0.1)",
        unit: "m³"
    },
    air: {
        color: "#66D8E6",
        iconColor: "#66D8E6",
        titleColor: "#66D8E6",
        bgHover: "rgba(102, 216, 230, 0.1)",
        unit: "m³"
    }
};

const getIcon = (type: string, className: string): ReactElement => {
    const config = ENERGY_CONFIG[type as keyof typeof ENERGY_CONFIG];
    switch (type) {
        case "electricity":
            return <Zap className={className} size={48} style={{ color: config.iconColor }} />;
        case "gas":
            return <Flame className={className} size={48} style={{ color: config.iconColor }} />;
        case "water":
            return <Droplets className={className} size={48} style={{ color: config.iconColor }} />;
        case "air":
            return <Wind className={className} size={48} style={{ color: config.iconColor }} />;
        default:
            return <Zap className={className} size={48} style={{ color: config.iconColor }} />;
    }
};

const KPICard = ({ title, dataSource, valueAttribute, type, baseUnit }: KPICardProps): ReactElement => {
    const [value, setValue] = useState<Big>(new Big(0));
    const config = ENERGY_CONFIG[type];
    
    // Déterminer l'unité de base (paramètre fourni ou valeur par défaut)
    const effectiveBaseUnit = baseUnit || getDefaultUnit(type);
    
    useEffect(() => {
        if (dataSource?.status === ValueStatus.Available && valueAttribute) {
            const items = dataSource.items || [];
            if (items.length > 0) {
                const val = valueAttribute.get(items[0]);
                if (val && val.value) {
                    const originalValue = val.value.toString();
                    console.log(`${title} original value:`, originalValue, `(base unit: ${effectiveBaseUnit})`);
                    setValue(new Big(originalValue));
                } else {
                    console.log(`${title} value not available`);
                }
            } else {
                console.log(`${title} data source has no items`);
            }
        } else {
            console.log(`${title} data source not available:`, dataSource?.status);
        }
    }, [dataSource, valueAttribute, title, effectiveBaseUnit]);

    const formattedValue = formatFlexibleEnergyValue(value, effectiveBaseUnit);
    console.log(`${title} formatted value:`, formattedValue.value, formattedValue.unit);

    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <div 
                    className="kpi-icon-container"
                    style={{ backgroundColor: config.bgHover }}
                >
                    {getIcon(type, "kpi-icon")}
                </div>
                <div className="flex-1">
                    <h3 className="kpi-title">{title}</h3>
                    <div className="kpi-value-container">
                        <div className="flex items-baseline">
                            <span className="kpi-value">
                                {formattedValue.value}
                            </span>
                            <span 
                                className="kpi-unit"
                                style={{ color: config.color }}
                            >
                                {formattedValue.unit}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const KPISection = (props: KPISectionProps): ReactElement => {
    return (
        <div className="kpi-grid">
            <KPICard
                title="Électricité"
                dataSource={props.electricityDataSource}
                valueAttribute={props.electricityValueAttribute}
                type="electricity"
                baseUnit={props.electricityUnit}
            />
            <KPICard
                title="Gaz"
                dataSource={props.gasDataSource}
                valueAttribute={props.gasValueAttribute}
                type="gas"
                baseUnit={props.gasUnit}
            />
            <KPICard
                title="Eau"
                dataSource={props.waterDataSource}
                valueAttribute={props.waterValueAttribute}
                type="water"
                baseUnit={props.waterUnit}
            />
            <KPICard
                title="Air"
                dataSource={props.airDataSource}
                valueAttribute={props.airValueAttribute}
                type="air"
                baseUnit={props.airUnit}
            />
        </div>
    );
};

export default KPISection;
