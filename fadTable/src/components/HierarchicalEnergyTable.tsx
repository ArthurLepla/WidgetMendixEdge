import React from "react";
import { ReactElement, createElement, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Table,
    Card,
    Typography,
    Tag,
    Pagination,
    Row,
    Col,
    Input,
    Dropdown,
    Button,
    Tooltip,
    Space,
    MenuProps,
    Spin,
    Alert
} from "antd";
import {
    SearchOutlined,
    CloseOutlined,
    DownOutlined,
    RightOutlined,
    ExportOutlined,
    FileTextOutlined,
    FileExcelOutlined,
    PrinterOutlined,
    BarChartOutlined,
    DatabaseOutlined,
    ExpandOutlined,
    CompressOutlined,
    NodeExpandOutlined
} from "@ant-design/icons";
import { formatEnergy, calculateVariation, formatPercentage } from "../utils/dataFormatters";
import { EnergyData, Month } from "../types/energyData";
import { HierarchicalNode, useHierarchicalData } from "../hooks/useHierarchicalData";
import { FlexibleHierarchicalNode, FlexibleHierarchyConfig, generateLevelStyles } from "../types/hierarchyConfig";
import {
    exportHierarchicalFlatToCSV,
    printHierarchicalFlatTable,
    exportHierarchicalToXLSX
} from "../utils/hierarchicalExportUtils";
import { SelectedEnergyTypeEnum } from "../../typings/FadTableProps";

const { Text, Title } = Typography;

// Animation variants pour les expansions fluides
const iconRotateVariants = {
    collapsed: {
        rotate: 0
    },
    expanded: {
        rotate: 90
    }
};

interface HierarchicalEnergyTableProps {
    data: EnergyData[];
    months: Month[];
    isLoading: boolean;
    error: string | null;
    enableExport: boolean;
    showTotals: boolean;
    enableComparison: boolean;
    loadingStrategy: "loadAll" | "pagination" | "lazyLoad";
    pageSize: number;
    onSearchChange: (text: string) => void;
    totalFiltered: number;
    totalOriginal: number;
    selectedEnergyType: SelectedEnergyTypeEnum;
    // Nouvelles props pour la hiérarchie flexible
    flexibleHierarchy?: {
        hierarchyConfig: FlexibleHierarchyConfig;
        hierarchicalData: FlexibleHierarchicalNode[];
        expandedNodes: { [key: string]: boolean };
        toggleNodeExpansion: (nodeId: string) => void;
        expandAllNodes: () => void;
        collapseAllNodes: () => void;
        getFlattenedNodes: () => FlexibleHierarchicalNode[];
        getAllExpandedNodes: () => FlexibleHierarchicalNode[];
        expandNodesForSearch: (searchTerm: string) => void;
    };
    hierarchyConfig?: FlexibleHierarchyConfig;
}

export default function HierarchicalEnergyTable(props: HierarchicalEnergyTableProps): ReactElement {
    const {
        data,
        months,
        isLoading,
        error,
        enableExport,
        enableComparison,
        loadingStrategy,
        pageSize,
        onSearchChange,
        totalFiltered,
        totalOriginal,
        selectedEnergyType,
        flexibleHierarchy,
        hierarchyConfig
    } = props;

    // États
    const [searchValue, setSearchValue] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isAllExpanded, setIsAllExpanded] = useState<boolean>(false);
    const [animatingNodes, setAnimatingNodes] = useState<Set<string>>(new Set());

    // Utiliser soit le nouveau système flexible, soit l'ancien pour rétrocompatibilité
    const legacyHierarchy = useHierarchicalData(data, months);

    // Choisir le système à utiliser selon la configuration
    const useFlexible = flexibleHierarchy && hierarchyConfig;

    const {
        expandedNodes,
        toggleNodeExpansion,
        expandAllNodes,
        collapseAllNodes,
        getFlattenedNodes,
        getAllExpandedNodes,
        expandNodesForSearch
    } = useFlexible ? flexibleHierarchy : legacyHierarchy;

    // Obtenir la liste aplatie des nœuds selon leur état d'expansion
    const flattenedNodes = getFlattenedNodes();

    // Appliquer la pagination si nécessaire
    const displayNodes = (() => {
        if (loadingStrategy === "pagination") {
            const startIndex = (currentPage - 1) * pageSize;
            return flattenedNodes.slice(startIndex, startIndex + pageSize);
        }
        return flattenedNodes;
    })();

    // Nombre total de pages pour la pagination
    const totalPages = Math.ceil(flattenedNodes.length / pageSize);

    // Gestion de la recherche CORRIGÉE - maintenant elle filtre réellement ET déplie les résultats
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        onSearchChange(value); // Propager vers le hook de filtre parent

        // Déplier automatiquement les nœuds qui contiennent des résultats de recherche
        if (value && value.trim() !== "") {
            // Utiliser un petit délai pour que le filtrage soit appliqué d'abord
            setTimeout(() => {
                expandNodesForSearch(value);
            }, 100);
        }
    };

    // Fonction pour basculer entre développer tout et réduire tout
    const handleToggleExpansion = () => {
        if (isAllExpanded) {
            collapseAllNodes();
            setIsAllExpanded(false);
        } else {
            expandAllNodes();
            setIsAllExpanded(true);
        }
    };

    // Gestion des actions d'exportation MODIFIÉE pour exporter TOUS les nœuds
    const handleExport = (format: "csv" | "excel" | "print") => {
        // Adapter pour la hiérarchie flexible ou legacy
        const nodesToExport = useFlexible ? getAllExpandedNodes() : getAllExpandedNodes(); // Même fonction mais types différents
        const energyType = selectedEnergyType;

        switch (format) {
            case "csv":
                exportHierarchicalFlatToCSV(nodesToExport as any, months, energyType);
                break;
            case "excel":
                exportHierarchicalToXLSX(nodesToExport as any, months, energyType, "export_hierarchique.xlsx");
                break;
            case "print":
                printHierarchicalFlatTable(nodesToExport as any, months, energyType);
                break;
        }
    };

    // Réinitialiser la pagination lors des changements de filtres
    useEffect(() => {
        setCurrentPage(1);
    }, [totalFiltered]);

    // SUPPRIMÉ : Synchronisation automatique qui causait des changements d'état non désirés
    // Le bouton "Tout développer/Tout réduire" ne changera d'état que lors du clic direct

    // Menu items pour l'export
    const exportMenuItems: MenuProps["items"] = [
        {
            key: "csv",
            label: (
                <Space>
                    <FileTextOutlined style={{ color: "#22c55e" }} />
                    <div>
                        <div style={{ fontWeight: 600 }}>Format CSV</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Données tabulaires compatibles</div>
                    </div>
                </Space>
            ),
            onClick: () => handleExport("csv")
        },
        {
            key: "excel",
            label: (
                <Space>
                    <FileExcelOutlined style={{ color: "#059669" }} />
                    <div>
                        <div style={{ fontWeight: 600 }}>Excel (.xlsx)</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Feuille de calcul avec formatage</div>
                    </div>
                </Space>
            ),
            onClick: () => handleExport("excel")
        },
        {
            type: "divider"
        },
        {
            key: "print",
            label: (
                <Space>
                    <PrinterOutlined style={{ color: "#6366f1" }} />
                    <div>
                        <div style={{ fontWeight: 600 }}>Impression</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Aperçu et impression directe</div>
                    </div>
                </Space>
            ),
            onClick: () => handleExport("print")
        }
    ];

    // Fonction pour obtenir l'indentation selon le niveau hiérarchique
    const getIndentation = (level: number) => {
        return { paddingLeft: `${level * 16 + 6}px` };
    };

    // Fonction pour obtenir le style d'une ligne selon le type/niveau
    const getRowClassName = (record: any) => {
        if (useFlexible && hierarchyConfig) {
            // Mode flexible : utiliser levelId
            const node = record as FlexibleHierarchicalNode;
            if (node.levelId === "leaf") {
                return "hierarchy-leaf-node";
            }
            return `hierarchy-level-${node.levelIndex + 1}`;
        } else {
            // Mode legacy : utiliser type
            const node = record as HierarchicalNode;
            switch (node.type) {
                case "secteur":
                    return "secteur-row";
                case "atelier":
                    return "atelier-row";
                default:
                    return "machine-row";
            }
        }
    };

    // Fonction pour obtenir les couleurs selon le type/niveau
    const getNodeColor = (record: any) => {
        if (useFlexible && hierarchyConfig) {
            const node = record as FlexibleHierarchicalNode;
            if (node.levelId === "leaf") {
                return "#475569";
            }
            const levelConfig = hierarchyConfig.levels.find(l => l.id === node.levelId);
            return levelConfig?.color || "#64748b";
        } else {
            const node = record as HierarchicalNode;
            return node.type === "secteur" ? "#1e293b" : node.type === "atelier" ? "#334155" : "#475569";
        }
    };

    // Configuration des colonnes du tableau
    const tableColumns = [
        {
            title: "Nom",
            dataIndex: "name",
            key: "name",
            width: 200,
            render: (_: any, record: any) => {
                // DEBUGGING APPROFONDI - Traquer l'origine du [object Object]
                console.group(`[DEBUG RENDER] Node ID: ${record.id}`);
                console.log('Record complet:', record);
                console.log('record.name type:', typeof record.name);
                console.log('record.name value:', record.name);
                
                if (typeof record.name === 'object' && record.name !== null) {
                    console.error('PROBLÈME DÉTECTÉ - record.name est un objet:', {
                        name: record.name,
                        keys: Object.keys(record.name),
                        stringValue: record.name?.toString(),
                        json: JSON.stringify(record.name),
                        valueOf: record.name?.valueOf ? record.name.valueOf() : 'no valueOf',
                        constructor: record.name?.constructor?.name
                    });
                    
                    // Vérifier si c'est un objet Mendix
                    if (record.name?.get && typeof record.name.get === 'function') {
                        console.log('Objet Mendix détecté, tentative get():', record.name.get());
                    }
                    
                    // Vérifier d'autres propriétés communes
                    if (record.name?.value !== undefined) {
                        console.log('Propriété value trouvée:', record.name.value);
                    }
                    if (record.name?.displayValue !== undefined) {
                        console.log('Propriété displayValue trouvée:', record.name.displayValue);
                    }
                }
                
                console.groupEnd();
                
                const hasChildren = record.children && record.children.length > 0;
                const level = useFlexible
                    ? (record as FlexibleHierarchicalNode).levelIndex
                    : (record as HierarchicalNode).level;
                const isLeaf = useFlexible
                    ? (record as FlexibleHierarchicalNode).levelId === "leaf"
                    : (record as HierarchicalNode).type === "machine";

                // Fonction améliorée pour extraire le nom
                const extractName = (nameValue: any): string => {
                    if (nameValue === null || nameValue === undefined) {
                        return 'Nom non défini';
                    }
                    
                    if (typeof nameValue === 'string') {
                        return nameValue;
                    }
                    
                    if (typeof nameValue === 'number') {
                        return nameValue.toString();
                    }
                    
                    if (typeof nameValue === 'object') {
                        // Cas spécial pour les objets Mendix
                        if (nameValue.get && typeof nameValue.get === 'function') {
                            try {
                                const mendixValue = nameValue.get();
                                console.log(`[DEBUG] Valeur Mendix extraite: ${mendixValue}`);
                                return mendixValue || 'Valeur Mendix vide';
                            } catch (e) {
                                console.error('Erreur lors de l\'extraction Mendix:', e);
                                return 'Erreur Mendix';
                            }
                        }
                        
                        // Autres propriétés possibles
                        if (nameValue.value !== undefined) {
                            return String(nameValue.value);
                        }
                        if (nameValue.displayValue !== undefined) {
                            return String(nameValue.displayValue);
                        }
                        if (nameValue.name !== undefined) {
                            return String(nameValue.name);
                        }
                        
                        // Dernier recours
                        const stringified = JSON.stringify(nameValue);
                        if (stringified && stringified !== '{}') {
                            return `Objet: ${stringified}`;
                        }
                        
                        return 'Objet non résolu';
                    }
                    
                    return String(nameValue);
                };

                const displayName = extractName(record.name);
                console.log(`[DEBUG] Nom final affiché: "${displayName}"`);

                return (
                    <motion.div 
                        style={getIndentation(level)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
                        }}
                    >
                        <Space size="small">
                            {hasChildren ? (
                                <motion.div 
                                    whileHover={{ 
                                        scale: 1.15,
                                        transition: { duration: 0.2, ease: "easeOut" }
                                    }} 
                                    whileTap={{ 
                                        scale: 0.9,
                                        transition: { duration: 0.1, ease: "easeIn" }
                                    }}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={
                                            <motion.div
                                                variants={iconRotateVariants}
                                                animate={expandedNodes[record.id] ? "expanded" : "collapsed"}
                                                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                            >
                                                <RightOutlined />
                                            </motion.div>
                                        }
                                                                                 onClick={() => {
                                             // Animation fluide avec feedback visuel
                                             setAnimatingNodes(prev => new Set(prev).add(record.id));
                                             
                                             // Délai léger pour permettre l'animation du bouton
                                             setTimeout(() => {
                                                 toggleNodeExpansion(record.id);
                                                 setTimeout(() => {
                                                     setAnimatingNodes(prev => {
                                                         const newSet = new Set(prev);
                                                         newSet.delete(record.id);
                                                         return newSet;
                                                     });
                                                 }, 300);
                                             }, 50);
                                         }}
                                        style={{
                                            color: expandedNodes[record.id] ? "#38a13c" : "#64748b",
                                            border: "none",
                                            borderRadius: "8px",
                                            transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                            backgroundColor: expandedNodes[record.id] ? "rgba(56, 161, 60, 0.1)" : "transparent"
                                        }}
                                    />
                                </motion.div>
                            ) : (
                                <div style={{ width: "22px" }} />
                            )}
                            <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: 0.1,
                                    ease: "easeOut"
                                }}
                            >
                                <Text
                                    strong={!isLeaf}
                                    style={{
                                        color: getNodeColor(record),
                                        transition: "color 0.3s ease"
                                    }}
                                >
                                    {displayName}
                                </Text>
                            </motion.div>
                        </Space>
                    </motion.div>
                );
            }
        },
        ...months.map(month => ({
            title: month.name.substring(0, 3),
            dataIndex: ["monthlyTotals", month.id],
            key: month.id,
            width: 90,
            align: "right" as const,
            render: (_: any, record: any) => {
                const currentValue = record.monthlyTotals[month.id] || 0;
                const previousValue =
                    enableComparison && record.previousMonthlyTotals ? record.previousMonthlyTotals[month.id] || 0 : 0;
                const hasComparison = enableComparison && record.previousMonthlyTotals !== undefined;
                const variation = hasComparison ? calculateVariation(currentValue, previousValue) : 0;

                return (
                    <div style={{ textAlign: "right" }}>
                        <Text style={{ fontSize: "14px" }}>{formatEnergy(currentValue, selectedEnergyType)}</Text>
                        {hasComparison && (
                            <div>
                                <Text type={variation >= 0 ? "danger" : "success"} style={{ fontSize: "12px" }}>
                                    ({formatEnergy(previousValue, selectedEnergyType)}, {variation >= 0 ? "+" : ""}
                                    {formatPercentage(variation, 1)})
                                </Text>
                            </div>
                        )}
                    </div>
                );
            }
        })),
        {
            title: "Total",
            dataIndex: "yearTotal",
            key: "yearTotal",
            width: 120,
            align: "right" as const,
            render: (_: any, record: any) => (
                <Tooltip
                    title={
                        <div>
                            <div>Total annuel : {formatEnergy(record.yearTotal, selectedEnergyType)}</div>
                            {enableComparison &&
                                record.previousYearTotal !== undefined &&
                                record.previousYearTotal > 0 && (
                                    <div>
                                        Année précédente : {formatEnergy(record.previousYearTotal, selectedEnergyType)}
                                        <br />
                                        Variation :{" "}
                                        {((record.yearTotal - record.previousYearTotal) / record.previousYearTotal) *
                                            100 >
                                        0
                                            ? "+"
                                            : ""}
                                        {(
                                            ((record.yearTotal - record.previousYearTotal) / record.previousYearTotal) *
                                            100
                                        ).toFixed(1)}
                                        %
                                    </div>
                                )}
                        </div>
                    }
                >
                    <div style={{ textAlign: "right" }}>
                        <Text strong style={{ fontSize: "14px" }}>
                            {formatEnergy(record.yearTotal, selectedEnergyType)}
                        </Text>

                        {enableComparison && record.previousYearTotal !== undefined && record.previousYearTotal > 0 && (
                            <Tag
                                color={record.yearTotal > record.previousYearTotal ? "red" : "green"}
                                style={{ marginLeft: "8px", fontSize: "11px" }}
                            >
                                {((record.yearTotal - record.previousYearTotal) / record.previousYearTotal) * 100 > 0
                                    ? "+"
                                    : ""}
                                {(
                                    ((record.yearTotal - record.previousYearTotal) / record.previousYearTotal) *
                                    100
                                ).toFixed(1)}
                                %
                            </Tag>
                        )}
                    </div>
                </Tooltip>
            )
        }
    ];

    // États de chargement, erreur, données vides INITIAUX seulement
    if (isLoading) {
        return (
            <Card style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
                <div style={{ marginTop: "16px" }}>
                    <Text>Chargement des données...</Text>
                </div>
            </Card>
        );
    }

    if (error) {
        return <Alert message="Erreur" description={error} type="error" style={{ margin: "20px 0" }} />;
    }

    // Vérifier seulement si vraiment aucune donnée initiale (pas de filtrage)
    if (!data || data.length === 0) {
        return (
            <Alert
                message="Aucune donnée disponible"
                description="Aucune donnée n'est disponible pour l'affichage."
                type="info"
                style={{ margin: "20px 0" }}
            />
        );
    }

    // Générer les styles CSS dynamiques pour la hiérarchie flexible
    const dynamicStyles = useFlexible && hierarchyConfig ? generateLevelStyles(hierarchyConfig) : "";

    return (
        <div
            style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                minHeight: "100vh",
                padding: "16px",
                width: "100%",
                maxWidth: "100vw",
                overflow: "hidden"
            }}
        >
            {/* Professional Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ marginBottom: "20px" }}
            >
                <Card
                    style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                        border: "1px solid rgba(148, 163, 184, 0.1)",
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)"
                    }}
                >
                    <Row gutter={[16, 16]} align="middle" justify="space-between">
                        {/* Brand Section */}
                        <Col flex="auto">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <Space size="middle" align="center">
                                    <motion.div
                                        whileHover={{
                                            scale: 1.1,
                                            rotate: [0, -5, 5, 0],
                                            transition: { duration: 0.3 }
                                        }}
                                        style={{
                                            background: "linear-gradient(135deg, #38a13c, #22c55e)",
                                            borderRadius: "12px",
                                            padding: "10px",
                                            boxShadow: "0 6px 24px rgba(56, 161, 60, 0.25)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <BarChartOutlined style={{ fontSize: "28px", color: "white" }} />
                                    </motion.div>

                                    <div>
                                        <Title
                                            level={3}
                                            style={{
                                                background: "linear-gradient(135deg, #18213e, #475569)",
                                                backgroundClip: "text",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                margin: 0,
                                                marginBottom: "6px",
                                                lineHeight: 1.2
                                            }}
                                        >
                                            Dashboard Énergétique
                                        </Title>
                                        <Space size="small" wrap>
                                            <Tag color="green" icon={<DatabaseOutlined />} style={{ fontWeight: 500 }}>
                                                {totalOriginal} éléments
                                            </Tag>
                                            <Tag color="blue" style={{ fontWeight: 500 }}>
                                                {selectedEnergyType}
                                            </Tag>
                                            {useFlexible && hierarchyConfig && (
                                                <Tag color="purple" style={{ fontWeight: 500 }}>
                                                    {hierarchyConfig.levels.length} niveaux
                                                </Tag>
                                            )}
                                            {totalFiltered < totalOriginal && (
                                                <Tag color="orange" style={{ fontWeight: 500 }}>
                                                    {totalFiltered} filtrés
                                                </Tag>
                                            )}
                                        </Space>
                                    </div>
                                </Space>
                            </motion.div>
                        </Col>

                        {/* Search Section */}
                        <Col flex="280px">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <Input
                                    placeholder={`Rechercher ${
                                        useFlexible && hierarchyConfig
                                            ? hierarchyConfig.levels.map(l => l.name).join(", ") +
                                              ", " +
                                              hierarchyConfig.leafNodeName
                                            : "secteur, atelier, machine"
                                    }...`}
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    prefix={<SearchOutlined style={{ color: "#64748b" }} />}
                                    suffix={
                                        <AnimatePresence mode="wait">
                                            {searchValue && (
                                                <motion.div
                                                    key="clear"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<CloseOutlined />}
                                                        onClick={() => {
                                                            setSearchValue("");
                                                            onSearchChange("");
                                                        }}
                                                        style={{
                                                            border: "none",
                                                            boxShadow: "none",
                                                            color: "#64748b"
                                                        }}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    }
                                    size="large"
                                    style={{
                                        borderRadius: "12px",
                                        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)"
                                    }}
                                />
                            </motion.div>
                        </Col>

                        {/* Actions Section - Controls intégrés de manière compacte */}
                        <Col>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                <Space size="middle" align="center">
                                    {/* Navigation Hiérarchique - Version compacte */}
                                    <motion.div
                                        whileHover={{
                                            scale: 1.05,
                                            y: -2,
                                            transition: {
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 25,
                                                duration: 0.2
                                            }
                                        }}
                                        whileTap={{
                                            scale: 0.95,
                                            transition: {
                                                type: "spring",
                                                stiffness: 600,
                                                damping: 15,
                                                duration: 0.1
                                            }
                                        }}
                                    >
                                        <Tooltip 
                                            title={
                                                <div>
                                                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                                                        Navigation Hiérarchique
                                                    </div>
                                                    <div style={{ fontSize: "12px", opacity: 0.8 }}>
                                                        {isAllExpanded ? "Réduire tous les niveaux" : "Développer tous les niveaux"}
                                                    </div>
                                                </div>
                                            }
                                            placement="bottom"
                                        >
                                            <Button
                                                type={isAllExpanded ? "default" : "primary"}
                                                icon={
                                                    <AnimatePresence mode="wait">
                                                        <motion.div
                                                            key={isAllExpanded ? "compress" : "expand"}
                                                            initial={{
                                                                scale: 0.8,
                                                                rotate: -45,
                                                                opacity: 0
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                                rotate: 0,
                                                                opacity: 1
                                                            }}
                                                            exit={{
                                                                scale: 0.8,
                                                                rotate: 45,
                                                                opacity: 0
                                                            }}
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 300,
                                                                damping: 20,
                                                                duration: 0.3
                                                            }}
                                                        >
                                                            {isAllExpanded ? (
                                                                <CompressOutlined />
                                                            ) : (
                                                                <ExpandOutlined />
                                                            )}
                                                        </motion.div>
                                                    </AnimatePresence>
                                                }
                                                onClick={handleToggleExpansion}
                                                disabled={isLoading}
                                                size="large"
                                                style={{
                                                    fontWeight: 600,
                                                    borderRadius: "12px",
                                                    background: isAllExpanded 
                                                        ? "linear-gradient(135deg, #ffffff, #f8fafc)" 
                                                        : "linear-gradient(135deg, #38a13c, #22c55e)",
                                                    border: isAllExpanded ? "2px solid #e2e8f0" : "none",
                                                    color: isAllExpanded ? "#475569" : "white",
                                                    boxShadow: isAllExpanded
                                                        ? "0 2px 8px rgba(0, 0, 0, 0.06)"
                                                        : "0 4px 16px rgba(56, 161, 60, 0.3)",
                                                    minWidth: "48px",
                                                    height: "48px",
                                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                                }}
                                            />
                                        </Tooltip>
                                    </motion.div>

                                    {/* Export Menu - Version compacte */}
                                    {enableExport && (
                                        <motion.div
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        >
                                            <Dropdown
                                                menu={{ items: exportMenuItems }}
                                                placement="bottomRight"
                                                trigger={["click"]}
                                            >
                                                <Tooltip title="Exporter les données" placement="bottom">
                                                    <Button
                                                        type="primary"
                                                        icon={<ExportOutlined />}
                                                        size="large"
                                                        style={{
                                                            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                                            border: "none",
                                                            fontWeight: 600,
                                                            borderRadius: "12px",
                                                            boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                                                            minWidth: "48px",
                                                            height: "48px",
                                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                                        }}
                                                    />
                                                </Tooltip>
                                            </Dropdown>
                                        </motion.div>
                                    )}
                                </Space>
                            </motion.div>
                        </Col>
                    </Row>
                </Card>
            </motion.div>



            {/* Professional Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                <Card
                    style={{
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)"
                    }}
                >
                    {/* Vérifier si aucun résultat après filtrage/recherche */}
                    {displayNodes.length === 0 ? (
                        <div style={{ 
                            textAlign: "center", 
                            padding: "60px 40px",
                            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                            borderRadius: "12px",
                            margin: "20px"
                        }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <SearchOutlined 
                                    style={{ 
                                        fontSize: "48px", 
                                        color: "#94a3b8",
                                        marginBottom: "16px"
                                    }} 
                                />
                                <Title level={4} style={{ color: "#64748b", marginBottom: "8px" }}>
                                    Aucun résultat trouvé
                                </Title>
                                <Text style={{ color: "#94a3b8", fontSize: "16px", display: "block", marginBottom: "16px" }}>
                                    {searchValue 
                                        ? `Aucun élément ne correspond à votre recherche "${searchValue}"`
                                        : "Aucune donnée ne correspond aux filtres appliqués"
                                    }
                                </Text>
                                <Text style={{ color: "#cbd5e1", fontSize: "14px" }}>
                                    Essayez de modifier votre recherche ou de réinitialiser les filtres
                                </Text>
                            </motion.div>
                        </div>
                    ) : (
                        <Table
                            columns={tableColumns}
                            dataSource={displayNodes}
                            rowKey="id"
                            pagination={false}
                            size="middle"
                            scroll={{ x: "max-content" }}
                            style={{ fontSize: "14px" }}
                            expandable={{
                                showExpandColumn: false,
                                expandIcon: () => null
                            }}
                            rowClassName={getRowClassName}
                        />
                    )}

                    {/* Pagination si nécessaire */}
                    {loadingStrategy === "pagination" && totalPages > 1 && displayNodes.length > 0 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                padding: "20px",
                                borderTop: "1px solid #f0f0f0"
                            }}
                        >
                            <Pagination
                                current={currentPage}
                                total={flattenedNodes.length}
                                pageSize={pageSize}
                                onChange={setCurrentPage}
                                showSizeChanger={false}
                                showQuickJumper
                                showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} éléments`}
                            />
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Custom Styles */}
            <style>{`
                .secteur-row {
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
                    font-weight: bold;
                    border-left: 4px solid #38a13c;
                }
                .atelier-row {
                    background: linear-gradient(135deg, #fefefe, #f8fafc) !important;
                    border-left: 3px solid #3b82f6;
                }
                .machine-row {
                    border-left: 2px solid #e2e8f0;
                }
                
                ${dynamicStyles}
                
                .ant-table-thead > tr > th {
                    background: linear-gradient(135deg, #f1f5f9, #e2e8f0) !important;
                    border-bottom: 2px solid #cbd5e1 !important;
                    color: #1e293b !important;
                    font-weight: 700 !important;
                }
                .ant-table-tbody > tr:hover > td {
                    background: #f8fafc !important;
                }
                
                /* Masquer complètement les icônes d'expansion par défaut d'AntDesign */
                .ant-table-row-expand-icon,
                .ant-table-row-expand-icon-collapsed,
                .ant-table-row-expand-icon-expanded {
                    display: none !important;
                }
                
                /* Masquer la colonne d'expansion par défaut */
                .ant-table-expand-icon-col {
                    display: none !important;
                }
                
                /* Styles personnalisés pour les onglets */
                .ant-tabs-nav-wrap {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                    border-radius: 16px 16px 0 0 !important;
                    padding: 12px 24px !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    margin-bottom: 8px !important;
                }
                
                .ant-tabs-nav-list {
                    gap: 16px !important;
                }
                
                .ant-tabs-tab {
                    border-radius: 12px !important;
                    margin: 0 !important;
                    padding: 12px 20px !important;
                    transition: all 0.3s ease !important;
                    min-height: 48px !important;
                    display: flex !important;
                    align-items: center !important;
                    font-weight: 500 !important;
                }
                
                .ant-tabs-tab:hover {
                    background: rgba(56, 161, 60, 0.1) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 12px rgba(56, 161, 60, 0.15) !important;
                }
                
                .ant-tabs-tab-active {
                    background: rgba(56, 161, 60, 0.15) !important;
                    border: 1px solid rgba(56, 161, 60, 0.3) !important;
                    box-shadow: 0 4px 16px rgba(56, 161, 60, 0.2) !important;
                    font-weight: 600 !important;
                }
                
                .ant-tabs-tab-btn {
                    padding: 0 !important;
                    font-size: 15px !important;
                }
            `}</style>
        </div>
    );
}
