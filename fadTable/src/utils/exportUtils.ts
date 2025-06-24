import { EnergyData, Month } from "../types/energyData";
import { formatEnergy, getUnit } from "./dataFormatters";
import { SelectedEnergyTypeEnum } from "../../typings/FadTableProps";

/**
 * Exporte les données au format CSV
 * @param data - Données à exporter
 * @param months - Liste des mois
 * @param energyType - Type d'énergie pour le formatage/unités
 * @param filename - Nom du fichier d'export
 */
export const exportToCSV = (
    data: EnergyData[],
    months: Month[],
    energyType: SelectedEnergyTypeEnum,
    filename: string = "consommation_energetique.csv"
): void => {
    // Définir les en-têtes du CSV
    const unit = getUnit(energyType);
    let headers = ["Machine"];

    // Ajouter atelier et secteur si présents
    const hasAtelier = data.some(item => item.atelierName !== undefined);
    const hasSecteur = data.some(item => item.secteurName !== undefined);

    if (hasAtelier) headers.push("Atelier");
    if (hasSecteur) headers.push("Secteur");

    // Ajouter les mois avec unité
    months.forEach(month => {
        headers.push(`${month.name} (${unit})`);
    });

    // Ajouter le total avec unité
    headers.push(`Total Annuel (${unit})`);

    // Préparer les lignes de données
    const rows = data.map(item => {
        let row: string[] = [item.machineName];

        if (hasAtelier) row.push(item.atelierName || "");
        if (hasSecteur) row.push(item.secteurName || "");

        // Ajouter les valeurs mensuelles (nombre brut)
        months.forEach(month => {
            const value = item.monthlyValues[month.id] || 0;
            // Extraire la partie numérique après formatage pour CSV
            try {
                const formattedString = formatEnergy(value, energyType);
                const numberPart = formattedString.split(" ")[0].replace(/\s/g, "").replace(",", ".");
                const num = parseFloat(numberPart);
                row.push(isNaN(num) ? "" : String(num));
            } catch {
                row.push("");
            }
        });

        // Ajouter le total (nombre brut)
        const yearTotal = item.yearTotal || 0;
        try {
            const formattedString = formatEnergy(yearTotal, energyType);
            const numberPart = formattedString.split(" ")[0].replace(/\s/g, "").replace(",", ".");
            const num = parseFloat(numberPart);
            row.push(isNaN(num) ? "" : String(num));
        } catch (e) {
            console.error("Error formatting year total for CSV:", e);
            row.push("");
        }

        return row;
    });

    // Ajouter la ligne des totaux
    if (data.length > 0) {
        let totalRow: string[] = ["TOTAL"];

        if (hasAtelier) totalRow.push("");
        if (hasSecteur) totalRow.push("");

        // Calculer les totaux par mois
        months.forEach(month => {
            const total = data.reduce((sum, item) => sum + (item.monthlyValues[month.id] || 0), 0);
            try {
                const formattedString = formatEnergy(total, energyType);
                const numberPart = formattedString.split(" ")[0].replace(/\s/g, "").replace(",", ".");
                const num = parseFloat(numberPart);
                totalRow.push(isNaN(num) ? "" : String(num));
            } catch (e) {
                console.error("Error formatting monthly total for CSV:", e);
                totalRow.push("");
            }
        });

        // Calculer le total général
        const grandTotal = data.reduce((sum, item) => sum + (item.yearTotal || 0), 0);
        try {
            const formattedString = formatEnergy(grandTotal, energyType);
            const numberPart = formattedString.split(" ")[0].replace(/\s/g, "").replace(",", ".");
            const num = parseFloat(numberPart);
            totalRow.push(isNaN(num) ? "" : String(num));
        } catch (e) {
            console.error("Error formatting grand total for CSV:", e);
            totalRow.push("");
        }

        rows.push(totalRow);
    }

    // Convertir en CSV
    const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");

    // Créer un blob et télécharger le fichier
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Exporte les données au format Excel (XLSX)
 * @param data - Données à exporter
 * @param months - Liste des mois
 * @param energyType - Type d'énergie pour le formatage/unités
 * @param filename - Nom du fichier d'export
 */
export const exportToExcel = (
    data: EnergyData[],
    months: Month[],
    energyType: SelectedEnergyTypeEnum,
    filename: string = "consommation_energetique.xlsx"
): void => {
    // Note: Cette fonction nécessiterait l'intégration d'une bibliothèque comme ExcelJS ou SheetJS
    // Pour l'instant, on redirige vers l'export CSV
    console.warn("Export Excel non implémenté. Utilisation de l'export CSV à la place.");
    exportToCSV(data, months, energyType, filename.replace(".xlsx", ".csv"));
};

/**
 * Génère une image PNG du tableau
 * Note: L'implémentation nécessite une bibliothèque comme html2canvas
 */
export const exportToPNG = (): void => {
    // Remarque: Cette fonction n'utilise pas les paramètres pour le moment, ils seront nécessaires
    // lorsque l'implémentation sera complétée avec html2canvas ou une autre librairie
    console.warn("Export PNG non implémenté.");
    alert("Export PNG non implémenté dans cette version.");
};

/**
 * Prépare les données pour l'impression
 * @param data - Données à imprimer
 * @param months - Liste des mois
 * @param energyType - Type d'énergie pour le formatage/unités
 */
export const printTable = (data: EnergyData[], months: Month[], energyType: SelectedEnergyTypeEnum): void => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Veuillez autoriser les popups pour l'impression.");
        return;
    }

    const unit = getUnit(energyType);

    // Créer le contenu HTML
    let html = `
        <html>
        <head>
            <title>Consommation Énergétique</title>
            <style>
                body { font-family: Arial, sans-serif; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background-color: #f2f2f2; }
                .text-left { text-align: left; }
                .total-row { font-weight: bold; background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1>Rapport de Consommation Énergétique (${energyType === "Elec" ? "kWh" : "m³"})</h1>
            <p>Date d'impression: ${new Date().toLocaleDateString("fr-FR")}</p>
            <table>
                <thead>
                    <tr>
                        <th class="text-left">Machine</th>
    `;

    // Ajouter atelier et secteur si présents
    const hasAtelier = data.some(item => item.atelierName !== undefined);
    const hasSecteur = data.some(item => item.secteurName !== undefined);

    if (hasAtelier) html += `<th class="text-left">Atelier</th>`;
    if (hasSecteur) html += `<th class="text-left">Secteur</th>`;

    // Ajouter les en-têtes des mois avec unité
    months.forEach(month => {
        html += `<th>${month.name} (${unit})</th>`;
    });

    html += `<th>Total Annuel (${unit})</th></tr></thead><tbody>`;

    // Ajouter les lignes de données
    data.forEach(item => {
        html += `<tr>
            <td class="text-left">${item.machineName}</td>`;

        if (hasAtelier) html += `<td class="text-left">${item.atelierName || ""}</td>`;
        if (hasSecteur) html += `<td class="text-left">${item.secteurName || ""}</td>`;

        // Ajouter les valeurs mensuelles formatées
        months.forEach(month => {
            html += `<td>${formatEnergy(item.monthlyValues[month.id] || 0, energyType)}</td>`;
        });

        // Ajouter le total formaté
        html += `<td>${formatEnergy(item.yearTotal || 0, energyType)}</td></tr>`;
    });

    // Ajouter la ligne des totaux
    if (data.length > 0) {
        html += `<tr class="total-row">
            <td class="text-left">TOTAL</td>`;

        if (hasAtelier) html += `<td></td>`;
        if (hasSecteur) html += `<td></td>`;

        // Calculer et ajouter les totaux par mois formatés
        months.forEach(month => {
            const total = data.reduce((sum, item) => sum + (item.monthlyValues[month.id] || 0), 0);
            html += `<td>${formatEnergy(total, energyType)}</td>`;
        });

        // Calculer et ajouter le total général formaté
        const grandTotal = data.reduce((sum, item) => sum + (item.yearTotal || 0), 0);
        html += `<td>${formatEnergy(grandTotal, energyType)}</td></tr>`;
    }

    html += `</tbody></table></body></html>`;

    // Écrire dans la fenêtre et imprimer
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    // Attendre que le document soit chargé avant d'imprimer
    printWindow.onload = () => {
        printWindow.print();
        // printWindow.close();  // Commenter cette ligne pour permettre à l'utilisateur de fermer lui-même
    };
};
