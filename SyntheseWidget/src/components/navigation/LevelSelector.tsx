import { ReactElement, createElement } from "react";
import { Layers } from "lucide-react";

interface LevelSelectorProps {
    levels: string[];
    selected: string[];
    onToggle: (level: string) => void;
}

export function LevelSelector({ levels, selected, onToggle }: LevelSelectorProps): ReactElement {
    const handleSelectAll = () => {
        const allSelected = selected.length === levels.length;
        levels.forEach(level => {
            if (allSelected && selected.includes(level)) {
                onToggle(level);
            } else if (!allSelected && !selected.includes(level)) {
                onToggle(level);
            }
        });
    };

    return (
        <div className="modern-selector-card">
            <div className="selector-header">
                <div className="selector-icon-wrapper">
                    <Layers className="selector-icon" />
                </div>
                <div className="selector-content">
                    <div className="selector-title-row">
                        <h2 className="selector-title">Niveaux d'analyse</h2>
                        <button onClick={handleSelectAll} className="select-all-btn">
                            {selected.length === levels.length ? "Désélectionner" : "Tout sélectionner"}
                        </button>
                    </div>
                    <div className="level-count">
                        {selected.length} sur {levels.length} niveau{levels.length > 1 ? "x" : ""} sélectionné
                        {selected.length > 1 ? "s" : ""}
                    </div>
                </div>
            </div>

            <div className="level-buttons">
                {levels.map(name => (
                    <button
                        key={name}
                        className={`level-btn ${selected.includes(name) ? "selected" : ""}`}
                        onClick={() => onToggle(name)}
                    >
                        <span className="level-indicator"></span>
                        <span className="level-text">{name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
