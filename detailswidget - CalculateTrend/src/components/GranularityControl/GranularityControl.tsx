import { createElement, useState, useEffect, useRef } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Settings2, 
  Clock, 
  Lightbulb,
  Check,
  ChevronDown
} from "lucide-react";
import { SegmentGroup } from '@ark-ui/react';
import "./GranularityControl.css";

export interface GranularityControlProps {
  mode: "auto" | "strict";
  value: number;
  unit: "second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year";
  onModeChange: (mode: "Auto" | "Strict") => void;
  onValueChange: (value: number) => void;
  onUnitChange: (unit: string) => void;
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
  const [pendingUnit, setPendingUnit] = useState(unit);
  const [pendingMode, setPendingMode] = useState<"auto" | "strict">(mode);
  const menuRef = useRef<HTMLDivElement>(null);

  const unitLabels: Record<string, string> = {
    minute: "minutes",
    hour: "heures", 
    day: "jours",
    week: "semaines",
    month: "mois",
    quarter: "trimestres",
    year: "années"
  };

  const unitLabelsSingular: Record<string, string> = {
    minute: "minute",
    hour: "heure",
    day: "jour", 
    week: "semaine",
    month: "mois",
    quarter: "trimestre",
    year: "année"
  };

  const unitMsMap: Record<string, number> = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    quarter: 3 * 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000
  };

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSuggestions(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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

  const generateOptions = React.useCallback((unitType: string): number[] => {
    const baseOptions: Record<string, number[]> = {
      minute: [5, 10, 15, 20, 30, 45, 60],
      hour: [1, 2, 3, 4, 6, 8, 12, 24],
      day: [1, 2, 3, 5, 7, 10, 14, 21, 30],
      week: [1, 2, 3, 4, 6, 8, 12],
      month: [1, 2, 3, 4, 6, 12],
      quarter: [1, 2, 3, 4],
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

  const isUnitValid = React.useCallback((unitType: string): boolean => {
    if (!analysisDurationMs) return true;
    return generateOptions(unitType).length > 0;
  }, [analysisDurationMs, generateOptions]);

  const generateSuggestions = () => {
    if (!analysisDurationMs) return [];

    const allOptions: Array<{unit: string; value: number; points: number}> = [];
    
    Object.entries(unitMsMap).forEach(([u, ms]) => {
      const baseOptions: Record<string, number[]> = {
        minute: [5, 10, 15, 30],
        hour: [1, 2, 3, 4, 6, 8, 12],
        day: [1, 2, 3, 5, 7, 14],
        week: [1, 2, 3, 4],
        month: [1, 2, 3, 6],
        quarter: [1, 2],
        year: [1, 2]
      };
      
      baseOptions[u]?.forEach(v => {
        const pts = Math.ceil(analysisDurationMs / (v * ms));
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
    setPendingMode(newMode);
    onModeChange(newMode === "auto" ? "Auto" : "Strict");
  };

  const handleValueChange = (newValue: number) => {
    setPendingTime(newValue);
    onValueChange(newValue);
  };

  const handleUnitChange = (newUnit: string) => {
    if (!isUnitValid(newUnit)) return;
    
    const newOptions = generateOptions(newUnit);
    let selectedValue = pendingTime;
    if (!newOptions.includes(selectedValue)) {
      selectedValue = newOptions.length > 0 ? newOptions[0] : pendingTime;
    }

    setPendingUnit(newUnit as any);
    setPendingTime(selectedValue);
    onUnitChange(newUnit);
    onValueChange(selectedValue);
  };

  const handleSuggestionClick = (suggestion: {unit: string; value: number}) => {
    handleUnitChange(suggestion.unit);
    handleValueChange(suggestion.value);
    setShowSuggestions(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowSuggestions(false);
  };

  const suggestions = generateSuggestions();
  const availableValues = generateOptions(pendingUnit);
  const availableUnits = Object.keys(unitLabels).filter(isUnitValid);

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
      <motion.button 
        onClick={toggleMenu}
        className={`granularity-button ${isOpen ? 'open' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        disabled={isDisabled}
        whileHover={{ 
          scale: 1.02, 
          boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.12)" 
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        style={{ willChange: "transform" }}
      >
        <div className="granularity-button-content">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Settings2 size={18} className="granularity-button-icon" />
          </motion.div>
          <span className="granularity-button-text">
            {pendingMode === "auto" ? (
              <span>Auto: {autoGranularity.value} {autoGranularity.unit}</span>
            ) : (
              <span>Manuel: {pendingTime} {pendingTime === 1 ? unitLabelsSingular[pendingUnit] : unitLabels[pendingUnit]}</span>
            )}
          </span>
        </div>
      </motion.button>
      
      {/* Menu déroulant avec AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="granularity-dropdown-menu"
            role="menu"
            aria-orientation="vertical"
            initial={{ 
              opacity: 0, 
              y: -10,
              scale: 0.95 
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1 
            }}
            exit={{ 
              opacity: 0, 
              y: -10,
              scale: 0.95 
            }}
            transition={{ 
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            style={{ willChange: "transform, opacity" }}
          >
            {/* Header */}
            <motion.div 
              className="granularity-dropdown-header"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="granularity-dropdown-title">Configuration de la granularité</h3>
            </motion.div>

            {/* Content */}
            <motion.div 
              className="granularity-dropdown-content"
              layout
              transition={{ 
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              style={{ 
                willChange: "height",
                overflow: "hidden"
              }}
            >
              {/* Mode Selection */}
              <motion.div 
                className="granularity-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="granularity-section-title">Mode</div>
                <SegmentGroup.Root 
                  value={pendingMode}
                  onValueChange={(e) => handleModeToggle(e.value as "auto" | "strict")}
                >
                  <SegmentGroup.Indicator />
                  <SegmentGroup.Item value="auto">
                    <SegmentGroup.ItemText>
                      <div className="segment-item-content">
                        <Zap size={18} className="segment-item-icon" />
                        <span className="segment-item-label">Auto</span>
                      </div>
                    </SegmentGroup.ItemText>
                    <SegmentGroup.ItemControl />
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item value="strict">
                    <SegmentGroup.ItemText>
                      <div className="segment-item-content">
                        <Settings2 size={18} className="segment-item-icon" />
                        <span className="segment-item-label">Manuel</span>
                      </div>
                    </SegmentGroup.ItemText>
                    <SegmentGroup.ItemControl />
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                </SegmentGroup.Root>
              </motion.div>

              {/* Auto Mode Display */}
              <AnimatePresence mode="wait">
                {pendingMode === "auto" && (
                  <motion.div 
                    key="auto-mode"
                    className="granularity-section"
                    initial={{ 
                      opacity: 0, 
                      maxHeight: 0,
                      scaleY: 0.95
                    }}
                    animate={{ 
                      opacity: 1, 
                      maxHeight: "200px",
                      scaleY: 1
                    }}
                    exit={{ 
                      opacity: 0, 
                      maxHeight: 0,
                      scaleY: 0.95
                    }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    style={{ 
                      willChange: "transform, opacity, max-height",
                      overflow: "hidden",
                      transformOrigin: "top"
                    }}
                  >
                    <motion.div 
                      className="granularity-auto-display"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
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
                    </motion.div>
                  </motion.div>
                )}

                {/* Strict Mode Controls */}
                {pendingMode === "strict" && (
                  <motion.div 
                    key="strict-mode"
                    className="granularity-section"
                    initial={{ 
                      opacity: 0, 
                      maxHeight: 0,
                      scaleY: 0.95
                    }}
                    animate={{ 
                      opacity: 1, 
                      maxHeight: "400px",
                      scaleY: 1
                    }}
                    exit={{ 
                      opacity: 0, 
                      maxHeight: 0,
                      scaleY: 0.95
                    }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    style={{ 
                      willChange: "transform, opacity, max-height",
                      overflow: "hidden",
                      transformOrigin: "top"
                    }}
                  >
                    <motion.div 
                      className="granularity-section-title"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Configuration manuelle
                    </motion.div>
                    
                    {/* Value Selection */}
                    <motion.div 
                      className="granularity-control-group"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
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
                    </motion.div>

                    {/* Unit Selection */}
                    <motion.div 
                      className="granularity-control-group"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="granularity-control-label">Unité</label>
                      <div className="granularity-select-wrapper">
                        <select 
                          value={pendingUnit}
                          onChange={(e) => handleUnitChange(e.target.value)}
                          className="granularity-select"
                        >
                          {availableUnits.map(unitKey => (
                            <option key={unitKey} value={unitKey}>
                              {unitLabels[unitKey]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <motion.div 
                        className="granularity-suggestions"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
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
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 