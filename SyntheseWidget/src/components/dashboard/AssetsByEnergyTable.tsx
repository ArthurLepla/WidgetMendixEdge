import { ReactElement, createElement, useMemo, useState } from "react";
import { Zap, Flame, Droplet, Wind, ChevronUp, ChevronDown } from "lucide-react";
import "./AssetsByEnergyTable.css";

export interface AssetRow {
    name: string;
    electricity: number;
    gas: number;
    water: number;
    air: number;
}

type EnergyKey = "all" | "electricity" | "gas" | "water" | "air";
type SortKey = "name" | "electricity" | "gas" | "water" | "air";
type SortDir = "asc" | "desc";

interface AssetsByEnergyTableProps {
    rows: AssetRow[];
    levelName: string;
    primaryColor?: string;
    activeEnergy?: EnergyKey;
}

export function AssetsByEnergyTable({ rows, levelName, primaryColor = "#18213e", activeEnergy }: AssetsByEnergyTableProps): ReactElement {
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const activeTab = activeEnergy || "all";

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("desc"); }
    };

    const sortedRows = useMemo(() => {
        const score = (r: AssetRow): number => (sortKey === "name" ? 0 :
            sortKey === "electricity" ? r.electricity :
            sortKey === "gas" ? r.gas :
            sortKey === "water" ? r.water : r.air);

        const base = [...rows].sort((a, b) => {
            if (sortKey === "name") return a.name.localeCompare(b.name);
            const diff = score(b) - score(a);
            return diff === 0 ? a.name.localeCompare(b.name) : diff;
        });
        return sortDir === "asc" ? base.reverse() : base;
    }, [rows, sortKey, sortDir]);

    const totals = useMemo(() => rows.reduce((acc, r) => ({
        electricity: acc.electricity + r.electricity,
        gas: acc.gas + r.gas,
        water: acc.water + r.water,
        air: acc.air + r.air
    }), { electricity: 0, gas: 0, water: 0, air: 0 }), [rows]);

    const fmt = (n: number) => Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);

    const pctOf = (v: number, denom: number) => (denom > 0 ? (v / denom) * 100 : 0);

    const Header = ({label, color, k}: {label: ReactElement; color: string; k: SortKey}) => (
        <th
            className="table-cell-header text-center header-sortable"
            style={{ color }}
            onClick={() => toggleSort(k)}
            aria-sort={sortKey === k ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
            title={`Trier par ${label.props.children[1]}`}
        >
            <span className="header-content">
                {label}
                {sortKey === k ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
            </span>
        </th>
    );

    const allRows = [
        ...sortedRows.map((r) => {
            const denom =
                activeTab === "electricity" ? totals.electricity :
                activeTab === "gas" ? totals.gas :
                activeTab === "water" ? totals.water :
                activeTab === "air" ? totals.air : 0;
            const value =
                activeTab === "electricity" ? r.electricity :
                activeTab === "gas" ? r.gas :
                activeTab === "water" ? r.water :
                activeTab === "air" ? r.air : 0;

            const pct = pctOf(value, denom);
            const cellBar = (val: number, col: string) => (
                <div className="cell-with-bar">
                    <div className="cell-bar" style={{ width: `${pctOf(val, col === "#38a13c" ? totals.electricity : col === "#F9BE01" ? totals.gas : col === "#3293f3" ? totals.water : totals.air)}%`, background: `${col}33` }} />
                    <span className="metric-value" style={{ color: col }}>{fmt(val)}</span>
                </div>
            );

            return (
                <tr key={r.name} className="table-row">
                    <td className="table-cell-data sticky-col level-cell" style={{ color: primaryColor }}>
                        <div className="level-badge" style={{ background: `${primaryColor}15`, color: primaryColor }}>{r.name}</div>
                    </td>
                    <td className="table-cell-data text-center">{cellBar(r.electricity, "#38a13c")}</td>
                    <td className="table-cell-data text-center">{cellBar(r.gas, "#F9BE01")}</td>
                    <td className="table-cell-data text-center">{cellBar(r.water, "#3293f3")}</td>
                    <td className="table-cell-data text-center">{cellBar(r.air, "#66D8E6")}</td>
                    {activeTab !== "all" && (
                        <td className="table-cell-data text-center">
                            <span className="metric-value-total" style={{ color: primaryColor }}>{pct.toFixed(1)}%</span>
                        </td>
                    )}
                </tr>
            );
        }),
        <tr key="total" className="table-row total-row">
            <td className="table-cell-data sticky-col total-cell" style={{ color: primaryColor }}>
                <div className="total-badge" style={{ background: `${primaryColor}25`, color: primaryColor, fontWeight: 700 }}>Total</div>
            </td>
            <td className="table-cell-data text-center">
                <span className="metric-value total-value" style={{ color: "#38a13c", fontWeight: 600 }}>{fmt(totals.electricity)}</span>
            </td>
            <td className="table-cell-data text-center">
                <span className="metric-value total-value" style={{ color: "#F9BE01", fontWeight: 600 }}>{fmt(totals.gas)}</span>
            </td>
            <td className="table-cell-data text-center">
                <span className="metric-value total-value" style={{ color: "#3293f3", fontWeight: 600 }}>{fmt(totals.water)}</span>
            </td>
            <td className="table-cell-data text-center">
                <span className="metric-value total-value" style={{ color: "#66D8E6", fontWeight: 600 }}>{fmt(totals.air)}</span>
            </td>
            {activeTab !== "all" && (
                <td className="table-cell-data text-center">
                    <span className="metric-value-total" style={{ color: primaryColor, fontWeight: 600 }}>100%</span>
                </td>
            )}
        </tr>
    ];

    return (
        <div className="card-base assets-by-energy" role="table" aria-label={`Assets du niveau ${levelName}`}>
            <div className="table-header">
                <div className="title-medium" style={{ color: primaryColor }}>
                    Assets du niveau: {levelName}
                </div>
            </div>

            <div className="table-container">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-cell-header sticky-col" style={{ color: primaryColor }} onClick={() => toggleSort("name")} aria-sort={sortKey === "name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                                    Asset
                                </th>
                                <Header label={<div><Zap className="w-4 h-4" /> Élec.</div>} color="#38a13c" k="electricity" />
                                <Header label={<div><Flame className="w-4 h-4" /> Gaz</div>} color="#F9BE01" k="gas" />
                                <Header label={<div><Droplet className="w-4 h-4" /> Eau</div>} color="#3293f3" k="water" />
                                <Header label={<div><Wind className="w-4 h-4" /> Air</div>} color="#66D8E6" k="air" />
                                {activeTab !== "all" && <th className="table-cell-header text-center" style={{ color: primaryColor }}>%</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRows.length === 0 ? (
                                <tr><td colSpan={activeTab !== "all" ? 6 : 5} className="table-cell-data text-center text-muted">Aucun asset pour ce niveau</td></tr>
                            ) : (
                                allRows
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}