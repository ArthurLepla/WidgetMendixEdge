import { 
    ProcessedDataItem, 
    EnergyTotals, 
    IPEByEnergy, 
    PaginationConfig 
} from "../types/widget";
import {
    MAX_ROWS_PER_PAGE,
    TOLERANCE_OVERFLOW,
    MIN_CHUNK_SIZE,
    ROWS_FOR_SECTION_TITLE,
    ROWS_FOR_TABLE_TITLE,
    ROWS_FOR_TABLE_HEADER,
    ROWS_FOR_TABLE_TOTAL,
    ROWS_FOR_SPACING
} from "../constants/config";

/**
 * Calcule les totaux énergétiques pour une liste d'items
 * @param items - Liste des items à calculer
 */
export function calculateTotals(items: ProcessedDataItem[]): EnergyTotals {
    let totalElec = 0;
    let totalGaz = 0;
    let totalAir = 0;
    let totalEau = 0; // Ajout
    let totalProduction = 0;

    items.forEach(item => {
        totalElec += item.consumption["Elec"] || 0;
        totalGaz += item.consumption["Gaz"] || 0;
        totalAir += item.consumption["Air"] || 0;
        totalEau += item.consumption["Eau"] || 0; // Ajout
        totalProduction += item.production || 0;
    });

    return { totalElec, totalGaz, totalAir, totalEau, totalProduction }; // Ajout
}

/**
 * Calcule les IPE par type d'énergie
 * @param consumption - Consommations par énergie
 * @param production - Production totale
 */
export function calculateIPEByEnergy(
    consumption: { [key: string]: number | undefined }, 
    production: number | undefined
): IPEByEnergy {
    const elecCons = consumption["Elec"];
    const gazCons = consumption["Gaz"];
    const airCons = consumption["Air"];

    const ipeElec = (production && production > 0 && elecCons !== undefined) ? elecCons / production : undefined;
    const ipeGaz = (production && production > 0 && gazCons !== undefined) ? gazCons / production : undefined;
    const ipeAir = (production && production > 0 && airCons !== undefined) ? airCons / production : undefined;
    
    return { ipeElec, ipeGaz, ipeAir };
}

/**
 * Collecte récursivement tous les items d'un certain type
 * @param items - Items à parcourir
 * @param targetType - Type d'item recherché
 */
export function collectItemsByType(items: ProcessedDataItem[], targetType: string): ProcessedDataItem[] {
    const result: ProcessedDataItem[] = [];
    
    const traverse = (itemList: ProcessedDataItem[]) => {
        itemList.forEach(item => {
            if (item.level.Name === targetType) {
                result.push(item);
            }
            if (item.children && item.children.length > 0) {
                traverse(item.children);
            }
        });
    };
    
    traverse(items);
    return result;
}

/**
 * Fonction pour ajouter une valeur si elle est pertinente
 * @param val - Valeur à évaluer
 * @param relevant - Si l'énergie est pertinente
 */
export function addIfRelevant(val: number | undefined, relevant: boolean | undefined): number | undefined {
    if (val === undefined || val === null) return relevant ? 0 : undefined;
    return relevant ? val : undefined;
}

/**
 * Fonction pour calculer le nombre de lignes nécessaires pour un tableau
 * @param itemCount - Nombre d'items
 */
export function calculateTableRows(itemCount: number): number {
    return ROWS_FOR_TABLE_TITLE + ROWS_FOR_TABLE_HEADER + itemCount + ROWS_FOR_TABLE_TOTAL;
}

/**
 * Fonction pour déterminer la pagination optimale avec tolérance intelligente
 * @param mainTableRows - Nombre de lignes du tableau principal
 * @param ipeTableRows - Nombre de lignes du tableau IPE
 */
export function calculateOptimalPagination(mainTableRows: number, ipeTableRows: number): PaginationConfig {
    const totalRows = mainTableRows + ipeTableRows + ROWS_FOR_SPACING;
    
    // Si les deux tableaux tiennent sur une page (avec tolérance)
    if (totalRows <= MAX_ROWS_PER_PAGE + TOLERANCE_OVERFLOW) {
        return {
            separateTables: false,
            mainChunks: [mainTableRows - ROWS_FOR_TABLE_TITLE - ROWS_FOR_TABLE_HEADER - ROWS_FOR_TABLE_TOTAL],
            ipeChunks: [ipeTableRows - ROWS_FOR_TABLE_TITLE - ROWS_FOR_TABLE_HEADER - ROWS_FOR_TABLE_TOTAL]
        };
    }
    
    // Sinon, vérifier si chaque tableau individuellement peut tenir sur une page
    const mainDataRows = mainTableRows - ROWS_FOR_TABLE_TITLE - ROWS_FOR_TABLE_HEADER - ROWS_FOR_TABLE_TOTAL;
    const ipeDataRows = ipeTableRows - ROWS_FOR_TABLE_TITLE - ROWS_FOR_TABLE_HEADER - ROWS_FOR_TABLE_TOTAL;
    
    return {
        separateTables: true,
        mainChunks: calculateIntelligentChunks(mainDataRows, true), // true = première table (avec titre de section)
        ipeChunks: calculateIntelligentChunks(ipeDataRows, false)    // false = table suivante
    };
}

/**
 * Fonction pour calculer les chunks intelligemment
 * @param dataRows - Nombre de lignes de données
 * @param isFirstTable - Si c'est la première table (avec titre de section)
 */
export function calculateIntelligentChunks(dataRows: number, isFirstTable: boolean): number[] {
    // Espace disponible pour les données sur la première page
    let firstPageDataCapacity = MAX_ROWS_PER_PAGE - ROWS_FOR_TABLE_TITLE - ROWS_FOR_TABLE_HEADER - ROWS_FOR_TABLE_TOTAL;
    if (isFirstTable) {
        firstPageDataCapacity -= ROWS_FOR_SECTION_TITLE; // Moins de place sur la première page
    }
    
    // Espace disponible pour les données sur les pages suivantes
    const otherPagesDataCapacity = MAX_ROWS_PER_PAGE - ROWS_FOR_TABLE_TITLE - ROWS_FOR_TABLE_HEADER - ROWS_FOR_TABLE_TOTAL;
    
    // Si tout tient sur une page (avec tolérance)
    if (dataRows <= firstPageDataCapacity + TOLERANCE_OVERFLOW) {
        return [dataRows];
    }
    
    const chunks: number[] = [];
    let remainingRows = dataRows;
    let isFirstChunk = true;
    
    while (remainingRows > 0) {
        let chunkCapacity = isFirstChunk ? firstPageDataCapacity : otherPagesDataCapacity;
        
        // Si les lignes restantes sont peu nombreuses, les intégrer au chunk précédent si possible
        if (remainingRows <= MIN_CHUNK_SIZE && chunks.length > 0) {
            // Ajouter les lignes restantes au dernier chunk
            chunks[chunks.length - 1] += remainingRows;
            break;
        }
        
        // Si on peut tout prendre sans dépasser (avec tolérance)
        if (remainingRows <= chunkCapacity + TOLERANCE_OVERFLOW) {
            chunks.push(remainingRows);
            break;
        }
        
        // Sinon, prendre le maximum possible en laissant au moins MIN_CHUNK_SIZE pour la suite
        let chunkSize = chunkCapacity;
        if (remainingRows - chunkCapacity < MIN_CHUNK_SIZE) {
            // Répartir plus équitablement
            chunkSize = Math.floor(remainingRows / 2);
            chunkSize = Math.max(chunkSize, MIN_CHUNK_SIZE);
        }
        
        chunks.push(chunkSize);
        remainingRows -= chunkSize;
        isFirstChunk = false;
    }
    
    return chunks;
} 