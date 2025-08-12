import React, { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { AdvancedSankeyV2ContainerProps } from "../typings/AdvancedSankeyV2Props";
import "./ui/AdvancedSankeyV2.css";
import { useVisualSankeyData, useNodeInteractions, useNavigationState } from "./hooks/useVisualSankeyData";
import { SankeyChart } from "./components/SankeyChart";

export function AdvancedSankeyV2(props: AdvancedSankeyV2ContainerProps): ReactElement {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: props.width || 800, height: props.height || 600 });

    const visualData = useVisualSankeyData(props);
    const interactions = useNodeInteractions(props);
    const navigation = useNavigationState(visualData);

    const hasData = visualData.status === "available" && visualData.nodes.length > 0;

    useEffect(() => {
        if (!containerRef.current) return;
        const update = () => {
            const bbox = containerRef.current?.getBoundingClientRect();
            if (!bbox) return;
            setDimensions({
                width: Math.max(bbox.width || props.width || 800, 600),
                height: props.height || 600
            });
        };
        update();
        const ro = new ResizeObserver(() => requestAnimationFrame(update));
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [props.width, props.height]);

    const Header = useMemo(() => {
        const Icon = visualData.energyConfig.icon as React.ComponentType<any> | undefined;
        return (
            <div className="sankey-header">
                <div className="sankey-title-section">
                    <div className="sankey-title-container">
                        {Icon && (
                            <div className="sankey-energy-icon">
                                <Icon size={28} color={visualData.energyConfig.color} strokeWidth={2} />
                            </div>
                        )}
                        <h2 className="sankey-title" style={{ color: visualData.energyConfig.color }}>
                            {props.title || visualData.energyConfig.title}
                        </h2>
                    </div>
                    {/* DisplayModeSwitch UI rétabli */}
                    <div className="display-mode-switch">
                        <button className="mode-option active">
                            <span className="text">Consommation</span>
                            <span className="unit-text">{visualData.energyConfig.unit}</span>
                        </button>
                        <button className="mode-option">
                            <span className="text">Coût</span>
                            <span className="unit-text">€</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }, [visualData.energyConfig, props.title]);

    if (visualData.status === "loading") {
        return <div className="sankey-loading">Chargement des données...</div>;
    }

    if (!hasData) {
        return (
            <div ref={containerRef} className="sankey-container">
                {Header}
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
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <h3 style={{ color: "#333", marginTop: 20, marginBottom: 10 }}>Aucune donnée disponible</h3>
                    <p style={{ color: "#666", marginBottom: 20 }}>La source `energyFlowDataSource` ne contient pas de données.</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="sankey-container" style={{ boxSizing: "border-box" }}>
            {Header}
            {/* Breadcrumb rétabli */}
            {navigation.breadcrumbs.length > 0 && (
                <div className="sankey-breadcrumbs">
                    {navigation.breadcrumbs.map((bc, idx) => (
                        <React.Fragment key={bc.id}>
                            {idx > 0 && <span className="breadcrumb-separator">&gt;</span>}
                            <button
                                className={`breadcrumb-item ${bc.isCurrent ? "current" : ""}`}
                                onClick={() => navigation.goToLevel(idx)}
                            >
                                {bc.name}
                            </button>
                        </React.Fragment>
                    ))}
                    <span className="level-indicator" style={{ marginLeft: "auto" }}>Niveau {navigation.currentLevel}</span>
                </div>
            )}

            <div className="sankey-chart" style={{ width: "100%", height: dimensions.height }}>
                <SankeyChart
                    nodes={navigation.displayNodes}
                    links={navigation.displayLinks as any}
                    width={dimensions.width}
                    height={dimensions.height}
                    onNodeClick={node => {
                        navigation.navigateToNode(node.id);
                        interactions.handleNodeClick(node.id);
                    }}
                    unitOfMeasure={visualData.energyConfig.unit}
                    linkColor={"#E0E0E0"}
                    showValues={props.showValues}
                />
            </div>

            {props.showDebugTools && (
                <div className="debug-info">
                    <h3>🔍 Debug</h3>
                    <pre>{JSON.stringify({
                        nodeCount: visualData.metadata.nodeCount,
                        linkCount: visualData.metadata.linkCount,
                        totalValue: visualData.metadata.totalValue
                    }, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

