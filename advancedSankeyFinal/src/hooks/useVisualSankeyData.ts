import { useCallback, useMemo, useState } from "react";
import { AdvancedSankeyV2ContainerProps } from "../../typings/AdvancedSankeyV2Props";
import { VisualDataAdapter, VisualSankeyData } from "../utils/visualDataAdapter";
import { ValueStatus } from "mendix";

/**
 * Hook pour récupérer les données visuelles du Sankey
 * PRESERVE exactement la même interface que l'ancien hook pour les composants visuels
 * Utilise le nouveau système EnergyFlowNode en arrière-plan
 */
export function useVisualSankeyData(props: AdvancedSankeyV2ContainerProps): VisualSankeyData {
    
    return useMemo(() => {
        // Utilise l'adaptateur pour transformer EnergyFlowNode vers format visuel
        return VisualDataAdapter.transformToVisualFormat(props);
        
    }, [
        props.energyFlowDataSource,
        props.energyType,
        props.metricType,
        // Dépendances pour recalcul si changement
        props.energyFlowDataSource?.status,
        props.energyFlowDataSource?.items?.length
    ]);
}

/**
 * Hook de navigation : breadcrumb + filtrage des données affichées selon la racine sélectionnée
 */
export function useNavigationState(visualData: VisualSankeyData) {
    const [currentRootId, setCurrentRootId] = useState<string | null>(null);

    const idToNode = useMemo(() => {
        const map = new Map<string, any>();
        visualData.nodes.forEach(n => map.set(n.id, n));
        return map;
    }, [visualData.nodes]);

    // Construit les noms source/target pour chaque lien
    const normalizedLinks = useMemo(() => {
        return visualData.links.map(l => {
            const sourceName = (l as any).sourceName ?? visualData.nodes[(l.source as number)]?.name;
            const targetName = (l as any).targetName ?? visualData.nodes[(l.target as number)]?.name;
            return { ...l, sourceName, targetName } as any;
        });
    }, [visualData.links, visualData.nodes]);

    // Graphe d'adjacence pour exploration descendants et parents
    const adjacency = useMemo(() => {
        const children = new Map<string, Set<string>>();
        const parents = new Map<string, Set<string>>();
        for (const l of normalizedLinks) {
            const s = l.sourceName as string;
            const t = l.targetName as string;
            if (!children.has(s)) children.set(s, new Set());
            if (!parents.has(t)) parents.set(t, new Set());
            children.get(s)!.add(t);
            parents.get(t)!.add(s);
        }
        return { children, parents };
    }, [normalizedLinks]);

    // Calcule les breadcrumbs (chemin parent principal -> racine courante)
    const breadcrumbs = useMemo(() => {
        if (!currentRootId) return [] as Array<{ id: string; name: string; level: number; isCurrent: boolean; isRoot: boolean }>;
        const path: string[] = [currentRootId];
        // remonte en choisissant le parent ayant le lien entrant le plus fort
        let cursor = currentRootId;
        // Évite boucles infinies (graphes cycliques improbables ici)
        for (let i = 0; i < 10; i++) {
            const parentSet = adjacency.parents.get(cursor);
            if (!parentSet || parentSet.size === 0) break;
            // Trouver le parent dominant par valeur
            let bestParent: string | null = null;
            let bestVal = -Infinity;
            for (const p of parentSet) {
                const linkVal = normalizedLinks
                    .filter(l => l.sourceName === p && l.targetName === cursor)
                    .reduce((s, l) => s + (l.value || 0), 0);
                if (linkVal > bestVal) {
                    bestVal = linkVal;
                    bestParent = p;
                }
            }
            if (!bestParent) break;
            path.unshift(bestParent);
            cursor = bestParent;
        }
        return path.map((id, idx) => ({
            id,
            name: idToNode.get(id)?.name ?? id,
            level: idToNode.get(id)?.level ?? idx,
            isCurrent: idx === path.length - 1,
            isRoot: idx === 0
        }));
    }, [currentRootId, adjacency.parents, normalizedLinks, idToNode]);

    // Nœuds/liens affichés selon la racine courante
    const { displayNodes, displayLinks } = useMemo(() => {
        if (!currentRootId) {
            return { displayNodes: visualData.nodes, displayLinks: visualData.links };
        }
        // BFS descendants à partir de currentRootId
        const toVisit: string[] = [currentRootId];
        const visited = new Set<string>([currentRootId]);
        while (toVisit.length > 0) {
            const n = toVisit.shift()!;
            const childSet = adjacency.children.get(n) ?? new Set<string>();
            for (const c of childSet) {
                if (!visited.has(c)) {
                    visited.add(c);
                    toVisit.push(c);
                }
            }
        }
        const displayNodes = visualData.nodes.filter(n => visited.has(n.id));
        const allowed = new Set(displayNodes.map(n => n.name));
        const displayLinks = normalizedLinks.filter(l => allowed.has(l.sourceName) && allowed.has(l.targetName));
        return { displayNodes, displayLinks };
    }, [currentRootId, visualData.nodes, visualData.links, adjacency.children, normalizedLinks]);

    const navigateToNode = useCallback((nodeId: string) => {
        setCurrentRootId(nodeId);
    }, []);

    const goBack = useCallback(() => {
        if (breadcrumbs.length <= 1) {
            setCurrentRootId(null);
            return;
        }
        const parent = breadcrumbs[breadcrumbs.length - 2];
        setCurrentRootId(parent.id);
    }, [breadcrumbs]);

    const goToLevel = useCallback((levelIndex: number) => {
        if (levelIndex < 0 || levelIndex >= breadcrumbs.length) return;
        const item = breadcrumbs[levelIndex];
        setCurrentRootId(item.id);
    }, [breadcrumbs]);

    const currentLevel = useMemo(() => {
        if (!currentRootId) return 0;
        return idToNode.get(currentRootId)?.level ?? 0;
    }, [currentRootId, idToNode]);

    return {
        currentRootId,
        currentLevel,
        breadcrumbs,
        canGoBack: breadcrumbs.length > 1,
        goBack,
        goToLevel,
        navigateToNode,
        displayNodes,
        displayLinks
    };
}

/**
 * Hook pour la gestion des interactions (clic, hover, sélection)
 * PRESERVE exactement les mêmes interactions que l'ancien système
 */
export function useNodeInteractions(props: AdvancedSankeyV2ContainerProps) {
    
    const handleNodeClick = (nodeId: string) => {
        // Mise à jour de l'attribut cliqué si défini (préserve l'ancien comportement)
        if (props.clickedNodeAttribute && props.clickedNodeAttribute.status === "available") {
            props.clickedNodeAttribute.setValue(nodeId);
        }
        
        // Exécution de l'action si définie (préserve l'ancien comportement)  
        if (props.onNodeClick && props.onNodeClick.canExecute) {
            props.onNodeClick.execute();
        }
        
        console.log(`Node clicked: ${nodeId}`);
    };
    
    const handleLinkClick = (linkData: any) => {
        console.log(`Link clicked:`, linkData);
    };
    
    const handleNodeHover = (nodeId: string | null) => {
        // Gestion du hover pour les tooltips
        console.log(`Node hover: ${nodeId}`);
    };
    
    return {
        handleNodeClick,
        handleLinkClick, 
        handleNodeHover
    };
}