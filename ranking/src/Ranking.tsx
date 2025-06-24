import React, { useState, useEffect, useMemo, createElement } from "react";
import { RankingContainerProps } from "../typings/RankingProps";
import { ValueStatus } from "mendix";
import { 
    TrendingUpIcon, 
    ZapIcon, 
    Flame, 
    Droplets, 
    Wind, 
    InfoIcon, 
    SlidersIcon,
    CalendarIcon
} from "lucide-react";
import { Table, Tag, Space, Typography, Button, Modal, Switch, Card, Statistic } from "antd";
import type { ColumnsType } from "antd/es/table";

// Importez les styles CSS
import "./ui/Ranking.css";

// Configuration pour chaque type d'énergie
export const ENERGY_CONFIG = {
    Elec: {
        color: "#38a13c",
        iconColor: "#38a13c",
        titleColor: "#38a13c",
        unit: "kWh",
        label: "Électricité",
        icon: ZapIcon
    },
    gaz: {
        color: "#F9BE01",
        iconColor: "#F9BE01",
        titleColor: "#F9BE01",
        unit: "m³",
        label: "Gaz",
        icon: Flame
    },
    eau: {
        color: "#3293f3",
        iconColor: "#3293f3",
        titleColor: "#3293f3",
        unit: "m³",
        label: "Eau",
        icon: Droplets
    },
    Air: {
        color: "#66D8E6",
        iconColor: "#66D8E6",
        titleColor: "#66D8E6",
        unit: "m³",
        label: "Air",
        icon: Wind
    }
} as const;


// Labels pour les statuts
const statusLabels = {
    critical: "Critique",
    watch: "À surveiller",
    normal: "Normale"
};

// Styles CSS pour les status badges spécifiques au statut
const statusColors = {
    critical: "#ef4444",
    watch: "#f59e0b", 
    normal: "#10b981"
};

interface MachineData {
    name: string;
    consumption: number;
}

interface MachineWithStatus extends MachineData {
    status: "critical" | "watch" | "normal";
    explanation: string;
    contributionPercent: number;
    deviationPercent: number;
    anomalyScore?: number;
    anomalyReason?: string;
    key: string;
    rank: number;
}

// Interface pour les statistiques de la distribution
interface DistributionStats {
    mean: number;
    median: number;
    q1: number;
    q3: number;
    iqr: number;
    stdDev: number;
    skewness: number;
    totalConsumption: number;
    highThreshold: number;
    watchThreshold: number;
}

// Interface pour un cluster de machines
interface Cluster {
    center: number;
    machines: MachineData[];
    deviation: number;
}

/**
 * Calcule un score d'anomalie composite basé sur plusieurs facteurs
 */
function calculateAnomalyScore(machine: MachineData, stats: DistributionStats): number {
    // Facteur 1: Écart par rapport à l'IQR (méthode de base)
    const iqrScore = stats.iqr > 0 ? (machine.consumption - stats.q3) / stats.iqr : 0;
    
    // Facteur 2: Contribution relative à la consommation totale
    const contributionScore = machine.consumption / stats.totalConsumption;
    
    // Facteur 3: Écart par rapport à la médiane normalisé
    const medianScore = stats.median > 0 ? (machine.consumption - stats.median) / stats.median : 0;
    
    // Facteur 4: Écart type (mesure l'éloignement de la distribution normale)
    const stdScore = stats.stdDev > 0 ? (machine.consumption - stats.mean) / stats.stdDev : 0;
    
    // Calculer un score composite pondéré
    return (iqrScore * 0.4) + (contributionScore * 0.3) + (medianScore * 0.15) + (stdScore * 0.15);
}

/**
 * Utilitaire pour calculer la moyenne d'un tableau de machines ou valeurs
 */
function calculateMean(items: MachineData[] | number[]): number {
    if (items.length === 0) return 0;
    
    if (typeof items[0] === 'number') {
        const numArray = items as number[];
        return numArray.reduce((sum, val) => sum + val, 0) / numArray.length;
    } else {
        const machines = items as MachineData[];
        return machines.reduce((sum, m) => sum + m.consumption, 0) / machines.length;
    }
}

/**
 * Regroupe automatiquement les machines en clusters similaires
 */
function detectClusters(machines: MachineData[]): Cluster[] {
    if (machines.length <= 2) {
        return [{
            center: calculateMean(machines),
            machines: [...machines],
            deviation: 0
        }];
    }

    // 1D k‑means simplifié
    const sortedMachines = [...machines].sort((a, b) => a.consumption - b.consumption);
    const clusterSize = Math.max(1, Math.ceil(machines.length / 3));

    // Initialisation des clusters : on caste le tableau vide
    let clusters: Cluster[] = [
        {
            center: calculateMean(sortedMachines.slice(0, clusterSize)),
            machines: [] as MachineData[],
            deviation: 0
        },
        {
            center: calculateMean(sortedMachines.slice(clusterSize, 2 * clusterSize)),
            machines: [] as MachineData[],
            deviation: 0
        },
        {
            center: calculateMean(sortedMachines.slice(2 * clusterSize)),
            machines: [] as MachineData[],
            deviation: 0
        }
    ];

    // 2. Itération pour raffiner
    for (let iteration = 0; iteration < 5; iteration++) {
        // On vide chaque tableau sans changer son type
        clusters.forEach(c => { c.machines.length = 0; });

        // On force TS à voir closestCluster comme Cluster | null
        machines.forEach(machine => {
            let minDistance = Infinity;
            let closestCluster: Cluster | null = null;

            clusters.forEach(cluster => {
                const distance = Math.abs(machine.consumption - cluster.center);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCluster = cluster;
                }
            });

            if (closestCluster) {
                // Explicitly assert type to satisfy TS compiler
                const confirmedCluster: Cluster = closestCluster;
                confirmedCluster.machines.push(machine);
            }
        });

        // Filtrer les clusters vides (optionnel)
        clusters = clusters.filter(cluster => cluster.machines.length > 0);

        // Recalcul des centres et déviations
        clusters.forEach(cluster => {
            const sum = cluster.machines.reduce((acc, m) => acc + m.consumption, 0);
            cluster.center = sum / cluster.machines.length;
            cluster.deviation = Math.sqrt(
                cluster.machines.reduce((acc, m) => acc + Math.pow(m.consumption - cluster.center, 2), 0)
                / cluster.machines.length
            );
        });
    }

    return clusters;
}


/**
 * Calcule les seuils adaptatifs basés sur la distribution réelle des données
 */
function getAdaptiveThresholds(consumptions: number[]): DistributionStats {
    if (consumptions.length === 0) {
        return {
            mean: 0,
            median: 0,
            q1: 0,
            q3: 0,
            iqr: 0,
            stdDev: 0,
            skewness: 0,
            totalConsumption: 0,
            highThreshold: 0,
            watchThreshold: 0
        };
    }
    
    // Calculs statistiques de base
    const sorted = [...consumptions].sort((a, b) => a - b);
    const q1Index = Math.max(0, Math.floor(sorted.length * 0.25));
    const medianIndex = Math.floor(sorted.length * 0.5);
    const q3Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.75));
    
    const q1 = sorted[q1Index];
    const median = sorted[medianIndex];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    const totalConsumption = sorted.reduce((sum, val) => sum + val, 0);
    
    // Calcul de la moyenne et de l'écart-type
    const mean = totalConsumption / sorted.length;
    
    const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sorted.length;
    const stdDev = Math.sqrt(variance);
    
    // Calcul d'asymétrie (skewness) pour déterminer si la distribution est asymétrique
    const skewness = stdDev > 0 
        ? sorted.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / sorted.length
        : 0;
    
    // Adapter les multiplicateurs IQR en fonction de l'asymétrie
    let highMultiplier, watchMultiplier;
    
    if (skewness > 1.5) {
        // Distribution très asymétrique à droite: être plus conservatif
        highMultiplier = 2.0;
        watchMultiplier = 1.0;
    } else if (skewness > 0.5) {
        // Distribution modérément asymétrique à droite
        highMultiplier = 1.5;
        watchMultiplier = 0.8;
    } else if (skewness < -0.5) {
        // Distribution asymétrique à gauche: être plus agressif
        highMultiplier = 1.0;
        watchMultiplier = 0.5;
    } else {
        // Distribution relativement symétrique
        highMultiplier = 1.5;
        watchMultiplier = 0.7;
    }
    
    // Protection contre les valeurs IQR nulles ou très petites
    const effectiveIQR = iqr > 0 ? iqr : (q3 * 0.1);
    
    return {
        mean,
        median,
        q1,
        q3,
        iqr: effectiveIQR,
        stdDev,
        skewness,
        totalConsumption,
        highThreshold: q3 + (effectiveIQR * highMultiplier),
        watchThreshold: q3 + (effectiveIQR * watchMultiplier)
    };
}

export function Ranking({ 
    title, 
    useDummyData,
    mode,
    machineGroupEntity, 
    machineNameAttribute, 
    consumptionAttribute, 
    consumptionUnit,
    limitResults,
    highConsumptionColor,
    mediumConsumptionColor,
    lowConsumptionColor,
    dateStart,
    dateEnd
}: RankingContainerProps): React.ReactElement {
    const [machines, setMachines] = useState<MachineData[]>([]);
    const [dateRange, setDateRange] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États pour la configuration
    const [showExplanations, setShowExplanations] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Récupérer la configuration en fonction du mode sélectionné
    const energyConfig = ENERGY_CONFIG[mode] || ENERGY_CONFIG.Elec;
    const IconComponent = energyConfig.icon;

    const data = useMemo(() => {
        setIsLoading(true);
        setError(null);

        if (useDummyData) {
            setIsLoading(false);
            return generateDummyData();
        }
    
        if (machineGroupEntity && machineGroupEntity.status === ValueStatus.Available) {
            const machineData: MachineData[] = machineGroupEntity.items?.map(item => {
                if (machineNameAttribute && consumptionAttribute) {
                    const name = machineNameAttribute.get(item).value ?? "";
                    const consumption = consumptionAttribute.get(item).value?.toNumber() ?? 0;
                    return { name, consumption };
                }
                return null;
            }).filter((machine): machine is MachineData => machine !== null) || [];

            setIsLoading(false);
            return machineData.sort((a, b) => b.consumption - a.consumption).slice(0, limitResults);
        }
    
        setIsLoading(false);
        setError("Les données ne sont pas disponibles.");
        return [];
    }, [useDummyData, machineGroupEntity, machineNameAttribute, consumptionAttribute, limitResults]);

    useEffect(() => {
        setMachines(data);
        updateDateRange();
    }, [data, dateStart, dateEnd]);

    function generateDummyData(): MachineData[] {
        return [
            { name: "Machine A", consumption: 1500 },
            { name: "Machine B", consumption: 1200 },
            { name: "Machine C", consumption: 800 },
            { name: "Machine D", consumption: 500 },
            { name: "Machine E", consumption: 1000 },
            { name: "Machine F", consumption: 120 },
            { name: "Machine G", consumption: 110 },
            { name: "Machine H", consumption: 105 },
            { name: "Machine I", consumption: 95 },
            { name: "Machine J", consumption: 90 },
        ].slice(0, limitResults);
    }

    function updateDateRange() {
        if (dateStart.status === ValueStatus.Available && dateEnd.status === ValueStatus.Available) {
            const start = dateStart.value!.toLocaleDateString();
            const end = dateEnd.value!.toLocaleDateString();
            setDateRange(`${start} - ${end}`);
        }
    }

    // Classification intelligente avancée des machines
    const machinesWithStatus = useMemo((): MachineWithStatus[] => {
        if (machines.length === 0) return [];

        // 1. Extraction des données de consommation
        const consumptions = machines.map(m => m.consumption);
        const totalConsumption = consumptions.reduce((sum, val) => sum + val, 0);
        
        // 2. Analyse statistique avancée de la distribution
        const stats = getAdaptiveThresholds(consumptions);
        
        // 3. Détection des clusters pour identifier des groupes anormaux
        const clusters = detectClusters(machines);
        
        // Trouver le cluster avec le moins de machines (potentiellement anormal)
        const smallestCluster = clusters.reduce<Cluster>(
            (min, c) => (c.machines.length < min.machines.length ? c : min),
            {
              machines,
              center: calculateMean(machines),
              deviation: 0,
            }
          );
        
        // Trouver le cluster avec la consommation moyenne la plus élevée
        const highestCluster = clusters.reduce<Cluster>(
            (max, c) => (c.center > max.center ? c : max),
            {
              machines: [],
              center: 0,
              deviation: 0,
            }
          );
        
        // Est-ce que le cluster le plus petit est aussi celui avec la consommation la plus élevée?
        const isSmallHighCluster = 
            smallestCluster.machines.length < machines.length * 0.3 && 
            smallestCluster.center === highestCluster.center;
        
        // 4. Analyser chaque machine avec notre algorithme intelligent multi-facteurs
        return machines.map((machine, index) => {
            // Calcul des métriques relatives
            const contributionPercent = (machine.consumption / totalConsumption) * 100;
            const medianDeviation = stats.median > 0 ? ((machine.consumption / stats.median) - 1) * 100 : 0;
            
            // Calcul du score d'anomalie composite qui combine plusieurs facteurs
            const anomalyScore = calculateAnomalyScore(machine, stats);
            
            // Variables pour le statut et l'explication
            let status: "critical" | "watch" | "normal" = "normal";
            let explanation = "";
            let anomalyReason = "";
            
            // Vérifier si la machine est dans le cluster le plus petit et de consommation élevée
            const isInSmallHighCluster = isSmallHighCluster && 
                highestCluster.machines.some(m => m.name === machine.name);
            
            // Détermination intelligente du statut
            if (
                machine.consumption > stats.highThreshold || // Critère 1: Dépassement du seuil statistique
                anomalyScore > 1.0 ||                       // Critère 2: Score d'anomalie élevé
                isInSmallHighCluster                        // Critère 3: Appartient à un petit groupe à forte consommation
            ) {
                status = "critical";
                
                // Explication personnalisée selon la raison principale
                if (machine.consumption > stats.highThreshold) {
                    anomalyReason = "consommation anormalement élevée";
                } else if (isInSmallHighCluster) {
                    anomalyReason = "groupe isolé à forte consommation";
                } else if (anomalyScore > 1.0) {
                    anomalyReason = "combinaison de facteurs anormaux";
                }
                
                // Calcul de l'écart par rapport à la normale pour les machines critiques
                const percentAboveNormal = stats.q3 > 0 ? ((machine.consumption / stats.q3) - 1) * 100 : 0;
                explanation = `${contributionPercent.toFixed(2)}% du total | +${percentAboveNormal.toFixed(2)}% vs normale`;
                
                // Ajouter la raison spécifique si elle existe
                if (anomalyReason) {
                    explanation += ` | ${anomalyReason}`;
                }
            } 
            else if (
                machine.consumption > stats.watchThreshold || // Seuil de surveillance
                anomalyScore > 0.7                           // Score d'anomalie modéré
            ) {
                status = "watch";
                explanation = `${contributionPercent.toFixed(2)}% du total | +${medianDeviation.toFixed(2)}% vs médiane`;
            } 
            else {
                // Machine à consommation normale
                explanation = `${contributionPercent.toFixed(2)}% du total`;
            }
            
            return {
                ...machine,
                status,
                explanation,
                contributionPercent,
                deviationPercent: medianDeviation,
                anomalyScore,
                anomalyReason,
                key: machine.name,
                rank: index + 1
            };
        });
    }, [machines]);

    // Définition des colonnes pour Ant Design Table
    const columns: ColumnsType<MachineWithStatus> = useMemo(() => {
        const baseColumns: ColumnsType<MachineWithStatus> = [
            {
                title: 'Rang',
                dataIndex: 'rank',
                key: 'rank',
                width: '8%',
                align: 'center',
                render: (rank: number) => (
                    <span className="rank-badge">{rank}</span>
                ),
            },
            {
                title: 'Machine',
                dataIndex: 'name',
                key: 'name',
                width: showExplanations ? '22%' : '30%',
                render: (name: string) => (
                    <Typography.Text strong className="machine-name">
                        {name}
                    </Typography.Text>
                ),
            },
            {
                title: 'Consommation',
                dataIndex: 'consumption',
                key: 'consumption',
                width: showExplanations ? '20%' : '25%',
                align: 'right',
                render: (consumption: number) => (
                    <Space>
                        <IconComponent 
                            size={18} 
                            style={{ color: energyConfig.iconColor }}
                        />
                        <Typography.Text strong>
                            {consumption.toFixed(2)}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                            {consumptionUnit?.trim() || energyConfig.unit}
                        </Typography.Text>
                    </Space>
                ),
            },
            {
                title: 'Statut',
                dataIndex: 'status',
                key: 'status',
                width: showExplanations ? '15%' : '20%',
                align: 'center',
                render: (status: string) => {
                    const colors = {
                        critical: highConsumptionColor || statusColors.critical,
                        watch: mediumConsumptionColor || statusColors.watch,
                        normal: lowConsumptionColor || statusColors.normal
                    };
                    return (
                        <Tag color={colors[status as keyof typeof colors]}>
                            {statusLabels[status as keyof typeof statusLabels]}
                        </Tag>
                    );
                },
            },
        ];

        if (showExplanations) {
            baseColumns.push({
                title: 'Détails',
                dataIndex: 'explanation',
                key: 'details',
                width: '35%',
                render: (explanation: string, record: MachineWithStatus) => (
                    <Space>
                        <Typography.Text className="details-text">
                            {explanation}
                        </Typography.Text>
                        {record.status === "critical" && (
                            <InfoIcon size={16} className="info-icon" />
                        )}
                    </Space>
                ),
            });
        }

        return baseColumns;
    }, [showExplanations, energyConfig, consumptionUnit, highConsumptionColor, mediumConsumptionColor, lowConsumptionColor]);

    // Résumé des consommations pour le panneau d'information
    const consumptionSummary = useMemo(() => {
        if (machinesWithStatus.length === 0) return null;
        
        const critical = machinesWithStatus.filter(m => m.status === "critical");
        const watch = machinesWithStatus.filter(m => m.status === "watch");
        
        const totalConsumption = machines.reduce((sum, m) => sum + m.consumption, 0);
        const criticalConsumption = critical.reduce((sum, m) => sum + m.consumption, 0);
        const criticalContributionPercent = (criticalConsumption / totalConsumption) * 100;
        
        // Regrouper les raisons d'anomalies pour enrichir le résumé
        const uniqueReasons = new Set<string>();
        critical.forEach(machine => {
            if (machine.anomalyReason) {
                uniqueReasons.add(machine.anomalyReason);
            }
        });
        
        return {
            critical: {
                count: critical.length,
                contributionPercent: criticalContributionPercent,
                reasons: Array.from(uniqueReasons)
            },
            watch: {
                count: watch.length
            },
            normal: {
                count: machinesWithStatus.length - critical.length - watch.length
            }
        };
    }, [machinesWithStatus, machines]);

    if (isLoading) {
        return <div className="ranking-widget__loading">Chargement des données...</div>;
    }

    if (error) {
        return <div className="ranking-widget__error">{error}</div>;
    }

    if (machinesWithStatus.length === 0) {
        return <div className="ranking-widget__no-data">Aucune donnée à afficher. Vérifiez la configuration du widget.</div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <Typography.Title level={2} className="dashboard-title" style={{ color: energyConfig.titleColor, margin: 0 }}>
                    <Space>
                        <TrendingUpIcon className="dashboard-icon" size={28} style={{ color: energyConfig.iconColor }} />
                        {title || `Classement de Consommation - ${energyConfig.label}`}
                    </Space>
                </Typography.Title>
                <Button 
                    icon={<SlidersIcon size={20} />}
                    onClick={() => setIsSettingsOpen(true)}
                    title="Paramètres d'affichage"
                    type="text"
                />
            </div>

            <div className="date-range">
                <Space>
                    <CalendarIcon size={18} />
                    <Typography.Text type="secondary">{dateRange}</Typography.Text>
                </Space>
            </div>

            {/* Résumé de consommation enrichi avec Ant Design */}
            {consumptionSummary && consumptionSummary.critical.count > 0 && (
                <Card size="small" style={{ marginBottom: 16 }}>
                    <Statistic
                        title={
                            <Space>
                                <span>{consumptionSummary.critical.count > 1 ? 'Machines critiques' : 'Machine critique'}</span>
                                <Typography.Text type="secondary">
                                    représentant {consumptionSummary.critical.contributionPercent.toFixed(2)}% 
                                    de la consommation totale
                                    {consumptionSummary.critical.reasons.length > 0 && 
                                        ` (${consumptionSummary.critical.reasons.join(", ")})`}
                                </Typography.Text>
                            </Space>
                        }
                        value={consumptionSummary.critical.count}
                        valueStyle={{ color: highConsumptionColor || statusColors.critical }}
                    />
                </Card>
            )}

            <div className="table-container">
                <Table
                    columns={columns}
                    dataSource={machinesWithStatus}
                    rowKey="key"
                    pagination={{ pageSize: 10 }}
                    loading={isLoading}
                    rowClassName={(record) => record.status === "critical" ? "critical-row" : ""}
                />
            </div>

            {/* Dialog de configuration avec Ant Design Modal */}
            <Modal
                title="Paramètres d'affichage"
                open={isSettingsOpen}
                onCancel={() => setIsSettingsOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsSettingsOpen(false)}>
                        Fermer
                    </Button>,
                    <Button key="save" type="primary" onClick={() => setIsSettingsOpen(false)}>
                        Appliquer
                    </Button>,
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                        <Typography.Text>Affichage des détails :</Typography.Text>
                        <br />
                        <Switch
                            checked={showExplanations}
                            onChange={setShowExplanations}
                            checkedChildren="Détails visibles"
                            unCheckedChildren="Détails masqués"
                        />
                    </div>
                </Space>
            </Modal>
        </div>
    );
}