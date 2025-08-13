import { EnergyFlowData, SankeyFormattedData } from "../types/EnergyFlow.types";

/**
 * Transformations pour convertir les EnergyFlowNode vers différents formats
 */
export class DataTransformers {
    
    /**
     * Transforme les données de flux en format D3-Sankey
     */
    static toSankeyFormat(flows: EnergyFlowData[]): SankeyFormattedData {
        try {
            // Extraction des nœuds uniques
            const nodeIds = new Set<string>();
            flows.forEach(flow => {
                nodeIds.add(flow.source);
                nodeIds.add(flow.target);
            });
            
            const nodes = Array.from(nodeIds).map((id, index) => ({
                id: id,
                name: id,
                level: DataTransformers.calculateNodeLevel(id, flows)
            }));
            
            // Création de l'index des nœuds
            const nodeIndexMap = new Map<string, number>();
            nodes.forEach((node, index) => {
                nodeIndexMap.set(node.id, index);
            });
            
            // Transformation des liens
            const links = flows
                .filter(flow => flow.value > 0) // Filtrer les valeurs nulles
                .map(flow => ({
                    source: nodeIndexMap.get(flow.source) || 0,
                    target: nodeIndexMap.get(flow.target) || 0,
                    value: flow.value,
                    percentage: flow.percentage
                }));
            
            return { 
                nodes, 
                links, 
                status: "available" 
            };
            
        } catch (error) {
            console.error("Error in DataTransformers.toSankeyFormat:", error);
            return { 
                nodes: [], 
                links: [], 
                status: "error" 
            };
        }
    }
    
    /**
     * Calcule le niveau hiérarchique d'un nœud (simple heuristique)
     */
    private static calculateNodeLevel(nodeId: string, flows: EnergyFlowData[]): number {
        // Les sources sans parents sont niveau 0
        const hasParent = flows.some(flow => flow.target === nodeId);
        if (!hasParent) return 0;
        
        // Calcul récursif du niveau maximum des parents + 1
        const parents = flows
            .filter(flow => flow.target === nodeId)
            .map(flow => flow.source);
            
        const maxParentLevel = Math.max(
            ...parents.map(parent => DataTransformers.calculateNodeLevel(parent, flows))
        );
        
        return maxParentLevel + 1;
    }
}

/**
 * Utilitaires pour les calculs de données énergétiques
 */
export class EnergyCalculations {
    
    /**
     * Calcule les pourcentages normalisés pour un groupe de flux
     */
    static normalizePercentages(flows: EnergyFlowData[]): EnergyFlowData[] {
        const totalValue = flows.reduce((sum, flow) => sum + flow.value, 0);
        
        if (totalValue === 0) {
            return flows.map(flow => ({ ...flow, percentage: 0 }));
        }
        
        return flows.map(flow => ({
            ...flow,
            percentage: Math.round((flow.value / totalValue) * 100 * 100) / 100 // 2 décimales
        }));
    }
    
    /**
     * Formate les valeurs selon l'unité énergétique
     */
    static formatValue(value: number, unit: string): string {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M ${unit}`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k ${unit}`;
        }
        return `${value.toFixed(1)} ${unit}`;
    }
}

/**
 * Service de conversion d'unités (énergie/volume) avec détection d'unité de base.
 * - Énergie: Wh, kWh, MWh, GWh
 * - Volume: L, m3
 */
export type UnitKind = "energy" | "volume" | "unknown";

export interface UnitDescriptor {
    kind: UnitKind;
    base: string; // Unité de base interne (kWh pour énergie, L pour volume)
    unit: string; // Unité canonique d'entrée (ex: "kwh", "m3")
}

export class UnitConversionError extends Error {
    constructor(
        message: string,
        public readonly code: "UNKNOWN_UNIT" | "INCOMPATIBLE_UNITS",
        public readonly meta?: Record<string, any>
    ) {
        super(message);
        this.name = "UnitConversionError";
    }
}

export class UnitConversionService {
    // Tables de conversion vers unité de base
    // Base énergie en kWh (aligné avec les capteurs)
    private static energyToKWh: Record<string, number> = {
        kwh: 1,
        mwh: 1000,
        gwh: 1000 * 1000,
        wh: 1 / 1000
    };

    private static volumeToL: Record<string, number> = {
        l: 1,
        liter: 1,
        litres: 1,
        m3: 1000,
        "m^3": 1000,
        cubicmeter: 1000
    };

    /** Normalise une unité brute: lowercase, suppression espaces/punct, gestion de "m³" → "m3" */
    private static canonicalizeUnit(raw?: string | null): string {
        if (!raw) return "";
        const replaced = raw.replace(/³/g, "3");
        const cleaned = replaced.toLowerCase().replace(/[^a-z0-9]/g, "");
        // synonymes → canonique
        const synonyms: Record<string, string> = {
            kilowatthour: "kwh",
            megawatthour: "mwh",
            gigawatthour: "gwh",
            watthour: "wh",
            litre: "l",
            litres: "l",
            liter: "l",
            liters: "l",
            cubicmeter: "m3",
            cubicmeters: "m3",
            cubicmetre: "m3",
            cubicmetres: "m3"
        };
        return synonyms[cleaned] ?? cleaned;
    }

    /** Détecte le type et l'unité de base probable à partir d'une chaîne (ex: "kWh", "m3"). */
    static detectUnit(unitInput?: string | null): UnitDescriptor {
        const u = this.canonicalizeUnit(unitInput);
        if (!u) return { kind: "unknown", base: "", unit: "" };
        if (u in this.energyToKWh) return { kind: "energy", base: "kWh", unit: u };
        if (u in this.volumeToL) return { kind: "volume", base: "L", unit: u };
        // Aucun match → inconnu
        return { kind: "unknown", base: "", unit: u };
    }

    /** Détecte et lève une erreur si l'unité est inconnue */
    static requireKnownUnit(unitInput?: string | null): UnitDescriptor {
        const d = this.detectUnit(unitInput);
        if (d.kind === "unknown") {
            throw new UnitConversionError("Unknown unit", "UNKNOWN_UNIT", { unit: unitInput });
        }
        return d;
    }

    /** Convertit une valeur depuis son unité d'origine vers une unité cible. */
    static convert(value: number, fromUnit: string, toUnit: string): number {
        const from = this.canonicalizeUnit(fromUnit);
        const to = this.canonicalizeUnit(toUnit);
        const fromDesc = this.requireKnownUnit(from);
        const toDesc = this.requireKnownUnit(to);

        if (fromDesc.kind === "energy" && toDesc.kind === "energy") {
            const vInkWh = value * (this.energyToKWh[from] ?? 1);
            const factor = Object.entries(this.energyToKWh).reduce((acc, [k, f]) => (k === to ? f : acc), 1);
            return vInkWh / factor;
        }

        if (fromDesc.kind === "volume" && toDesc.kind === "volume") {
            const vInL = value * (this.volumeToL[from] ?? 1);
            const factor = Object.entries(this.volumeToL).reduce((acc, [k, f]) => (k === to ? f : acc), 1);
            return vInL / factor;
        }
        // Incompatible
        throw new UnitConversionError("Incompatible unit kinds", "INCOMPATIBLE_UNITS", { from: fromUnit, to: toUnit });
    }

    /**
     * Retourne un format intelligent (valeur + unité) selon des seuils humains.
     * Exemple: 1 500 000 Wh → 1.5 MWh; 2 000 L → 2 m3.
     */
    static autoFormat(value: number, baseUnit: string): { value: number; unit: string } {
        const desc = this.requireKnownUnit(baseUnit);
        if (desc.kind === "energy") {
            // Politique: base capteur = kWh → MWh à partir de 1 000 kWh, GWh à partir de 1 000 000 kWh
            const u = this.canonicalizeUnit(baseUnit);
            if (u === "kwh") {
                if (value >= 1_000_000) return { value: value / 1_000_000, unit: "GWh" };
                if (value >= 1_000) return { value: value / 1_000, unit: "MWh" };
                return { value, unit: "kWh" };
            }
            if (u === "mwh") {
                if (value >= 1_000) return { value: value / 1_000, unit: "GWh" };
                return { value, unit: "MWh" };
            }
            if (u === "gwh") {
                return { value, unit: "GWh" };
            }
            // fallback pour d'autres unités énergie
            if (value >= 1_000) return { value: value / 1_000, unit: "MWh" };
            return { value, unit: "kWh" };
        }
        if (desc.kind === "volume") {
            if (value >= 1000) return { value: value / 1000, unit: "m3" };
            return { value, unit: "L" };
        }
        // Ne devrait pas arriver (requireKnownUnit lève déjà)
        throw new UnitConversionError("Unknown unit", "UNKNOWN_UNIT", { unit: baseUnit });
    }
}