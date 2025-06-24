import { ReactElement, createElement } from "react";
import { Big } from "big.js";
import { Zap, Flame, Droplet, Wind } from "lucide-react";

export interface SecteurConsoCardProps {
    name: string;
    consoElec: Big;
    consoGaz: Big;
    consoEau: Big;
    consoAir: Big;
    consoElecPrec: Big;
    consoGazPrec: Big;
    consoEauPrec: Big;
    consoAirPrec: Big;
}

const ENERGY_CONFIG = {
    electricity: {
        color: '#38a13c',
        iconColor: '#38a13c',
        titleColor: '#38a13c',
        BackgroundIconColor: "rgba(56, 161, 60, 0.1)"
    },
    gas: {
        color: '#F9BE01',
        iconColor: '#F9BE01',
        titleColor: '#F9BE01',
        BackgroundIconColor: "rgba(249, 190, 1, 0.1)"
    },
    water: {
        color: '#3293f3',
        iconColor: '#3293f3',
        titleColor: '#3293f3',
        BackgroundIconColor: "rgba(50, 147, 243, 0.1)"
    },
    air: {
        color: '#66D8E6',
        iconColor: '#66D8E6',
        titleColor: '#66D8E6',
        BackgroundIconColor: "rgba(102, 216, 230, 0.1)"
    }
};

// Fonction pour formater les valeurs d'électricité avec les bonnes unités selon la magnitude
const formatValue = (value: Big): { formattedValue: string, displayUnit: string } => {
    const numericValue = value.toNumber();
    
    // Conversion automatique basée sur la magnitude
    if (numericValue >= 1000000) {
        // Convertir en GWh si >= 1 000 000 kWh
        return { 
            formattedValue: (numericValue / 1000000).toFixed(2), 
            displayUnit: "GWh" 
        };
    } else if (numericValue >= 1000) {
        // Convertir en MWh si >= 1 000 kWh
        return { 
            formattedValue: (numericValue / 1000).toFixed(2), 
            displayUnit: "MWh" 
        };
    } else {
        // Laisser en kWh pour les petites valeurs
        return { 
            formattedValue: numericValue.toFixed(1), 
            displayUnit: "kWh" 
        };
    }
};

const calculateVariation = (current: Big | null, previous: Big | null): number => {
    if (!current || !previous || previous.eq(0)) return 0;
    return current.minus(previous).div(previous).mul(100).toNumber();
};

export const SecteurConsoCard = ({
    name,
    consoElec,
    consoGaz,
    consoEau,
    consoAir,
    consoElecPrec,
    consoGazPrec,
    consoEauPrec,
    consoAirPrec
}: SecteurConsoCardProps): ReactElement => {
    const hasElecData = !consoElec.eq(0) || !consoElecPrec.eq(0);
    const hasGazData = !consoGaz.eq(0) || !consoGazPrec.eq(0);
    const hasEauData = !consoEau.eq(0) || !consoEauPrec.eq(0);
    const hasAirData = !consoAir.eq(0) || !consoAirPrec.eq(0);

    const variations = {
        elec: calculateVariation(consoElec, consoElecPrec),
        gaz: calculateVariation(consoGaz, consoGazPrec),
        eau: calculateVariation(consoEau, consoEauPrec),
        air: calculateVariation(consoAir, consoAirPrec)
    };
    
    // Formatage des valeurs d'électricité avec conversion d'unités
    const formattedElec = hasElecData ? formatValue(consoElec) : { formattedValue: "0.0", displayUnit: "kWh" };

    return (
        <div className="card-base">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{name}</h3>
            <div className="space-y-6">
                <div className={`flex items-start gap-4 p-4 rounded-lg ${variations.elec > 8 ? 'bg-red-50' : ''}`}>
                    <div className="icon-container" style={{ backgroundColor: ENERGY_CONFIG.electricity.BackgroundIconColor }}>
                        <Zap className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" style={{ color: ENERGY_CONFIG.electricity.iconColor }} />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-semibold text-gray-900">Électricité</div>
                        {hasElecData ? (
                            <div>
                                <div className="text-xl font-bold mt-2" style={{ color: ENERGY_CONFIG.electricity.color }}>
                                    {formattedElec.formattedValue} {formattedElec.displayUnit}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className={`px-3 py-1.5 rounded-lg font-medium text-lg ${
                                            variations.elec > 0
                                                ? variations.elec > 8
                                                    ? 'text-red-700 bg-red-100'
                                                    : 'text-gray-700 bg-gray-100'
                                                : 'text-green-700 bg-green-100'
                                        }`}
                                    >
                                        {variations.elec > 0 ? '+' : ''}{variations.elec.toFixed(1)}%
                                    </span>
                                    <span className="text-lg text-gray-500">vs période précédente</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-lg text-gray-500 mt-2">Aucune donnée disponible</div>
                        )}
                    </div>
                </div>

                <div className={`flex items-start gap-4 p-4 rounded-lg ${variations.gaz > 8 ? 'bg-red-50' : ''}`}>
                    <div className="icon-container" style={{ backgroundColor: ENERGY_CONFIG.gas.BackgroundIconColor }}>
                        <Flame className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" style={{ color: ENERGY_CONFIG.gas.iconColor }} />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-semibold text-gray-900">Gaz</div>
                        {hasGazData ? (
                            <div>
                                <div className="text-xl font-bold mt-2" style={{ color: ENERGY_CONFIG.gas.color }}>
                                    {consoGaz.toFixed(1)} m³
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className={`px-3 py-1.5 rounded-lg font-medium text-lg ${
                                            variations.gaz > 0
                                                ? variations.gaz > 8
                                                    ? 'text-red-700 bg-red-100'
                                                    : 'text-gray-700 bg-gray-100'
                                                : 'text-green-700 bg-green-100'
                                        }`}
                                    >
                                        {variations.gaz > 0 ? '+' : ''}{variations.gaz.toFixed(1)}%
                                    </span>
                                    <span className="text-lg text-gray-500">vs période précédente</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-lg text-gray-500 mt-2">Aucune donnée disponible</div>
                        )}
                    </div>
                </div>

                <div className={`flex items-start gap-4 p-4 rounded-lg ${variations.eau > 8 ? 'bg-red-50' : ''}`}>
                    <div className="icon-container" style={{ backgroundColor: ENERGY_CONFIG.water.BackgroundIconColor }}>
                        <Droplet className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" style={{ color: ENERGY_CONFIG.water.iconColor }} />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-semibold text-gray-900">Eau</div>
                        {hasEauData ? (
                            <div>
                                <div className="text-xl font-bold mt-2" style={{ color: ENERGY_CONFIG.water.color }}>
                                    {consoEau.toFixed(1)} m³
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className={`px-3 py-1.5 rounded-lg font-medium text-lg ${
                                            variations.eau > 0
                                                ? variations.eau > 8
                                                    ? 'text-red-700 bg-red-100'
                                                    : 'text-gray-700 bg-gray-100'
                                                : 'text-green-700 bg-green-100'
                                        }`}
                                    >
                                        {variations.eau > 0 ? '+' : ''}{variations.eau.toFixed(1)}%
                                    </span>
                                    <span className="text-lg text-gray-500">vs période précédente</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-lg text-gray-500 mt-2">Aucune donnée disponible</div>
                        )}
                    </div>
                </div>

                <div className={`flex items-start gap-4 p-4 rounded-lg ${variations.air > 8 ? 'bg-red-50' : ''}`}>
                    <div className="icon-container" style={{ backgroundColor: ENERGY_CONFIG.air.BackgroundIconColor }}>
                        <Wind className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" style={{ color: ENERGY_CONFIG.air.iconColor }} />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-semibold text-gray-900">Air</div>
                        {hasAirData ? (
                            <div>
                                <div className="text-xl font-bold mt-2" style={{ color: ENERGY_CONFIG.air.color }}>
                                    {consoAir.toFixed(1)} m³
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className={`px-3 py-1.5 rounded-lg font-medium text-lg ${
                                            variations.air > 0
                                                ? variations.air > 8
                                                    ? 'text-red-700 bg-red-100'
                                                    : 'text-gray-700 bg-gray-100'
                                                : 'text-green-700 bg-green-100'
                                        }`}
                                    >
                                        {variations.air > 0 ? '+' : ''}{variations.air.toFixed(1)}%
                                    </span>
                                    <span className="text-lg text-gray-500">vs période précédente</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-lg text-gray-500 mt-2">Aucune donnée disponible</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 