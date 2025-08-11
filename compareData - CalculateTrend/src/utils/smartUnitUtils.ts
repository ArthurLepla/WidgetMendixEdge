import { ListValue, ListAttributeValue } from "mendix";

// Types correspondant exactement aux enums Mendix
export type SmartMetricType = 'Conso' | 'IPE' | 'IPE_kg' | 'Prod' | 'Prod_kg' | 'Custom';
export type SmartEnergyType = 'Elec' | 'Gaz' | 'Eau' | 'Air' | 'None';

export interface SmartVariableData {
  iihId: string;
  name: string;
  unit: string;
  dataType: string;
  metricType: SmartMetricType;
  energyType: SmartEnergyType;
  isActive: boolean;
}

/**
 * Mapping des attributs calculés Smart.Asset vers (MetricType, EnergyType)
 * Permet de relier un attribut affiché (ex: ProdTotal) à la variable Smart correspondante (Prod/None)
 */
export const SMART_ASSET_ATTRIBUTE_MAPPING: Record<string, { metricType: SmartMetricType; energyType: SmartEnergyType }> = {
  // Consommation totale par énergie (période courante et précédente)
  ConsoTotalElec: { metricType: "Conso", energyType: "Elec" },
  ConsoTotalGaz: { metricType: "Conso", energyType: "Gaz" },
  ConsoTotalEau: { metricType: "Conso", energyType: "Eau" },
  ConsoTotalAir: { metricType: "Conso", energyType: "Air" },
  ConsoTotalElecPrev: { metricType: "Conso", energyType: "Elec" },
  ConsoTotalGazPrev: { metricType: "Conso", energyType: "Gaz" },
  ConsoTotalEauPrev: { metricType: "Conso", energyType: "Eau" },
  ConsoTotalAirPrev: { metricType: "Conso", energyType: "Air" },

  // IPE quantité par énergie
  IPEElec: { metricType: "IPE", energyType: "Elec" },
  IPEGaz: { metricType: "IPE", energyType: "Gaz" },
  IPEEau: { metricType: "IPE", energyType: "Eau" },
  IPEAir: { metricType: "IPE", energyType: "Air" },
  // IPE kg par énergie
  IPEElecKg: { metricType: "IPE_kg", energyType: "Elec" },
  IPEGazKg: { metricType: "IPE_kg", energyType: "Gaz" },
  IPEEauKg: { metricType: "IPE_kg", energyType: "Eau" },
  IPEAirKg: { metricType: "IPE_kg", energyType: "Air" },

  // Production (EnergyType=None)
  ProdTotal: { metricType: "Prod", energyType: "None" },
  ProdTotalPrev: { metricType: "Prod", energyType: "None" },
  ProdTotalKg: { metricType: "Prod_kg", energyType: "None" },
  ProdTotalPrevKg: { metricType: "Prod_kg", energyType: "None" }
};

/**
 * Mapping des types d'énergie du widget vers les enums Smart
 */
export const WIDGET_TO_SMART_ENERGY_MAPPING: Record<string, SmartEnergyType> = {
  'electricity': 'Elec',
  'gas': 'Gaz',
  'water': 'Eau',
  'air': 'Air',
  'Elec': 'Elec',
  'Gaz': 'Gaz',
  'Eau': 'Eau',
  'Air': 'Air',
  'IPE': 'Elec' // IPE par défaut utilise Elec
};

/**
 * Extrait les données des variables Smart depuis la datasource assetVariablesDataSource
 */
export function extractSmartVariablesData(
  assetVariablesDataSource?: ListValue,
  variableNameAttr?: ListAttributeValue<string>,
  variableUnitAttr?: ListAttributeValue<string>,
  variableMetricTypeAttr?: ListAttributeValue<string>,
  variableEnergyTypeAttr?: ListAttributeValue<string>
): SmartVariableData[] {
  if (!assetVariablesDataSource?.items || 
      !variableNameAttr || 
      !variableUnitAttr || 
      !variableMetricTypeAttr || 
      !variableEnergyTypeAttr) {
    return [];
  }

  return assetVariablesDataSource.items
    .map(item => {
      const metricTypeStr = variableMetricTypeAttr.get(item)?.value || '';
      const energyTypeStr = variableEnergyTypeAttr.get(item)?.value || '';
      
      return {
        iihId: '', // Peut être ajouté si nécessaire
        name: variableNameAttr.get(item)?.value || '',
        unit: variableUnitAttr.get(item)?.value || '',
        dataType: '', // Peut être ajouté si nécessaire
        metricType: metricTypeStr as SmartMetricType,
        energyType: energyTypeStr as SmartEnergyType,
        isActive: true
      };
    })
    .filter(v => v.name && v.unit && v.metricType && v.energyType);
}

/**
 * Trouve l'unité d'une variable Smart pour un couple (metricType, energyType) donné
 */
export function findSmartVariableUnit(
  variables: SmartVariableData[],
  metricType: SmartMetricType,
  energyType: SmartEnergyType
): string {
  const candidates = variables.filter(v => 
    v.metricType === metricType && 
    v.energyType === energyType && 
    v.unit && 
    v.unit.trim().length > 0
  );
  
  if (candidates.length === 0) return '';
  
  // Retourner l'unité la plus fréquente
  const freq: Record<string, number> = {};
  for (const v of candidates) {
    const u = v.unit.trim();
    freq[u] = (freq[u] || 0) + 1;
  }
  
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || '';
}

/**
 * Extrait l'unité d'une carte depuis un attribut Smart.Asset
 */
export function getCardUnitFromSmartAssetAttr(
  valueAttrPath: string,
  variables: SmartVariableData[]
): string {
  const mapping = SMART_ASSET_ATTRIBUTE_MAPPING[valueAttrPath];
  if (!mapping) return '';
  
  return findSmartVariableUnit(variables, mapping.metricType, mapping.energyType);
}

/**
 * Résout l'unité d'une carte en mode Smart
 */
export function getSmartCardUnit(
  variables: SmartVariableData[], 
  widgetEnergyType: string, 
  cardPosition: 'card1' | 'card2' | 'card3',
  viewMode: string
): string {
  if (viewMode === 'ipe') {
    // En mode IPE, les cartes affichent des unités de production
    if (cardPosition === 'card1') {
      return findSmartVariableUnit(variables, 'IPE', WIDGET_TO_SMART_ENERGY_MAPPING[widgetEnergyType] || 'Elec');
    } else if (cardPosition === 'card2') {
      return findSmartVariableUnit(variables, 'IPE_kg', WIDGET_TO_SMART_ENERGY_MAPPING[widgetEnergyType] || 'Elec');
    } else {
      return findSmartVariableUnit(variables, 'Prod', 'None');
    }
  } else {
    // En mode consommation
    const smartEnergyType = WIDGET_TO_SMART_ENERGY_MAPPING[widgetEnergyType] || 'Elec';
    return findSmartVariableUnit(variables, 'Conso', smartEnergyType);
  }
}

/**
 * Résout les unités IPE intelligentes pour le toggle Double IPE
 */
export function getSmartIPEUnits(
  variables: SmartVariableData[],
  widgetEnergyType: string
): { ipe1Unit: string; ipe2Unit: string } {
  // 1) Déterminer l'énergie Smart pertinente
  let smartEnergyType = WIDGET_TO_SMART_ENERGY_MAPPING[widgetEnergyType];

  if (!smartEnergyType) {
    // Choisir l'énergie la plus représentée parmi les variables IPE (priorité IPE_kg)
    const candidatesKg = variables.filter(v => v.metricType === 'IPE_kg' && v.unit);
    const candidates = candidatesKg.length > 0 ? candidatesKg : variables.filter(v => v.metricType === 'IPE' && v.unit);
    const freq: Record<string, number> = {};
    for (const v of candidates) {
      freq[v.energyType] = (freq[v.energyType] || 0) + 1;
    }
    const bestEnergy = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] as SmartEnergyType | undefined;
    smartEnergyType = bestEnergy || 'Elec';
  }

  // 2) Résoudre séparément l'unité de IPE_kg et celle de IPE (pcs)
  const unitKg = findSmartVariableUnit(variables, 'IPE_kg', smartEnergyType);
  const unitPcs = findSmartVariableUnit(variables, 'IPE', smartEnergyType);

  // 3) Renvoyer deux unités distinctes pour alimenter le toggle
  //    - ipe1Unit: IPE_kg si disponible (ex: kWh/kg), sinon IPE
  //    - ipe2Unit: IPE (ex: kWh/pcs) si dispo, sinon IPE_kg
  const ipe1Unit = unitKg || unitPcs || '';
  const ipe2Unit = unitPcs || unitKg || '';

  return { ipe1Unit, ipe2Unit };
}

/**
 * Extrait les variantes IPE disponibles pour une énergie cible à partir des variables liées à l'asset.
 * - Sans hardcode des unités: lit directement les unités des variables.
 * - Retourne au plus une variante par metricType (IPE, IPE_kg) avec l'unité la plus fréquente.
 */
export function getIPEVariantsFromVariables(
  variables: SmartVariableData[],
  targetEnergy: SmartEnergyType
): Array<{ metricType: SmartMetricType; energyType: SmartEnergyType; unit: string }> {
  if (!variables || variables.length === 0) return [];

  // Garder uniquement IPE* pour l'énergie demandée
  const candidates = variables.filter(v =>
    (v.metricType === 'IPE' || v.metricType === 'IPE_kg') && v.energyType === targetEnergy && !!v.unit
  );

  // Agréger par metricType → unité la plus fréquente
  const byMetric: Record<string, Record<string, number>> = {};
  for (const v of candidates) {
    if (!byMetric[v.metricType]) byMetric[v.metricType] = {};
    const u = v.unit.trim();
    byMetric[v.metricType][u] = (byMetric[v.metricType][u] || 0) + 1;
  }

  const variants: Array<{ metricType: SmartMetricType; energyType: SmartEnergyType; unit: string }> = [];
  (['IPE_kg', 'IPE'] as SmartMetricType[]).forEach(mt => {
    const freqMap = byMetric[mt];
    if (freqMap) {
      const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
      const bestUnit = sorted[0]?.[0] || '';
      if (bestUnit) variants.push({ metricType: mt, energyType: targetEnergy, unit: bestUnit });
    }
  });

  return variants;
}

/**
 * Trouve l'unité de Production la plus cohérente avec une unité d'IPE donnée, sans hardcode de mapping.
 * - Ex.: IPE "kWh/kg" → préférer une variable Prod dont l'unité est "kg".
 * - Ex.: IPE "kWh/pcs" → préférer Prod avec unité "pcs".
 * - À défaut, renvoie l'unité Prod la plus fréquente disponible.
 */
export function findProductionUnitForIPE(
  variables: SmartVariableData[],
  ipeUnit: string
): string {
  if (!variables || variables.length === 0) return '';

  const prodVars = variables.filter(v => v.metricType.startsWith('Prod'));
  if (prodVars.length === 0) return '';

  const denom = (ipeUnit || '').split('/')[1]?.trim().toLowerCase();
  if (denom) {
    // Chercher la meilleure correspondance par inclusion (kg, pcs, etc.)
    const exact = prodVars.find(v => v.unit.trim().toLowerCase() === denom)?.unit;
    if (exact) return exact;
    const containing = prodVars.find(v => v.unit.toLowerCase().includes(denom))?.unit;
    if (containing) return containing;
  }

  // Sinon, renvoyer l'unité Prod la plus fréquente
  const freq: Record<string, number> = {};
  for (const v of prodVars) {
    const u = v.unit.trim();
    freq[u] = (freq[u] || 0) + 1;
  }
  const best = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
  return best || '';
}

/**
 * Résout l'unité IPE pour une série spécifique en se basant sur MetricType/EnergyType de la série.
 * - Priorité IPE_kg > IPE si MetricType ne précise pas
 */
export function getSmartIPEUnitForSeries(
  variables: SmartVariableData[],
  seriesMetricType?: string | null,
  seriesEnergyType?: string | null,
  widgetEnergyType?: string
): string {
  // Normaliser
  const mt = (seriesMetricType || '').trim() as SmartMetricType;
  const et = (seriesEnergyType || '').trim() as SmartEnergyType;

  // 1) Si la série indique explicitement IPE_kg ou IPE + énergie → direct
  if (et) {
    if (mt === 'IPE_kg') {
      const u = findSmartVariableUnit(variables, 'IPE_kg', et);
      if (u) return u;
    }
    if (mt === 'IPE') {
      const u = findSmartVariableUnit(variables, 'IPE', et);
      if (u) return u;
    }
    // Sinon, tenter IPE_kg puis IPE
    const uKg = findSmartVariableUnit(variables, 'IPE_kg', et);
    if (uKg) return uKg;
    const u = findSmartVariableUnit(variables, 'IPE', et);
    if (u) return u;
  }

  // 2) Pas d'énergie fournie: utiliser l'énergie du widget s'il existe
  const widgetEt = WIDGET_TO_SMART_ENERGY_MAPPING[widgetEnergyType || ''] || 'Elec';
  const wKg = findSmartVariableUnit(variables, 'IPE_kg', widgetEt);
  if (wKg) return wKg;
  const w = findSmartVariableUnit(variables, 'IPE', widgetEt);
  if (w) return w;

  // 3) Dernier recours: choisir la première unité IPE_kg ou IPE disponible
  const anyKg = variables.find(v => v.metricType === 'IPE_kg' && v.unit)?.unit;
  if (anyKg) return anyKg;
  const any = variables.find(v => v.metricType === 'IPE' && v.unit)?.unit;
  return any || '';
}

/**
 * Debug des variables Smart pour le développement
 */
export function debugSmartVariables(variables: SmartVariableData[]): object {
  const byMetric: Record<string, SmartVariableData[]> = {};
  const byEnergy: Record<string, SmartVariableData[]> = {};
  
  for (const v of variables) {
    if (!byMetric[v.metricType]) byMetric[v.metricType] = [];
    if (!byEnergy[v.energyType]) byEnergy[v.energyType] = [];
    byMetric[v.metricType].push(v);
    byEnergy[v.energyType].push(v);
  }
  
  return {
    total: variables.length,
    byMetric,
    byEnergy,
    ipeVariants: getIPEVariantsFromVariables(variables, 'Elec'),
    smartIPEUnits: getSmartIPEUnits(variables, 'Elec')
  };
}


