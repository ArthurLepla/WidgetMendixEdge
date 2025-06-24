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
export function formatDate(date?: Date, options: DateFormatOptions = {}): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return "";
    }

    const { style = 'medium', includeTime = false, relative = false } = options;

    // Format relatif (si c'est récent)
    if (relative) {
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Hier";
        if (diffDays === -1) return "Demain";
        if (diffDays > 0 && diffDays <= 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        if (diffDays < 0 && diffDays >= -7) return `Dans ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
    }

    // Configuration des formats selon le style
    const formatConfigs = {
        short: {
            day: '2-digit' as const,
            month: '2-digit' as const,
            year: '2-digit' as const
        },
        medium: {
            day: '2-digit' as const,
            month: 'short' as const,
            year: 'numeric' as const
        },
        long: {
            weekday: 'short' as const,
            day: '2-digit' as const,
            month: 'long' as const,
            year: 'numeric' as const
        },
        full: {
            weekday: 'long' as const,
            day: '2-digit' as const,
            month: 'long' as const,
            year: 'numeric' as const
        }
    };

    const config = formatConfigs[style];
    
    if (includeTime) {
        return new Intl.DateTimeFormat('fr-FR', {
            ...config,
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    return new Intl.DateTimeFormat('fr-FR', config).format(date);
}

/**
 * Formatte une période (date début - date fin)
 */
export function formatPeriod(
    startDate?: Date, 
    endDate?: Date, 
    options: DateFormatOptions = {}
): string {
    if (!startDate || !endDate) return "";

    const formattedStart = formatDate(startDate, options);
    const formattedEnd = formatDate(endDate, options);

    // Si même mois et année, on optimise l'affichage
    if (startDate.getFullYear() === endDate.getFullYear() && 
        startDate.getMonth() === endDate.getMonth()) {
        
        const dayStart = startDate.getDate();
        const dayEnd = endDate.getDate();
        const monthYear = new Intl.DateTimeFormat('fr-FR', {
            month: 'long',
            year: 'numeric'
        }).format(endDate);

        if (dayStart === dayEnd) {
            return `${dayStart} ${monthYear}`;
        }
        
        return `${dayStart} - ${dayEnd} ${monthYear}`;
    }

    return `${formattedStart} - ${formattedEnd}`;
}

/**
 * Formatte une durée en texte lisible
 */
export function formatDuration(startDate?: Date, endDate?: Date): string {
    if (!startDate || !endDate) return "";

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 jour";
    if (diffDays < 30) return `${diffDays} jours`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "1 mois";
    if (diffMonths < 12) return `${diffMonths} mois`;
    
    const diffYears = Math.floor(diffMonths / 12);
    if (diffYears === 1) return "1 an";
    return `${diffYears} ans`;
}

/**
 * Vérifie si deux dates sont dans la même période (même mois)
 */
export function isSamePeriod(date1?: Date, date2?: Date): boolean {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() && 
           date1.getMonth() === date2.getMonth();
} 