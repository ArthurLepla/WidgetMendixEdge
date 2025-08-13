import { useCallback, useEffect, useMemo, useState } from "react";
import { AdvancedSankeyV2ContainerProps } from "../../typings/AdvancedSankeyV2Props";
import { VisualDataAdapter, VisualSankeyData } from "../utils/visualDataAdapter";
import { ValueStatus } from "mendix";

/**
 * Hook pour récupérer les données visuelles du Sankey
 * PRESERVE exactement la même interface que l'ancien hook pour les composants visuels
 * Utilise le nouveau système EnergyFlowNode en arrière-plan
 */
export function useVisualSankeyData(props: AdvancedSankeyV2ContainerProps): VisualSankeyData & { allLinks: any[] } {
    
    return useMemo(() => {
        // Utilise l'adaptateur pour transformer EnergyFlowNode vers format visuel
        const visualData = VisualDataAdapter.transformToVisualFormat(props);
        
        // Récupérer TOUS les liens originaux pour la détection des enfants
        const allOriginalLinks = VisualDataAdapter.getAllOriginalLinks(props);
        
        return {
            ...visualData,
            allLinks: allOriginalLinks
        };
        
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
export function useNavigationState(visualData: VisualSankeyData & { allLinks: any[] }) {
    const [currentRootId, setCurrentRootId] = useState<string | null>(null);

    const idToNode = useMemo(() => {
        const map = new Map<string, any>();
        visualData.nodes.forEach(n => map.set(n.id, n));
        return map;
    }, [visualData.nodes]);

    // Initialisation: si une racine réelle unique existe, démarrer dessus (évite le breadcrumb "Vue d'ensemble")
    useEffect(() => {
        if (currentRootId !== null) return;
        if (!visualData.nodes || visualData.nodes.length === 0) return;
        const roots = visualData.nodes.filter(n => n.level === 0);
        if (roots.length === 1) {
            setCurrentRootId(roots[0].id);
            return;
        }
        const apRoot = roots.find(r => r.name === "ALIMENTATION PRINCIPALE" || r.id === "ALIMENTATION PRINCIPALE");
        if (apRoot) {
            setCurrentRootId(apRoot.id);
        }
    }, [visualData.nodes, currentRootId]);

    // Construit les noms source/target pour chaque lien - UTILISE TOUS LES LIENS
    const normalizedLinks = useMemo(() => {
        // Utiliser allLinks pour l'adjacence (tous les liens) au lieu de visualData.links (filtrés)
        return visualData.allLinks || [];
    }, [visualData.allLinks]);
    
    // Liens filtrés pour l'affichage seulement 
    const displayNormalizedLinks = useMemo(() => {
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
        
        console.log(`[Adjacency] Building adjacency from ${normalizedLinks.length} links`);
        
        for (const l of normalizedLinks) {
            const s = l.sourceName as string;
            const t = l.targetName as string;
            
            if (!s || !t) {
                console.warn(`[Adjacency] Invalid link: ${s} -> ${t}`);
                continue;
            }
            
            if (!children.has(s)) children.set(s, new Set());
            if (!parents.has(t)) parents.set(t, new Set());
            children.get(s)!.add(t);
            parents.get(t)!.add(s);
        }
        
        console.log(`[Adjacency] Built adjacency:`, {
            childrenCount: children.size,
            parentsCount: parents.size,
            childrenEntries: Array.from(children.entries()).map(([k, v]) => [k, Array.from(v)])
        });
        
        return { children, parents };
    }, [normalizedLinks]);

    // Calcule les breadcrumbs (chemin parent principal -> racine courante)
    const breadcrumbs = useMemo(() => {
        // Vue initiale: afficher uniquement "Vue d'ensemble"
        if (!currentRootId) {
            return [{
                id: "home",
                name: "Vue d'ensemble",
                level: 0,
                isCurrent: true,
                isRoot: true
            }] as Array<{ id: string; name: string; level: number; isCurrent: boolean; isRoot: boolean }>;
        }

        // Construit le chemin depuis la racine réelle jusqu'au nœud courant
        const path: string[] = [currentRootId];
        let cursor = currentRootId;
        for (let i = 0; i < 10; i++) {
            const parentSet = adjacency.parents.get(cursor);
            if (!parentSet || parentSet.size === 0) break;
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

        // Règle UX: éviter la redondance "Vue d'ensemble" + "ALIMENTATION PRINCIPALE"
        // Si le premier élément du chemin est un nœud de niveau 0 (racine réelle), on omet le crumb "home".
        const firstId = path[0];
        const firstNode = idToNode.get(firstId);
        const isRealRoot = !!firstNode && (firstNode.level === 0 || firstNode.name === "ALIMENTATION PRINCIPALE");

        const fullPath = isRealRoot ? path : ["home", ...path];

        return fullPath.map((id, idx) => ({
            id,
            name: id === "home" ? "Vue d'ensemble" : (idToNode.get(id)?.name ?? id),
            level: id === "home" ? 0 : (idToNode.get(id)?.level ?? idx),
            isCurrent: idx === fullPath.length - 1,
            isRoot: idx === 0
        }));
    }, [currentRootId, adjacency.parents, normalizedLinks, idToNode]);

    // Nœuds/liens affichés selon la racine courante
    const { displayNodes, displayLinks } = useMemo(() => {
        if (!currentRootId) {
            return { displayNodes: visualData.nodes, displayLinks: visualData.links };
        }
        
        // Vérifier que le nœud racine existe
        const rootNode = idToNode.get(currentRootId);
        if (!rootNode) {
            console.error(`Root node ${currentRootId} not found, falling back to all nodes`);
            return { displayNodes: visualData.nodes, displayLinks: visualData.links };
        }
        
        // Navigation drill-down : afficher SEULEMENT le nœud sélectionné + ses enfants directs
        const directChildren = adjacency.children.get(currentRootId) ?? new Set<string>();
        const nodesToShow = new Set<string>([currentRootId]);
        
        // Ajouter UNIQUEMENT les enfants directs (PAS le parent)
        for (const child of directChildren) {
            nodesToShow.add(child);
        }
        
        console.log(`[Navigation] Drill-down to ${currentRootId}: showing node + ${directChildren.size} children`);
        console.log(`[Navigation] Nodes to show:`, Array.from(nodesToShow));
        
        // Filtrer les nœuds existants
        let displayNodes = visualData.nodes.filter(n => nodesToShow.has(n.id));
        
        // 🚨 CORRECTION : Créer dynamiquement les nœuds enfants manquants
        const existingNodeNames = new Set(displayNodes.map(n => n.id));
        const missingChildren = Array.from(directChildren).filter(childName => !existingNodeNames.has(childName));
        
        if (missingChildren.length > 0) {
            console.log(`Creating ${missingChildren.length} missing child nodes:`, missingChildren);
            
            const missingNodes = missingChildren.map(childName => {
                // Calculer la valeur de l'enfant depuis les liens
                const childValue = normalizedLinks
                    .filter(l => l.targetName === childName)
                    .reduce((sum, l) => sum + (l.value || 0), 0);
                
                return {
                    id: childName,
                    name: childName,
                    value: childValue,
                    level: (idToNode.get(currentRootId)?.level || 0) + 1,
                    color: "#4CAF50" // Couleur par défaut pour enfants
                } as any;
            });
            
            displayNodes = [...displayNodes, ...missingNodes];
        }
        
        // S'assurer qu'on a au moins le nœud racine
        if (displayNodes.length === 0) {
            console.error(`No nodes found for root ${currentRootId}, falling back to root only`);
            return { 
                displayNodes: [rootNode], 
                displayLinks: [] 
            };
        }
        
        const allowed = new Set(displayNodes.map(n => n.name));
        console.log(`[Navigation] Looking for links between nodes:`, Array.from(allowed));
        console.log(`[Navigation] Available links pool:`, normalizedLinks.length);
        
        // 🚨 CORRECTION: Utiliser normalizedLinks (tous les liens) pour la sélection
        // mais n'afficher QUE les liens de valeur strictement positive pour éviter les NaN dans d3-sankey
        let filteredLinks = normalizedLinks.filter(l => 
            allowed.has(l.sourceName) && allowed.has(l.targetName) && (l.value || 0) >= 0
        );

        // Fallback: si aucune liaison positive n'est trouvée entre la racine et ses enfants
        // on crée des liens synthétiques avec la valeur agrégée des enfants (ou un epsilon)
        if (filteredLinks.length === 0 && (adjacency.children.get(currentRootId) ?? new Set<string>()).size > 0) {
            const epsilon = 1e-6;
            const childrenArr = Array.from(adjacency.children.get(currentRootId) ?? new Set<string>());
            filteredLinks = childrenArr.map(childName => {
                const childValue = normalizedLinks
                    .filter(l => l.targetName === childName)
                    .reduce((sum, l) => sum + (l.value || 0), 0);
                return {
                    sourceName: currentRootId,
                    targetName: childName,
                    value: Math.max(childValue, epsilon),
                    percentage: 0
                } as any;
            });
            console.warn(`[Navigation] No positive links found; creating ${filteredLinks.length} synthetic links from ${currentRootId}`);
        }
        
        console.log(`[Navigation] Found ${filteredLinks.length} matching links:`, 
            filteredLinks.map(l => `${l.sourceName} -> ${l.targetName} (${l.value})`)
        );
        
        // 🚨 CORRECTION CRITIQUE : Remapper les indices des liens aux nouveaux nœuds
        const nodeIndexMap = new Map<string, number>();
        displayNodes.forEach((node, index) => {
            nodeIndexMap.set(node.name, index);
        });
        
        const EPS_VISUAL = 1e-6;
        const displayLinks = filteredLinks.map(link => ({
            ...link,
            rawValue: link.value,
            value: Math.max(link.value || 0, EPS_VISUAL),
            source: nodeIndexMap.get(link.sourceName) ?? 0,
            target: nodeIndexMap.get(link.targetName) ?? 0
        }));
        
        console.log(`Navigation: ${displayNodes.length} nodes, ${displayLinks.length} links for root ${currentRootId}`);
        console.log(`Showing: parent + ${currentRootId} + ${directChildren.size} children`);
        console.log(`Node mapping:`, Array.from(nodeIndexMap.entries()));
        
        return { displayNodes, displayLinks };
    }, [currentRootId, visualData.nodes, visualData.links, adjacency.children, adjacency.parents, normalizedLinks, idToNode]);

    const goBack = useCallback(() => {
        if (breadcrumbs.length <= 1) {
            setCurrentRootId(null);
            return;
        }
        const parent = breadcrumbs[breadcrumbs.length - 2];
        if (parent.id === "home") {
            setCurrentRootId(null);
        } else {
            setCurrentRootId(parent.id);
        }
    }, [breadcrumbs]);

    const navigateToNode = useCallback((nodeId: string) => {
        console.log(`[Navigation] Attempting to navigate to: ${nodeId}`);
        
        // Vérifier si le nœud a des enfants avant de naviguer
        const node = idToNode.get(nodeId);
        const nodeChildren = adjacency.children.get(nodeId);
        
        console.log(`[Navigation] Node found: ${!!node}, Children: ${nodeChildren?.size || 0}`);
        console.log(`[Navigation] All available nodes:`, Array.from(idToNode.keys()));
        console.log(`[Navigation] All children mappings:`, Array.from(adjacency.children.entries()).map(([k, v]) => [k, Array.from(v)]));
        
        if (!node) {
            console.warn(`[Navigation] Node ${nodeId} not found`);
            return;
        }
        
        if (!nodeChildren || nodeChildren.size === 0) {
            console.log(`[Navigation] Node ${nodeId} has no children, skipping navigation`);
            return;
        }
        
        // Si on clique sur le même nœud que la racine actuelle, revenir en arrière
        if (currentRootId === nodeId) {
            console.log(`[Navigation] Clicking on current root ${nodeId}, going back`);
            goBack();
            return;
        }
        
        console.log(`[Navigation] Navigating to node ${nodeId} with ${nodeChildren.size} children`);
        setCurrentRootId(nodeId);
    }, [idToNode, adjacency.children, currentRootId, goBack]);

    const goToLevel = useCallback((levelIndex: number) => {
        if (levelIndex < 0 || levelIndex >= breadcrumbs.length) return;
        const item = breadcrumbs[levelIndex];
        // Si on clique sur "Vue d'ensemble", revenir à la vue globale
        if (item.id === "home") {
            setCurrentRootId(null);
        } else {
            setCurrentRootId(item.id);
        }
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
        // Clic normal: navigation uniquement (pas de stockage, pas d'action)
        if (props.onNodeClick && props.onNodeClick.canExecute) {
            // Si un ancien microflow est configuré pour le clic simple, on ne l'exécute plus par défaut.
            // Laisser vide pour respecter la règle navigation only.
        }
        console.log(`Node clicked (navigate only): ${nodeId}`);
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