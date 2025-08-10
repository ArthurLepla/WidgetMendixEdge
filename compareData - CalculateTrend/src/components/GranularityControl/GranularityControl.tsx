import { createElement, useState, useEffect, useRef } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Settings2, 
  Clock, 
  Lightbulb,
  Check,
  ChevronDown
} from "lucide-react";
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import "./GranularityControl.css";

export type GranularityUnit = "minute" | "hour" | "day" | "week" | "month" | "year";

export interface GranularityControlProps {
  mode: "auto" | "strict";
  value: number;
  unit: GranularityUnit;
  onModeChange: (mode: "Auto" | "Strict") => void;
  onValueChange: (value: number) => void;
  onUnitChange: (unit: GranularityUnit) => void;
  autoGranularity: { value: number; unit: string };
  isDisabled?: boolean;
  analysisDurationMs?: number;
}

const palette = {
  primary: { color: "#18213e", name: "Primaire" },
  electric: { color: "#38a13c", name: "Électricité" },
  gas: { color: "#f9be01", name: "Gaz" },
  water: { color: "#3293f3", name: "Eau" },
  air: { color: "#66d8e6", name: "Air" },
};

export const GranularityControl: React.FC<GranularityControlProps> = ({
  mode,
  value,
  unit,
  onModeChange,
  onValueChange,
  onUnitChange,
  autoGranularity,
  isDisabled = false,
  analysisDurationMs
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pendingTime, setPendingTime] = useState<number>(value);
  const [pendingUnit, setPendingUnit] = useState<GranularityUnit>(unit);
  const [pendingMode, setPendingMode] = useState<"auto" | "strict">(mode);
  const menuRef = useRef<HTMLDivElement>(null);

  const unitLabels: Record<GranularityUnit, string> = {
    minute: "minutes",
    hour: "heures", 
    day: "jours",
    week: "semaines",
    month: "mois",
    year: "années"
  };

  const unitLabelsSingular: Record<GranularityUnit, string> = {
    minute: "minute",
    hour: "heure",
    day: "jour", 
    week: "semaine",
    month: "mois",
    year: "année"
  };

  const unitMsMap: Record<GranularityUnit, number> = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000
  };

  const closeMenu = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
        setShowSuggestions(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  // Sync avec les changements externes
  useEffect(() => {
    setPendingTime(value);
  }, [value]);

  useEffect(() => {
    setPendingUnit(unit);
  }, [unit]);

  useEffect(() => {
    setPendingMode(mode);
  }, [mode]);

  const generateOptions = React.useCallback((unitType: GranularityUnit): number[] => {
    const baseOptions: Record<GranularityUnit, number[]> = {
      minute: [5, 10, 15, 20, 30, 45, 60],
      hour: [1, 2, 3, 4, 6, 8, 12, 24],
      day: [1, 2, 3, 5, 7, 10, 14, 21, 30],
      week: [1, 2, 3, 4, 6, 8, 12],
      month: [1, 2, 3, 4, 6, 12],
      year: [1, 2, 3, 5]
    };
    
    return baseOptions[unitType]?.filter(opt => {
      if (!analysisDurationMs) return true;
      const bucketMs = opt * unitMsMap[unitType];
      if (bucketMs > analysisDurationMs) return false;
      const points = Math.ceil(analysisDurationMs / bucketMs);
      return points <= 100;
    }) || [];
  }, [analysisDurationMs, unitMsMap]);

  const isUnitValid = React.useCallback((unitType: GranularityUnit): boolean => {
    if (!analysisDurationMs) return true;
    return generateOptions(unitType).length > 0;
  }, [analysisDurationMs, generateOptions]);

  const generateSuggestions = () => {
    if (!analysisDurationMs) return [];

    const allOptions: Array<{unit: GranularityUnit; value: number; points: number}> = [];
    
    (Object.keys(unitMsMap) as GranularityUnit[]).forEach((u) => {
      const baseOptions: Record<string, number[]> = {
        minute: [5, 10, 15, 30],
        hour: [1, 2, 3, 4, 6, 8, 12],
        day: [1, 2, 3, 5, 7, 14],
        week: [1, 2, 3, 4],
        month: [1, 2, 3, 6],
        year: [1, 2]
      };
      
      baseOptions[u]?.forEach(v => {
        const pts = Math.ceil(analysisDurationMs / (v * unitMsMap[u]));
        if (pts >= 20 && pts <= 80) {
          allOptions.push({ unit: u, value: v, points: pts });
        }
      });
    });
    
    return allOptions
      .sort((a, b) => Math.abs(a.points - 50) - Math.abs(b.points - 50))
      .slice(0, 3);
  };

  const handleModeToggle = (newMode: "auto" | "strict") => {
    if (pendingMode === "auto" && newMode === "strict") {
        const { value: autoValue, unit: autoUnitLabel } = autoGranularity;
        
        const unitKeyByLabel = new Map<string, GranularityUnit>();
        (Object.keys(unitLabels) as GranularityUnit[]).forEach(key => unitKeyByLabel.set(unitLabels[key], key));
        (Object.keys(unitLabelsSingular) as GranularityUnit[]).forEach(key => unitKeyByLabel.set(unitLabelsSingular[key], key));
        
        const unitKey = unitKeyByLabel.get(autoUnitLabel);

        if (unitKey) {
            setPendingTime(autoValue);
            setPendingUnit(unitKey);
            onValueChange(autoValue);
            onUnitChange(unitKey);
        }
    }
    setPendingMode(newMode);
    onModeChange(newMode === "auto" ? "Auto" : "Strict");
  };

  const handleValueChange = (newValue: number) => {
    setPendingTime(newValue);
    onValueChange(newValue);
  };

  const handleUnitChange = (newUnit: GranularityUnit) => {
    if (!isUnitValid(newUnit)) return;
    
    const newOptions = generateOptions(newUnit);
    let selectedValue = pendingTime;
    if (!newOptions.includes(selectedValue)) {
      selectedValue = newOptions.length > 0 ? newOptions[0] : pendingTime;
    }

    setPendingUnit(newUnit);
    setPendingTime(selectedValue);
    onUnitChange(newUnit);
    onValueChange(selectedValue);
  };

  const handleSuggestionClick = (suggestion: {unit: GranularityUnit; value: number}) => {
    handleUnitChange(suggestion.unit);
    handleValueChange(suggestion.value);
    setShowSuggestions(false);
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      setIsOpen(true);
    }
    setShowSuggestions(false);
  };

  const suggestions = generateSuggestions();
  const availableValues = generateOptions(pendingUnit);
  const availableUnits = (Object.keys(unitLabels) as GranularityUnit[]).filter(isUnitValid);

  // Auto-protection : Force mode Auto lors des changements de plage temporelle
  const prevAnalysisDurationMs = React.useRef(analysisDurationMs);
  const [modeChangedDueToTimeRange, setModeChangedDueToTimeRange] = React.useState(false);
  
  React.useEffect(() => {
    if (analysisDurationMs && 
        analysisDurationMs !== prevAnalysisDurationMs.current &&
        mode === "strict") {
      
      console.log("🔄 Nouvelle plage temporelle détectée, passage en mode Auto pour recalcul optimal");
      onModeChange("Auto");
      setModeChangedDueToTimeRange(true);
      
      // Reset le flag après 3 secondes
      setTimeout(() => setModeChangedDueToTimeRange(false), 3000);
    }
    prevAnalysisDurationMs.current = analysisDurationMs;
  }, [analysisDurationMs, mode, onModeChange]);

  return (
    <div className="granularity-control" ref={menuRef}>
      {/* Bouton principal */}
      <button 
        onClick={toggleMenu}
        className={`granularity-button ${isOpen ? 'open' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        disabled={isDisabled}
        style={{ willChange: "transform" }}
      >
        <div className="granularity-button-content">
          <Settings2 size={18} className="granularity-button-icon" />
          <span className="granularity-button-text">
            {pendingMode === "auto" ? (
              <span>Auto: {autoGranularity.value} {autoGranularity.unit}</span>
            ) : (
              <span>Manuel: {pendingTime} {pendingTime === 1 ? unitLabelsSingular[pendingUnit] : unitLabels[pendingUnit]}</span>
            )}
          </span>
          <div 
            className={`granularity-chevron-wrapper${isOpen ? ' open' : ''}`}
            style={{ marginLeft: '0.5rem' }}
          >
            <ChevronDown 
              size={18} 
              className={`granularity-chevron${isOpen ? ' open' : ''}`}
              style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            />
          </div>
        </div>
      </button>
      {/* Menu déroulant avec AnimatePresence pour animation fluide */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            className="granularity-dropdown-menu"
            role="menu"
            aria-orientation="vertical"
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ 
              duration: 0.2,
              ease: [0.25, 1, 0.5, 1]
            }}
            style={{ 
              willChange: "transform, opacity",
              transformOrigin: "top center"
            }}
          >
            {/* Header */}
            <div className="granularity-dropdown-header">
              <h3 className="granularity-dropdown-title">Configuration de la granularité</h3>
            </div>
            {/* Content */}
            <div className="granularity-dropdown-content">
                {/* Mode Selection */}
                <div 
                  className="granularity-section"
                >
                  <div className="granularity-section-title">Mode</div>
                  <ToggleGroup.Root 
                    type="single"
                    value={pendingMode}
                    onValueChange={(value) => value && handleModeToggle(value as "auto" | "strict")}
                    className="toggle-group-root"
                  >
                    <ToggleGroup.Item value="auto" className="toggle-group-item">
                      <div className="segment-item-content">
                        <Zap size={18} className="segment-item-icon" />
                        <span className="segment-item-label">Auto</span>
                      </div>
                    </ToggleGroup.Item>
                    <ToggleGroup.Item value="strict" className="toggle-group-item">
                      <div className="segment-item-content">
                        <Settings2 size={18} className="segment-item-icon" />
                        <span className="segment-item-label">Manuel</span>
                      </div>
                    </ToggleGroup.Item>
                  </ToggleGroup.Root>
                </div>

                {/* Auto Mode Display */}
                <AnimatePresence mode="wait">
                  {pendingMode === "auto" && (
                    <div 
                      key="auto-mode"
                      className="granularity-section"
                    >
                      <div 
                        className="granularity-auto-display"
                      >
                        <Clock size={16} style={{ color: palette.electric.color }} />
                        <div className="granularity-auto-text">
                          <span className="granularity-auto-label">
                            Granularité automatique
                            {modeChangedDueToTimeRange && (
                              <motion.span 
                                style={{ color: palette.gas.color, fontStyle: 'italic' }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                              >
                                {" "}(recalculée)
                              </motion.span>
                            )}
                          </span>
                          <span className="granularity-auto-value">
                            {autoGranularity.value} {autoGranularity.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strict Mode Controls */}
                  {pendingMode === "strict" && (
                    <div 
                      key="strict-mode"
                      className="granularity-section"
                    >
                      <div 
                        className="granularity-section-title"
                      >
                        Configuration manuelle
                      </div>
                      
                      {/* Value Selection */}
                      <div 
                        className="granularity-control-group"
                      >
                        <label className="granularity-control-label">Valeur</label>
                        <div className="granularity-select-wrapper">
                          <select 
                            value={pendingTime}
                            onChange={(e) => handleValueChange(Number(e.target.value))}
                            className="granularity-select"
                          >
                            {availableValues.map(val => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Unit Selection */}
                      <div 
                        className="granularity-control-group"
                      >
                        <label className="granularity-control-label">Unité</label>
                        <div className="granularity-select-wrapper">
                          <select 
                            value={pendingUnit}
                            onChange={(e) => handleUnitChange(e.target.value as GranularityUnit)}
                            className="granularity-select"
                          >
                            {availableUnits.map(unitKey => (
                              <option key={unitKey} value={unitKey}>
                                {unitLabels[unitKey]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Suggestions */}
                      {suggestions.length > 0 && (
                        <div 
                          className="granularity-suggestions"
                        >
                          <div className="granularity-suggestions-header">
                            <Lightbulb size={14} style={{ color: palette.gas.color }} />
                            <span>Suggestions optimales</span>
                            <motion.button
                              onClick={() => setShowSuggestions(!showSuggestions)}
                              className="granularity-suggestions-toggle"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <motion.div
                                animate={{ rotate: showSuggestions ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown size={14} />
                              </motion.div>
                            </motion.button>
                          </div>
                          
                          <AnimatePresence mode="wait">
                            {showSuggestions && (
                              <motion.div
                                className="granularity-suggestions-list"
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ 
                                  duration: 0.25,
                                  ease: [0.25, 0.46, 0.45, 0.94],
                                  height: { duration: 0.3 }
                                }}
                                style={{ 
                                  willChange: "height, opacity",
                                  overflow: "hidden"
                                }}
                              >
                                {suggestions.map((suggestion, idx) => (
                                  <motion.button
                                    key={`${suggestion.unit}-${suggestion.value}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="granularity-suggestion-item"
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ 
                                      delay: idx * 0.05,
                                      duration: 0.2,
                                      ease: [0.25, 0.46, 0.45, 0.94]
                                    }}
                                    whileHover={{ 
                                      scale: 1.02, 
                                      backgroundColor: "#f8fafc",
                                      transition: { duration: 0.15 }
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ willChange: "transform" }}
                                  >
                                    <div className="granularity-suggestion-text">
                                      <span className="granularity-suggestion-title">
                                        {suggestion.value} {suggestion.value === 1 
                                          ? unitLabelsSingular[suggestion.unit] 
                                          : unitLabels[suggestion.unit]
                                        }
                                      </span>
                                      <span className="granularity-suggestion-desc">
                                        {suggestion.points} points
                                      </span>
                                    </div>
                                    <Check size={14} style={{ color: palette.electric.color }} />
                                  </motion.button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 