import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, Flame, Droplet, Wind, CalendarRange, ChevronDown, TrendingUp, TrendingDown, Factory } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

// -----------------------------------------------------
// Palette & thème jour
// -----------------------------------------------------
const palette = {
  primary:   { color: "#18213e", name: "Primaire" },
  electric:  { color: "#38a13c", name: "Électricité" },
  gas:       { color: "#f9be01", name: "Gaz" },
  water:     { color: "#3293f3", name: "Eau" },
  air:       { color: "#66d8e6", name: "Air" },
};

// -----------------------------------------------------
// Utilitaires de démo (mock data + helpers)
// -----------------------------------------------------
const PERIOD_PRESETS = [
  { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" },
  { key: "mtd", label: "Mois en cours" },
  { key: "m-1", label: "Mois -1" },
  { key: "ytd", label: "YTD" },
  { key: "n-1", label: "Année -1" },
  { key: "custom", label: "Perso" }
];

const LEVELS = ["L0", "L1", "L2", "L3"];

// Données factices pour la démo
const CURRENT = [
  { level: "L0", electricity: 12000, gas: 8200, water: 2500, air: 1600 },
  { level: "L1", electricity: 9200, gas: 5400, water: 1850, air: 1100 },
  { level: "L2", electricity: 6100, gas: 3100, water: 1250, air: 900 },
  { level: "L3", electricity: 2600, gas: 1300, water: 520, air: 320 }
];

const PREVIOUS = [
  { level: "L0", electricity: 11500, gas: 8700, water: 2400, air: 1500 },
  { level: "L1", electricity: 9500, gas: 5200, water: 1750, air: 1200 },
  { level: "L2", electricity: 6400, gas: 3300, water: 1300, air: 950 },
  { level: "L3", electricity: 2800, gas: 1400, water: 540, air: 350 }
];

function sumBy(data, key, levelsFilter) {
  return data
    .filter(d => levelsFilter.includes(d.level))
    .reduce((acc, d) => acc + (d[key] || 0), 0);
}

function pctChange(curr, prev) {
  if (!prev || prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
}

const fmt = (n, digits = 0) =>
  n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });

// DPE (très simplifié) – renvoie lettre et borne indicative
function computeDPE(kwhPerM2) {
  const thresholds = [
    { letter: "A", max: 70 },
    { letter: "B", max: 110 },
    { letter: "C", max: 180 },
    { letter: "D", max: 250 },
    { letter: "E", max: 330 },
    { letter: "F", max: 420 },
    { letter: "G", max: Infinity }
  ];
  for (const t of thresholds) if (kwhPerM2 <= t.max) return t.letter;
  return "G";
}

// -----------------------------------------------------
// Composants UI
// -----------------------------------------------------
function PeriodSelector({ value, onChange }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-3 md:p-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: palette.primary.color }}>
          <CalendarRange className="h-4 w-4" /> Période
        </div>
        <Separator orientation="vertical" className="hidden md:block h-6" />
        <div className="flex flex-wrap gap-2">
          {PERIOD_PRESETS.map(p => (
            <Button
              key={p.key}
              size="sm"
              variant={value === p.key ? "default" : "secondary"}
              onClick={() => onChange(p.key)}
              className="rounded-full border"
              style={
                value === p.key
                  ? { backgroundColor: palette.primary.color, color: "white", borderColor: palette.primary.color }
                  : { backgroundColor: "#f8fafc", color: palette.primary.color, borderColor: "#e2e8f0" }
              }
            >
              {p.label}
            </Button>
          ))}
        </div>
        {value === "custom" && (
          <div className="ml-auto flex items-center gap-2 text-xs" style={{ color: palette.primary.color }}>
            <Badge variant="secondary">Sélection date à brancher</Badge>
            <ChevronDown className="h-4 w-4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LevelChips({ levels, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LEVELS.map(lvl => {
        const active = levels.includes(lvl);
        return (
          <Button
            key={lvl}
            size="sm"
            variant={active ? "default" : "outline"}
            onClick={() => onToggle(lvl)}
            className="rounded-full"
            style={
              active
                ? { backgroundColor: palette.primary.color, color: "white", borderColor: palette.primary.color }
                : { color: palette.primary.color, borderColor: "#cbd5e1" }
            }
          >
            {lvl}
          </Button>
        );
      })}
    </div>
  );
}

function Delta({ value }) {
  const isUp = value >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const color = isUp ? "#0f9d58" : "#d93025"; // vert/rouge sobres
  return (
    <div className="flex items-center gap-1 text-xs" style={{ color }}>
      <Icon className="h-4 w-4" />
      {value === 0 ? "–" : `${value.toFixed(1)}%`}
    </div>
  );
}

function KPIEnergyCard({ icon: Icon, label, unit, value, delta, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: color }} />
        <CardHeader className="pb-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}20` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <CardTitle className="text-sm font-medium" style={{ color: palette.primary.color }}>{label}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end justify-between">
            <div className="text-2xl font-semibold tabular-nums" style={{ color: palette.primary.color }}>
              {fmt(value)} <span className="text-sm opacity-70">{unit}</span>
            </div>
            <Delta value={delta} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DPEGauge({ kwhPerM2 }) {
  const letter = computeDPE(kwhPerM2);
  const scale = ["A", "B", "C", "D", "E", "F", "G"];
  const index = scale.indexOf(letter);

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium" style={{ color: palette.primary.color }}>DPE énergétique (indicatif)</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-1">
            {scale.map((l, i) => (
              <div key={l} className="h-8 rounded-md flex items-center justify-center text-xs font-semibold text-white" style={{
                backgroundColor:
                  i === 0 ? "#059669" :
                  i === 1 ? "#10b981" :
                  i === 2 ? "#84cc16" :
                  i === 3 ? "#eab308" :
                  i === 4 ? "#f59e0b" :
                  i === 5 ? "#f43f5e" :
                  "#dc2626"
              }}>{l}</div>
            ))}
          </div>
          <div className="relative h-6">
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: `${(index / 6) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 12 }}
              className="absolute -translate-x-1/2 -top-2"
            >
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-[10px] border-l-transparent border-r-transparent" style={{ borderBottomColor: palette.primary.color }} />
            </motion.div>
          </div>
          <div className="text-xs" style={{ color: palette.primary.color }}>
            Intensité estimée: <span className="font-medium">{fmt(kwhPerM2)}</span> kWh/m²/an
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ByLevelChart({ data, levels }) {
  const filtered = data.filter(d => levels.includes(d.level));
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium" style={{ color: palette.primary.color }}>Répartition par niveau</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filtered}>
            <XAxis dataKey="level" tick={{ fill: palette.primary.color }} />
            <YAxis tick={{ fill: palette.primary.color }} />
            <Tooltip formatter={(v, n) => [fmt(v), n]} />
            <Legend />
            <Bar dataKey="electricity" stackId="a" name="Électricité" fill={palette.electric.color} />
            <Bar dataKey="gas" stackId="a" name="Gaz" fill={palette.gas.color} />
            <Bar dataKey="water" stackId="a" name="Eau" fill={palette.water.color} />
            <Bar dataKey="air" stackId="a" name="Air comprimé" fill={palette.air.color} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ByLevelTable({ data, levels }) {
  const filtered = data.filter(d => levels.includes(d.level));
  const totals = {
    electricity: filtered.reduce((a, b) => a + b.electricity, 0),
    gas: filtered.reduce((a, b) => a + b.gas, 0),
    water: filtered.reduce((a, b) => a + b.water, 0),
    air: filtered.reduce((a, b) => a + b.air, 0)
  };
  const headStyle = { color: palette.primary.color };
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium" style={headStyle}>Détail par niveau</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="py-2" style={headStyle}>Niveau</th>
              <th className="py-2" style={headStyle}>Électricité</th>
              <th className="py-2" style={headStyle}>Gaz</th>
              <th className="py-2" style={headStyle}>Eau</th>
              <th className="py-2" style={headStyle}>Air</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.level} className="border-t">
                <td className="py-2 font-medium" style={headStyle}>{row.level}</td>
                <td className="py-2 tabular-nums">{fmt(row.electricity)}</td>
                <td className="py-2 tabular-nums">{fmt(row.gas)}</td>
                <td className="py-2 tabular-nums">{fmt(row.water)}</td>
                <td className="py-2 tabular-nums">{fmt(row.air)}</td>
              </tr>
            ))}
            <tr className="border-t font-semibold">
              <td className="py-2" style={headStyle}>Total</td>
              <td className="py-2 tabular-nums">{fmt(totals.electricity)}</td>
              <td className="py-2 tabular-nums">{fmt(totals.gas)}</td>
              <td className="py-2 tabular-nums">{fmt(totals.water)}</td>
              <td className="py-2 tabular-nums">{fmt(totals.air)}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function SummaryHero({ totalKwh, delta, periodLabel }) {
  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: palette.primary.color }} />
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="p-3 rounded-2xl" style={{ backgroundColor: "#e2e8f0" }}>
            <Factory className="h-6 w-6" style={{ color: palette.primary.color }} />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide" style={{ color: palette.primary.color }}>Synthèse {periodLabel}</div>
            <div className="mt-1 text-3xl md:text-4xl font-semibold tabular-nums" style={{ color: palette.primary.color }}>
              {fmt(totalKwh)} <span className="text-lg opacity-70">kWh équiv.</span>
            </div>
            <div className="mt-1"><Delta value={delta} /></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------
// Composant principal
// -----------------------------------------------------
export default function SmartEnergyDashboard() {
  const [period, setPeriod] = useState("30d");
  const [activeLevels, setActiveLevels] = useState(["L0", "L1", "L2", "L3"]);

  const totals = useMemo(() => {
    return {
      electricity: sumBy(CURRENT, "electricity", activeLevels),
      gas: sumBy(CURRENT, "gas", activeLevels),
      water: sumBy(CURRENT, "water", activeLevels),
      air: sumBy(CURRENT, "air", activeLevels)
    };
  }, [activeLevels]);

  const previousTotals = useMemo(() => {
    return {
      electricity: sumBy(PREVIOUS, "electricity", activeLevels),
      gas: sumBy(PREVIOUS, "gas", activeLevels),
      water: sumBy(PREVIOUS, "water", activeLevels),
      air: sumBy(PREVIOUS, "air", activeLevels)
    };
  }, [activeLevels]);

  const deltas = {
    electricity: pctChange(totals.electricity, previousTotals.electricity),
    gas: pctChange(totals.gas, previousTotals.gas),
    water: pctChange(totals.water, previousTotals.water),
    air: pctChange(totals.air, previousTotals.air)
  };

  // DPE fictif basé sur une conversion très grossière de la conso totale
  const siteSurfaceM2 = 5000; // maquette
  const kwhElec = totals.electricity; // suppose kWh
  const kwhGazEq = totals.gas * 0.9; // facteur simplifié
  const kwhGlobal = kwhElec + kwhGazEq; // ignore eau/air pour l'illustration
  const kwhPerM2 = Math.round(kwhGlobal / Math.max(1, siteSurfaceM2));

  const toggleLevel = (lvl) => {
    setActiveLevels((prev) => (
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    ));
  };

  const periodLabel = PERIOD_PRESETS.find(p => p.key === period)?.label || "";
  const totalDeltaVsPrev = pctChange(kwhGlobal, (previousTotals.electricity + previousTotals.gas * 0.9));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4" style={{ backgroundColor: "#ffffff" }}>
      {/* En-tête */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ color: palette.primary.color }}>Tableau de bord — Usine</h1>
        <p className="text-sm" style={{ color: palette.primary.color, opacity: 0.7 }}>Vue synthétique pour direction : une seule page, chiffres clés, comparaison N-1.</p>
      </div>

      {/* Synthèse haute (une info clé très lisible) */}
      <SummaryHero totalKwh={kwhGlobal} delta={totalDeltaVsPrev} periodLabel={periodLabel} />

      {/* Contrôles */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2"><PeriodSelector value={period} onChange={setPeriod} /></div>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="mb-2 text-sm font-medium" style={{ color: palette.primary.color }}>Niveaux visibles</div>
            <LevelChips levels={activeLevels} onToggle={toggleLevel} />
          </CardContent>
        </Card>
      </div>

      {/* KPI + DPE */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIEnergyCard icon={Zap} label="Électricité" unit="kWh" value={totals.electricity} delta={deltas.electricity} color={palette.electric.color} />
          <KPIEnergyCard icon={Flame} label="Gaz" unit="kWh eq" value={totals.gas} delta={deltas.gas} color={palette.gas.color} />
          <KPIEnergyCard icon={Droplet} label="Eau" unit="m³" value={totals.water} delta={deltas.water} color={palette.water.color} />
          <KPIEnergyCard icon={Wind} label="Air comprimé" unit="Nm³" value={totals.air} delta={deltas.air} color={palette.air.color} />
        </div>
        <div className="xl:col-span-2">
          <DPEGauge kwhPerM2={kwhPerM2} />
        </div>
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ByLevelChart data={CURRENT} levels={activeLevels} />
        <ByLevelTable data={CURRENT} levels={activeLevels} />
      </div>

      {/* Note d'intégration */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4 text-xs" style={{ color: palette.primary.color, opacity: 0.75 }}>
          <p>
            Intégration Mendix : remplacez les données factices par vos <em>datasources</em> (microflows / REST) et mappez vos entités
            <strong> Asset / Level / Variable / Timeseries</strong>. Le sélecteur de période expose <code>period</code> et les niveaux
            visibles sont dans <code>activeLevels</code>. Le DPE est indicatif, 
            pensez à brancher un calcul métier si disponible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
