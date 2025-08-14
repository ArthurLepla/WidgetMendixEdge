import { ReactElement, useState, useMemo, createElement } from "react";
import { Zap, Flame, Droplet, Wind, Box, ChevronDown, Factory } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import * as Tabs from "@radix-ui/react-tabs";
import "./DashboardSynthese.css";

type EnergyKey = "all" | "electricity" | "gas" | "water" | "air";

export interface AssetRow {
    name: string;
    electricity: number;
    gas: number;
    water: number;
    air: number;
}

interface DashboardSyntheseProps {
    levelNames: string[];
    selectedLevel: string;
    onChangeLevel: (name: string) => void;
    donutData: { name: string; value: number }[];
    assetRows: AssetRow[];
}

const ENERGY_CONFIGS = {
    electricity: { 
        label: "Électricité", 
        color: "#10b981", 
        icon: Zap,
        unit: "kWh" 
    },
    gas: { 
        label: "Gaz", 
        color: "#f59e0b", 
        icon: Flame,
        unit: "m³" 
    },
    water: { 
        label: "Eau", 
        color: "#3b82f6", 
        icon: Droplet,
        unit: "m³" 
    },
    air: { 
        label: "Air comprimé", 
        color: "#06b6d4", 
        icon: Wind,
        unit: "m³" 
    }
} as const;

const CHART_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#06b6d4"];

export function DashboardSynthese({
    levelNames,
    selectedLevel,
    onChangeLevel,
    donutData,
    assetRows
}: DashboardSyntheseProps): ReactElement {
    const [activeEnergy, setActiveEnergy] = useState<EnergyKey>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Données filtrées pour le graphique
    const filteredDonutData = useMemo(() => {
        if (activeEnergy === "all") return donutData;
        const energyMap: Record<EnergyKey, string> = {
            electricity: "Électricité",
            gas: "Gaz",
            water: "Eau",
            air: "Air",
            all: ""
        };
        return donutData.filter(item => item.name === energyMap[activeEnergy]);
    }, [donutData, activeEnergy]);

    // Calcul des totaux
    const totals = useMemo(() => {
        return assetRows.reduce(
            (acc, row) => ({
                electricity: acc.electricity + row.electricity,
                gas: acc.gas + row.gas,
                water: acc.water + row.water,
                air: acc.air + row.air
            }),
            { electricity: 0, gas: 0, water: 0, air: 0 }
        );
    }, [assetRows]);

    // Pagination
    const totalPages = Math.ceil(assetRows.length / itemsPerPage);
    const paginatedData = assetRows.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Custom tooltip pour le graphique (utilise des classes neutres)
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const total = filteredDonutData.reduce((a, b) => a + b.value, 0);
            const percentage = ((payload[0].value / total) * 100).toFixed(1);
            return (
                <div className="chart-tooltip">
                    <div className="tooltip-label">{payload[0].name}</div>
                    <div className="tooltip-value">
                        {payload[0].value.toLocaleString("fr-FR")}
                        <span className="tooltip-percent">({percentage}%)</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const handleEnergyFilter = (energy: EnergyKey) => {
        setActiveEnergy(activeEnergy === energy ? "all" : energy);
    };

    const renderEnergyValue = (value: number, energyType: keyof typeof ENERGY_CONFIGS) => {
        const config = ENERGY_CONFIGS[energyType];
        // Debug log pour vérifier les valeurs
        console.log(`Rendering ${energyType}:`, value, config);
        return (
            <div className="energy-value">
                <span className="value" style={{ color: config.color }}>
                    {value.toLocaleString("fr-FR")}
                </span>
                <span className="unit">{config.unit}</span>
            </div>
        );
    };

    return (
        <div className="dashboard-synthese">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-info">
                        <div className="header-icon">
                            <Factory size={24} />
                        </div>
                        <div className="header-text">
                            <h1 className="title">Synthèse Énergétique</h1>
                            <div className="level-selector">
                                <label htmlFor="level-select">Niveau:</label>
                                <div className="select-wrapper">
                                    <select 
                                        id="level-select"
                                        value={selectedLevel}
                                        onChange={(e) => onChangeLevel(e.target.value)}
                                        className="level-select"
                                    >
                                        {levelNames.map(level => (
                                            <option key={level} value={level}>
                                                {level}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="select-icon" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="energy-filters">
                        {Object.entries(ENERGY_CONFIGS).map(([key, config]) => {
                            const IconComponent = config.icon;
                            const isActive = activeEnergy === key;
                            return (
                                <button
                                    key={key}
                                    className={`energy-filter ${isActive ? "active" : ""}`}
                                    onClick={() => handleEnergyFilter(key as EnergyKey)}
                                    style={{ 
                                        // Le CSS consomme --energy-color
                                        "--energy-color": config.color
                                    } as React.CSSProperties}
                                    title={config.label}
                                >
                                    <IconComponent size={18} />
                                    <span className="filter-label">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Chart Section */}
                <section className="chart-section">
                    <div className="section-header">
                        <h2>Répartition énergétique</h2>
                        {activeEnergy !== "all" && (
                            <div className="active-filter" style={{ backgroundColor: ENERGY_CONFIGS[activeEnergy].color }}>
                                {ENERGY_CONFIGS[activeEnergy].label}
                            </div>
                        )}
                    </div>
                    
                    <div className="chart-container">
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={filteredDonutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                    >
                                        {filteredDonutData.map((_, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            
                            <div className="chart-center">
                                <div className="center-value">
                                    {filteredDonutData.reduce((sum, item) => sum + item.value, 0).toLocaleString("fr-FR")}
                                </div>
                                <div className="center-label">Total</div>
                            </div>
                        </div>

                        <div className="chart-legend">
                            {filteredDonutData.map((item, index) => (
                                <div key={item.name} className="legend-item">
                                    <div 
                                        className="legend-dot" 
                                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                    />
                                    <span className="legend-name">{item.name}</span>
                                    <span className="legend-value">
                                        {item.value.toLocaleString("fr-FR")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Tabs Section */}
                <section className="table-section">
                    <div className="section-header">
                        <h2>Assets du niveau: {selectedLevel}</h2>
                        <div className="asset-count">{assetRows.length} assets</div>
                    </div>
                    
                    <Tabs.Root className="table-container" defaultValue={activeEnergy === "all" ? "all" : activeEnergy}>
                        <Tabs.List className="assets-table">
                            <Tabs.Trigger className="asset-column" value="asset">
                                <div className="column-header">
                                    <Box size={16} />
                                    <span>Asset</span>
                                </div>
                            </Tabs.Trigger>
                            {activeEnergy === "all" ? (
                                Object.entries(ENERGY_CONFIGS).map(([key, config]) => {
                                    const IconComponent = config.icon;
                                    return (
                                        <Tabs.Trigger key={key} className="energy-column" value={key}>
                                            <div className="column-header">
                                                <IconComponent size={16} style={{ color: config.color }} />
                                                <span>{config.label}</span>
                                            </div>
                                        </Tabs.Trigger>
                                    );
                                })
                            ) : (
                                <Tabs.Trigger className="energy-column" value={activeEnergy}>
                                    <div className="column-header">
                                        {(() => {
                                            const IconComponent = ENERGY_CONFIGS[activeEnergy].icon;
                                            return <IconComponent size={16} style={{ color: ENERGY_CONFIGS[activeEnergy].color }} />;
                                        })()}
                                        <span>{ENERGY_CONFIGS[activeEnergy].label}</span>
                                    </div>
                                </Tabs.Trigger>
                            )}
                        </Tabs.List>

                        <Tabs.Content value="asset" className="table-content">
                            {paginatedData.map((row, index) => (
                                <div key={index} className="asset-row">
                                    <div className="asset-cell">
                                        <Box size={16} className="asset-icon" />
                                        <span className="asset-name">{row.name}</span>
                                    </div>
                                </div>
                            ))}
                        </Tabs.Content>

                        {activeEnergy === "all" ? (
                            Object.entries(ENERGY_CONFIGS).map(([key, _]) => (
                                <Tabs.Content key={key} value={key} className="table-content">
                                    {paginatedData.map((row, index) => (
                                        <div key={index} className="energy-row">
                                            <div className="asset-cell">
                                                <Box size={16} className="asset-icon" />
                                                <span className="asset-name">{row.name}</span>
                                            </div>
                                            <div className="energy-cell">
                                                {renderEnergyValue(row[key as keyof typeof row] as number, key as "electricity" | "gas" | "water" | "air")}
                                            </div>
                                        </div>
                                    ))}
                                </Tabs.Content>
                            ))
                        ) : (
                            <Tabs.Content value={activeEnergy} className="table-content">
                                {paginatedData.map((row, index) => (
                                    <div key={index} className="energy-row">
                                        <div className="asset-cell">
                                            <Box size={16} className="asset-icon" />
                                            <span className="asset-name">{row.name}</span>
                                        </div>
                                        <div className="energy-cell">
                                            {renderEnergyValue(row[activeEnergy], activeEnergy)}
                                        </div>
                                    </div>
                                ))}
                            </Tabs.Content>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button 
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Précédent
                                </button>
                                
                                <div className="pagination-info">
                                    {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, assetRows.length)} sur {assetRows.length}
                                </div>
                                
                                <button 
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Suivant
                                </button>
                            </div>
                        )}

                        {/* Footer avec totaux */}
                        <div className="table-footer">
                            <div className="footer-label">
                                <Box size={16} />
                                <span>Total</span>
                            </div>
                            <div className="footer-totals">
                                {activeEnergy === "all" ? (
                                    Object.entries(ENERGY_CONFIGS).map(([key, config]) => {
                                        const IconComponent = config.icon;
                                        return (
                                            <div key={key} className="footer-total">
                                                <IconComponent size={14} style={{ color: config.color }} />
                                                <span style={{ color: config.color }}>
                                                    {totals[key as keyof typeof totals].toLocaleString("fr-FR")} {config.unit}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="footer-total">
                                        {(() => {
                                            const IconComponent = ENERGY_CONFIGS[activeEnergy].icon;
                                            return <IconComponent size={14} style={{ color: ENERGY_CONFIGS[activeEnergy].color }} />;
                                        })()}
                                        <span style={{ color: ENERGY_CONFIGS[activeEnergy].color }}>
                                            {totals[activeEnergy].toLocaleString("fr-FR")} {ENERGY_CONFIGS[activeEnergy].unit}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Tabs.Root>
                </section>
            </main>
        </div>
    );
}
