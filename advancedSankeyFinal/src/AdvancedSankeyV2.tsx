import React, { ReactElement, createElement, useEffect, useState, useRef } from "react";
import { ValueStatus } from "mendix";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyJustify } from "d3-sankey";
import { AdvancedSankeyV2ContainerProps } from "../typings/AdvancedSankeyV2Props";
import { SankeyData, BaseNode, ExtendedNode } from "./types/SankeyTypes";
import "./ui/AdvancedSankeyV2.css";
import { Zap, Flame, Droplet, Wind } from "lucide-react";

// 🚀 REFACTORING: Import des services optimisés
import { SankeyState, SankeyContext } from "./states/SankeyStates";
import { SankeyOrchestrator, SankeyProcessingResult } from "./services/SankeyOrchestrator";
import { PriceCalculationService } from "./services/PriceCalculationService";
import { NavigationService, NavigationPath } from "./services/NavigationService";
import { useD3Rendering } from "./hooks/useD3Rendering";
import { StyleUtils } from "./utils/StyleUtils";
import { STYLE_CONSTANTS } from "./constants/StyleConstants";
import { formatPeriod } from "./utils/dateFormatter";

// Définition des couleurs pour chaque catégorie
interface ColorScheme {
    [key: string]: string;
}

const COLORS: ColorScheme = {
    Usine: "#2196F3",    // Bleu moderne
    Atelier: "#4CAF50",  // Vert moderne
    Machine: "#FF9800",  // Orange moderne
    link: "#E0E0E0"      // Gris clair moderne
};

// Configuration des énergies
const ENERGY_CONFIG = {
    elec: {
        color: "#38a13c",
        iconColor: "#38a13c",
        titleColor: "#38a13c",
        unit: "kWh",
        icon: Zap,
        title: "Distribution des flux électriques"
    },
    gaz: {
        color: "#F9BE01",
        iconColor: "#F9BE01",
        titleColor: "#F9BE01",
        unit: "m³",
        icon: Flame,
        title: "Distribution des flux de gaz"
    },
    eau: {
        color: "#3293f3",
        iconColor: "#3293f3",
        titleColor: "#3293f3",
        unit: "m³",
        icon: Droplet,
        title: "Distribution des flux d'eau"
    },
    air: {
        color: "#66D8E6",
        iconColor: "#66D8E6",
        titleColor: "#66D8E6",
        unit: "m³",
        icon: Wind,
        title: "Distribution des flux d'air comprimé"
    },
    all: {
        color: "#1a1a1a",
        iconColor: "#1a1a1a",
        titleColor: "#1a1a1a",
        unit: "unité",
        title: "Distribution globale des flux"
    }
} as const;

// ✅ SIMPLIFIÉ: Plus de fonctions utilitaires ici - tout est dans les services



export function AdvancedSankeyV2(props: AdvancedSankeyV2ContainerProps): ReactElement {
    // 🚀 ÉTAT SIMPLIFIÉ: Seulement l'essentiel
    const [processingResult, setProcessingResult] = useState<SankeyProcessingResult | null>(null);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [displayMode, setDisplayMode] = useState<"consumption" | "cost">("consumption");
    const [dimensions, setDimensions] = useState({ width: 0, height: 1000 });
    
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // 🎯 DONNÉES EXTRAITES
    const sankeyContext = processingResult?.context || {
        currentRoot: null,
        availableNodes: [],
        filteredNodes: [],
        filteredLinks: [],
        allLinks: [],
        navigationPath: []
    };
    const sankeyData = processingResult?.data || null;
    const hasDataForPeriod = processingResult?.success && processingResult.data && 
                            processingResult.data.nodes.length > 0;
    
    // 🎯 DONNÉES DE PRIX UNIFIÉES
    const priceData = PriceCalculationService.createPriceDataFromProps(props);

    // 🚀 REDIMENSIONNEMENT SIMPLIFIÉ
    useEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            const bbox = containerRef.current?.getBoundingClientRect();
            if (!bbox) return;

            // 🔧 OPTIMISATION: Dimensions plus compactes pour tenir sur l'écran
            const width = Math.max(bbox.width || 600, 600);  // 800 → 600
            const height = Math.max(bbox.height || 400, 400); // 600 → 400
            setDimensions({ width, height });
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // 🚀 TRAITEMENT DES DONNÉES
    useEffect(() => {
        const result = SankeyOrchestrator.processHierarchicalData(
            props.hierarchyConfig,
            props.selectedEnergies || "all",
            selectedNode,
            props.startDate?.value,
            props.endDate?.value
        );
        
        setProcessingResult(result);
        
        if (props.showDebugTools && result.performance) {
            console.log(`⚡ ORCHESTRATOR: ${result.performance.duration.toFixed(2)}ms`);
        }
        
    }, [props.hierarchyConfig, selectedNode, props.startDate, props.endDate, props.selectedEnergies]);

    // 🚀 GESTION DES CLICS SUR NŒUDS
    const handleNodeClick = (node: BaseNode) => {
        console.log(`🎯 COMPOSANT PRINCIPAL: handleNodeClick appelé pour ${node.name} (${node.id})`);
        NavigationService.handleNodeClick(
            node,
            selectedNode,
            sankeyContext,
            setSelectedNode,
            props
        );
    };

    // 🚀 RENDU D3 VIA HOOK PERSONNALISÉ
    useD3Rendering({
        svgRef,
        containerRef,
        sankeyData,
        sankeyContext,
        selectedNode,
        dimensions,
        selectedEnergies: props.selectedEnergies || "all",
        displayMode,
        priceData,
        currency: props.currency || "€",
        startDate: props.startDate?.value,
        endDate: props.endDate?.value,
        onNodeClick: handleNodeClick,
        showDebugTools: props.showDebugTools
    });

    // 🚀 BREADCRUMBS NAVIGATION
    const getBreadcrumbs = () => {
        if (!sankeyData) return null;

        const navigationPath = NavigationService.buildNavigationPath(selectedNode, sankeyContext);
        const currentLevel = NavigationService.getCurrentNavigationLevel(navigationPath);

        return (
            <div 
                className="sankey-breadcrumbs"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 0',
                    borderBottom: '2px solid #e0e0e0',
                    marginBottom: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    paddingLeft: '16px',
                    paddingRight: '16px'
                }}
            >
                {navigationPath.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {index > 0 && (
                            <span 
                                className="breadcrumb-separator"
                                style={{ 
                                    color: '#666666',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    userSelect: 'none'
                                }}
                            >
                                &gt;
                            </span>
                        )}
                        <button 
                            className={`breadcrumb-item ${item.isCurrent ? 'current' : ''}`}
                            onClick={() => setSelectedNode(item.id)}
                            style={{
                                padding: `${STYLE_CONSTANTS.SPACING.SMALL}px ${STYLE_CONSTANTS.SPACING.MEDIUM}px`,
                                border: `1px solid ${item.isCurrent ? '#2196F3' : 'transparent'}`,
                                backgroundColor: item.isCurrent ? '#2196F3' : item.isRoot ? '#f8f9fa' : 'transparent',
                                color: item.isCurrent ? '#ffffff' : '#333333',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                fontSize: '16px',
                                fontWeight: item.isCurrent ? '600' : '500',
                                fontFamily: "'Barlow', sans-serif",
                                textShadow: 'none',
                                outline: 'none',
                                boxShadow: item.isCurrent ? '0 2px 4px rgba(33, 150, 243, 0.3)' : 'none'
                            }}
                            title={`Naviguer vers ${item.name}`}
                            onMouseEnter={(e) => {
                                if (!item.isCurrent) {
                                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                                    e.currentTarget.style.color = '#1976d2';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!item.isCurrent) {
                                    e.currentTarget.style.backgroundColor = item.isRoot ? '#f8f9fa' : 'transparent';
                                    e.currentTarget.style.color = '#333333';
                                }
                            }}
                        >
                            {StyleUtils.truncateLabel(item.name).display}
                        </button>
                    </React.Fragment>
                ))}
                
                {/* Indicateur de niveau */}
                <span 
                    className="level-indicator"
                    style={{
                        marginLeft: 'auto',
                        fontSize: '14px',
                        color: '#666666',
                        fontWeight: '400',
                        fontFamily: "'Barlow', sans-serif"
                    }}
                >
                    {`Niveau ${currentLevel}`}
                </span>
            </div>
        );
    };

    // 🚀 VÉRIFICATION DES PRIX VALIDES
    const hasPricesForPeriod = (): boolean => {
        if (displayMode !== "cost" || !priceData || !sankeyData) return false;
        
        return PriceCalculationService.hasValidPricesForNodes(
            sankeyData.nodes,
            props.selectedEnergies || "all",
            priceData,
            props.currency || "€",
            props.startDate?.value,
            props.endDate?.value
        );
    };

    // 🚀 COMPOSANT DE COMMUTATEUR DE MODE
    const DisplayModeSwitch = () => (
        <div className="display-mode-switch" style={{
            display: 'flex',
            gap: '8px',
            background: '#f5f5f5',
            padding: '4px',
            borderRadius: '8px'
        }}>
            <button
                className={`mode-option ${displayMode === "consumption" ? "active" : ""}`}
                onClick={() => setDisplayMode("consumption")}
                title="Voir les consommations"
                style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: displayMode === "consumption" ? '#2196F3' : 'transparent',
                    color: displayMode === "consumption" ? 'white' : '#666'
                }}
            >
                Consommation
            </button>
            <button
                className={`mode-option ${displayMode === "cost" ? "active" : ""}`}
                onClick={() => setDisplayMode("cost")}
                title="Voir les coûts"
                style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: displayMode === "cost" ? '#2196F3' : 'transparent',
                    color: displayMode === "cost" ? 'white' : '#666'
                }}
            >
                Coût
            </button>
        </div>
    );

    // 🚀 HEADER DU COMPOSANT
    const SankeyHeader = () => (
        <div className="sankey-header">
            <div className="sankey-title-section">
                <div className="sankey-title-container">
                    {props.selectedEnergies !== "all" && (
                        <div className="sankey-energy-icon">
                            {(() => {
                                const IconComponent = ENERGY_CONFIG[props.selectedEnergies]?.icon;
                                return IconComponent && (
                                    <IconComponent 
                                        size={28} 
                                        color={ENERGY_CONFIG[props.selectedEnergies].iconColor}
                                        strokeWidth={2}
                                    />
                                );
                            })()}
                        </div>
                    )}
                    <h2 
                        className="sankey-title" 
                        style={{ 
                            color: props.selectedEnergies !== "all" 
                                ? ENERGY_CONFIG[props.selectedEnergies].titleColor 
                                : "#1a1a1a"
                        }}
                    >
                        {props.selectedEnergies !== "all" 
                            ? ENERGY_CONFIG[props.selectedEnergies].title
                            : props.title || "Distribution globale des flux"}
                    </h2>
                </div>
                <DisplayModeSwitch />
            </div>
            {props.startDate?.status === ValueStatus.Available && props.endDate?.status === ValueStatus.Available && (
                <p className="sankey-subtitle">
                    Période : {formatPeriod(props.startDate.value, props.endDate.value, { style: 'medium' })}
                </p>
            )}
        </div>
    );

    // 🚀 MESSAGE D'ERREUR POUR PRIX MANQUANTS
    if (displayMode === "cost" && !hasPricesForPeriod()) {
        return (
            <div className="sankey-container" style={{ width: "100%", minWidth: "600px" }}>
                <SankeyHeader />
                <div className="sankey-no-price-message" style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    margin: "20px 0"
                }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3 style={{ color: "#333", marginTop: "20px", marginBottom: "10px" }}>
                        Aucun prix valide pour la période sélectionnée
                    </h3>
                    <p style={{ color: "#666", marginBottom: "20px" }}>
                        Les prix ne sont pas configurés ou ne couvrent pas la période du {formatPeriod(props.startDate?.value, props.endDate?.value, { style: 'long' })}.
                    </p>
                    {props.onNoPriceClick?.canExecute && (
                        <button 
                            onClick={() => props.onNoPriceClick?.execute()}
                            style={{
                                backgroundColor: "#2196F3",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "14px",
                                fontWeight: "500",
                                transition: "background-color 0.2s"
                            }}
                        >
                            Configurer les prix
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // 🚀 MESSAGE D'ERREUR POUR DONNÉES MANQUANTES
    if (!hasDataForPeriod) {
        return (
            <div className="sankey-container" style={{ width: "100%", minWidth: "600px" }}>
                <SankeyHeader />
                <div className="sankey-no-data-message" style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    margin: "20px 0"
                }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3 style={{ color: "#333", marginTop: "20px", marginBottom: "10px" }}>
                        Aucune donnée disponible pour la période sélectionnée
                    </h3>
                    <p style={{ color: "#666", marginBottom: "20px" }}>
                        Aucune consommation n'a été enregistrée pour la période du {formatPeriod(props.startDate?.value, props.endDate?.value, { style: 'long' })}.
                    </p>
                </div>
            </div>
        );
    }

    // 🚀 RENDU PRINCIPAL SIMPLIFIÉ
    if (!sankeyData) {
        return <div className="sankey-loading">Chargement des données...</div>;
    }

    return (
        <div ref={containerRef} className="sankey-container" style={{ 
            width: "100%", 
            minWidth: "800px",
            overflow: "hidden",
            boxSizing: "border-box"
        }}>
            <SankeyHeader />
            {getBreadcrumbs()}
            
            <div className="sankey-chart" style={{ 
                width: "100%",
                height: "auto",
                position: "relative",
                margin: "0",
                overflow: "hidden",
                boxSizing: "border-box"
            }}>
                <svg 
                    ref={svgRef}
                    style={{ 
                        width: "100%",
                        display: "block",
                        minWidth: "600px"
                    }}
                />
            </div>

            {props.showDebugTools && (
                <div className="debug-info" style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "16px",
                    marginTop: "20px",
                    fontFamily: "monospace"
                }}>
                    <h3 style={{ color: "#495057", marginBottom: "12px" }}>🔍 Informations de débogage</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <h4>Données Sankey</h4>
                            <pre style={{ fontSize: "12px", lineHeight: "1.4" }}>
                                {JSON.stringify({
                                    nodesCount: sankeyData?.nodes.length || 0,
                                    linksCount: sankeyData?.links.length || 0,
                                    selectedNode
                                }, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h4>Dimensions & État</h4>
                            <pre style={{ fontSize: "12px", lineHeight: "1.4" }}>
                                {JSON.stringify({
                                    dimensions,
                                    hasDataForPeriod,
                                    processingSuccess: processingResult?.success
                                }, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


