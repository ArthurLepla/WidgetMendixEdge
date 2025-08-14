Parfait, on garde ton esprit “sobre mais smart”, et on fait monter le niveau sans faire clignoter la discothèque. Voici un plan d’améliorations **ciblées** (UX + code) pour moderniser `LevelAnalysis` et ses sous-composants, avec des patchs concrets.

---

# 1) Axes d’amélioration (rapides, à fort impact)

1. **Un seul filtre énergie, synchronisé** entre le donut et le tableau.
   Aujourd’hui, le `activeEnergy` vit dans `LevelAnalysis` mais ne pilote que le tableau. Fais-le piloter aussi le donut : clic sur une part → même filtre, et les parts non sélectionnées deviennent “muettes” (opacité réduite). &#x20;

2. **État “no data” élégant** pour le donut et le tableau (zéro total ou lignes vides) : affiche un placeholder doux plutôt qu’un grand vide. &#x20;

3. **Label central dans le donut** (Total + unité), pour éviter d’avoir à descendre l’œil jusqu’au “Total: X” sous le graphique. Gagne un battement cardiaque de lecture.&#x20;

4. **Tri par colonne** dans la table (clic sur l’en-tête Élec./Gaz/Eau/Air) + `aria-sort` pour l’accessibilité. Aujourd’hui tu tries selon le tab actif, mais pas sur clic d’en-tête.&#x20;

5. **Micro-barchart dans cellule** (barre très fine en arrière-plan) pour donner la “longueur” relative de chaque valeur sans surcharger le visuel.&#x20;

6. **Tokens de design** (variables CSS) pour les 4 énergies + primary, et **suppression des `!important`** superflus. Ton CSS a du `!important` un peu partout, ce qui complique la maintenance. Centralise les couleurs dans `:root` de `.syntheseWidget-root`. &#x20;

7. **Ligne de titre compacte et alignements** : la hiérarchie typo “Analyse du niveau: L0” peut être plus compacte et homogène (même interlignage que les cartes), avec un sous-titre condensé. &#x20;

8. **Accessibilité & UX** : ajouter `aria-label`, `role="table"`, `aria-sort`, focus visibles sur tabs/headers, et `title` unifié.&#x20;

---

# 2) Patches concrets (modifs minimales, effet maximal)

## A) `LevelAnalysis.tsx` — synchroniser le filtre énergie

* Garde `activeEnergy` ici (bien), et passe-le aussi au donut avec un callback `onEnergyChange`.
* Le donut grise les segments ≠ sélection et remonte l’événement de clic.

```tsx
// LevelAnalysis.tsx
// ...
export function LevelAnalysis({...}: LevelAnalysisProps): ReactElement {
  const [activeEnergy, setActiveEnergy] = useState<EnergyKey>("all");

  return (
    <div className="card-base level-analysis">
      <LevelPicker levels={levelNames} selected={selectedLevel} onChange={onChangeLevel} />
      <div className="analysis-header title-medium" style={{ color: "#18213e" }}>
        Analyse du niveau: {selectedLevel}
      </div>
      <div className="analysis-grid">
        <div className="analysis-pane">
          <DonutEnergyChart
            title={`Répartition énergie — ${selectedLevel}`}
            data={donutData}
            activeEnergy={activeEnergy}
            onEnergyChange={setActiveEnergy}
          />
        </div>
        <div className="analysis-pane">
          <AssetsByEnergyTable
            rows={assetRows}
            levelName={selectedLevel}
            primaryColor="#18213e"
            activeEnergy={activeEnergy}
            onEnergyChange={setActiveEnergy}
          />
        </div>
      </div>
    </div>
  );
}
```

Réf. au fichier actuel : `LevelAnalysis.tsx` gère déjà `activeEnergy`, mais ne le passe pas au donut.&#x20;

---

## B) `DonutEnergyChart.tsx` — label central, clic segment, états “no data”

* Ajoute les props `activeEnergy?: "all"|"electricity"|"gas"|"water"|"air"` et `onEnergyChange?`.
* Centre un label total, grise les parts ≠ filtre, gère “no data”.

```tsx
// DonutEnergyChart.tsx
import { ReactElement, createElement } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./DonutEnergyChart.css";

interface DonutEnergyChartProps {
  title: string;
  data: { name: string; value: number }[];
  colors?: string[];
  activeEnergy?: "all" | "electricity" | "gas" | "water" | "air";
  onEnergyChange?: (k: "all" | "electricity" | "gas" | "water" | "air") => void;
}

const DEFAULT_COLORS = ["#38a13c", "#F9BE01", "#3293f3", "#66D8E6"];
const KEY_BY_INDEX = ["electricity", "gas", "water", "air"] as const;

export function DonutEnergyChart({
  title,
  data,
  colors = DEFAULT_COLORS,
  activeEnergy = "all",
  onEnergyChange
}: DonutEnergyChartProps): ReactElement {
  const total = data.reduce((a, d) => a + (d.value || 0), 0);
  const muted = (i: number) => activeEnergy !== "all" && KEY_BY_INDEX[i] !== activeEnergy;

  return (
    <div className="card-base donut-energy" role="group" aria-label={title}>
      <div className="title-medium" style={{ marginBottom: "0.75rem", color: "#18213e" }}>{title}</div>
      <div style={{ width: "100%", height: 260, position: "relative" }}>
        {total === 0 ? (
          <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#64748b" }}>
            Aucune donnée sur cette période
          </div>
        ) : (
          <>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  onClick={(_, idx) => onEnergyChange?.(KEY_BY_INDEX[idx])}
                >
                  {data.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={colors[idx % colors.length]}
                      opacity={muted(idx) ? 0.4 : 1}
                      cursor="pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8 }}
                  formatter={(v: any, n: any) => [
                    `${Intl.NumberFormat("fr-FR").format(v as number)}`,
                    n as string
                  ]}
                />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>

            {/* Label central */}
            <div style={{
              position: "absolute", inset: 0,
              display: "grid", placeItems: "center",
              pointerEvents: "none"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#64748b" }}>Total</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {Intl.NumberFormat("fr-FR").format(total)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

Base actuelle du composant donut : mêmes dépendances, on enrichit sans tout chambouler.&#x20;

---

## C) `AssetsByEnergyTable.tsx` — tri par colonne, mini-barres, a11y

* Ajoute un `sortKey` + `sortDir` et rends les headers cliquables.
* Ajoute une **barre de fond** proportionnelle à la valeur (par énergie).
* Ajoute `role="table"` et `aria-sort`.

```tsx
// AssetsByEnergyTable.tsx
import { ReactElement, createElement, useMemo, useState } from "react";
import { Zap, Flame, Droplet, Wind, ChevronUp, ChevronDown } from "lucide-react";
import "./AssetsByEnergyTable.css";

type SortKey = "name" | "electricity" | "gas" | "water" | "air";
type SortDir = "asc" | "desc";

// ...

export function AssetsByEnergyTable({ rows, levelName, primaryColor = "#18213e", activeEnergy, onEnergyChange }: AssetsByEnergyTableProps): ReactElement {
  const [internalTab, setInternalTab] = useState<(typeof ENERGY_TABS)[number]["key"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const activeTab = (activeEnergy as any) ?? internalTab;
  const setActiveTab = (k: any) => { setInternalTab(k); onEnergyChange?.(k); };

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

  const Header = ({label, color, k}: {label: string; color: string; k: SortKey}) => (
    <th
      className="table-cell-header text-center header-sortable"
      style={{ color }}
      onClick={() => toggleSort(k)}
      aria-sort={sortKey === k ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      title={`Trier par ${label}`}
    >
      <span className="header-content">
        {label}
        {sortKey === k ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
      </span>
    </th>
  );

  return (
    <div className="card-base assets-by-energy" role="table" aria-label={`Assets du niveau ${levelName}`}>
      <div className="table-header">
        <div className="title-medium" style={{ color: primaryColor }}>
          Assets du niveau: {levelName}
        </div>
        <div className="energy-tabs">
          {ENERGY_TABS.map(tab => (
            <button
              key={tab.key}
              className={`energy-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
              style={{ color: activeTab === tab.key ? tab.color : "#64748b", borderColor: activeTab === tab.key ? tab.color : "transparent" } as any}
              title={`Filtrer par ${tab.label}`}
            >
              {"Icon" in tab ? createElement((tab as any).Icon, { className: "w-4 h-4" }) : null}
              <span className="header-label">{tab.label}</span>
            </button>
          ))}
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
                <Header label={<><Zap className="w-4 h-4" /> Élec.</> as any} color="#38a13c" k="electricity" />
                <Header label={<><Flame className="w-4 h-4" /> Gaz</> as any} color="#F9BE01" k="gas" />
                <Header label={<><Droplet className="w-4 h-4" /> Eau</> as any} color="#3293f3" k="water" />
                <Header label={<><Wind className="w-4 h-4" /> Air</> as any} color="#66D8E6" k="air" />
                <th className="table-cell-header text-center" style={{ color: primaryColor }}>% (filtre)</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr><td colSpan={6} className="table-cell-data text-center text-muted">Aucun asset pour ce niveau</td></tr>
              ) : sortedRows.map((r) => {
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
                    <td className="table-cell-data text-center">
                      {activeTab === "all" ? <span className="metric-value-total text-muted">—</span> : <span className="metric-value-total" style={{ color: primaryColor }}>{pct.toFixed(1)}%</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

Dans ton code actuel, les tabs existent déjà et le tri est basé sur la tab active, mais pas sur clic d’en-tête, et pas d’`aria-sort`. On ajoute ces comportements sans casser l’existant.&#x20;

**CSS (ajouts) :**

```css
/* AssetsByEnergyTable.css – ajouts */
.syntheseWidget-root {
  --primary: #18213e;
  --elec: #38a13c;
  --gas: #F9BE01;
  --water: #3293f3;
  --air: #66D8E6;
}

.syntheseWidget-root .assets-by-energy .header-sortable { cursor: pointer; }
.syntheseWidget-root .assets-by-energy .text-muted { color: #6b7280; }

.syntheseWidget-root .assets-by-energy .cell-with-bar {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  width: 100%; min-width: 64px;
}
.syntheseWidget-root .assets-by-energy .cell-bar {
  position: absolute; left: 8px; right: 8px; height: 6px; border-radius: 9999px;
}
```

Tu peux ensuite **retirer quelques `!important`** qui ne sont plus nécessaires dans `LevelAnalysis.css`/`AssetsByEnergyTable.css` (garde-les seulement là où Mendix injecte un style trop fort). &#x20;

---

## D) `LevelPicker.tsx` — micro-polish accessibilité + compacité

* Ajoute un label accessible et un `id` pour le `<select>`.
* Resserre l’espacement vertical (déjà pas mal propre).

```tsx
// LevelPicker.tsx
export function LevelPicker({ levels, selected, onChange }: LevelPickerProps): ReactElement {
  const current = selected && levels.includes(selected) ? selected : levels[0] || "";
  const selId = "level-select";

  return (
    <div className="card-base">
      <div className="selector-header">
        <div className="selector-icon-wrapper">
          <Layers className="selector-icon" />
        </div>
        <div className="selector-content">
          <div className="selector-title-row">
            <h2 className="selector-title">Analyse par niveau</h2>
          </div>
          <div className="period-subtitle" id="level-help">Choisissez un niveau pour voir sa répartition et ses assets</div>
        </div>
        <div>
          <label htmlFor={selId} className="sr-only">Niveau</label>
          <select id={selId} aria-describedby="level-help" className="form-input" value={current} onChange={e => onChange(e.target.value)}>
            {levels.map(l => (<option key={l} value={l}>{l}</option>))}
          </select>
        </div>
      </div>
    </div>
  );
}
```

Tu peux ajouter `.sr-only` (classe utilitaire CSS) si tu ne l’as pas déjà. &#x20;

---

# 3) Détails stylistiques à corriger (sans changer l’ADN)

* **Titres** : uniformise `title-medium` (même taille/poids/marge partout). Aujourd’hui `DonutEnergyChart` redéfinit un margin inline ; passe en CSS. &#x20;
* **Icônes des tabs** : conserve la taille `w-4 h-4` et l’espacement `gap-0.375rem`, mais supprime les `!important` si possible (préférence aux classes plus spécifiques).&#x20;
* **Grille** : `analysis-grid` est bien. Ajoute un `minmax(0,1fr)` si tu rencontres des problèmes de débordement Recharts.&#x20;
* **Couleurs** : utilise les variables `--elec`, `--gas`, `--water`, `--air` dans tous les composants (table, donut, légende). Ça garantira la cohérence palette. &#x20;

---

# 4) Résultat attendu

* Une **lecture en 3 s** : niveau choisi → donut filtrable → table triable, avec barres miniatures qui donnent la dynamique sans voler la vedette.
* Une **cohérence visuelle** (tokens, marges, tailles d’icônes, opacités) et **comportements synchronisés** (tabs/segments).
* Un **CSS plus propre** (moins de `!important`), facilement thémable.

Si tu veux, je peux te livrer une *branch* “patch minimal” où je intègre ces modifs sans casser tes APIs Mendix, ou une variante “propre” avec extraction d’un composant `EnergyTabs` réutilisable pour donut + table.
