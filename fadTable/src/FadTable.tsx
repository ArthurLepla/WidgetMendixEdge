import { ReactElement, createElement, useState } from "react";
import { ConfigProvider, Tabs } from "antd";
import type { TabsProps } from "antd";
import { FadTableContainerProps } from "../typings/FadTableProps";
import EnergyTable from "./components/EnergyTable";
import HierarchicalEnergyTable from "./components/HierarchicalEnergyTable";
import { useEnergyData } from "./hooks/useEnergyData";
import { useSorting } from "./hooks/useSorting";
import { useFilters } from "./hooks/useFilters";
import { useFlexibleHierarchy } from "./hooks/useFlexibleHierarchy";
import { isLegacyMode } from "./types/hierarchyConfig";
import { TableOutlined, ApartmentOutlined } from "@ant-design/icons";

// Import Barlow font from Google Fonts
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";

// Import AntDesign styles
import "antd/dist/reset.css";

export function FadTable(props: FadTableContainerProps): ReactElement {
    // Log props received from Mendix for debugging
    console.log("FadTable Props received:", props);
    console.log("Raw dsGridData items:", props.dsGridData?.items);
    console.log("Flexible Hierarchy Mode:", props.useFlexibleHierarchy);
    console.log("Legacy Mode Detected:", isLegacyMode(props));

    // État pour le type de vue (standard ou hiérarchique)
    const [activeKey, setActiveKey] = useState<string>("hierarchical");

    // Utiliser le hook pour charger et gérer les données
    const { data, isLoading, error, months } = useEnergyData(props);

    // Utiliser le hook pour gérer les filtres
    const { filteredData, searchByText, totalFiltered, totalOriginal } = useFilters(data);

    // Utiliser le hook pour gérer le tri
    const { sortedData, sortOptions, updateSortField } = useSorting(filteredData, months);

    // Utiliser le nouveau hook de hiérarchie flexible
    const flexibleHierarchy = useFlexibleHierarchy(filteredData, months, props);

    // Configuration du thème AntDesign
    const themeConfig = {
        token: {
            // Utilisation de la palette énergétique
            colorPrimary: "#38a13c", // Vert énergétique
            colorSuccess: "#22c55e",
            colorWarning: "#f9be01",
            colorError: "#ef4444",
            colorInfo: "#3293f3",

            // Configuration des polices
            fontFamily: 'Barlow, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 16,
            fontSizeHeading1: 28,
            fontSizeHeading2: 24,
            fontSizeHeading3: 20,
            fontSizeHeading4: 18,
            fontSizeHeading5: 16,

            // Espacement et design
            borderRadius: 12,
            borderRadiusLG: 16,
            borderRadiusSM: 8,

            // Couleurs de fond
            colorBgContainer: "#ffffff",
            colorBgElevated: "#f8fafc",
            colorBgLayout: "#f1f5f9"
        },
        components: {
            Table: {
                headerBg: "#f1f5f9",
                headerColor: "#1e293b",
                rowHoverBg: "#f8fafc"
            },
            Tabs: {
                itemColor: "#64748b",
                itemSelectedColor: "#38a13c",
                itemHoverColor: "#22c55e",
                inkBarColor: "#38a13c"
            },
            Input: {
                borderRadius: 12,
                paddingInline: 16,
                paddingBlock: 10
            },
            Button: {
                borderRadius: 12,
                fontWeight: 500
            }
        }
    };

    const logAndSearchByText = (text: string) => {
        console.log(`[FadTable] Calling searchByText - Text:`, text);
        console.log(`[FadTable] Hierarchy levels configured:`, flexibleHierarchy.hierarchyConfig.levels.length);
        console.log(`[FadTable] Hierarchy config:`, flexibleHierarchy.hierarchyConfig);
        searchByText(text); // Call original hook function
    };

    // Déterminer le titre de la vue hiérarchique selon la configuration
    const getHierarchicalViewTitle = () => {
        const config = flexibleHierarchy.hierarchyConfig;

        if (config.levels.length === 0) {
            return `Vue ${config.leafNodeName}`;
        } else if (config.levels.length === 1) {
            return `Vue ${config.levels[0].name}`;
        } else {
            return `Vue Hiérarchique (${config.levels.length} niveaux)`;
        }
    };

    // Configuration des onglets
    const tabItems: TabsProps["items"] = [
        {
            key: "hierarchical",
            label: (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ApartmentOutlined />
                    {getHierarchicalViewTitle()}
                </span>
            ),
            children: (
                <HierarchicalEnergyTable
                    // Données filtrées mais pas encore hiérarchiques
                    data={filteredData}
                    months={months}
                    isLoading={isLoading}
                    error={error}
                    enableExport={props.enableExport}
                    showTotals={props.showTotals}
                    enableComparison={props.enableComparison}
                    loadingStrategy={props.loadingStrategy}
                    pageSize={props.pageSize || 10}
                    onSearchChange={logAndSearchByText}
                    totalFiltered={totalFiltered}
                    totalOriginal={totalOriginal}
                    selectedEnergyType={props.selectedEnergyType}
                    // Nouvelles props pour la hiérarchie flexible
                    flexibleHierarchy={flexibleHierarchy}
                    hierarchyConfig={flexibleHierarchy.hierarchyConfig}
                />
            )
        },
        {
            key: "standard",
            label: (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <TableOutlined />
                    Vue Standard
                </span>
            ),
            children: (
                <EnergyTable
                    months={months}
                    isLoading={isLoading}
                    error={error}
                    enableExport={props.enableExport}
                    enableSort={props.enableSort}
                    loadingStrategy={props.loadingStrategy}
                    pageSize={props.pageSize || 10}
                    onSearchChange={logAndSearchByText}
                    sortOptions={sortOptions}
                    onSortChange={updateSortField}
                    sortedData={sortedData}
                    totalFiltered={totalFiltered}
                    totalOriginal={totalOriginal}
                    selectedEnergyType={props.selectedEnergyType}
                />
            )
        }
    ];

    return (
        <ConfigProvider theme={themeConfig}>
            <div
                style={{
                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    minHeight: "100vh",
                    padding: "16px"
                }}
            >
                <Tabs
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    items={tabItems}
                    size="large"
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "0",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
                    }}
                />
            </div>
        </ConfigProvider>
    );
}
