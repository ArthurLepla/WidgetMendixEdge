import { createElement } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Settings2, 
  Clock, 
  Lightbulb,
  Check
} from "lucide-react";
import { 
  Segmented,
  Select, 
  Space, 
  Popover, 
  Button, 
  Card,
  Typography,
  ConfigProvider
} from "antd";
import "./GranularityControl.css";

const { Text } = Typography;
const { Option } = Select;

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

// Configuration du thème Ant Design pour une intégration parfaite
const antdTheme = {
  token: {
    colorPrimary: palette.electric.color,
    colorInfo: palette.water.color,
    colorSuccess: palette.electric.color,
    colorWarning: palette.gas.color,
    fontFamily: "'Barlow', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    borderRadius: 6,
    controlHeight: 36,
    fontSize: 14,
  },
  components: {
    Segmented: {
      itemSelectedBg: palette.primary.color,
      itemSelectedColor: "#ffffff",
    },
    Select: {
      colorBorder: "#e2e8f0",
      colorBorderHover: "#cbd5e1",
      colorPrimary: palette.electric.color,
    },
    Button: {
      colorPrimary: palette.gas.color,
      colorPrimaryHover: "#e6a800",
    },
    Popover: {
      colorBgElevated: "#ffffff",
      boxShadowSecondary: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },
  },
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
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [pendingTime, setPendingTime] = React.useState<number>(value);

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

  const getPointsCount = React.useCallback((val: number): number | null => {
    if (!analysisDurationMs) return null;
    const bucketMs = val * unitMsMap[unit];
    return Math.ceil(analysisDurationMs / bucketMs);
  }, [analysisDurationMs, unit, unitMsMap]);

  const isOptionValid = React.useCallback((val: number) => {
    if (!analysisDurationMs) return true;
    const bucketMs = val * unitMsMap[unit];
    if (bucketMs > analysisDurationMs) return false;
    const points = getPointsCount(val);
    return !points || points <= 100;
  }, [analysisDurationMs, getPointsCount, unit, unitMsMap]);

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

  const optionSets = React.useMemo(() => generateOptions(unit), [generateOptions, unit]);

  // Sync avec les changements externes
  React.useEffect(() => {
    setPendingTime(value);
  }, [value]);

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

  const handleSelectChange = (v: number) => {
    setPendingTime(v);
  };

  const handleUnitChange = (newUnit: string) => {
    if (!isUnitValid(newUnit)) return;

    const newOptions = generateOptions(newUnit);
    let selectedValue = pendingTime;
    if (!newOptions.includes(selectedValue)) {
      selectedValue = newOptions.length > 0 ? newOptions[0] : pendingTime;
    }

    onUnitChange(newUnit);
    setPendingTime(selectedValue);
    onValueChange(selectedValue);
  };

  const handleSuggestionClick = (suggestion: {unit: string; value: number}) => {
    onUnitChange(suggestion.unit);
    setPendingTime(suggestion.value);
    onValueChange(suggestion.value);
    setShowSuggestions(false);
  };

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

  const suggestions = generateSuggestions();

  // Panel de suggestions pour Popover
  const suggestionsContent = (
    <div className="suggestions-content">
      <div className="suggestions-header">
        <Space size={8}>
          <Lightbulb size={14} style={{ color: palette.gas.color }} />
          <Text strong style={{ fontSize: 13 }}>Suggestions optimales</Text>
        </Space>
      </div>
      <div className="suggestions-list">
        {suggestions.map((suggestion, idx) => (
          <motion.div
            key={idx}
            className="suggestion-item"
            whileHover={{ backgroundColor: "#f8fafc" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <div className="suggestion-text">
              <Text strong style={{ fontSize: 14, color: palette.primary.color }}>
                {suggestion.value} {suggestion.value === 1 
                  ? unitLabelsSingular[suggestion.unit] 
                  : unitLabels[suggestion.unit]
                }
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {suggestion.points} points
              </Text>
            </div>
            <Check size={14} style={{ color: palette.electric.color }} />
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <ConfigProvider theme={antdTheme}>
      <motion.div 
        className="granularity-control-antd"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card 
          className="granularity-card granularity-card-light"
          size="small"
          style={{ 
            borderRadius: 12,
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
            background: "#ffffff"
          }}
        >
          <Space size={16} wrap className="granularity-content">
            {/* Mode Toggle */}
            <div className="mode-section">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
              >
                <Segmented
                  value={mode}
                  onChange={(value) => onModeChange(value === "auto" ? "Auto" : "Strict")}
                  disabled={isDisabled}
                  size="middle"
                  className="granularity-segmented"
                  options={[
                    {
                      label: (
                        <div className="toggle-option">
                          <Zap size={16} />
                          <span>Auto</span>
                        </div>
                      ),
                      value: "auto"
                    },
                    {
                      label: (
                        <div className="toggle-option">
                          <Settings2 size={16} />
                          <span>Strict</span>
                        </div>
                      ),
                      value: "strict"
                    }
                  ]}
                />
              </motion.div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {mode === "auto" ? (
                <motion.div
                  key="auto"
                  className="auto-section"
                  initial={{ opacity: 0, x: -15, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 15, scale: 0.98 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    duration: 0.25
                  }}
                >
                  <Space size={12} align="center">
                    <Clock size={16} style={{ color: palette.electric.color }} />
                    <div className="auto-content">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Granularité automatique
                        {modeChangedDueToTimeRange && (
                          <span style={{ color: palette.gas.color, fontStyle: 'italic' }}>
                            {" "}(recalculée)
                          </span>
                        )}
                      </Text>
                      <Text strong style={{ color: palette.primary.color, fontSize: 14 }}>
                        {autoGranularity.value} {autoGranularity.unit}
                      </Text>
                    </div>
                  </Space>
                </motion.div>
              ) : (
                <motion.div
                  key="strict"
                  className="strict-section"
                  initial={{ opacity: 0, x: 15, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -15, scale: 0.98 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    duration: 0.25
                  }}
                >
                  <Space size={8} wrap>
                    {/* Value Select */}
                    <Select
                      value={pendingTime}
                      onChange={handleSelectChange}
                      onBlur={() => {
                        if (pendingTime !== value) {
                          onValueChange(pendingTime);
                        }
                      }}
                      disabled={isDisabled}
                      style={{ minWidth: 80 }}
                      size="middle"
                    >
                      {optionSets.map(opt => (
                        <Option 
                          key={opt} 
                          value={opt}
                          disabled={!isOptionValid(opt)}
                        >
                          {opt}
                        </Option>
                      ))}
                    </Select>

                    {/* Unit Select */}
                    <Select
                      value={unit}
                      onChange={handleUnitChange}
                      disabled={isDisabled}
                      style={{ minWidth: 120 }}
                      size="middle"
                    >
                      {Object.entries(unitLabels).map(([key, label]) => {
                        const unitIsValid = isUnitValid(key);
                        return (
                          <Option 
                            key={key} 
                            value={key}
                            disabled={!unitIsValid}
                          >
                            {label}
                          </Option>
                        );
                      })}
                    </Select>

                    {/* Suggestions Button */}
                    {analysisDurationMs && suggestions.length > 0 && (
                      <Popover
                        content={suggestionsContent}
                        title={null}
                        trigger="click"
                        open={showSuggestions}
                        onOpenChange={setShowSuggestions}
                        placement="bottomRight"
                        overlayClassName="granularity-suggestions-popover"
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<Lightbulb size={16} />}
                            style={{ 
                              backgroundColor: palette.gas.color,
                              borderColor: palette.gas.color
                            }}
                          />
                        </motion.div>
                      </Popover>
                    )}
                  </Space>
                </motion.div>
              )}
            </AnimatePresence>
          </Space>
        </Card>
      </motion.div>
    </ConfigProvider>
  );
}; 