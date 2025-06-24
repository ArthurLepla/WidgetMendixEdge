import { ReactElement, createElement, useState, useEffect, ChangeEvent, useMemo } from "react";
import { Gauge, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Big } from "big.js";
import { ActionIcon } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
// Import necessary Mendix types
import { ListAttributeValue, EditableValue, ObjectItem } from "mendix";

// Import the generated props type
import { SyntheseWidgetContainerProps } from "../../typings/SyntheseWidgetProps";

// --- Define Types ---

// Props needed by the DPE component, now including both sets of attributes and the datasource
export interface DPEProps extends Pick<SyntheseWidgetContainerProps,
    // Datasource for reading saved settings
    | "dsDPESettings"
    // Attributes for reading saved thresholds (for display & form init)
    | "ThresholdA_Day" | "ThresholdB_Day" | "ThresholdC_Day" | "ThresholdD_Day" | "ThresholdE_Day" | "ThresholdF_Day"
    | "ThresholdA_Week" | "ThresholdB_Week" | "ThresholdC_Week" | "ThresholdD_Week" | "ThresholdE_Week" | "ThresholdF_Week"
    | "ThresholdA_Month" | "ThresholdB_Month" | "ThresholdC_Month" | "ThresholdD_Month" | "ThresholdE_Month" | "ThresholdF_Month"
    // Attributes for editing thresholds (bound to context)
    | "ThresholdA_Day_Form" | "ThresholdB_Day_Form" | "ThresholdC_Day_Form" | "ThresholdD_Day_Form" | "ThresholdE_Day_Form" | "ThresholdF_Day_Form"
    | "ThresholdA_Week_Form" | "ThresholdB_Week_Form" | "ThresholdC_Week_Form" | "ThresholdD_Week_Form" | "ThresholdE_Week_Form" | "ThresholdF_Week_Form"
    | "ThresholdA_Month_Form" | "ThresholdB_Month_Form" | "ThresholdC_Month_Form" | "ThresholdD_Month_Form" | "ThresholdE_Month_Form" | "ThresholdF_Month_Form"
    // Action to trigger the save microflow
    | "prepareAndSaveDPESettingsMF"
> {
    // Props specific to DPE functionality (passed down)
    grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    value: number; // The current consumption value to display grade for
    period: 'day' | 'week' | 'month';
}

// Type for the Mendix object from dsDPESettings
type DPESettingsObject = ObjectItem | undefined;

// Type for the form state (string values for inputs)
type FormThresholds = Partial<Record<string, string>>;

// Keys for the original attributes linked to dsDPESettings (ListAttributeValue)
type OriginalThresholdKey = Extract<keyof SyntheseWidgetContainerProps, `Threshold${string}_${'Day'|'Week'|'Month'}`>;
const ORIGINAL_THRESHOLD_KEYS: OriginalThresholdKey[] = [
    "ThresholdA_Day", "ThresholdB_Day", "ThresholdC_Day", "ThresholdD_Day", "ThresholdE_Day", "ThresholdF_Day",
    "ThresholdA_Week", "ThresholdB_Week", "ThresholdC_Week", "ThresholdD_Week", "ThresholdE_Week", "ThresholdF_Week",
    "ThresholdA_Month", "ThresholdB_Month", "ThresholdC_Month", "ThresholdD_Month", "ThresholdE_Month", "ThresholdF_Month"
];

// Keys for the form attributes linked to the context object (EditableValue)
type FormThresholdKey = Extract<keyof SyntheseWidgetContainerProps, `Threshold${string}_${'Day'|'Week'|'Month'}_Form`>;
const FORM_THRESHOLD_KEYS: FormThresholdKey[] = [
    "ThresholdA_Day_Form", "ThresholdB_Day_Form", "ThresholdC_Day_Form", "ThresholdD_Day_Form", "ThresholdE_Day_Form", "ThresholdF_Day_Form",
    "ThresholdA_Week_Form", "ThresholdB_Week_Form", "ThresholdC_Week_Form", "ThresholdD_Week_Form", "ThresholdE_Week_Form", "ThresholdF_Week_Form",
    "ThresholdA_Month_Form", "ThresholdB_Month_Form", "ThresholdC_Month_Form", "ThresholdD_Month_Form", "ThresholdE_Month_Form", "ThresholdF_Month_Form"
];

// --- DPEGrade Interface (unchanged) ---
interface DPEGrade {
    color: string;
    range: string;
    label: string;
    width: string;
    textColor?: string;
}

// --- Default Thresholds (as numbers) ---
const DEFAULT_THRESHOLDS: Record<string, number> = {
    ThresholdA_Day: 200, ThresholdB_Day: 400, ThresholdC_Day: 600, ThresholdD_Day: 800, ThresholdE_Day: 1000, ThresholdF_Day: 1200,
    ThresholdA_Week: 1400, ThresholdB_Week: 2800, ThresholdC_Week: 4200, ThresholdD_Week: 5600, ThresholdE_Week: 7000, ThresholdF_Week: 8400,
    ThresholdA_Month: 6000, ThresholdB_Month: 12000, ThresholdC_Month: 18000, ThresholdD_Month: 24000, ThresholdE_Month: 30000, ThresholdF_Month: 36000,
};


// --- getGradeRanges Function ---
// Uses threshold values (passed as numbers) to define the visual scale
const getGradeRanges = (period: 'day' | 'week' | 'month', currentThresholds: Record<string, number>): Record<string, DPEGrade> => {
    const periodSuffix = period === 'day' ? 'Day' : period === 'week' ? 'Week' : 'Month';
    const unit = period === 'day' ? 'kWh/jour' : period === 'week' ? 'kWh/semaine' : 'kWh/mois';

    const getThreshold = (grade: string): number => {
        const key = `Threshold${grade}_${periodSuffix}`;
        return currentThresholds[key] ?? DEFAULT_THRESHOLDS[key];
    };

    const thresholds = {
        A: getThreshold('A'), B: getThreshold('B'), C: getThreshold('C'),
        D: getThreshold('D'), E: getThreshold('E'), F: getThreshold('F'),
    };

    const formatRange = (low: number | undefined, high: number | undefined) => {
        const lowNum = typeof low === 'number' ? low : -Infinity;
        const highNum = typeof high === 'number' ? high : Infinity;
        if (lowNum === -Infinity) return `≤ ${highNum} ${unit}`;
        if (highNum === Infinity) return `> ${lowNum} ${unit}`;
        return `${lowNum + 1}-${highNum} ${unit}`;
    };

    // Largeurs adaptées - en commençant par 20% pour A
    return {
        A: { color: '#319834', range: formatRange(undefined, thresholds.A), label: 'Très performant', width: '20%' },
        B: { color: '#33CC33', range: formatRange(thresholds.A, thresholds.B), label: 'Performant', width: '35%' },
        C: { color: '#CBEF43', range: formatRange(thresholds.B, thresholds.C), label: 'Assez performant', width: '50%', textColor: '#666666' },
        D: { color: '#FFF833', range: formatRange(thresholds.C, thresholds.D), label: 'Peu performant', width: '65%', textColor: '#666666' },
        E: { color: '#FDD733', range: formatRange(thresholds.D, thresholds.E), label: 'Peu performant', width: '80%', textColor: '#666666' },
        F: { color: '#FF9234', range: formatRange(thresholds.E, thresholds.F), label: 'Très peu performant', width: '90%' },
        G: { color: '#FF4234', range: formatRange(thresholds.F, undefined), label: 'Non performant', width: '100%' }
    };
};


// --- DPE Component ---
export const DPE = (props: DPEProps): ReactElement => {
    // Destructure all needed props
    const { grade, value, period, dsDPESettings } = props;

    // State for the dialog and form values
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [formSettings, setFormSettings] = useState<FormThresholds>({}); // Holds string values from inputs
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Get the Mendix object from the dsDPESettings datasource (for reading saved thresholds)
    const dpeSettingsObject = useMemo((): DPESettingsObject => {
        return dsDPESettings?.status === "available" && dsDPESettings.items && dsDPESettings.items.length > 0
            ? dsDPESettings.items[0]
            : undefined;
    }, [dsDPESettings]);

    // Extract current *saved* threshold values (as numbers) from dsDPESettings
    const currentThresholdValues = useMemo((): Record<string, number> => {
        const values: Record<string, number> = {};
        if (dpeSettingsObject) {
            ORIGINAL_THRESHOLD_KEYS.forEach(key => {
                // Read from the original Threshold* props (ListAttributeValue)
                const attr = props[key] as ListAttributeValue<Big> | undefined;
                if (attr) {
                    const editableValue = attr.get(dpeSettingsObject);
                    const bigValue = editableValue?.value;
                    values[key] = bigValue instanceof Big ? bigValue.toNumber() : DEFAULT_THRESHOLDS[key];
                } else {
                    console.warn(`Original attribute ${key} not found in props.`);
                    values[key] = DEFAULT_THRESHOLDS[key];
                }
            });
        } else {
            // Use defaults if dsDPESettings object not loaded
            ORIGINAL_THRESHOLD_KEYS.forEach(key => {
                values[key] = DEFAULT_THRESHOLDS[key];
            });
        }
        return values;
    // Depend on the loaded object and the props themselves
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dpeSettingsObject, ...ORIGINAL_THRESHOLD_KEYS.map(key => props[key])]);


    // Initialize form state when dialog opens, using the CURRENT saved threshold values
    useEffect(() => {
        if (isDialogOpen) {
            const initialFormValues: FormThresholds = {};
            let allFormPropsAvailable = true; // Check if _Form props are available for saving later

            FORM_THRESHOLD_KEYS.forEach(formKey => {
                const formAttr = props[formKey] as EditableValue<Big> | undefined;
                if (!formAttr || formAttr.status !== "available") {
                    allFormPropsAvailable = false;
                    console.warn(`Form attribute ${formKey} is not available or missing. Form will not save correctly.`);
                }

                // *** Use currentThresholdValues (read from dsDPESettings) for initialization ***
                const originalKey = formKey.replace('_Form', '') as OriginalThresholdKey;
                const currentValue = currentThresholdValues[originalKey];

                // Set the string value for the input field
                initialFormValues[formKey] = currentValue !== undefined ? currentValue.toString() : '';
            });

            setFormSettings(initialFormValues); // Set the form state

            if (!allFormPropsAvailable) {
                console.error("Some _Form attributes are missing or unavailable in props. Saving might fail.");
                 // Keep the form initialized with current values, but show error
                setSaveError("Erreur: Configuration du formulaire incomplète ou indisponible.");
            } else {
                setSaveError(null); // Clear error if form props are ok
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDialogOpen, currentThresholdValues]); // Depend on dialog state and the read values

    // Calculate DPE Grades based on *saved* thresholds read from dsDPESettings
    const DPE_GRADES = getGradeRanges(period, currentThresholdValues);

    // --- Formatting Functions (unchanged) ---
    const formatValueWithUnit = (val: number): { formattedValue: string, unit: string } => {
        if (val >= 1000000) return { formattedValue: (val / 1000000).toFixed(1), unit: 'GWh' };
        if (val >= 1000) return { formattedValue: (val / 1000).toFixed(1), unit: 'MWh' };
        return { formattedValue: val.toFixed(1), unit: 'kWh' };
    };
    const getPeriodSuffix = (): string => {
        switch (period) {
            case 'day': return '/jour';
            case 'week': return '/semaine';
            case 'month': return '/mois';
            default: return '';
        }
    };
    const { formattedValue, unit } = formatValueWithUnit(value);
    const valueDisplay = `${formattedValue} ${unit}${getPeriodSuffix()}`;


    // --- Event Handlers ---
    const handleFormInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormSettings(prev => ({ ...prev, [name]: value }));
    };

    // handleSaveChanges logic remains correct:
    // 1. Validate formSettings
    // 2. Update _Form props using setValue
    // 3. Execute prepareAndSaveDPESettingsMF action
    const handleSaveChanges = () => {
        if (!props.prepareAndSaveDPESettingsMF || !props.prepareAndSaveDPESettingsMF.canExecute || isSaving) {
            console.error("Cannot save: Action not available or already saving.");
            setSaveError("Impossible de sauvegarder : action Mendix indisponible ou sauvegarde déjà en cours.");
            return;
        }

        setSaveError(null);
        setIsSaving(true);

        const validationErrors: string[] = [];
        const validatedFormValues: Partial<Record<FormThresholdKey, Big>> = {};

        // 1. Validation & Conversion
        FORM_THRESHOLD_KEYS.forEach(formKey => {
            const stringValue = formSettings[formKey];
            const numValue = parseFloat(stringValue ?? '');

            if (stringValue === undefined || stringValue.trim() === '' || isNaN(numValue) || numValue < 0) {
                const label = formKey.replace('_Form', '').replace('Threshold', 'Seuil ');
                validationErrors.push(`Valeur invalide ou manquante pour ${label}.`);
            } else {
                try {
                    validatedFormValues[formKey] = new Big(numValue);
                } catch (e) {
                    const label = formKey.replace('_Form', '').replace('Threshold', 'Seuil ');
                    validationErrors.push(`Erreur de conversion pour ${label}: ${stringValue}`);
                }
            }
        });

        // Vérification de la progression des seuils (A < B < C < D < E < F)
        (['Day', 'Week', 'Month'] as const).forEach(period => { // Use 'as const' for type safety
            const grades = ['A', 'B', 'C', 'D', 'E', 'F'];
            const periodLabel = period === 'Day' ? 'Jour' : period === 'Week' ? 'Semaine' : 'Mois'; // Get label once

            for (let i = 0; i < grades.length - 1; i++) {
                const currentGrade = grades[i];
                const nextGrade = grades[i + 1];

                const currentKey = `Threshold${currentGrade}_${period}_Form` as FormThresholdKey;
                const nextKey = `Threshold${nextGrade}_${period}_Form` as FormThresholdKey;

                const currentValue = validatedFormValues[currentKey];
                const nextValue = validatedFormValues[nextKey];

                // Check only if both values are valid Big numbers
                if (currentValue && nextValue && currentValue.gte(nextValue)) { // gte means >=
                    validationErrors.push(
                        `Période ${periodLabel}: Le seuil ${nextGrade} (${nextValue.toFixed()}) doit être strictement supérieur au seuil ${currentGrade} (${currentValue.toFixed()}).` // Use toFixed() for clearer error message
                    );
                }
            }
        });

        if (validationErrors.length > 0) {
            setSaveError(`Erreurs de validation:\n- ${validationErrors.join("\n- ")}`);
            setIsSaving(false);
            return; // Exit if validation fails
        }

        // 2. Update Context Object Attributes (_Form props)
        let updateError = false;
        FORM_THRESHOLD_KEYS.forEach(formKey => {
            const formAttr = props[formKey] as EditableValue<Big> | undefined;
            const valueToSet = validatedFormValues[formKey];

            if (formAttr && formAttr.status === "available" && valueToSet !== undefined) {
                if (formAttr.readOnly) {
                    console.error(`Attribute ${formKey} is read-only.`);
                    validationErrors.push(`Le champ ${formKey.replace('_Form', '')} n'est pas modifiable.`);
                    updateError = true;
                } else {
                    try {
                        formAttr.setValue(valueToSet);
                    } catch (e: any) {
                         console.error(`Error setting value for ${formKey}:`, e);
                         validationErrors.push(`Erreur interne lors de la mise à jour de ${formKey.replace('_Form', '')}: ${e.message}`);
                         updateError = true;
                    }
                }
            } else if (valueToSet === undefined) {
                 console.warn(`Validated value for ${formKey} is missing.`);
                validationErrors.push(`Erreur interne: Valeur manquante pour ${formKey.replace('_Form', '')}.`);
                updateError = true;
            } else {
                console.error(`Attribute ${formKey} is not available or writeable.`);
                validationErrors.push(`Erreur: Impossible de mettre à jour le champ ${formKey.replace('_Form', '')}.`);
                updateError = true;
            }
        });

        if (updateError) {
             setSaveError(`Erreurs lors de la mise à jour:\n- ${validationErrors.join("\n- ")}`);
             setIsSaving(false);
             return;
        }

        // 3. Execute the Mendix Action
        try {
            props.prepareAndSaveDPESettingsMF.execute();
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error("Error executing Mendix action:", error);
            setSaveError(`Erreur lors de l'exécution de l'action de sauvegarde : ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Render Logic ---
    // Check dsDPESettings status for reading saved thresholds (for display)
    if (dsDPESettings?.status === "loading") {
        return <div className="card-base text-center p-4">Chargement de la configuration DPE...</div>;
    }

    // Display error if *saved* settings are unavailable (affects DPE scale display)
    if (dsDPESettings?.status === "unavailable" || !dpeSettingsObject) {
       return <div className="card-base text-center p-4 text-red-600">Configuration DPE indisponible. Impossible d'afficher l'échelle DPE. Vérifiez la source de données 'dsDPESettings'.</div>;
    }

    // Check if *form* attributes (context) are available for editing
    // This check is primarily for enabling the settings button and showing a form error message
    const formAttrsAvailable = FORM_THRESHOLD_KEYS.every(key => {
        const formAttr = props[key] as EditableValue<Big> | undefined;
        return formAttr && formAttr.status === "available";
    });


    // --- Normal Render ---
    // Only proceeds if dsDPESettings is available
    return (
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="card-base relative">
                {/* Settings Button: Using Mantine ActionIcon */}
                <Dialog.Trigger asChild>
                    <ActionIcon
                        variant="default" // Mantine variant (can be adjusted)
                        size={64} // Increased size again
                        title="Configurer les seuils DPE"
                        aria-label="Configurer les seuils DPE"
                        disabled={!props.prepareAndSaveDPESettingsMF?.canExecute || !formAttrsAvailable}
                        className="absolute top-2 right-2 z-10" // Keep absolute positioning AND ADD z-index
                        // onClick={() => setIsDialogOpen(true)} // Alternative if asChild doesn't work
                    >
                        <IconSettings style={{ width: '70%', height: '70%' }} />
                    </ActionIcon>
                </Dialog.Trigger>

                {/* Header */}
                <div className="card-header">
                    <div className="icon-container bg-[#18213e]/10">
                        <Gauge className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-[#18213e]" />
                    </div>
                    <h3 className="title-medium">Diagnostic de Performance Énergétique</h3>
                </div>

                {/* DPE Bars (using DPE_GRADES calculated from saved thresholds) */}
                <div className="mt-8 relative">
                    {/* Ligne de référence verticale */}
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
                                            borderTopRightRadius: '6px',
                                            borderBottomRightRadius: '6px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                        className="h-12 flex items-center justify-between px-4"
                                    >
                                        {/* Pour les barres plus courtes, minimiser le texte */}
                                        <span 
                                            className={`font-medium whitespace-nowrap ${key === 'A' ? 'text-2xl' : 'text-2xl'}`} 
                                            style={{ color: textColor || 'white' }}
                                        >
                                            {label}
                                        </span>
                                        
                                        {/* Réduire la taille du texte pour les barres courtes */}
                                        <span 
                                            className={`font-medium whitespace-nowrap ml-2 ${key === 'A' || key === 'B' ? 'text-2xl' : 'text-2xl'}`} 
                                            style={{ color: textColor || 'white' }}
                                        >
                                            {range}
                                        </span>
                                    </div>
                                    
                                    {isActiveGrade && (
                                        <div
                                            style={{ color: color, border: `2px solid ${color}`, backgroundColor: 'white', marginLeft: '12px' }}
                                            className="inline-flex items-center rounded-full px-3 py-1.5 text-2xl font-bold shadow-md flex-shrink-0"
                                        >
                                            <div
                                                style={{ backgroundColor: color, width: '10px', height: '10px', borderRadius: '50%', marginRight: '6px' }}
                                            ></div>
                                            <span style={{ whiteSpace: 'nowrap' }}>{valueDisplay}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Current Level Text */}
                <div className="mt-6 text-lg text-gray-700 font-medium text-center">
                    Niveau actuel : <span className="font-bold" style={{ color: DPE_GRADES[grade]?.color ?? '#000' }}>{DPE_GRADES[grade]?.label ?? 'N/A'} ({grade})</span>
                </div>
            </div>

            {/* Dialog Content */}
            <Dialog.Portal>
                 <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow z-[900]" />
                 <Dialog.Content
                     className="fixed inset-0 flex items-center justify-center z-[1000]"
                     style={{ maxHeight: "100vh", overflow: "auto" }}
                 >
                     <div className="relative bg-white rounded-lg p-6 shadow-xl w-[90vw] max-w-[600px] max-h-[90vh] overflow-y-auto m-4 data-[state=open]:animate-contentShow">
                         <Dialog.Title className="text-3xl font-semibold mb-4 text-gray-800">
                             Configurer les Seuils DPE
                         </Dialog.Title>
                         <Dialog.Description className="text-lg text-gray-600 mb-6">
                             Entrez les valeurs maximales (en kWh) pour chaque grade et période. Le grade G correspondra à toute valeur supérieure au seuil F. Ces valeurs seront mises à jour dans le contexte Mendix.
                         </Dialog.Description>

                         {/* Form: Conditionally render based on formAttrsAvailable */}
                         {formAttrsAvailable ? (
                             <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                                 {/* Save Error Display */}
                                 {saveError && (
                                     <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-lg">
                                         <p className="font-bold">Erreur de sauvegarde</p>
                                         <pre className="whitespace-pre-wrap text-lg">{saveError}</pre>
                                     </div>
                                 )}
                                 {/* Form Fields Grid */}
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     {(['Day', 'Week', 'Month'] as const).map(p => (
                                         <fieldset key={p} className="border p-4 rounded">
                                             <legend className="font-medium px-1 text-xl">Par {p === 'Day' ? 'Jour' : p === 'Week' ? 'Semaine' : 'Mois'} (kWh/{p === 'Day' ? 'jour' : p === 'Week' ? 'semaine' : 'mois'})</legend>
                                             {["A", "B", "C", "D", "E", "F"].map(g => {
                                                 const formKey = `Threshold${g}_${p}_Form` as FormThresholdKey;
                                                 return (
                                                     <div key={formKey} className="mb-3">
                                                         <label htmlFor={formKey} className="block text-lg font-medium text-gray-700 mb-1">
                                                             Seuil Max Grade {g}
                                                         </label>
                                                         <input
                                                             type="number"
                                                             id={formKey}
                                                             name={formKey}
                                                             value={formSettings[formKey] ?? ''}
                                                             onChange={handleFormInputChange}
                                                             className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-2"
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
                                 {/* Action Buttons */}
                                 <div className="mt-8 flex justify-end space-x-3">
                                     <Dialog.Close asChild>
                                         <button type="button" className="px-4 py-2 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                             Annuler
                                         </button>
                                     </Dialog.Close>
                                     <button
                                         type="submit"
                                         className="px-4 py-2 text-lg font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                         disabled={!props.prepareAndSaveDPESettingsMF?.canExecute || isSaving}
                                     >
                                         {isSaving ? "Sauvegarde..." : "Sauvegarder les modifications"}
                                     </button>
                                 </div>
                             </form>
                         ) : (
                             // Show error message within the dialog if form attributes are not available
                             <div className="text-center text-red-500 p-4 border border-red-300 rounded bg-red-50 text-lg">
                                 Le formulaire de configuration DPE ne peut pas être chargé. <br/>
                                 Vérifiez que les attributs de formulaire (ex: ThresholdA_Day_Form) sont correctement configurés dans le widget et disponibles dans le contexte Mendix.
                             </div>
                         )}

                         {/* Close Button (Moved Inside the new div) */}
                         <Dialog.Close asChild>
                             <button className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Fermer">
                                 <X className="w-5 h-5" />
                             </button>
                         </Dialog.Close>
                     </div>
                 </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

// Remember to include CSS for Radix animations if needed