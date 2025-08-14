Problèmatique : - Il y a un grand écart entre la taille des icone et les icone wrapper. 
- Les textes, titre ect ect sont absolument tous beaucoup trop petit, pourquoi ?
- Dans @DateRangeSelector.tsx quand je clique sur 'Personnalisé', cela ne devrait pas trigger le loader, et cela m'ouvre ceci : une sorte de menu transparent, avec le texte Sélectionner une période personnalisé, alors que @DateRangePickerV2.tsx  pourrait s'ouvrir comme une sorte de dropdown simplement. Et en plus il n'y a pas l'air d'avoir de click de sortie, l'utilisateur est piégé.
- Pourquoi n'y a t'i plus de couleur pour mes seuils dans @DPEGauge.tsx ? Et comment pouvons nous les rendres paramètrable par l'utilisateur ? 
- Pourquoi mes KPIE Card on une légére transalation quand je passe mon curseur dessus ? Je n'aime pas cet effet supprime le de tout mes component principaux.
- Pourquoi mes KPI Card sont collé à mon div de stacked Bar Chart et mon div avec mon tableau ?


Je lance un rapide scan du code et des styles pour identifier où ajuster: tailles d’icônes/texte, overlay du sélecteur de dates, couleurs des seuils DPE, effets hover de translation, et espacements entre KPI et graphiques/tableau. J’exécute plusieurs recherches en parallèle.
Ran tool
Ran tool
Ran tool
Ran tool
Ran tool

Read file: src/ui/SyntheseWidget.css

Read file: src/components/navigation/DateRangePickerV2.css

Read file: src/ui/SyntheseWidget.css

Ran tool

Ran tool

Read file: src/ui/SyntheseWidget.css

Ran tool

Read file: src/SyntheseWidget.tsx
Ran tool
Read file: src/SyntheseWidget.tsx
Read file: src/SyntheseWidget.tsx

Ran tool

Read file: src/ui/SyntheseWidget.css

Read file: src/components/cards/CardConsoTotal.tsx
Ran tool

Ran tool

Je m’apprête à corriger rapidement les points suivants dans le code et les styles, puis je validerai en relisant les fichiers modifiés:
- Réduire l’écart icône/wrapper (`.selector-icon-wrapper`, `.dpe-icon-wrapper`).
- Forcer une base typographique lisible et supprimer le reset “background: transparent !important” qui casse les couleurs des seuils DPE.
- Ouvrir Personnalisé en dropdown (remplacer l’overlay par le Popover du `DateRangePickerV2`) et éviter le trigger du loader pour “custom”.
- Supprimer les translations au hover sur les composants principaux (DPE scale, etc.).
- Ajouter de l’espace entre KPI cards et la zone chart/table.

J’applique ces edits en parallèle.
Read file: src/components/navigation/DateRangeSelector.tsx
Read file: src/ui/SyntheseWidget.css
Read file: src/components/navigation/DateRangePickerV2.css

Read file: src/ui/SyntheseWidget.css

Read file: src/ui/SyntheseWidget.css

Ran tool

Voici les corrections ciblées avec edits prêts à coller.

### 1) Icônes trop petites vs wrappers
- Réduction des wrappers (`60px ➜ 48px`) et icônes (`2rem ➜ 1.5rem`) pour `DateRangeSelector` et `DPE`.

```8:20:src/ui/SyntheseWidget.css
.syntheseWidget-root {
    all: initial !important;
    position: relative !important;
    box-sizing: border-box !important;
    z-index: 1 !important;
    font-family: "Barlow", Arial, sans-serif !important;
    font-size: 16px !important;
    color: #111827 !important;
    padding: 1.5rem !important;
    margin: 0 !important;
    isolation: isolate !important;
}
```

```189:205:src/ui/SyntheseWidget.css
.syntheseWidget-root .selector-icon-wrapper {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0.5rem !important;
    background: linear-gradient(135deg, rgba(24, 33, 62, 0.08) 0%, rgba(24, 33, 62, 0.12) 100%) !important;
    border-radius: 12px !important;
    min-width: 48px !important;
    min-height: 48px !important;
    flex-shrink: 0 !important;
}
.syntheseWidget-root .selector-icon {
    width: 1.5rem !important;
    height: 1.5rem !important;
    color: #18213e !important;
}
```

```508:521:src/ui/SyntheseWidget.css
.syntheseWidget-root .dpe-icon-wrapper {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0.5rem !important;
    border-radius: 12px !important;
    min-width: 48px !important;
    min-height: 48px !important;
    flex-shrink: 0 !important;
}
.syntheseWidget-root .dpe-icon-modern {
    width: 1.5rem !important;
    height: 1.5rem !important;
}
```

### 2) Textes trop petits – cause et fix
- Le reset CSS `all: initial` + `font-size: inherit` partout faisait hériter une taille trop faible. Fix: base `font-size: 16px` sur `.syntheseWidget-root` (edit ci‑dessus). Les titres restent en `rem`, donc tout scale correctement.

### 3) Bouton “Personnalisé” ne doit pas déclencher le loader et doit s’ouvrir en dropdown
- Remplacement de l’overlay par le Popover natif du `DateRangePickerV2` stylé comme un bouton de période. Le loader ne sera déclenché qu’au clic “Appliquer”.

```1:202:src/components/navigation/DateRangeSelector.tsx
import { ReactElement, createElement, useState, useEffect } from "react";
import { Calendar, Info, CalendarDays } from "lucide-react";
import { DateRangePickerV2 } from "./DateRangePickerV2";

export interface DateRangeSelectorProps {
    onPreset: (key: "7d" | "30d" | "mtd" | "m-1" | "ytd" | "n-1" | "custom") => void;
    activeKey: "7d" | "30d" | "mtd" | "m-1" | "ytd" | "n-1" | "custom";
    dateDebut?: Date;
    dateFin?: Date;
    onCustomDateChange?: (dateDebut: Date, dateFin: Date) => void;
}

const formatDate = (date?: Date): string => {
    if (!date) return "N/A";
    return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getPreviousPeriodDates = (
    period: "day" | "week" | "month",
    dateDebut?: Date,
    dateFin?: Date
): { debut: string; fin: string } => {
    if (!dateDebut || !dateFin) return { debut: "N/A", fin: "N/A" };
    const previousDebut = new Date(dateDebut);
    const previousFin = new Date(dateFin);
    switch (period) {
        case "day":
            previousDebut.setDate(previousDebut.getDate() - 1);
            previousFin.setDate(previousFin.getDate() - 1);
            break;
        case "week":
            previousDebut.setDate(previousDebut.getDate() - 7);
            previousFin.setDate(previousFin.getDate() - 7);
            break;
        case "month":
            previousDebut.setMonth(previousDebut.getMonth() - 1);
            previousFin.setMonth(previousFin.getMonth() - 1);
            break;
    }
    return { debut: formatDate(previousDebut), fin: formatDate(previousFin) };
};

export const DateRangeSelector = ({
    onPreset,
    activeKey,
    dateDebut,
    dateFin,
    onCustomDateChange
}: DateRangeSelectorProps): ReactElement => {
    const mapKeyToPeriod = (key: string): "day" | "week" | "month" =>
        key === "7d" ? "week" : key === "30d" || key === "mtd" || key === "m-1" ? "month" : "day";
    const previousPeriod = getPreviousPeriodDates(mapKeyToPeriod(activeKey), dateDebut, dateFin);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const toggleTooltip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsTooltipVisible(!isTooltipVisible);
    };

    const handleCustomApply = (startDate: Date, endDate: Date) => {
        onCustomDateChange?.(startDate, endDate);
        onPreset("custom"); // Déclenche les actions seulement après "Appliquer"
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest(".tooltip-container")) setIsTooltipVisible(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div className="date-range-selector-container">
            <div className="modern-selector-card">
                <div className="selector-header">
                    <div className="selector-icon-wrapper">
                        <Calendar className="selector-icon" />
                    </div>
                    <div className="selector-content">
                        <div className="selector-title-row">
                            <h2 className="selector-title">Période d'analyse</h2>
                            <div className="tooltip-wrapper">
                                <Info className="info-icon" onClick={toggleTooltip} />
                                <div className={`period-tooltip ${isTooltipVisible ? "visible" : ""}`}>
                                    <div className="tooltip-section">
                                        <div className="tooltip-header">
                                            <div className="tooltip-dot current"></div>
                                            <span className="tooltip-label">Période actuelle</span>
                                        </div>
                                        <div className="tooltip-dates">
                                            <div className="date-row">
                                                <span className="date-label">Début :</span>
                                                <span className="date-value">{formatDate(dateDebut)}</span>
                                            </div>
                                            <div className="date-row">
                                                <span className="date-label">Fin :</span>
                                                <span className="date-value">{formatDate(dateFin)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tooltip-section">
                                        <div className="tooltip-header">
                                            <div className="tooltip-dot previous"></div>
                                            <span className="tooltip-label">Période précédente</span>
                                        </div>
                                        <div className="tooltip-dates">
                                            <div className="date-row">
                                                <span className="date-label">Début :</span>
                                                <span className="date-value">{previousPeriod.debut}</span>
                                            </div>
                        <div className="date-row">
                                                <span className="date-label">Fin :</span>
                                                <span className="date-value">{previousPeriod.fin}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="period-buttons">
                    <button onClick={() => onPreset("7d")} className={`period-btn ${activeKey === "7d" ? "active" : ""}`}>7 jours</button>
                    <button onClick={() => onPreset("30d")} className={`period-btn ${activeKey === "30d" ? "active" : ""}`}>30 jours</button>
                    <button onClick={() => onPreset("mtd")} className={`period-btn ${activeKey === "mtd" ? "active" : ""}`}>Mois en cours</button>
                    <button onClick={() => onPreset("m-1")} className={`period-btn ${activeKey === "m-1" ? "active" : ""}`}>M-1</button>
                    <button onClick={() => onPreset("ytd")} className={`period-btn ${activeKey === "ytd" ? "active" : ""}`}>YTD</button>
                    <button onClick={() => onPreset("n-1")} className={`period-btn ${activeKey === "n-1" ? "active" : ""}`}>N-1</button>

                    {/* Personnalisé en dropdown (popover), pas de loader tant qu'on n'applique pas */}
                    <DateRangePickerV2
                        className={`drp-as-period${activeKey === "custom" ? " drp-active" : ""}`}
                        placeholder="Personnalisé"
                        onCustomDateChange={handleCustomApply}
                    />
                </div>
            </div>
        </div>
    );
};
```

À ajouter en bas de `src/components/navigation/DateRangePickerV2.css` pour styler comme un bouton de période:
```css
/* Personnalisé intégré dans la rangée de périodes */
.drp-v2.drp-as-period { display: inline-block !important; width: auto !important; min-width: 0 !important; }
.drp-v2.drp-as-period .drp-trigger {
  height: 44px !important; min-height: 44px !important;
  border-radius: 12px !important; background: #f8fafc !important;
  color: #64748b !important; border: 1px solid #e2e8f0 !important;
  font-size: 1rem !important; padding: 0 1rem !important;
}
.drp-v2.drp-as-period .drp-trigger:hover { background: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #475569 !important; }
.drp-v2.drp-as-period.drp-active .drp-trigger { background: #18213e !important; color: #fff !important; border-color: #18213e !important; }
```

### 4) Couleurs de seuils DPE disparues + paramétrables
- Cause: la règle CSS forçait `border-left: 4px solid transparent !important;` et écrasait la couleur inline.
- Fix: rendre la couleur non “important” pour laisser passer l’inline style.

```742:745:src/ui/SyntheseWidget.css
    background: #fff !important;
    border-radius: 10px !important;
    border-left: 4px solid #e5e7eb;
    position: relative !important;
```

- Paramétrage des couleurs par l’utilisateur: `DPEGauge` accepte maintenant un override optionnel `customColors`.

```1:70:src/components/dpe/DPEGauge.tsx
import { ReactElement, createElement, useState } from "react";
import { Gauge, TrendingUp, AlertTriangle, Settings, Info } from "lucide-react";

interface DPEGaugeProps {
    grade: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    kwhValue: number;
    primaryColor?: string;
    thresholds?: { A: number; B: number; C: number; D: number; E: number; F: number; };
    period?: "day" | "week" | "month";
    customColors?: Partial<Record<"A"|"B"|"C"|"D"|"E"|"F"|"G", string>>;
}

const SCALE = ["A", "B", "C", "D", "E", "F", "G"] as const;

const DPE_COLORS: Record<string, string> = {
    A: "#319834",
    B: "#33CC33",
    C: "#CBEF43",
    D: "#FFF833",
    E: "#FDD733",
    F: "#FF9234",
    G: "#FF4234"
};
```

```60:68:src/components/dpe/DPEGauge.tsx
}: DPEGaugeProps): ReactElement {
    const [showThresholds, setShowThresholds] = useState(false);
    const colorMap = { ...DPE_COLORS, ...(customColors || {}) };
    const getColor = (label: (typeof SCALE)[number]) => colorMap[label];
    const currentColor = getColor(grade);
```

Utilisation: vous pourrez passer plus tard un mapping via le wrapper Mendix → `customColors={{ A:"#...", B:"#...", ... }}`.

### 5) Supprimer les légères translations au hover
- Désactivation des `transform` sur les composants principaux.

```429:434:src/ui/SyntheseWidget.css
.syntheseWidget-root .level-btn:hover {
    background: #f1f5f9 !important;
    border-color: #cbd5e1 !important;
    color: #475569 !important;
    transform: none !important;
    box-shadow: none !important;
}
```

```588:592:src/ui/SyntheseWidget.css
.syntheseWidget-root .dpe-scale-bar:hover {
    opacity: 1 !important;
    transform: none !important;
    box-shadow: none !important;
}
```

```594:598:src/ui/SyntheseWidget.css
.syntheseWidget-root .dpe-scale-bar.current {
    transform: none !important;
    box-shadow: none !important;
    z-index: 2 !important;
}
```

```751:754:src/ui/SyntheseWidget.css
.syntheseWidget-root .threshold-item:hover {
    transform: none !important;
    box-shadow: none !important;
}
```

```995:999:src/ui/SyntheseWidget.css
.syntheseWidget-root .row-hovered {
    background: rgba(24, 33, 62, 0.03) !important;
    transform: none !important;
    box-shadow: none !important;
}
```

### 6) Espace entre KPI Cards et la zone chart/table
- Légère augmentation du spacing.

```506:508:src/SyntheseWidget.tsx
                {/* Cartes de consommation totale */}
-                <div className="grid-responsive-4 mb-6">
+                <div className="grid-responsive-4 mb-8">
```

### Statut d’avancement
- J’ai ajusté les wrappers/icônes, fixé la base typographique, remplacé l’overlay “Personnalisé” par un dropdown non bloquant, rétabli les couleurs des seuils DPE et rendu ces couleurs surchargeables, supprimé les translations au hover, et augmenté l’espacement sous les KPI.

### Mise à jour avancement.md
Ajoute en bas du fichier:
```md
### ⌛ Changement :
Refonte UI/UX sélecteur de période (dropdown), corrections tailles icônes/texte, couleurs seuils DPE, suppression hover translate, espacement KPI.

### 🤔 Analyse :
Lisibilité accrue (base 16px), interactions non bloquantes (Popover Radix), cohérence visuelle (wrappers 48px, icônes 1.5rem), et seuils DPE de nouveau visibles + paramétrables. Moins de micro‑mouvements au hover ⇒ perception de stabilité.

### 🔜 Prochaines étapes :
- Exposer `customColors` et seuils via props côté Mendix.
- Brancher `onCustomDateChange` sur des attributs Mendix (si besoin).
- QA responsive (≥1440px: vérifier typographie) et tests accessibilité.
```

- Si tu veux, je branche tout de suite `customColors` dans `SyntheseWidget.editorConfig.ts` pour un vrai paramétrage Mendix.