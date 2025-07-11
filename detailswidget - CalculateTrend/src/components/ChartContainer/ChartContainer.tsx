"use client"

import { createElement, type ReactNode, useState, useEffect } from "react"
import { Big } from "big.js"
import * as ToggleGroup from "@radix-ui/react-toggle-group"
import { LineChart } from "../LineChart"
import { HeatMap } from "../HeatMap"
import { ExportMenu } from "../Export/ExportMenu"
import type { Row } from "../Export/ExportLogic"
import type { EnergyConfig } from "../../utils/energy"
import { BarChart3, Zap, Flame, Droplets, Wind } from "lucide-react"
import "./ChartContainer.css"
import { GranularityControl } from "../GranularityControl/GranularityControl"
import { GranularityPopover } from "../GranularityControl/GranularityPopover"

interface ChartContainerProps {
  data: Row[]
  energyConfig: EnergyConfig
  startDate?: Date
  endDate?: Date
  filename: string
  title?: string
  showLineChart?: boolean
  showHeatMap?: boolean
  showExportButton?: boolean
  extraHeaderContent?: ReactNode
  machineName?: string
  noDataContent?: ReactNode
  showIPEToggle?: boolean
  ipe1Name?: string
  ipe2Name?: string
  activeIPE?: 1 | 2
  onIPEToggle?: (ipe: 1 | 2) => void
  showGranularityControl?: boolean
  granularityMode?: "auto" | "strict"
  granularityValue?: number
  granularityUnit?: "second" | "minute" | "hour" | "day" | "week" | "month" | "year"
  onGranularityModeChange?: (mode: "Auto" | "Strict") => void
  onGranularityValueChange?: (value: number) => void
  onGranularityUnitChange?: (unit: string) => void
  autoGranularity?: { value: number; unit: string }
  isGranularityDisabled?: boolean
}

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
}) => (
  <ToggleGroup.Root
    className="ipe-toggle-group"
    type="single"
    value={activeIPE.toString()}
    onValueChange={(value) => {
      if (value) {
        onToggle(parseInt(value) as 1 | 2)
      }
    }}
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
);

function getEnergyIcon(label: string | undefined, color: string) {
  if (!label) return <BarChart3 size={36} color={color} />

  const l = label.toLowerCase()
  if (l.includes("elec") || l.includes("élec")) return <Zap size={36} color={color} />
  if (l.includes("gaz") || l.includes("gas")) return <Flame size={36} color={color} />
  if (l.includes("eau") || l.includes("water")) return <Droplets size={36} color={color} />
  if (l.includes("air")) return <Wind size={36} color={color} />

  return <BarChart3 size={36} color={color} />
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  energyConfig,
  startDate,
  endDate,
  filename,
  title,
  showLineChart = true,
  showHeatMap = true,
  showExportButton = true,
  extraHeaderContent,
  machineName,
  noDataContent,
  showIPEToggle = false,
  ipe1Name,
  ipe2Name,
  activeIPE = 1,
  onIPEToggle,
  showGranularityControl = false,
  granularityMode = "auto",
  granularityValue = 5,
  granularityUnit = "minute",
  onGranularityModeChange,
  onGranularityValueChange,
  onGranularityUnitChange,
  autoGranularity = { value: 5, unit: "minutes" },
  isGranularityDisabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isCompact, setIsCompact] = useState(false)

  // Corrige l'unité de granularité pour la compatibilité des graphiques
  const safeGranularityUnit = granularityUnit === "second" ? "minute" : granularityUnit;

  // Calcul de la durée d'analyse pour validation granularité
  const analysisDurationMs = startDate && endDate ? endDate.getTime() - startDate.getTime() : undefined;

  // Apparition en douceur
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Responsive breakpoint listener
  useEffect(() => {
    const handler = () => {
      setIsCompact(window.innerWidth < 1024);
    };
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Prepare chart data
  const chartData = data.map((item) => ({
    timestamp: new Date(item.timestamp),
    value: new Big(item.value.toString()),
  }))

  const hasData = chartData.length > 0
  const icon = getEnergyIcon(energyConfig.label, energyConfig.color)
  const containerTitle = title || `Visualisation des données ${energyConfig.label?.toLowerCase?.() || ""}`

  return (
    <div className={`chart-container ${isVisible ? 'visible' : 'hidden'}`}>
      {/* Header with title, toggle and export button */}
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

          {/* Actions wrapper pour granularité, toggle et export */}
          <div className="chart-header-actions">
            {/* Granularity */}
            {showGranularityControl && hasData && onGranularityModeChange && (
              isCompact ? (
                <GranularityPopover
                  mode={granularityMode}
                  value={granularityValue}
                  unit={safeGranularityUnit}
                  onModeChange={onGranularityModeChange}
                  onValueChange={onGranularityValueChange!}
                  onUnitChange={onGranularityUnitChange!}
                  autoGranularity={autoGranularity}
                  analysisDurationMs={analysisDurationMs}
                  isDisabled={isGranularityDisabled}
                />
              ) : (
                <GranularityControl
                  mode={granularityMode}
                  value={granularityValue}
                  unit={safeGranularityUnit}
                  onModeChange={onGranularityModeChange}
                  onValueChange={onGranularityValueChange!}
                  onUnitChange={onGranularityUnitChange!}
                  autoGranularity={autoGranularity}
                  analysisDurationMs={analysisDurationMs}
                  isDisabled={isGranularityDisabled}
                />
              )
            )}

            {/* Toggle IPE */}
            {showIPEToggle && onIPEToggle && (
              <IPEToggle
                ipe1Name={ipe1Name || "IPE 1"}
                ipe2Name={ipe2Name || "IPE 2"}
                activeIPE={activeIPE}
                onToggle={onIPEToggle}
              />
            )}

            {/* Export button */}
            {hasData && showExportButton && (
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
        {showLineChart && hasData && (
          <div className="chart-section">
            <LineChart
              data={chartData}
              energyConfig={energyConfig}
              height="350px"
              startDate={startDate}
              endDate={endDate}
              granularityMode={granularityMode}
              granularityValue={granularityValue}
              granularityUnit={safeGranularityUnit}
            />
          </div>
        )}

        {showHeatMap && hasData && (
          <div className="chart-section">
            <HeatMap
              data={chartData}
              energyConfig={energyConfig}
              height="350px"
              startDate={startDate}
              endDate={endDate}
              granularityMode={granularityMode}
              granularityValue={granularityValue}
              granularityUnit={safeGranularityUnit}
            />
          </div>
        )}

        {/* Empty state */}
        {!hasData && (
          <div className="empty-state">
            {noDataContent ? (
              noDataContent
            ) : (
              <div className="empty-state-content">
                <div className="empty-state-icon-wrapper">
                  <BarChart3 size={40} className="empty-state-icon" />
                </div>
                <h3 className="empty-state-title">Aucune donnée disponible</h3>
                <p className="empty-state-description">
                  Aucune donnée n'est disponible pour la période sélectionnée.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}