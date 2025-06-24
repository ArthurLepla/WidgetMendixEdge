import { ReactElement, createElement } from "react";
import { Table } from "antd";
import { EnergyData } from "../types/energyData";

// Define column interface
interface TableColumn {
    header: string;
    accessor: string | ((row: EnergyData) => string | number);
}

interface DataTableProps {
    data: EnergyData[];
    columns: TableColumn[];
    isLoading: boolean;
    error: string | null;
}

export function DataTable({ data, columns, isLoading, error }: DataTableProps): ReactElement {
    if (isLoading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!data || data.length === 0) {
        return <div>Aucune donnée disponible</div>;
    }

    // Configuration des colonnes pour AntDesign
    const antdColumns = columns.map((column, index) => ({
        title: column.header,
        dataIndex: typeof column.accessor === "string" ? column.accessor : undefined,
        key: index,
        render:
            typeof column.accessor === "function"
                ? (_: any, record: EnergyData) => (column.accessor as (row: EnergyData) => string | number)(record)
                : undefined
    }));

    return (
        <Table
            columns={antdColumns}
            dataSource={data}
            rowKey={record => record.id || Math.random().toString()}
            pagination={false}
        />
    );
}
