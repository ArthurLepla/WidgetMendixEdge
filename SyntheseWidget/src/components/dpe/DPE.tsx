import { ReactElement, createElement, useState, useEffect, ChangeEvent, useMemo } from "react";
import { Gauge, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Big } from "big.js";
import { Settings } from "lucide-react";
import { ListAttributeValue, EditableValue, ObjectItem } from "mendix";
import { SyntheseWidgetContainerProps } from "../../../typings/SyntheseWidgetProps";

export interface DPEProps
    extends Pick<
        SyntheseWidgetContainerProps,
        | "dsDPESettings"
        | "ThresholdA_Day"
        | "ThresholdB_Day"
        | "ThresholdC_Day"
        | "ThresholdD_Day"
        | "ThresholdE_Day"
        | "ThresholdF_Day"
        | "ThresholdA_Week"
        | "ThresholdB_Week"
        | "ThresholdC_Week"
        | "ThresholdD_Week"
        | "ThresholdE_Week"
        | "ThresholdF_Week"
        | "ThresholdA_Month"
        | "ThresholdB_Month"
        | "ThresholdC_Month"
        | "ThresholdD_Month"
        | "ThresholdE_Month"
        | "ThresholdF_Month"
        | "ThresholdA_Day_Form"
        | "ThresholdB_Day_Form"
        | "ThresholdC_Day_Form"
        | "ThresholdD_Day_Form"
        | "ThresholdE_Day_Form"
        | "ThresholdF_Day_Form"
        | "ThresholdA_Week_Form"
        | "ThresholdB_Week_Form"
        | "ThresholdC_Week_Form"
        | "ThresholdD_Week_Form"
        | "ThresholdE_Week_Form"
        | "ThresholdF_Week_Form"
        | "ThresholdA_Month_Form"
        | "ThresholdB_Month_Form"
        | "ThresholdC_Month_Form"
        | "ThresholdD_Month_Form"
        | "ThresholdE_Month_Form"
        | "ThresholdF_Month_Form"
        | "prepareAndSaveDPESettingsMF"
    > {
    grade: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    value: number;
    period: "day" | "week" | "month";
}

type DPESettingsObject = ObjectItem | undefined;
type FormThresholds = Partial<Record<string, string>>;
type OriginalThresholdKey = Extract<
    keyof SyntheseWidgetContainerProps,
    `Threshold${string}_${"Day" | "Week" | "Month"}`
>;
const ORIGINAL_THRESHOLD_KEYS: OriginalThresholdKey[] = [
    "ThresholdA_Day",
    "ThresholdB_Day",
    "ThresholdC_Day",
    "ThresholdD_Day",
    "ThresholdE_Day",
    "ThresholdF_Day",
    "ThresholdA_Week",
    "ThresholdB_Week",
    "ThresholdC_Week",
    "ThresholdD_Week",
    "ThresholdE_Week",
    "ThresholdF_Week",
    "ThresholdA_Month",
    "ThresholdB_Month",
    "ThresholdC_Month",
    "ThresholdD_Month",
    "ThresholdE_Month",
    "ThresholdF_Month"
];
type FormThresholdKey = Extract<
    keyof SyntheseWidgetContainerProps,
    `Threshold${string}_${"Day" | "Week" | "Month"}_Form`
>;
const FORM_THRESHOLD_KEYS: FormThresholdKey[] = [
    "ThresholdA_Day_Form",
    "ThresholdB_Day_Form",
    "ThresholdC_Day_Form",
    "ThresholdD_Day_Form",
    "ThresholdE_Day_Form",
    "ThresholdF_Day_Form",
    "ThresholdA_Week_Form",
    "ThresholdB_Week_Form",
    "ThresholdC_Week_Form",
    "ThresholdD_Week_Form",
    "ThresholdE_Week_Form",
    "ThresholdF_Week_Form",
    "ThresholdA_Month_Form",
    "ThresholdB_Month_Form",
    "ThresholdC_Month_Form",
    "ThresholdD_Month_Form",
    "ThresholdE_Month_Form",
    "ThresholdF_Month_Form"
];

interface DPEGrade {
    color: string;
    range: string;
    label: string;
    width: string;
    textColor?: string;
}

const DEFAULT_THRESHOLDS: Record<string, number> = {
    ThresholdA_Day: 200,
    ThresholdB_Day: 400,
    ThresholdC_Day: 600,
    ThresholdD_Day: 800,
    ThresholdE_Day: 1000,
    ThresholdF_Day: 1200,
    ThresholdA_Week: 1400,
    ThresholdB_Week: 2800,
    ThresholdC_Week: 4200,
    ThresholdD_Week: 5600,
    ThresholdE_Week: 7000,
    ThresholdF_Week: 8400,
    ThresholdA_Month: 6000,
    ThresholdB_Month: 12000,
    ThresholdC_Month: 18000,
    ThresholdD_Month: 24000,
    ThresholdE_Month: 30000,
    ThresholdF_Month: 36000
};

const getGradeRanges = (
    period: "day" | "week" | "month",
    currentThresholds: Record<string, number>
): Record<string, DPEGrade> => {
    const periodSuffix = period === "day" ? "Day" : period === "week" ? "Week" : "Month";
    const unit = period === "day" ? "kWh/jour" : period === "week" ? "kWh/semaine" : "kWh/mois";
    const getThreshold = (grade: string): number =>
        currentThresholds[`Threshold${grade}_${periodSuffix}`] ??
        DEFAULT_THRESHOLDS[`Threshold${grade}_${periodSuffix}`];
    const thresholds = {
        A: getThreshold("A"),
        B: getThreshold("B"),
        C: getThreshold("C"),
        D: getThreshold("D"),
        E: getThreshold("E"),
        F: getThreshold("F")
    };
    const formatRange = (low?: number, high?: number) => {
        const lowNum = typeof low === "number" ? low : -Infinity;
        const highNum = typeof high === "number" ? high : Infinity;
        if (lowNum === -Infinity) return `≤ ${highNum} ${unit}`;
        if (highNum === Infinity) return `> ${lowNum} ${unit}`;
        return `${lowNum + 1}-${highNum} ${unit}`;
    };
    return {
        A: { color: "#319834", range: formatRange(undefined, thresholds.A), label: "Très performant", width: "20%" },
        B: { color: "#33CC33", range: formatRange(thresholds.A, thresholds.B), label: "Performant", width: "35%" },
        C: {
            color: "#CBEF43",
            range: formatRange(thresholds.B, thresholds.C),
            label: "Assez performant",
            width: "50%",
            textColor: "#666666"
        },
        D: {
            color: "#FFF833",
            range: formatRange(thresholds.C, thresholds.D),
            label: "Peu performant",
            width: "65%",
            textColor: "#666666"
        },
        E: {
            color: "#FDD733",
            range: formatRange(thresholds.D, thresholds.E),
            label: "Peu performant",
            width: "80%",
            textColor: "#666666"
        },
        F: {
            color: "#FF9234",
            range: formatRange(thresholds.E, thresholds.F),
            label: "Très peu performant",
            width: "90%"
        },
        G: { color: "#FF4234", range: formatRange(thresholds.F, undefined), label: "Non performant", width: "100%" }
    };
};

export const DPE = (props: DPEProps): ReactElement => {
    const { grade, value, period, dsDPESettings } = props;
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [formSettings, setFormSettings] = useState<FormThresholds>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const dpeSettingsObject = useMemo<DPESettingsObject>(
        () =>
            dsDPESettings?.status === "available" && dsDPESettings.items && dsDPESettings.items.length > 0
                ? dsDPESettings.items[0]
                : undefined,
        [dsDPESettings]
    );

    const currentThresholdValues = useMemo((): Record<string, number> => {
        const values: Record<string, number> = {};
        if (dpeSettingsObject) {
            ORIGINAL_THRESHOLD_KEYS.forEach(key => {
                const attr = props[key] as ListAttributeValue<Big> | undefined;
                if (attr) {
                    const editableValue = attr.get(dpeSettingsObject);
                    const bigValue = editableValue?.value;
                    values[key] = bigValue instanceof Big ? bigValue.toNumber() : DEFAULT_THRESHOLDS[key];
                } else {
                    values[key] = DEFAULT_THRESHOLDS[key];
                }
            });
        } else {
            ORIGINAL_THRESHOLD_KEYS.forEach(key => {
                values[key] = DEFAULT_THRESHOLDS[key];
            });
        }
        return values;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dpeSettingsObject, ...ORIGINAL_THRESHOLD_KEYS.map(key => props[key])]);

    useEffect(() => {
        if (isDialogOpen) {
            const initialFormValues: FormThresholds = {};
            let allFormPropsAvailable = true;
            FORM_THRESHOLD_KEYS.forEach(formKey => {
                const formAttr = props[formKey] as EditableValue<Big> | undefined;
                if (!formAttr || formAttr.status !== "available") allFormPropsAvailable = false;
                const originalKey = formKey.replace("_Form", "") as OriginalThresholdKey;
                const currentValue = currentThresholdValues[originalKey];
                initialFormValues[formKey] = currentValue !== undefined ? currentValue.toString() : "";
            });
            setFormSettings(initialFormValues);
            setSaveError(
                allFormPropsAvailable ? null : "Erreur: Configuration du formulaire incomplète ou indisponible."
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDialogOpen, currentThresholdValues]);

    const DPE_GRADES = getGradeRanges(period, currentThresholdValues);

    const formatValueWithUnit = (val: number): { formattedValue: string; unit: string } => {
        if (val >= 1000000) return { formattedValue: (val / 1000000).toFixed(1), unit: "GWh" };
        if (val >= 1000) return { formattedValue: (val / 1000).toFixed(1), unit: "MWh" };
        return { formattedValue: val.toFixed(1), unit: "kWh" };
    };
    const getPeriodSuffix = (): string => (period === "day" ? "/jour" : period === "week" ? "/semaine" : "/mois");
    const { formattedValue, unit } = formatValueWithUnit(value);
    const valueDisplay = `${formattedValue} ${unit}${getPeriodSuffix()}`;

    const handleFormInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = () => {
        if (!props.prepareAndSaveDPESettingsMF || !props.prepareAndSaveDPESettingsMF.canExecute || isSaving) {
            setSaveError("Impossible de sauvegarder : action Mendix indisponible ou sauvegarde déjà en cours.");
            return;
        }
        setSaveError(null);
        setIsSaving(true);
        const validationErrors: string[] = [];
        const validatedFormValues: Partial<Record<FormThresholdKey, Big>> = {};
        FORM_THRESHOLD_KEYS.forEach(formKey => {
            const stringValue = formSettings[formKey];
            const numValue = parseFloat(stringValue ?? "");
            if (stringValue === undefined || stringValue.trim() === "" || isNaN(numValue) || numValue < 0) {
                const label = formKey.replace("_Form", "").replace("Threshold", "Seuil ");
                validationErrors.push(`Valeur invalide ou manquante pour ${label}.`);
            } else {
                try {
                    validatedFormValues[formKey] = new Big(numValue);
                } catch (e) {
                    const label = formKey.replace("_Form", "").replace("Threshold", "Seuil ");
                    validationErrors.push(`Erreur de conversion pour ${label}: ${stringValue}`);
                }
            }
        });
        (["Day", "Week", "Month"] as const).forEach(periodLbl => {
            const grades = ["A", "B", "C", "D", "E", "F"];
            const periodText = periodLbl === "Day" ? "Jour" : periodLbl === "Week" ? "Semaine" : "Mois";
            for (let i = 0; i < grades.length - 1; i++) {
                const currentKey = `Threshold${grades[i]}_${periodLbl}_Form` as FormThresholdKey;
                const nextKey = `Threshold${grades[i + 1]}_${periodLbl}_Form` as FormThresholdKey;
                const currentValue = validatedFormValues[currentKey];
                const nextValue = validatedFormValues[nextKey];
                if (currentValue && nextValue && currentValue.gte(nextValue)) {
                    validationErrors.push(
                        `Période ${periodText}: Le seuil ${
                            grades[i + 1]
                        } (${nextValue.toFixed()}) doit être strictement supérieur au seuil ${
                            grades[i]
                        } (${currentValue.toFixed()}).`
                    );
                }
            }
        });
        if (validationErrors.length > 0) {
            setSaveError(`Erreurs de validation:\n- ${validationErrors.join("\n- ")}`);
            setIsSaving(false);
            return;
        }
        let updateError = false;
        FORM_THRESHOLD_KEYS.forEach(formKey => {
            const formAttr = props[formKey] as EditableValue<Big> | undefined;
            const valueToSet = validatedFormValues[formKey];
            if (formAttr && formAttr.status === "available" && valueToSet !== undefined) {
                if (formAttr.readOnly) {
                    updateError = true;
                    validationErrors.push(`Le champ ${formKey.replace("_Form", "")} n'est pas modifiable.`);
                } else {
                    try {
                        formAttr.setValue(valueToSet);
                    } catch (e: any) {
                        updateError = true;
                        validationErrors.push(
                            `Erreur interne lors de la mise à jour de ${formKey.replace("_Form", "")}: ${e.message}`
                        );
                    }
                }
            } else if (valueToSet === undefined) {
                updateError = true;
                validationErrors.push(`Erreur interne: Valeur manquante pour ${formKey.replace("_Form", "")}.`);
            } else {
                updateError = true;
                validationErrors.push(`Erreur: Impossible de mettre à jour le champ ${formKey.replace("_Form", "")}.`);
            }
        });
        if (updateError) {
            setSaveError(`Erreurs lors de la mise à jour:\n- ${validationErrors.join("\n- ")}`);
            setIsSaving(false);
            return;
        }
        try {
            props.prepareAndSaveDPESettingsMF.execute();
            setIsDialogOpen(false);
        } catch (error: any) {
            setSaveError(`Erreur lors de l'exécution de l'action de sauvegarde : ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (dsDPESettings?.status === "loading") {
        return <div className="card-base text-center p-4">Chargement de la configuration DPE...</div>;
    }
    if (dsDPESettings?.status === "unavailable" || !dpeSettingsObject) {
        return (
            <div className="card-base text-center p-4 text-red-600">
                Configuration DPE indisponible. Impossible d'afficher l'échelle DPE. Vérifiez la source de données
                'dsDPESettings'.
            </div>
        );
    }
    const formAttrsAvailable = FORM_THRESHOLD_KEYS.every(key => {
        const formAttr = props[key] as EditableValue<Big> | undefined;
        return formAttr && formAttr.status === "available";
    });

    return (
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="card-base relative">
                <Dialog.Trigger asChild>
                    <button
                        title="Configurer les seuils DPE"
                        aria-label="Configurer les seuils DPE"
                        disabled={!props.prepareAndSaveDPESettingsMF?.canExecute || !formAttrsAvailable}
                        className="absolute top-2 right-2 z-10 btn-date"
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                </Dialog.Trigger>
                <div className="card-header">
                    <div className="icon-container bg-[#18213e]/10">
                        <Gauge className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-primary" />
                    </div>
                    <h3 className="title-medium">Diagnostic de Performance Énergétique</h3>
                </div>
                <div className="mt-8 relative">
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200 z-0"></div>
                    {Object.entries(DPE_GRADES).map(([key, { color, range, label, width, textColor }]) => {
                        const isActiveGrade = key === grade;
                        return (
                            <div key={key} className="flex mb-3 items-center relative z-10">
                                <div className="w-8 text-xl font-bold flex items-center justify-center mr-4">{key}</div>
                                <div className="flex-1 flex items-center">
                                    <div
                                        style={{
                                            backgroundColor: color,
                                            width: width,
                                            borderTopRightRadius: "6px",
                                            borderBottomRightRadius: "6px",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                        }}
                                        className="h-12 flex items-center justify-between px-4"
                                    >
                                        <span
                                            className={`font-medium whitespace-nowrap text-2xl`}
                                            style={{ color: textColor || "white" }}
                                        >
                                            {label}
                                        </span>
                                        <span
                                            className={`font-medium whitespace-nowrap ml-2 text-2xl`}
                                            style={{ color: textColor || "white" }}
                                        >
                                            {range}
                                        </span>
                                    </div>
                                    {isActiveGrade && (
                                        <div
                                            style={{
                                                color: color,
                                                border: `2px solid ${color}`,
                                                backgroundColor: "white",
                                                marginLeft: "12px"
                                            }}
                                            className="inline-flex items-center rounded-full px-3 py-1.5 text-2xl font-bold shadow-md flex-shrink-0"
                                        >
                                            <div
                                                style={{
                                                    backgroundColor: color,
                                                    width: "10px",
                                                    height: "10px",
                                                    borderRadius: "50%",
                                                    marginRight: "6px"
                                                }}
                                            ></div>
                                            <span style={{ whiteSpace: "nowrap" }}>{valueDisplay}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-6 text-lg text-gray-700 font-medium text-center">
                    Niveau actuel :{" "}
                    <span className="font-bold" style={{ color: (DPE_GRADES as any)[grade]?.color ?? "#000" }}>
                        {(DPE_GRADES as any)[grade]?.label ?? "N/A"} ({grade})
                    </span>
                </div>
            </div>
            <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content">
                    <div className="dialog-panel">
                        <Dialog.Title className="dialog-title">Configurer les Seuils DPE</Dialog.Title>
                        <Dialog.Description className="dialog-description">
                            Entrez les valeurs maximales (en kWh) pour chaque grade et période. Le grade G correspondra
                            à toute valeur supérieure au seuil F. Ces valeurs seront mises à jour dans le contexte
                            Mendix.
                        </Dialog.Description>
                        {formAttrsAvailable ? (
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    handleSaveChanges();
                                }}
                            >
                                {saveError && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-lg">
                                        <p className="font-bold">Erreur de sauvegarde</p>
                                        <pre className="whitespace-pre-wrap text-lg">{saveError}</pre>
                                    </div>
                                )}
                                <div className="dialog-grid">
                                    {(["Day", "Week", "Month"] as const).map(p => (
                                        <fieldset key={p} className="border p-4 rounded">
                                            <legend className="font-medium px-1 text-xl">
                                                Par {p === "Day" ? "Jour" : p === "Week" ? "Semaine" : "Mois"} (kWh/
                                                {p === "Day" ? "jour" : p === "Week" ? "semaine" : "mois"})
                                            </legend>
                                            {["A", "B", "C", "D", "E", "F"].map(g => {
                                                const formKey = `Threshold${g}_${p}_Form` as FormThresholdKey;
                                                return (
                                                    <div key={formKey} className="form-row">
                                                        <label htmlFor={formKey} className="form-label">
                                                            Seuil Max Grade {g}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            id={formKey}
                                                            name={formKey}
                                                            value={formSettings[formKey] ?? ""}
                                                            onChange={handleFormInputChange}
                                                            className="form-input"
                                                            step="any"
                                                            min="0"
                                                            required
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </fieldset>
                                    ))}
                                </div>
                                <div className="dialog-actions">
                                    <Dialog.Close asChild>
                                        <button type="button" className="btn-secondary">
                                            Annuler
                                        </button>
                                    </Dialog.Close>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={!props.prepareAndSaveDPESettingsMF?.canExecute || isSaving}
                                    >
                                        {isSaving ? "Sauvegarde..." : "Sauvegarder les modifications"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="dialog-error">
                                Le formulaire de configuration DPE ne peut pas être chargé. <br />
                                Vérifiez que les attributs de formulaire (ex: ThresholdA_Day_Form) sont correctement
                                configurés dans le widget et disponibles dans le contexte Mendix.
                            </div>
                        )}
                        <Dialog.Close asChild>
                            <button className="dialog-close" aria-label="Fermer">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default DPE;
