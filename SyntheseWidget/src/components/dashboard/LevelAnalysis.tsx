import { ReactElement, createElement, useState } from "react";
import { LevelPicker } from "../navigation/LevelPicker";
import { DonutEnergyChart } from "../charts/DonutEnergyChart";
import { AssetsByEnergyTable, AssetRow } from "./AssetsByEnergyTable";
import "./LevelAnalysis.css";

type EnergyKey = "all" | "electricity" | "gas" | "water" | "air";

interface LevelAnalysisProps {
    levelNames: string[];
    selectedLevel: string;
    onChangeLevel: (name: string) => void;
    donutData: { name: string; value: number }[];
    assetRows: AssetRow[];
}

export function LevelAnalysis({
    levelNames,
    selectedLevel,
    onChangeLevel,
    donutData,
    assetRows
}: LevelAnalysisProps): ReactElement {
    const [activeEnergy, setActiveEnergy] = useState<EnergyKey>("all");

    // Calculer les KPIs
    const totalConsumption = donutData.reduce((sum, item) => sum + item.value, 0);
    const assetsCount = assetRows.length;
    const avgConsumption = assetsCount > 0 ? totalConsumption / assetsCount : 0;
    const topAsset = assetRows.reduce((max, asset) => {
        const total = asset.electricity + asset.gas + asset.water + asset.air;
        const maxTotal = max.electricity + max.gas + max.water + max.air;
        return total > maxTotal ? asset : max;
    }, assetRows[0] || { name: "N/A", electricity: 0, gas: 0, water: 0, air: 0 });

    return (
        <div className="dashboard-modern">
            {/* Header compact */}
            <LevelPicker 
                levels={levelNames} 
                selected={selectedLevel} 
                onChange={onChangeLevel}
                activeEnergy={activeEnergy}
                onEnergyChange={setActiveEnergy}
            />
            
            {/* KPI Banner */}
            <div className="kpi-banner">
                <div className="kpi-card">
                    <div className="kpi-icon consumption">⚡</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(totalConsumption)}</div>
                        <div className="kpi-label">Total consommé</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon assets">🏢</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{assetsCount}</div>
                        <div className="kpi-label">Assets actifs</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon average">📊</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(avgConsumption)}</div>
                        <div className="kpi-label">Moyenne/asset</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon top">🎯</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{topAsset.name}</div>
                        <div className="kpi-label">Plus consommateur</div>
                    </div>
                </div>
            </div>

            {/* Visualisations principales */}
            <div className="dashboard-grid">
                <div className="viz-card primary">
                    <DonutEnergyChart 
                        title={`Répartition énergétique`} 
                        data={donutData}
                        activeEnergy={activeEnergy}
                        onEnergyChange={setActiveEnergy}
                    />
                </div>
                <div className="viz-card secondary">
                    <AssetsByEnergyTable
                        rows={assetRows}
                        levelName={selectedLevel}
                        primaryColor="#18213e"
                        activeEnergy={activeEnergy}
                    />
                </div>
            </div>
        </div>
    );
}


