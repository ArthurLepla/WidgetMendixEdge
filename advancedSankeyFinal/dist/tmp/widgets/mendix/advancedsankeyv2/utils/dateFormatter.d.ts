/**
 * 🕒 UTILITAIRE DE FORMATAGE DES DATES
 *
 * Formats dates avec une approche française élégante et contextuelle
 */
export interface DateFormatOptions {
    style?: 'short' | 'medium' | 'long' | 'full';
    includeTime?: boolean;
    relative?: boolean;
}
/**
 * Formatte une date avec un style français élégant
 */
export declare function formatDate(date?: Date, options?: DateFormatOptions): string;
/**
 * Formatte une période (date début - date fin)
 */
export declare function formatPeriod(startDate?: Date, endDate?: Date, options?: DateFormatOptions): string;
/**
 * Formatte une durée en texte lisible
 */
export declare function formatDuration(startDate?: Date, endDate?: Date): string;
/**
 * Vérifie si deux dates sont dans la même période (même mois)
 */
export declare function isSamePeriod(date1?: Date, date2?: Date): boolean;
//# sourceMappingURL=dateFormatter.d.ts.map