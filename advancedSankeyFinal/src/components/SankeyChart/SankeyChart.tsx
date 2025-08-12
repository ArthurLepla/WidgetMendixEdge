import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { VisualNode, VisualLink } from "../../utils/visualDataAdapter";

export interface SankeyChartProps {
    nodes: VisualNode[];
    links: VisualLink[];
    width: number;
    height: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    onNodeClick: (node: VisualNode) => void;
    unitOfMeasure?: string;
    linkColor?: string;
    showValues?: boolean;
}

type ChartNode = VisualNode & { x0?: number; x1?: number; y0?: number; y1?: number };
type ChartLink = { source: number; target: number; value: number; width?: number } & Partial<VisualLink> & { y0?: number; y1?: number };

const SankeyChart: React.FC<SankeyChartProps> = ({
    nodes,
    links,
    width,
    height,
    margin = { top: 20, right: 60, bottom: 20, left: 60 },
    onNodeClick,
    unitOfMeasure = "kWh",
    linkColor = "#E0E0E0",
    showValues = true
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!svgRef.current || !tooltipRef.current || width === 0) {
            return;
        }

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Fonctions pour le tooltip
        const showTooltip = (event: MouseEvent, content: string) => {
            const tooltip = d3.select(tooltipRef.current);
            tooltip
                .style("opacity", 1)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`)
                .html(content);
        };

        const hideTooltip = () => {
            d3.select(tooltipRef.current)
                .style("opacity", 0);
        };

        try {
            // Validation des données
            const hasInvalidNodes = nodes.some(node => 
                typeof node.value !== 'number' ||
                isNaN(node.value)
            );

            if (hasInvalidNodes) {
                console.error("[DEBUG] Invalid node values detected");
                return;
            }

            // Création du layout Sankey
            const sankeyGenerator = sankey<ChartNode, ChartLink>()
                .nodeWidth(30)
                .nodePadding(20)
                .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

            // Préparation des données
            const sankeyData = {
                nodes: nodes.map(node => ({ ...node } as ChartNode)),
                links: links.map(l => ({
                    ...l,
                    source: typeof l.source === "number" ? l.source : Number(l.source),
                    target: typeof l.target === "number" ? l.target : Number(l.target)
                } as ChartLink))
            };

            const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator(sankeyData);

            // Vérification des positions calculées
            const hasInvalidPositions = sankeyNodes.some(
                node => isNaN(node.x0!) || isNaN(node.x1!) || isNaN(node.y0!) || isNaN(node.y1!)
            );

            if (hasInvalidPositions) {
                console.error("[DEBUG] Invalid node positions detected");
                return;
            }

            // Dessiner les liens
            svg.append("g")
                .selectAll("path")
                .data(sankeyLinks)
                .join("path")
                .attr("class", "sankey-link")
                .attr("d", sankeyLinkHorizontal())
                .attr("stroke-width", d => {
                    const baseWidth = Math.max(1, (d as any).width || 0);
                    // Contrainte : la largeur du lien ne peut pas dépasser la hauteur des nœuds
                    const s = (d as any).source as ChartNode;
                    const t = (d as any).target as ChartNode;
                    const sourceHeight = ((s?.y1 ?? 0) as number) - ((s?.y0 ?? 0) as number);
                    const targetHeight = ((t?.y1 ?? 0) as number) - ((t?.y0 ?? 0) as number);
                    const maxWidth = Math.min(sourceHeight, targetHeight) * 0.9;
                    return maxWidth > 0 ? Math.min(baseWidth, maxWidth) : baseWidth;
                })
                .attr("stroke", linkColor)
                .attr("fill", "none")
                .on("mouseover", (event, d) => {
                    showTooltip(event, `
                        <div class="sankey-tooltip-title">
                            ${(d as any).source?.name ?? ""} → ${(d as any).target?.name ?? ""}
                        </div>
                        <div class="sankey-tooltip-content">
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Source:</span>
                                <span class="sankey-tooltip-value">${(d as any).source?.name ?? ""}</span>
                            </div>
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Destination:</span>
                                <span class="sankey-tooltip-value">${(d as any).target?.name ?? ""}</span>
                            </div>
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Valeur:</span>
                                <span class="sankey-tooltip-value">${(d as any).value.toFixed(2)} ${unitOfMeasure}</span>
                            </div>
                        </div>
                    `);
                })
                .on("mouseout", hideTooltip);

            // Dessiner les nœuds
            const nodeGroup = svg.append("g")
                .selectAll("g")
                .data(sankeyNodes)
                .join("g")
                .attr("class", "sankey-node");

            nodeGroup.append("rect")
                .attr("x", d => d.x0!)
                .attr("y", d => d.y0!)
                .attr("height", d => Math.max(1, d.y1! - d.y0!))
                .attr("width", d => d.x1! - d.x0!)
                .attr("fill", d => (d as any).color || "#757575")
                .on("mouseover", (event, d) => {
                    showTooltip(event, `
                        <div class="sankey-tooltip-title">${d.name}</div>
                        <div class="sankey-tooltip-content">
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Niveau:</span>
                                <span class="sankey-tooltip-value">${(d as any).level ?? "-"}</span>
                            </div>
                            <div class="sankey-tooltip-row">
                                <span class="sankey-tooltip-label">Valeur:</span>
                                <span class="sankey-tooltip-value">${d.value.toFixed(2)} ${unitOfMeasure}</span>
                            </div>
                        </div>
                    `);
                })
                .on("mouseout", hideTooltip)
                .on("click", (event, d) => onNodeClick(d as unknown as VisualNode));

            // Labels
            nodeGroup.append("text")
                .attr("class", "sankey-label")
                .attr("x", d => d.x0! < width / 2 ? d.x1! + 6 : d.x0! - 6)
                .attr("y", d => (d.y0! + d.y1!) / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", d => d.x0! < width / 2 ? "start" : "end")
                .text(d => showValues ? `${d.name} (${d.value.toFixed(2)} ${unitOfMeasure})` : `${d.name}`);

        } catch (error) {
            console.error("[DEBUG] Error rendering Sankey diagram:", error);
        }
    }, [nodes, links, width, height, margin.top, margin.right, margin.bottom, margin.left, onNodeClick, unitOfMeasure, linkColor, showValues]);

    return (
        <div className="sankey-chart" style={{ position: "relative" }}>
            <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
            <div 
                ref={tooltipRef} 
                className="sankey-tooltip" 
                style={{ 
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none"
                }} 
            />
        </div>
    );
}; 

export default SankeyChart;