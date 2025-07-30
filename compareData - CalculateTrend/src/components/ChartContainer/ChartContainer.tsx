"use client"

import React, { createElement, type ReactNode, useState, useEffect } from "react"
import { Big } from "big.js"
import * as ToggleGroup from "@radix-ui/react-toggle-group"
// import { LineChart } from "./LineChart" // Still commented out - ensure this is reflected
// import { HeatMap } from "./HeatMap" // Still commented out - ensure this is reflected
import { ExportMenu } from "../Export/ExportMenu"
import { GranularityControl } from "../GranularityControl"
import type { Row } from "../Export/ExportLogic"
import type { EnergyConfig } from "../../utils/types"
import { getAutoGranularity } from "../../lib/utils"
import { BarChart3, Zap, Flame, Droplets, Wind } from "lucide-react"
import "./ChartContainer.css"

interface ChartContainerProps {
  data: Row[]
  energyConfig: EnergyConfig
  startDate?: Date
  endDate?: Date
  filename: string
  title?: string
  showLineChart?: boolean
  showHeatMap?: boolean
  extraHeaderContent?: ReactNode
  machineName?: string
  children?: ReactNode
  showIPEToggle?: boolean
  ipe1Name?: string
  ipe2Name?: string
  activeIPE?: 1 | 2
  onIPEToggle?: (ipe: 1 | 2) => void
  // Nouvelles props pour la granularité
  showGranularityControl?: boolean
  showSimpleGranularity?: boolean
  granularityMode?: "auto" | "strict"
  granularityValue?: number
  granularityUnit?: "minute" | "hour" | "day" | "week" | "month" | "year"
  onGranularityModeChange?: (mode: "Auto" | "Strict") => void
  onGranularityValueChange?: (value: number) => void
  onGranularityUnitChange?: (unit: string) => void
  isGranularityDisabled?: boolean
}

function getEnergyIcon(label: string | undefined, color: string) {
  if (!label) return <BarChart3 size={36} color={color} />

  const l = label.toLowerCase()
  if (l.includes("elec") || l.includes("élec")) return <Zap size={36} color={color} />
  if (l.includes("gaz") || l.includes("gas")) return <Flame size={36} color={color} />
  if (l.includes("eau") || l.includes("water")) return <Droplets size={36} color={color} />
  if (l.includes("air")) return <Wind size={36} color={color} />

  return <BarChart3 size={36} color={color} />
}

// Nouveau composant pour affichage simple de la granularité
const SimpleGranularityDisplay = ({ 
  autoGranularity 
}: { 
  autoGranularity: { value: number; unit: string } 
}) => {
  return (
    <div className="simple-granularity-display">
      <div className="simple-granularity-label">
        Granularité : <span className="simple-granularity-value">{autoGranularity.value} {autoGranularity.unit}</span>
      </div>
    </div>
  )
}

// Nouveau composant IPEToggle avec Radix UI
const IPEToggle = ({ 
  ipe1Name, 
  ipe2Name, 
  activeIPE, 
  onToggle 
}: { 
  ipe1Name: string; 
  ipe2Name: string; 
  activeIPE: 1 | 2; 
  onToggle: (ipe: 1 | 2) => void; 
}) => {
  const handleValueChange = (value: string) => {
    if (value === "1" || value === "2") {
      onToggle(parseInt(value) as 1 | 2)
    }
  }

  return (
    <ToggleGroup.Root
      className="ipe-toggle-group"
      type="single"
      value={activeIPE.toString()}
      onValueChange={handleValueChange}
      aria-label="Sélection IPE"
    >
      <ToggleGroup.Item
        className="ipe-toggle-item"
        value="1"
        aria-label={ipe1Name || "IPE 1"}
      >
        {ipe1Name || "IPE 1"}
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className="ipe-toggle-item"
        value="2"
        aria-label={ipe2Name || "IPE 2"}
      >
        {ipe2Name || "IPE 2"}
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  energyConfig,
  startDate,
  endDate,
  filename,
  title,
  extraHeaderContent,
  machineName,
  children,
  showIPEToggle,
  ipe1Name,
  ipe2Name,
  activeIPE,
  onIPEToggle,
  // Nouvelles props pour la granularité
  showGranularityControl = false,
  showSimpleGranularity = false,
  granularityMode = "auto",
  granularityValue = 5,
  granularityUnit = "minute",
  onGranularityModeChange,
  onGranularityValueChange,
  onGranularityUnitChange,
  isGranularityDisabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Prepare chart data
  const chartData = data.map((item) => ({
    timestamp: new Date(item.timestamp),
    value: new Big(item.value.toString()),
  }))

  // Calculer la granularité automatique si nécessaire
  const autoGranularity = React.useMemo(() => {
    if (!startDate || !endDate) {
      return { value: 5, unit: "minutes" }
    }
    
    const granularity = getAutoGranularity(startDate, endDate)
    const unitLabels: Record<string, string> = {
      minute: "minutes",
      hour: "heures",
      day: "jours",
      week: "semaines",
      month: "mois",
      year: "années"
    }
    
    return {
      value: granularity.value,
      unit: granularity.value === 1 
        ? granularity.unit === "minute" ? "minute" 
          : granularity.unit === "hour" ? "heure"
          : granularity.unit === "day" ? "jour"
          : granularity.unit === "week" ? "semaine"
          : granularity.unit === "month" ? "mois"
          : "année"
        : unitLabels[granularity.unit] || "minutes"
    }
  }, [startDate, endDate])

  // Calculer la durée d'analyse pour le GranularityControl
  const analysisDurationMs = React.useMemo(() => {
    if (!startDate || !endDate) return undefined
    return endDate.getTime() - startDate.getTime()
  }, [startDate, endDate])

  const hasData = chartData.length > 0
  const icon = getEnergyIcon(energyConfig.label, energyConfig.color)
  const containerTitle = title || `Visualisation des données ${energyConfig.label?.toLowerCase?.() || ""}`

  return (
    <div className={`chart-container ${isVisible ? 'visible' : 'hidden'}`}>
      {/* Header with title and actions */}
      <header className="chart-header">
        <div className="chart-header-content">
          <div className="chart-title-wrapper">
            <div className="chart-icon-wrapper">
              {icon}
            </div>
            <div>
              <h2 className="chart-title">{containerTitle}</h2>
            </div>
          </div>

          {/* Actions wrapper pour toggle, granularité et export */}
          <div className="chart-header-actions">
            {/* Toggle IPE */}
            {showIPEToggle && ipe1Name && ipe2Name && onIPEToggle && activeIPE && (
              <IPEToggle
                ipe1Name={ipe1Name}
                ipe2Name={ipe2Name}
                activeIPE={activeIPE}
                onToggle={onIPEToggle}
              />
            )}

            {/* Contrôle de granularité */}
            {showGranularityControl && onGranularityModeChange && onGranularityValueChange && onGranularityUnitChange && (
              <GranularityControl
                mode={granularityMode}
                value={granularityValue}
                unit={granularityUnit}
                onModeChange={onGranularityModeChange}
                onValueChange={onGranularityValueChange}
                onUnitChange={onGranularityUnitChange}
                autoGranularity={autoGranularity}
                isDisabled={isGranularityDisabled}
                analysisDurationMs={analysisDurationMs}
              />
            )}

            {/* Affichage simple de la granularité */}
            {showSimpleGranularity && (
              <SimpleGranularityDisplay autoGranularity={autoGranularity} />
            )}

            {/* Export button */}
            {hasData && (
              <ExportMenu
                data={data}
                filename={filename}
                machineName={machineName}
              />
            )}
          </div>
        </div>
      </header>

      {extraHeaderContent && <div className="chart-extra-header">{extraHeaderContent}</div>}

      {/* Charts content */}
      <div className="chart-content">
        {/* Render children if provided, otherwise render default charts */}
        {children ? (
          <React.Fragment>{children}</React.Fragment>
        ) : (
          <React.Fragment>
            {/* {showLineChart && hasData && (
              <div className="chart-section">
                <LineChart
                  data={chartData}
                  energyConfig={energyConfig}
                  height="350px"
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            )} */}

            {/* {showHeatMap && hasData && (
              <div className="chart-section">
                <HeatMap
                  data={chartData}
                  energyConfig={energyConfig}
                  height="350px"
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            )} */}

            {/* Empty state */}
            {!hasData && (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-state-icon-wrapper">
                    <BarChart3 size={40} className="empty-state-icon" />
                  </div>
                  <h3 className="empty-state-title">Aucune donnée disponible</h3>
                  <p className="empty-state-description">
                    Aucune donnée n'est disponible pour la période sélectionnée.
                  </p>
                </div>
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  )
}
