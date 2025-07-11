import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type GranularityUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";

export interface Granularity {
    value: number;
    unit: GranularityUnit;
}

const BUCKET_THRESHOLDS: Readonly<number[]> = [
    300000, 600000, 900000, 1200000, 1800000, 2700000, 3600000, 7200000, 10800000, 14400000,
    21600000, 28800000, 43200000, 86400000, 172800000, 259200000, 432000000, 604800000,
    864000000, 1209600000, 1814400000, 2419200000, 2629746000, 5259492000, 7889238000,
    10518984000, 15778476000, 31556952000, 63113904000, 94670856000, 157784760000
];

export const MENDIX_UNIT_TO_MS: Readonly<Record<GranularityUnit, number>> = {
    second: 1000,
    minute: 60000,
    hour: 3600000,
    day: 86400000,
    week: 604800000,
    month: 2629746000,
    year: 31556952000
};

/**
 * Réplique la logique du microflow Mendix pour déterminer la granularité automatique.
 * @param startDate La date de début.
 * @param endDate La date de fin.
 * @returns La granularité optimale.
 */
export function getAutoGranularity(startDate: Date, endDate: Date): Granularity {
    // Étape 2: Create TotalMs
    const totalMs = endDate.getTime() - startDate.getTime();
    if (totalMs <= 0) {
        return { value: 5, unit: "minute" }; // Fallback pour éviter division par zéro
    }

    // Étape 4: UserMs (en mode Auto)
    const userMs = 300000;

    // Étape 5: Create PointsUser
    const pointsUser = Math.ceil(totalMs / userMs);

    // Étape 6: Create BucketWork (en mode Auto)
    const bucketWork = pointsUser > 100
        ? userMs * ((pointsUser + 99) / 100) // Mendix 'div' est une division flottante
        : userMs;

    // Étape 7: Create BucketFinal
    let bucketFinal = BUCKET_THRESHOLDS[BUCKET_THRESHOLDS.length - 1]; // Default to largest
    for (const threshold of BUCKET_THRESHOLDS) {
        if (bucketWork <= threshold) {
            bucketFinal = threshold;
            break;
        }
    }

    // Conversion du BucketFinal en { value, unit } (simule MF_CalcEnumFromMs et MF_CalcTimeFromMs)
    // On trouve la plus grande unité qui divise parfaitement le bucket final
    if (bucketFinal % MENDIX_UNIT_TO_MS.month === 0) {
        return { value: bucketFinal / MENDIX_UNIT_TO_MS.month, unit: "month" };
    }
    if (bucketFinal % MENDIX_UNIT_TO_MS.week === 0) {
        return { value: bucketFinal / MENDIX_UNIT_TO_MS.week, unit: "week" };
    }
    if (bucketFinal % MENDIX_UNIT_TO_MS.day === 0) {
        return { value: bucketFinal / MENDIX_UNIT_TO_MS.day, unit: "day" };
    }
    if (bucketFinal % MENDIX_UNIT_TO_MS.hour === 0) {
        return { value: bucketFinal / MENDIX_UNIT_TO_MS.hour, unit: "hour" };
    }
    if (bucketFinal % MENDIX_UNIT_TO_MS.minute === 0) {
        return { value: bucketFinal / MENDIX_UNIT_TO_MS.minute, unit: "minute" };
    }
    
    // Fallback sur 'second'
    return { value: bucketFinal / MENDIX_UNIT_TO_MS.second, unit: "second" };
} 