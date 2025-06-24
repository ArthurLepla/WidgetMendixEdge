import { Month } from "../types/energyData";
import { EnergyData } from "../types/energyData"; // Import EnergyData type
import { formatEnergy, getUnit } from "./dataFormatters";
import { SelectedEnergyTypeEnum } from "../../typings/FadTableProps";
import * as XLSX from "xlsx"; // Import xlsx library

/**
 * Helper function to safely quote CSV fields containing delimiters or quotes.
 */
function quoteCSVField(field: string | number | undefined): string {
    const stringField = String(field === undefined || field === null ? "" : field);
    if (stringField.includes(",") || stringField.includes("\n") || stringField.includes('"')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

/**
 * Génère et télécharge un fichier CSV à partir des données standard (plates).
 * @param dataItems Liste des éléments EnergyData à exporter.
 * @param months Liste des mois pour les colonnes.
 * @param energyType Le type d'énergie sélectionné pour le formatage.
 * @param filename Nom du fichier CSV à générer.
 */
export function exportStandardToCSV(
    dataItems: EnergyData[],
    months: Month[],
    energyType: SelectedEnergyTypeEnum,
    filename: string = "export_standard.csv"
): void {
    if (!dataItems || dataItems.length === 0) {
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

    // Créer les en-têtes CSV (incluant Secteur, Atelier, Machine) sans unité
    const headers = [
        "Secteur",
        "Atelier",
        "Machine",
        ...months.map(m => m.name), // No unit here
        "Total Année" // No unit here
    ];
    const csvRows = [headers.map(quoteCSVField).join(",")];

    // Créer les lignes de données avec unités dans les cellules
    dataItems.forEach(item => {
        const secteur = quoteCSVField(item.secteurName);
        const atelier = quoteCSVField(item.atelierName);
        const machine = quoteCSVField(item.machineName);

        const monthlyValues = months.map(month => {
            const value = item.monthlyValues[month.id] || 0;
            // Format without extra unit for CSV cells, formatEnergy includes it
            return quoteCSVField(formatEnergy(value, energyType));
        });
        // Format without extra unit
        const yearTotal = quoteCSVField(formatEnergy(item.yearTotal || 0, energyType));

        const row = [secteur, atelier, machine, ...monthlyValues, yearTotal];
        csvRows.push(row.join(","));
    });

    // Créer le contenu CSV complet
    const csvString = csvRows.join("\r\n");

    // Créer un Blob et déclencher le téléchargement
    const blob = new Blob([`\uFEFF${csvString}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename); // Use corrected filename
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        alert("La fonction de téléchargement n'est pas prise en charge par votre navigateur.");
    }
}

/**
 * Génère et télécharge un fichier XLSX natif à partir des données standard.
 * @param dataItems Liste des éléments EnergyData à exporter.
 * @param months Liste des mois pour les colonnes.
 * @param energyType Le type d'énergie sélectionné.
 * @param filename Nom du fichier XLSX à générer.
 */
export function exportStandardToXLSX(
    dataItems: EnergyData[],
    months: Month[],
    energyType: SelectedEnergyTypeEnum,
    filename: string = "export_standard.xlsx"
): void {
    if (!dataItems || dataItems.length === 0) {
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
    const headers = [
        "Secteur",
        "Atelier",
        "Machine",
        ...months.map(m => `${m.name} (${unit})`),
        `Total Année (${unit})`
    ];

    // Prepare data rows for XLSX
    const dataRows = dataItems.map(item => {
        const monthlyValues = months.map(month => item.monthlyValues[month.id] || 0); // Use raw numbers
        const yearTotal = item.yearTotal || 0; // Use raw number

        return [item.secteurName || "", item.atelierName || "", item.machineName || "", ...monthlyValues, yearTotal];
    });

    // Combine headers and data
    const aoa = [headers, ...dataRows];

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données Standard");

    // Auto-adjust column widths
    const cols = headers.map((_, index) => {
        let maxWidth = 0;
        for (let i = 0; i < aoa.length; i++) {
            const cellValue = aoa[i][index];
            if (cellValue) {
                maxWidth = Math.max(maxWidth, String(cellValue).length);
            }
        }
        return { wch: maxWidth + 2 }; // Add padding
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
 * Ouvre une nouvelle fenêtre avec le tableau standard formaté pour l'impression.
 * @param dataItems Liste des éléments EnergyData à imprimer.
 * @param months Liste des mois pour les colonnes.
 * @param energyType Le type d'énergie sélectionné pour le formatage.
 */
export function printStandardTable(dataItems: EnergyData[], months: Month[], energyType: SelectedEnergyTypeEnum): void {
    if (!dataItems || dataItems.length === 0) {
        alert("Aucune donnée à imprimer.");
        return;
    }

    // Styles CSS pour l'impression
    const printStyles = `
        body { font-family: sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 9pt; word-wrap: break-word; vertical-align: top; } /* Slightly smaller font for potentially more columns, added vertical-align */
        th { background-color: #f2f2f2; font-weight: bold; }
        td.numeric { text-align: right; }
        h1 { font-size: 16pt; text-align: center; margin-bottom: 20px; }
        .no-print { display: none; }
        @page { size: A4 landscape; margin: 1cm; }
    `;

    const unit = getUnit(energyType);

    // Construction du HTML pour le tableau
    let tableHtml = `<h1>Suivi de Consommation Énergétique (${energyType === "Elec" ? "kWh" : "m³"})</h1>`;
    // Headers without unit
    tableHtml += `<table><thead><tr><th>Secteur</th><th>Atelier</th><th>Machine</th>`;
    months.forEach(month => (tableHtml += `<th>${month.name}</th>`));
    tableHtml += `<th>Total Année</th></tr></thead><tbody>`;

    dataItems.forEach(item => {
        tableHtml += `<tr>`;
        tableHtml += `<td>${item.secteurName || ""}</td>`;
        tableHtml += `<td>${item.atelierName || ""}</td>`;
        tableHtml += `<td>${item.machineName || ""}</td>`;

        months.forEach(month => {
            // Add unit in cell
            tableHtml += `<td class="numeric">${formatEnergy(
                item.monthlyValues[month.id] || 0,
                energyType
            )} ${unit}</td>`;
        });
        // Add unit in cell
        tableHtml += `<td class="numeric">${formatEnergy(item.yearTotal || 0, energyType)} ${unit}</td>`;
        tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;

    // Création et ouverture de la fenêtre d'impression
    const printWindow = window.open("", "_blank", "height=600,width=1000");

    if (printWindow) {
        printWindow.document.write("<html><head><title>Impression Tableau Standard</title>");
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
