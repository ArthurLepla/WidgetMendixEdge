import { useState, useEffect } from "react";
import { FadTableContainerProps } from "../../typings/FadTableProps";
import { useEnergyData } from "./useEnergyData";
import { EnergyData } from "../types/energyData";

// Define column interface
interface TableColumn {
    header: string;
    accessor: string | ((row: EnergyData) => string | number);
}

export const useTableData = (props: FadTableContainerProps) => {
    const { data, isLoading, error, months } = useEnergyData(props);
    const [columns, setColumns] = useState<TableColumn[]>([]);

    useEffect(() => {
        // Créer les colonnes du tableau
        const tableColumns: TableColumn[] = [{ header: "Machine", accessor: "machineName" }];

        // Ajouter les colonnes d'atelier et de secteur si activées
        if (props.attrAtelierName) {
            tableColumns.push({ header: "Atelier", accessor: "atelierName" });
        }

        if (props.attrSecteurName) {
            tableColumns.push({ header: "Secteur", accessor: "secteurName" });
        }

        // Ajouter les colonnes pour chaque mois
        months.forEach(month => {
            tableColumns.push({
                header: month.name,
                accessor: (row: EnergyData) => {
                    const value = row.monthlyValues[month.id];
                    return `${value} kWh`;
                }
            });
        });

        // Ajouter la colonne du total
        tableColumns.push({
            header: "Total",
            accessor: "yearTotal"
        });

        setColumns(tableColumns);
    }, [months, props.attrAtelierName, props.attrSecteurName]);

    return {
        data,
        columns,
        isLoading,
        error
    };
};
