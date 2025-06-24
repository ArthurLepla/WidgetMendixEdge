import { Month } from "../types/energyData";
import { HierarchicalNode } from "../hooks/useHierarchicalData";
import { formatEnergy, getUnit } from "./dataFormatters";
import { SelectedEnergyTypeEnum } from "../../typings/FadTableProps";
import * as XLSX from "xlsx"; // Import xlsx library

/**
 * Helper function to safely quote CSV fields containing delimiters or quotes.
 */
function quoteCSVField(field: string | number | undefined): string {
    const stringField = String(field === undefined || field === null ? "" : field);
    // Escape double quotes by doubling them and wrap in quotes if it contains comma, newline, or double quote
    if (stringField.includes(",") || stringField.includes("\n") || stringField.includes('"')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

/**
 * Gets indentation string based on level.
 * @param level The hierarchical level (0 for root, 1 for children, etc.)
 * @returns A string with spaces for indentation.
 */
function getIndentation(level: number): string {
    return "  ".repeat(level); // Use two spaces per level for indentation
}

/**
 * Génère et télécharge un fichier CSV PLAT à partir des données hiérarchiques,
 * avec indentation pour représenter la hiérarchie.
 * @param nodes Liste aplatie des nœuds hiérarchiques à exporter.
 * @param months Liste des mois pour les colonnes.
 * @param energyType Le type d'énergie sélectionné pour le formatage.
 * @param filename Nom du fichier CSV à générer (doit être .csv).
 */
export function exportHierarchicalFlatToCSV(
    nodes: HierarchicalNode[],
    months: Month[],
    energyType: SelectedEnergyTypeEnum,
    filename: string = "export_hierarchique_flat.csv" // Default to .csv
): void {
    if (!nodes || nodes.length === 0) {
        alert("Aucune donnée à exporter.");
        return;
    }

    // Ensure filename ends with .csv
    if (!filename.toLowerCase().endsWith(".csv")) {
        console.warn(`Filename "${filename}" does not end with .csv. Changing to .csv.`);
        filename = filename.substring(0, filename.lastIndexOf(".")) + ".csv";
        if (!filename.toLowerCase().endsWith(".csv")) {
            // Handle cases with no extension initially
            filename += ".csv";
        }
    }

    // Créer les en-têtes CSV sans unité dans l'en-tête
    const headers = [
        "Nom", // No unit here
        ...months.map(m => m.name), // No unit here
        "Total Année" // No unit here
    ];
    const csvRows = [headers.map(quoteCSVField).join(",")];

    // Créer les lignes de données avec indentation et unité dans les cellules
    nodes.forEach(node => {
        // Add indentation to the name based on level
        const indentedName = quoteCSVField(getIndentation(node.level) + node.name);

        const monthlyValues = months.map(month => {
            const value = node.monthlyTotals[month.id] || 0;
            // Format without extra unit for CSV cells, formatEnergy includes it
            return quoteCSVField(formatEnergy(value, energyType));
        });

        // Format without extra unit
        const yearTotal = quoteCSVField(formatEnergy(node.yearTotal || 0, energyType));

        const row = [
            indentedName, // Use indented name
            ...monthlyValues,
            yearTotal
        ];
        csvRows.push(row.join(","));
    });

    // Créer le contenu CSV complet
    const csvString = csvRows.join("\r\n");

    // Créer un Blob et déclencher le téléchargement
    const blob = new Blob([`\uFEFF${csvString}`], { type: "text/csv;charset=utf-8;" }); // \uFEFF pour BOM UTF-8 (compatibilité Excel)
    const link = document.createElement("a");

    if (link.download !== undefined) {
        // Vérifier la prise en charge du téléchargement
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename); // Use the corrected filename
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Libérer l'URL de l'objet
    } else {
        alert("La fonction de téléchargement n'est pas prise en charge par votre navigateur.");
    }
}

/**
 * Génère et télécharge un fichier XLSX natif à partir des données hiérarchiques.
 * @param nodes Liste aplatie des nœuds hiérarchiques à exporter.
 * @param months Liste des mois pour les colonnes.
 * @param energyType Le type d'énergie sélectionné.
 * @param filename Nom du fichier XLSX à générer.
 */
export function exportHierarchicalToXLSX(
    nodes: HierarchicalNode[],
    months: Month[],
    energyType: SelectedEnergyTypeEnum,
    filename: string = "export_hierarchique.xlsx"
): void {
    if (!nodes || nodes.length === 0) {
        alert("Aucune donnée à exporter.");
        return;
    }

    // Ensure filename ends with .xlsx
    if (!filename.toLowerCase().endsWith(".xlsx")) {
        console.warn(`Filename "${filename}" does not end with .xlsx. Correcting extension.`);
        const baseName = filename.includes(".") ? filename.substring(0, filename.lastIndexOf(".")) : filename;
        filename = `${baseName}.xlsx`;
    }

    const unit = getUnit(energyType);

    // Prepare header row for XLSX
    const headers = ["Nom", ...months.map(m => `${m.name} (${unit})`), `Total Année (${unit})`];

    // Prepare data rows for XLSX
    const dataRows = nodes.map(node => {
        const indentedName = getIndentation(node.level) + node.name;
        const monthlyValues = months.map(month => node.monthlyTotals[month.id] || 0); // Use raw numbers
        const yearTotal = node.yearTotal || 0; // Use raw number

        return [indentedName, ...monthlyValues, yearTotal];
    });

    // Combine headers and data
    const aoa = [headers, ...dataRows];

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données Hiérarchiques");

    // Auto-adjust column widths (optional but nice)
    const cols = Object.keys(ws)
        .filter(key => key.endsWith("1") && key !== "!ref")
        .map(key => {
            const col = key.replace(/[0-9]/g, "");
            let maxWidth = 0;
            for (let i = 1; i <= dataRows.length + 1; i++) {
                const cellRef = `${col}${i}`;
                const cellValue = ws[cellRef]?.v;
                if (cellValue) {
                    maxWidth = Math.max(maxWidth, String(cellValue).length);
                }
            }
            return { wch: maxWidth + 2 }; // Add a little padding
        });
    ws["!cols"] = cols;

    // Generate and trigger download
    try {
        XLSX.writeFile(wb, filename);
    } catch (error) {
        console.error("Erreur lors de la génération du fichier XLSX:", error);
        alert("Une erreur s'est produite lors de la génération du fichier Excel.");
    }
}

/**
 * Ouvre une nouvelle fenêtre avec le tableau PLAT formaté pour l'impression.
 * @param nodes Liste aplatie des nœuds hiérarchiques à imprimer.
 * @param months Liste des mois pour les colonnes.
 * @param energyType Le type d'énergie sélectionné pour le formatage.
 */
export function printHierarchicalFlatTable(
    nodes: HierarchicalNode[],
    months: Month[],
    energyType: SelectedEnergyTypeEnum
): void {
    if (!nodes || nodes.length === 0) {
        alert("Aucune donnée à imprimer.");
        return;
    }

    const unit = getUnit(energyType);

    // Styles CSS pour l'impression (avec indentation)
    const printStyles = `
        body { font-family: sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 10pt; word-wrap: break-word; vertical-align: top; } /* Added vertical-align */
        th { background-color: #f2f2f2; font-weight: bold; }
        td.indent-0 { padding-left: 8px; }
        td.indent-1 { padding-left: 28px; } /* 8 + 20 */
        td.indent-2 { padding-left: 48px; } /* 8 + 2 * 20 */
        td.indent-3 { padding-left: 68px; } /* Adjust as needed */
        /* Add more levels if necessary */
        td.numeric { text-align: right; }
        h1 { font-size: 16pt; text-align: center; margin-bottom: 20px; }
        .no-print { display: none; }
        @page { size: A4 landscape; margin: 1cm; }
    `;

    // Construction du HTML pour le tableau
    let tableHtml = `<h1>Suivi de Consommation Énergétique (${energyType === "Elec" ? "kWh" : "m³"})</h1>`;
    // Headers without unit
    tableHtml += `<table><thead><tr><th>Nom</th>`;
    months.forEach(month => (tableHtml += `<th>${month.name}</th>`));
    tableHtml += `<th>Total Année</th></tr></thead><tbody>`;

    nodes.forEach(node => {
        tableHtml += `<tr>`;
        // Add class for indentation based on level
        tableHtml += `<td class="indent-${node.level}">${node.name}</td>`;

        months.forEach(month => {
            // Add unit in cell
            tableHtml += `<td class="numeric">${formatEnergy(
                node.monthlyTotals[month.id] || 0,
                energyType
            )} ${unit}</td>`;
        });

        // Add unit in cell
        tableHtml += `<td class="numeric">${formatEnergy(node.yearTotal || 0, energyType)} ${unit}</td>`;
        tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;

    // Création et ouverture de la fenêtre d'impression
    const printWindow = window.open("", "_blank", "height=600,width=1000");

    if (printWindow) {
        printWindow.document.write("<html><head><title>Impression Tableau Hiérarchique</title>"); // Updated title
        printWindow.document.write(`<style>${printStyles}</style>`);
        printWindow.document.write("</head><body>");
        printWindow.document.write(tableHtml);
        printWindow.document.write("</body></html>");
        printWindow.document.close();

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    } else {
        alert("Impossible d'ouvrir la fenêtre d'impression. Vérifiez les bloqueurs de pop-up.");
    }
}
