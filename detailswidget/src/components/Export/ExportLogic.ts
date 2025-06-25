// Ce fichier reste inchangé car il n'utilise pas Radix
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface Row {
  timestamp: Date | string;
  value: number;
  name?: string; // Pour stocker le nom de l'objet/machine de NameAttr
  [key: string]: any; 
}

// Fonction utilitaire pour formater les dates en heure locale française
// Gère automatiquement les heures d'été (UTC+2) et d'hiver (UTC+1)
const formatDateForExport = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Paris" // Force le fuseau horaire français avec DST automatique
  }).format(date).replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, "$3-$2-$1 $4:$5:$6");
};

// Fonction de test pour vérifier la gestion des heures d'été/hiver (optionnelle)
export const testDSTHandling = () => {
  console.log("🧪 Test de gestion des heures d'été/hiver :");
  
  // Date d'été (juillet - UTC+2)
  const summerDate = new Date("2024-07-15T12:00:00.000Z"); // UTC
  console.log("☀️ Date d'été (juillet) :");
  console.log("  UTC:", summerDate.toISOString());
  console.log("  Export:", formatDateForExport(summerDate));
  
  // Date d'hiver (janvier - UTC+1)
  const winterDate = new Date("2024-01-15T12:00:00.000Z"); // UTC
  console.log("❄️ Date d'hiver (janvier) :");
  console.log("  UTC:", winterDate.toISOString());
  console.log("  Export:", formatDateForExport(winterDate));
  
  // Le décalage devrait être différent : +1h en hiver, +2h en été
};

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
    ...r,
    timestamp: r.timestamp instanceof Date 
      ? formatDateForExport(r.timestamp)
      : r.timestamp
  }));
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
  saveAs(blob, `${filename}${machineName ? "_" + machineName : ""}.json`); // Ajustement du nom de fichier
}