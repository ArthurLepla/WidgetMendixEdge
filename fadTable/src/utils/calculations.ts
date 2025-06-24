import { EnergyData, Month, MonthlyValues } from "../types/energyData";

/**
 * Calcule les totaux par mois pour toutes les données
 * @param data - Tableau de données énergétiques
 * @param months - Liste des mois
 * @returns Objet contenant les totaux par mois
 */
export const calculateMonthlyTotals = (data: EnergyData[], months: Month[]): MonthlyValues => {
    const totals: MonthlyValues = {};

    months.forEach(month => {
        totals[month.id] = data.reduce((sum, item) => sum + (item.monthlyValues[month.id] || 0), 0);
    });

    return totals;
};

/**
 * Calcule le total général pour toutes les données
 * @param data - Tableau de données énergétiques
 * @returns Total général
 */
export const calculateGrandTotal = (data: EnergyData[]): number => {
    return data.reduce((sum, item) => sum + (item.yearTotal || 0), 0);
};

/**
 * Calcule les totaux par mois pour l'année précédente
 * @param data - Tableau de données énergétiques
 * @param months - Liste des mois
 * @returns Objet contenant les totaux par mois de l'année précédente
 */
export const calculatePreviousMonthlyTotals = (data: EnergyData[], months: Month[]): MonthlyValues => {
    const totals: MonthlyValues = {};

    months.forEach(month => {
        totals[month.id] = data.reduce((sum, item) => sum + (item.previousYearValues?.[month.id] || 0), 0);
    });

    return totals;
};

/**
 * Calcule le total général pour l'année précédente
 * @param data - Tableau de données énergétiques
 * @returns Total général de l'année précédente
 */
export const calculatePreviousGrandTotal = (data: EnergyData[]): number => {
    return data.reduce((sum, item) => sum + (item.previousYearTotal || 0), 0);
};

/**
 * Calcule la variation en pourcentage par mois entre l'année courante et l'année précédente
 * @param data - Tableau de données énergétiques
 * @param months - Liste des mois
 * @returns Objet contenant les variations en pourcentage par mois
 */
export const calculateMonthlyVariations = (data: EnergyData[], months: Month[]): MonthlyValues => {
    const currentTotals = calculateMonthlyTotals(data, months);
    const previousTotals = calculatePreviousMonthlyTotals(data, months);
    const variations: MonthlyValues = {};

    months.forEach(month => {
        const current = currentTotals[month.id] || 0;
        const previous = previousTotals[month.id] || 0;

        if (previous === 0) {
            variations[month.id] = current > 0 ? 100 : 0;
        } else {
            variations[month.id] = ((current - previous) / previous) * 100;
        }
    });

    return variations;
};

/**
 * Groupe les données par secteur
 * @param data - Tableau de données énergétiques
 * @returns Données groupées par secteur
 */
export const groupBySecteur = (data: EnergyData[]): { [secteur: string]: EnergyData[] } => {
    return data.reduce((groups, item) => {
        const secteur = item.secteurName || "Non défini";
        if (!groups[secteur]) {
            groups[secteur] = [];
        }
        groups[secteur].push(item);
        return groups;
    }, {} as { [secteur: string]: EnergyData[] });
};

/**
 * Groupe les données par atelier
 * @param data - Tableau de données énergétiques
 * @returns Données groupées par atelier
 */
export const groupByAtelier = (data: EnergyData[]): { [atelier: string]: EnergyData[] } => {
    return data.reduce((groups, item) => {
        const atelier = item.atelierName || "Non défini";
        if (!groups[atelier]) {
            groups[atelier] = [];
        }
        groups[atelier].push(item);
        return groups;
    }, {} as { [atelier: string]: EnergyData[] });
};

/**
 * Calcule la répartition de la consommation par secteur
 * @param data - Tableau de données énergétiques
 * @returns Objet avec les secteurs et leur consommation totale
 */
export const calculateSecteurDistribution = (data: EnergyData[]): { name: string; value: number }[] => {
    const secteurGroups = groupBySecteur(data);

    return Object.entries(secteurGroups).map(([secteur, items]) => ({
        name: secteur,
        value: items.reduce((sum, item) => sum + item.yearTotal, 0)
    }));
};

/**
 * Calcule la répartition de la consommation par atelier
 * @param data - Tableau de données énergétiques
 * @returns Objet avec les ateliers et leur consommation totale
 */
export const calculateAtelierDistribution = (data: EnergyData[]): { name: string; value: number }[] => {
    const atelierGroups = groupByAtelier(data);

    return Object.entries(atelierGroups).map(([atelier, items]) => ({
        name: atelier,
        value: items.reduce((sum, item) => sum + item.yearTotal, 0)
    }));
};
