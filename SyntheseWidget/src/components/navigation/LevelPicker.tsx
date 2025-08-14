import { ReactElement, createElement } from "react";
import { Layers, Zap, Flame, Droplet, Wind } from "lucide-react";
import "./LevelPicker.css";

type EnergyKey = "all" | "electricity" | "gas" | "water" | "air";

interface LevelPickerProps {
    levels: string[];
    selected: string | null;
    onChange: (name: string) => void;
    activeEnergy?: EnergyKey;
    onEnergyChange?: (k: EnergyKey) => void;
}

const ENERGY_TABS = [
    { key: "all", label: "Toutes", color: "#374151" },
    { key: "electricity", label: "Élec.", color: "#38a13c", Icon: Zap },
    { key: "gas", label: "Gaz", color: "#F9BE01", Icon: Flame },
    { key: "water", label: "Eau", color: "#3293f3", Icon: Droplet },
    { key: "air", label: "Air", color: "#66D8E6", Icon: Wind }
] as const;

export function LevelPicker({ levels, selected, onChange, activeEnergy = "all", onEnergyChange }: LevelPickerProps): ReactElement {
    const current = selected && levels.includes(selected) ? selected : levels[0] || "";
    const selId = "level-select";

    return (
        <div className="level-picker-compact">
            <div className="compact-header">
                <div className="header-left">
                    <div className="icon-compact">
                        <Layers className="icon" />
                    </div>
                    <div className="title-section">
                        <h1 className="main-title">Analyse énergétique</h1>
                        <div className="level-info">
                            <span className="level-label">Niveau:</span>
                            <select 
                                id={selId}
                                className="level-select-compact" 
                                value={current} 
                                onChange={e => onChange(e.target.value)}
                            >
                                {levels.map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="energy-filters-compact">
                    {ENERGY_TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`filter-pill ${activeEnergy === tab.key ? "active" : ""}`}
                            onClick={() => onEnergyChange?.(tab.key as EnergyKey)}
                            style={{ 
                                color: activeEnergy === tab.key ? tab.color : "#64748b",
                                background: activeEnergy === tab.key ? `${tab.color}15` : undefined,
                                borderColor: activeEnergy === tab.key ? tab.color : "transparent"
                            }}
                            title={`Filtrer par ${tab.label}`}
                        >
                            {"Icon" in tab ? createElement((tab as any).Icon, { className: "w-3.5 h-3.5" }) : null}
                            <span className="pill-label">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


