import React from "react";
import { ReactElement, createElement, useState, useEffect } from "react";
import {
    Table,
    Card,
    Typography,
    Pagination,
    Row,
    Col,
    Input,
    Dropdown,
    Button,
    Space,
    MenuProps,
    Spin,
    Alert
} from "antd";
import {
    SearchOutlined,
    CloseOutlined,
    DownloadOutlined,
    DownOutlined,
    BarChartOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    VerticalAlignMiddleOutlined
} from "@ant-design/icons";
import { EnergyData, Month } from "../types/energyData";
import { formatEnergy } from "../utils/dataFormatters";
import { exportStandardToCSV, printStandardTable, exportStandardToXLSX } from "../utils/standardExportUtils";
import { SelectedEnergyTypeEnum } from "../../typings/FadTableProps";

const { Text, Title } = Typography;

interface EnergyTableProps {
    months: Month[];
    isLoading: boolean;
    error: string | null;
    enableExport: boolean;
    enableSort: boolean;
    loadingStrategy: "loadAll" | "pagination" | "lazyLoad";
    pageSize: number;
    onSearchChange: (text: string) => void;
    sortOptions: any;
    onSortChange: (field: string) => void;
    sortedData: EnergyData[];
    totalFiltered: number;
    totalOriginal: number;
    selectedEnergyType: SelectedEnergyTypeEnum;
}

export default function EnergyTable(props: EnergyTableProps): ReactElement {
    const {
        months,
        isLoading,
        error,
        enableExport,
        enableSort,
        loadingStrategy,
        pageSize,
        onSearchChange,
        sortOptions,
        onSortChange,
        sortedData,
        totalFiltered,
        totalOriginal,
        selectedEnergyType
    } = props;

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchValue, setSearchValue] = useState<string>("");

    const displayData = (() => {
        if (loadingStrategy === "pagination") {
            const startIndex = (currentPage - 1) * pageSize;
            return sortedData.slice(startIndex, startIndex + pageSize);
        }
        return sortedData;
    })();

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        onSearchChange(value);
    };

    const handleExport = (format: "csv" | "excel" | "print") => {
        const dataToExport = sortedData;
        const energyType = selectedEnergyType;
        switch (format) {
            case "csv":
                exportStandardToCSV(dataToExport, months, energyType);
                break;
            case "excel":
                exportStandardToXLSX(dataToExport, months, energyType, "export_standard.xlsx");
                break;
            case "print":
                printStandardTable(dataToExport, months, energyType);
                break;
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [totalFiltered]);

    const SortIcon = ({ field }: { field: string }) => {
        if (sortOptions.field !== field) {
            return <VerticalAlignMiddleOutlined style={{ marginLeft: 4, opacity: 0.5 }} />;
        }
        if (sortOptions.direction === "asc") {
            return <SortAscendingOutlined style={{ marginLeft: 4 }} />;
        }
        return <SortDescendingOutlined style={{ marginLeft: 4 }} />;
    };

    // Menu items pour l'export
    const exportMenuItems: MenuProps["items"] = [
        {
            key: "csv",
            label: "CSV",
            onClick: () => handleExport("csv")
        },
        {
            key: "excel",
            label: "Excel (.xlsx)",
            onClick: () => handleExport("excel")
        },
        {
            key: "print",
            label: "Imprimer",
            onClick: () => handleExport("print")
        }
    ];

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

    if (!sortedData || sortedData.length === 0) {
        return (
            <Alert
                message="Aucune donnée disponible"
                description="Aucune donnée n'est disponible pour l'affichage."
                type="info"
                style={{ margin: "20px 0" }}
            />
        );
    }

    // Configuration des colonnes du tableau
    const tableColumns = [
        {
            title: (
                <Space
                    style={{ cursor: enableSort ? "pointer" : "default" }}
                    onClick={enableSort ? () => onSortChange("secteurName") : undefined}
                >
                    Secteur
                    {enableSort && <SortIcon field="secteurName" />}
                </Space>
            ),
            dataIndex: "secteurName",
            key: "secteurName",
            width: 150
        },
        {
            title: (
                <Space
                    style={{ cursor: enableSort ? "pointer" : "default" }}
                    onClick={enableSort ? () => onSortChange("atelierName") : undefined}
                >
                    Atelier
                    {enableSort && <SortIcon field="atelierName" />}
                </Space>
            ),
            dataIndex: "atelierName",
            key: "atelierName",
            width: 150
        },
        {
            title: (
                <Space
                    style={{ cursor: enableSort ? "pointer" : "default" }}
                    onClick={enableSort ? () => onSortChange("machineName") : undefined}
                >
                    Machine
                    {enableSort && <SortIcon field="machineName" />}
                </Space>
            ),
            dataIndex: "machineName",
            key: "machineName",
            width: 150
        },
        ...months.map(month => ({
            title: month.name.substring(0, 3),
            dataIndex: ["monthlyValues", month.id],
            key: month.id,
            width: 90,
            align: "right" as const,
            render: (value: number) => formatEnergy(value || 0, selectedEnergyType)
        })),
        {
            title: (
                <Space
                    style={{ cursor: enableSort ? "pointer" : "default" }}
                    onClick={enableSort ? () => onSortChange("yearTotal") : undefined}
                >
                    Total
                    {enableSort && <SortIcon field="yearTotal" />}
                </Space>
            ),
            dataIndex: "yearTotal",
            key: "yearTotal",
            width: 120,
            align: "right" as const,
            render: (value: number) => <Text strong>{formatEnergy(value || 0, selectedEnergyType)}</Text>
        }
    ];

    return (
        <Card style={{ margin: "16px 0" }}>
            <div style={{ marginBottom: "16px" }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: "16px" }}>
                    <Col>
                        <Space>
                            <BarChartOutlined style={{ fontSize: "24px" }} />
                            <Title level={4} style={{ margin: 0 }}>
                                Suivi Standard Énergétique
                            </Title>
                        </Space>
                    </Col>

                    <Col>
                        <Space>
                            <Input
                                placeholder="Rechercher..."
                                value={searchValue}
                                onChange={handleSearchChange}
                                suffix={
                                    searchValue ? (
                                        <CloseOutlined
                                            style={{ cursor: "pointer" }}
                                            onClick={() => {
                                                setSearchValue("");
                                                onSearchChange("");
                                            }}
                                        />
                                    ) : (
                                        <SearchOutlined />
                                    )
                                }
                                style={{ width: "200px" }}
                            />

                            {enableExport && (
                                <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight" trigger={["click"]}>
                                    <Button icon={<DownloadOutlined />} type="default">
                                        Exporter
                                        <DownOutlined />
                                    </Button>
                                </Dropdown>
                            )}
                        </Space>
                    </Col>
                </Row>

                <Text type="secondary">
                    {totalFiltered} éléments{totalFiltered !== totalOriginal && ` sur ${totalOriginal} au total`}
                </Text>
            </div>

            <Table
                columns={tableColumns}
                dataSource={displayData}
                rowKey="id"
                pagination={false}
                size="middle"
                scroll={{ x: "max-content" }}
                style={{ fontSize: "14px" }}
            />

            {loadingStrategy === "pagination" && totalPages > 1 && (
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
                        total={sortedData.length}
                        pageSize={pageSize}
                        onChange={setCurrentPage}
                        showSizeChanger={false}
                        showQuickJumper
                        showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} éléments`}
                    />
                </div>
            )}
        </Card>
    );
}
