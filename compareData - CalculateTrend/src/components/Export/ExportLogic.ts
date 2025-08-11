// Ce fichier reste inchangé car il n'utilise pas Radix
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface Row {
  asset: string;
  timestamp: Date; // Important: Date strict, pas string
  value: number; // Important : number, pas Big
  metricType?: string;
  energyType?: string;
  [key: string]: any; // Permettre d'autres propriétés
}

// La fonction addMachineNameToData n'est plus nécessaire si 'name' vient des données individuelles.

export function downloadExcel(
  data: Row[],
  filename = "export",
  machineName?: string /* machineName est pour le nom de fichier ici */
) {
  // const processedData = addMachineNameToData(data, machineName); // Supprimé
  const ws = XLSX.utils.json_to_sheet(
    data.map(r => ({
      Asset: r.asset,
      Timestamp: r.timestamp.toISOString(),
      Valeur: r.value,
      "Type métrique": r.metricType ?? "",
      "Type énergie": r.energyType ?? ""
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Données");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout]), `${filename}${machineName ? "_" + machineName : ""}.xlsx`); // Ajustement du nom de fichier pour inclure machineName s'il est fourni
}

export function downloadCsv(
  data: Row[],
  filename = "export",
  machineName?: string /* machineName est pour le nom de fichier ici */
) {
  // const processedData = addMachineNameToData(data, machineName); // Supprimé
  const ws = XLSX.utils.json_to_sheet(
    data.map(r => ({
      Asset: r.asset,
      Timestamp: r.timestamp.toISOString(),
      Valeur: r.value,
      "Type métrique": r.metricType ?? "",
      "Type énergie": r.energyType ?? ""
    }))
  );
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  // Ajout du BOM UTF-8 pour une meilleure compatibilité avec Excel
  const blob = new Blob(["\uFEFF" + csvOutput], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}${machineName ? "_" + machineName : ""}.csv`); // Ajustement du nom de fichier
}

export function downloadJson(
  data: Row[],
  filename = "export",
  machineName?: string /* machineName est pour le nom de fichier ici */
) {
  // const processedData = addMachineNameToData(data, machineName); // Supprimé
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  saveAs(blob, `${filename}${machineName ? "_" + machineName : ""}.json`); // Ajustement du nom de fichier
}