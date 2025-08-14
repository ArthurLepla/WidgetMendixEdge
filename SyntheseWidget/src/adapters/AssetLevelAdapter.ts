import { Big } from "big.js";

export interface AssetEntity {
    nom?: string;
    levelName?: string;
    consoTotalElec?: Big | number | null;
    consoTotalGaz?: Big | number | null;
    consoTotalEau?: Big | number | null;
    consoTotalAir?: Big | number | null;
    consoTotalElecPrev?: Big | number | null;
    consoTotalGazPrev?: Big | number | null;
    consoTotalEauPrev?: Big | number | null;
    consoTotalAirPrev?: Big | number | null;
}

export interface AssetMetrics {
    nom: string;
    level: string;
    consoElec: number;
    consoGaz: number;
    consoEau: number;
    consoAir: number;
    consoElecPrec: number;
    consoGazPrec: number;
    consoEauPrec: number;
    consoAirPrec: number;
}

function toNumber(value: Big | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    try {
        return (value as Big).toNumber();
    } catch {
        return 0;
    }
}

export class AssetLevelAdapter {
    static toAssetMetrics(asset: AssetEntity): AssetMetrics {
        return {
            nom: asset.nom || "",
            level: asset.levelName || "",
            consoElec: toNumber(asset.consoTotalElec),
            consoGaz: toNumber(asset.consoTotalGaz),
            consoEau: toNumber(asset.consoTotalEau),
            consoAir: toNumber(asset.consoTotalAir),
            consoElecPrec: toNumber(asset.consoTotalElecPrev),
            consoGazPrec: toNumber(asset.consoTotalGazPrev),
            consoEauPrec: toNumber(asset.consoTotalEauPrev),
            consoAirPrec: toNumber(asset.consoTotalAirPrev)
        };
    }

    static aggregateAssets(assets: AssetEntity[]): AssetMetrics {
        const acc = assets.reduce(
            (a, it) => {
                a.consoElec += toNumber(it.consoTotalElec);
                a.consoGaz += toNumber(it.consoTotalGaz);
                a.consoEau += toNumber(it.consoTotalEau);
                a.consoAir += toNumber(it.consoTotalAir);
                a.consoElecPrec += toNumber(it.consoTotalElecPrev);
                a.consoGazPrec += toNumber(it.consoTotalGazPrev);
                a.consoEauPrec += toNumber(it.consoTotalEauPrev);
                a.consoAirPrec += toNumber(it.consoTotalAirPrev);
                return a;
            },
            {
                nom: assets[0]?.levelName || "Total",
                level: assets[0]?.levelName || "",
                consoElec: 0,
                consoGaz: 0,
                consoEau: 0,
                consoAir: 0,
                consoElecPrec: 0,
                consoGazPrec: 0,
                consoEauPrec: 0,
                consoAirPrec: 0
            } as AssetMetrics
        );
        return acc;
    }

    static toBigNumbers(metrics: AssetMetrics) {
        return {
            consoElec: new Big(metrics.consoElec),
            consoGaz: new Big(metrics.consoGaz),
            consoEau: new Big(metrics.consoEau),
            consoAir: new Big(metrics.consoAir),
            consoElecPrec: new Big(metrics.consoElecPrec),
            consoGazPrec: new Big(metrics.consoGazPrec),
            consoEauPrec: new Big(metrics.consoEauPrec),
            consoAirPrec: new Big(metrics.consoAirPrec)
        };
    }
}
