// Ce fichier reste inchangé car il n'utilise pas Radix
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface Row {
  timestamp: Date | string;
  value: number;
  name?: string; // Pour stocker le nom de l'objet/machine de NameAttr
  [key: string]: any; 
}

// Fonction utilitaire pour formatter les dates en heure française (Europe/Paris)
function formatDateForExport(date: Date): string {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Paris"
  });
  
  // Convertir le format français au format ISO-like pour l'export
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === "year")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  const hour = parts.find(p => p.type === "hour")?.value;
  const minute = parts.find(p => p.type === "minute")?.value;
  const second = parts.find(p => p.type === "second")?.value;
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// La fonction addMachineNameToData n'est plus nécessaire si 'name' vient des données individuelles.

export function downloadExcel(data: Row[], filename = "export", machineName?: string /* machineName est pour le nom de fichier ici */) {
  // const processedData = addMachineNameToData(data, machineName); // Supprimé
  const ws = XLSX.utils.json_to_sheet(
    data.map(r => ({ 
      Timestamp: r.timestamp instanceof Date 
        ? formatDateForExport(r.timestamp)
        : r.timestamp,
      Valeur: r.value,
      "Nom Machine": r.name // Utilisation de r.name provenant de NameAttr
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Données");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout]), `${filename}${machineName ? "_" + machineName : ""}.xlsx`); // Ajustement du nom de fichier pour inclure machineName s'il est fourni
}

export function downloadCsv(data: Row[], filename = "export", machineName?: string /* machineName est pour le nom de fichier ici */) {
  // const processedData = addMachineNameToData(data, machineName); // Supprimé
  const ws = XLSX.utils.json_to_sheet(data.map(r => ({
    Timestamp: r.timestamp instanceof Date 
      ? formatDateForExport(r.timestamp)
      : r.timestamp,
    Valeur: r.value,
    "Nom Machine": r.name // Utilisation de r.name provenant de NameAttr
  })));
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  // Ajout du BOM UTF-8 pour une meilleure compatibilité avec Excel
  const blob = new Blob(["\uFEFF" + csvOutput], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}${machineName ? "_" + machineName : ""}.csv`); // Ajustement du nom de fichier
}

export function downloadJson(data: Row[], filename = "export", machineName?: string /* machineName est pour le nom de fichier ici */) {
  // const processedData = addMachineNameToData(data, machineName); // Supprimé
  const jsonData = data.map(r => ({
    timestamp: r.timestamp instanceof Date 
      ? formatDateForExport(r.timestamp)
      : r.timestamp,
    value: r.value,
    name: r.name,
    ...Object.fromEntries(
      Object.entries(r).filter(([key]) => !['timestamp', 'value', 'name'].includes(key))
    )
  }));
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
  saveAs(blob, `${filename}${machineName ? "_" + machineName : ""}.json`); // Ajustement du nom de fichier
}