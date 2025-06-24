import React, { ReactElement, createElement, useState, useEffect, useCallback, useMemo, forwardRef } from "react"; // Add React import
import { ValueStatus, ObjectItem } from "mendix";
import { SaisieContainerProps } from "../typings/SaisieProps";
import Big from "big.js";
import { format, differenceInDays, areIntervalsOverlapping, startOfDay as dateFnsStartOfDay } from "date-fns";
import { fr } from 'date-fns/locale';
import { DateRangePicker, Range, StaticRange } from 'react-date-range';
import { addDays, endOfDay, isSameDay, startOfMonth, endOfMonth, addMonths, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import * as Select from "@radix-ui/react-select";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Toast from "@radix-ui/react-toast";
import * as Label from "@radix-ui/react-label";
import * as Separator from "@radix-ui/react-separator";
import * as Tabs from "@radix-ui/react-tabs";
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import { 
    CheckIcon, 
    ChevronDownIcon, 
    ChevronUpIcon, 
    Cross2Icon,
    QuestionMarkCircledIcon,
    CalendarIcon
} from "@radix-ui/react-icons";
import { Zap, Flame, Droplet, Wind, Info, X, AlertTriangle, Trash2, Sun, Moon, Clock, Settings } from 'lucide-react';

import "./ui/Saisie.css";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Définition des tailles de police homogènes
const fontSizes = {
    input: '16px',
    button: '16px',
    label: '14px',
    table: '15px'
};

// Define updated CSS variables for energy colors
const energyColorStyles = {
    electric: {
        main: 'var(--energy-electric-color, #38a13c)', // Electric color
    },
    gas: {
        main: 'var(--energy-gas-color, #f9be01)',    // Gas color
    },
    water: {
        main: 'var(--energy-water-color, #3293f3)',  // Water color
    },
    air: {
        main: 'var(--energy-air-color, #66d8e6)',    // Air color
    }
};

// Primary color definition (can be used elsewhere if needed)
const primaryColor = 'var(--energy-primary-color, #18213e)';

// Helper type for tariff options
type TariffOption = {
    key: string; // "STANDARD", "HP", "HC", "POINTE"
    label: string;
    icon: ReactElement;
    description: string;
    timeRanges?: string; // "06:00-22:00" for display
    compatibleEnergy?: string[]; // Which energy types support this tariff
    color: string;
};

// Define tariff options configuration
const tariffOptions: TariffOption[] = [
    {
        key: "STANDARD",
        label: "Standard",
        icon: createElement(Settings),
        description: "Tarif unique applicable toute la journée",
        compatibleEnergy: ["Elec", "Gaz", "Eau", "Air"],
        color: "#6b7280"
    },
    {
        key: "HP",
        label: "Heures Pleines",
        icon: createElement(Sun),
        description: "Tarif applicable en heures pleines (généralement 6h-22h)",
        timeRanges: "06:00-22:00",
        compatibleEnergy: ["Elec"],
        color: "#f59e0b"
    },
    {
        key: "HC",
        label: "Heures Creuses",
        icon: createElement(Moon),
        description: "Tarif applicable en heures creuses (généralement 22h-6h)",
        timeRanges: "22:00-06:00",
        compatibleEnergy: ["Elec"],
        color: "#3b82f6"
    },
    {
        key: "POINTE",
        label: "Heures de Pointe",
        icon: createElement(Clock),
        description: "Tarif applicable en heures de pointe",
        timeRanges: "18:00-20:00",
        compatibleEnergy: ["Elec"],
        color: "#ef4444"
    }
];

// Helper function to get tariff option details
const getTariffOption = (key: string | undefined): TariffOption | undefined => {
    return tariffOptions.find(option => option.key === key);
};

// Helper function to filter tariff options based on energy type
const getCompatibleTariffOptions = (energyKey: string | undefined): TariffOption[] => {
    if (!energyKey) return [tariffOptions[0]]; // Return only STANDARD if no energy selected
    return tariffOptions.filter(tariff => 
        !tariff.compatibleEnergy || tariff.compatibleEnergy.includes(energyKey)
    );
};

// Helper type for energy options - use string for key
type EnergyOption = {
    key: string; // Use string for enumeration key
    label: string;
    icon: ReactElement;
    cssColorVar: string; // CSS variable name for the color
    description: string; // Description for tooltip
    styles: { // Simplified styles
        main: string;
    };
    // Animation variants for consistency
    animations: {
        hover: object;
        tap: object;
        active: object;
    };
};

// Define energy options configuration with updated keys matching the enum
const energyOptions: EnergyOption[] = [
    { 
        key: "Elec", // Use enum key
        label: "Électricité", 
        icon: createElement(Zap), 
        cssColorVar: energyColorStyles.electric.main, 
        description: "Prix de l'électricité en euro par kWh",
        styles: energyColorStyles.electric,
        animations: {
            hover: { scale: 1.05, transition: { duration: 0.2 } },
            tap: { scale: 0.98, transition: { duration: 0.1 } },
            active: { transition: { duration: 0.3 } }
        }
    },
    { 
        key: "Gaz", // Use enum key
        label: "Gaz", 
        icon: createElement(Flame), 
        cssColorVar: energyColorStyles.gas.main,
        description: "Prix du gaz en euro par kWh",
        styles: energyColorStyles.gas,
        animations: {
            hover: { scale: 1.05, transition: { duration: 0.2 } },
            tap: { scale: 0.98, transition: { duration: 0.1 } },
            active: { transition: { duration: 0.3 } }
        }
    },
    { 
        key: "Eau", // Use enum key
        label: "Eau", 
        icon: createElement(Droplet), 
        cssColorVar: energyColorStyles.water.main,
        description: "Prix de l'eau en euro par m³",
        styles: energyColorStyles.water,
        animations: {
            hover: { scale: 1.05, transition: { duration: 0.2 } },
            tap: { scale: 0.98, transition: { duration: 0.1 } },
            active: { transition: { duration: 0.3 } }
        }
    },
    { 
        key: "Air", // Use enum key
        label: "Air", 
        icon: createElement(Wind), 
        cssColorVar: energyColorStyles.air.main,
        description: "Qualité de l'air et ventilation",
        styles: energyColorStyles.air,
        animations: {
            hover: { scale: 1.05, transition: { duration: 0.2 } },
            tap: { scale: 0.98, transition: { duration: 0.1 } },
            active: { transition: { duration: 0.3 } }
        }
    }
];

// Helper function to get energy option details - uses updated keys
const getEnergyOption = (key: string | undefined): EnergyOption | undefined => {
    return energyOptions.find(option => option.key === key);
};

// Helper component for Select Item with animations
const SelectItem = forwardRef<HTMLDivElement, Select.SelectItemProps & { option: EnergyOption }>(
    ({ children, className, option, ...props }, forwardedRef) => {
        return (
            <motion.div
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
            >
                <Select.Item
                    className={`widget-saisie-select-item ${className || ""}`}
                    {...props}
                    ref={forwardedRef}
                >
                    <span className="widget-saisie-energy-icon" style={{ color: option.cssColorVar }}>
                        {option.icon}
                    </span>
                    <Select.ItemText>{children}</Select.ItemText>
                    <Select.ItemIndicator className="widget-saisie-select-item-indicator">
                        <CheckIcon />
                    </Select.ItemIndicator>
                </Select.Item>
            </motion.div>
        );
    }
);

// Helper component for Tariff Select Item
const TariffSelectItem = forwardRef<HTMLDivElement, Select.SelectItemProps & { option: TariffOption }>(
    ({ children, className, option, ...props }, forwardedRef) => {
        return (
            <motion.div
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
            >
                <Select.Item
                    className={`widget-saisie-select-item ${className || ""}`}
                    {...props}
                    ref={forwardedRef}
                >
                    <span className="widget-saisie-tariff-icon" style={{ color: option.color }}>
                        {option.icon}
                    </span>
                    <Select.ItemText>{children}</Select.ItemText>
                    {option.timeRanges && (
                        <span className="widget-saisie-time-range" style={{ fontSize: '12px', opacity: 0.7, marginLeft: '8px' }}>
                            {option.timeRanges}
                        </span>
                    )}
                    <Select.ItemIndicator className="widget-saisie-select-item-indicator">
                        <CheckIcon />
                    </Select.ItemIndicator>
                </Select.Item>
            </motion.div>
        );
    }
);

// Helper type for unit options
type UnitOption = {
    key: string;
    label: string;
    description: string;
    compatibleEnergy?: string[]; // Use updated energy keys here
};

// Define unit options - update compatibleEnergy keys
const unitOptions: UnitOption[] = [
    { 
        key: "EUR_KWH", 
        label: "€/kWh", 
        description: "Prix en euros par kilowatt-heure",
        compatibleEnergy: ["Elec", "Gaz", "Air"] // Use enum keys
    },
    { 
        key: "EUR_MWH", 
        label: "€/MWh", 
        description: "Prix en euros par mégawatt-heure",
        compatibleEnergy: ["Elec", "Gaz"] // Use enum keys
    },
    { 
        key: "EUR_GWH", 
        label: "€/GWh", 
        description: "Prix en euros par gigawatt-heure",
        compatibleEnergy: ["Elec", "Gaz"] // Use enum keys
    },
    { 
        key: "EUR_M3", 
        label: "€/m³", 
        description: "Prix en euros par mètre cube",
        compatibleEnergy: ["Eau", "Gaz"] // Use enum keys
    },
    { 
        key: "EUR_L", 
        label: "€/L", 
        description: "Prix en euros par litre",
        compatibleEnergy: ["Eau"] // Use enum keys
    }
];

// Helper function to get unit option details
const getUnitOption = (key: string | undefined): UnitOption | undefined => {
    return unitOptions.find(option => option.key === key);
};

// Helper function to filter unit options based on energy type
const getCompatibleUnitOptions = (energyKey: string | undefined): UnitOption[] => {
    if (!energyKey) return unitOptions;
    return unitOptions.filter(unit => 
        !unit.compatibleEnergy || unit.compatibleEnergy.includes(energyKey)
    );
};

// Helper component for Unit Select Item
const UnitSelectItem = forwardRef<HTMLDivElement, Select.SelectItemProps & { option: UnitOption }>(
    ({ children, className, option, ...props }, forwardedRef) => {
        return (
            <Select.Item
                className={`widget-saisie-select-item ${className || ""}`}
                {...props}
                ref={forwardedRef}
            >
                <Select.ItemText>{children}</Select.ItemText>
                <Select.ItemIndicator className="widget-saisie-select-item-indicator">
                    <CheckIcon />
                </Select.ItemIndicator>
            </Select.Item>
        );
    }
);

// Define custom static ranges in French BEFORE the component
const staticRanges: StaticRange[] = [
    {
        label: "Aujourd'hui",
        range: () => ({
            startDate: dateFnsStartOfDay(new Date()),
            endDate: endOfDay(new Date()),
        }),
        isSelected(range) {
            const todayStart = dateFnsStartOfDay(new Date());
            const todayEnd = endOfDay(new Date());
            return (
                isSameDay(range.startDate || new Date(0), todayStart) && // Handle potential undefined dates
                isSameDay(range.endDate || new Date(0), todayEnd)
            );
        }
    },
    {
        label: "Hier",
        range: () => ({
            startDate: dateFnsStartOfDay(addDays(new Date(), -1)),
            endDate: endOfDay(addDays(new Date(), -1)),
        }),
         isSelected(range) {
            const yesterdayStart = dateFnsStartOfDay(addDays(new Date(), -1));
            const yesterdayEnd = endOfDay(addDays(new Date(), -1));
            return (
                isSameDay(range.startDate || new Date(0), yesterdayStart) &&
                isSameDay(range.endDate || new Date(0), yesterdayEnd)
            );
        }
    },
    {
        label: "Cette semaine",
        range: () => ({
            startDate: startOfWeek(new Date(), { locale: fr }),
            endDate: endOfWeek(new Date(), { locale: fr }),
        }),
         isSelected(range) {
            const weekStart = startOfWeek(new Date(), { locale: fr });
            const weekEnd = endOfWeek(new Date(), { locale: fr });
            return (
                isSameDay(range.startDate || new Date(0), weekStart) &&
                isSameDay(range.endDate || new Date(0), weekEnd)
            );
        }
    },
    {
        label: "7 derniers jours",
        range: () => ({
            startDate: dateFnsStartOfDay(addDays(new Date(), -6)),
            endDate: endOfDay(new Date()),
        }),
         isSelected(range) {
            const sevenDaysStart = dateFnsStartOfDay(addDays(new Date(), -6));
            const sevenDaysEnd = endOfDay(new Date());
            return (
                isSameDay(range.startDate || new Date(0), sevenDaysStart) &&
                isSameDay(range.endDate || new Date(0), sevenDaysEnd)
            );
        }
    },
    {
        label: "Mois en cours",
        range: () => ({
            startDate: startOfMonth(new Date()),
            endDate: endOfMonth(new Date()),
        }),
         isSelected(range) {
            const monthStart = startOfMonth(new Date());
            const monthEnd = endOfMonth(new Date());
            return (
                isSameDay(range.startDate || new Date(0), monthStart) &&
                isSameDay(range.endDate || new Date(0), monthEnd)
            );
        }
    },
    {
        label: "Mois dernier",
        range: () => ({
            startDate: startOfMonth(addMonths(new Date(), -1)),
            endDate: endOfMonth(addMonths(new Date(), -1)),
        }),
         isSelected(range) {
            const lastMonthStart = startOfMonth(addMonths(new Date(), -1));
            const lastMonthEnd = endOfMonth(addMonths(new Date(), -1));
            return (
                isSameDay(range.startDate || new Date(0), lastMonthStart) &&
                isSameDay(range.endDate || new Date(0), lastMonthEnd)
            );
        }
    }
];

// Update History Item Type for Dialog data
type UpdatedHistoryItem = {
    id: string;
    originalObjectItem: ObjectItem;
    energy: string | undefined;
    energyLabel: string;
    energyColor: string | undefined;
    tariffType: string | undefined;
    tariffLabel: string;
    tariffColor: string;
    tariffIcon: ReactElement | null;
    price: string; // Formatted price with unit (for table)
    period: string; // Formatted date range (for table)
    duration: string; // Calculated duration (for table and dialog)
    icon: ReactElement | null;
    startDate: Date | undefined; // Keep original date
    endDate: Date | undefined;   // Keep original date
    // Add fields for dialog
    unitLabel: string; // e.g., "€/kWh"
    originalPrice: string; // e.g., "10.00"
    formattedStartDate: string; // e.g., "09/04/2025"
    formattedEndDate: string; // e.g., "15/04/2025"
    formattedCreationDate: string; // Add this line
};

// Define the pulse animation variants
const pulseVariants = {
    pulse: {
        scale: [1, 1.02, 1],
        opacity: [0.7, 1, 0.7],
        transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
    }
};

// Skeleton loader component for different elements
const SkeletonLoader = ({ type }: { type: 'input' | 'select' | 'date' | 'button' | 'table-row' }) => {
    const baseStyle = {
        backgroundColor: 'var(--skeleton-color, #e9ecef)',
        borderRadius: '4px',
    };
    
    // Different dimensions based on type
    switch (type) {
        case 'input':
            return (
                <motion.div 
                    variants={pulseVariants}
                    animate="pulse"
                    style={{
                        ...baseStyle,
                        height: '38px',
                        width: '100%',
                    }}
                />
            );
        case 'select':
            return (
                <motion.div 
                    variants={pulseVariants}
                    animate="pulse"
                    style={{
                        ...baseStyle,
                        height: '38px',
                        width: '100%',
                    }}
                />
            );
        case 'date':
            return (
                <motion.div 
                    variants={pulseVariants}
                    animate="pulse"
                    style={{
                        ...baseStyle,
                        height: '300px', // Approx date picker height
                        width: '100%',
                    }}
                />
            );
        case 'button':
            return (
                <motion.div 
                    variants={pulseVariants}
                    animate="pulse"
                    style={{
                        ...baseStyle,
                        height: '38px',
                        width: '120px',
                    }}
                />
            );
        case 'table-row':
            return (
                <tr>
                    <td>
                        <motion.div 
                            variants={pulseVariants}
                            animate="pulse"
                            style={{
                                ...baseStyle,
                                height: '20px',
                                width: '100%',
                            }}
                        />
                    </td>
                    <td>
                        <motion.div 
                            variants={pulseVariants}
                            animate="pulse"
                            style={{
                                ...baseStyle,
                                height: '20px',
                                width: '60px',
                            }}
                        />
                    </td>
                    <td>
                        <motion.div 
                            variants={pulseVariants}
                            animate="pulse"
                            style={{
                                ...baseStyle,
                                height: '20px',
                                width: '80px',
                            }}
                        />
                    </td>
                    <td>
                        <motion.div 
                            variants={pulseVariants}
                            animate="pulse"
                            style={{
                                ...baseStyle,
                                height: '20px',
                                width: '80px',
                            }}
                        />
                    </td>
                </tr>
            );
        default:
            return null;
    }
};

// Declare the Mendix client API global (if not already typed)
declare const mx: any; 

export function Saisie(props: SaisieContainerProps): ReactElement {
    const {
        energyAttribute,
        tariffTypeAttribute,
        priceAttribute,
        unitAttribute,
        startDateAttribute,
        endDateAttribute,
        historyDataSource,
        historyEnergyAttribute,
        historyTariffTypeAttribute,
        historyPriceAttribute,
        historyUnitAttribute,
        historyStartDateAttribute,
        historyEndDateAttribute,
        historyCreationDateAttribute,
        onSaveAction,
        backgroundColor,
        textColor,
        style,
        class: className
    } = props;

    const [selectedEnergy, setSelectedEnergy] = useState<string | undefined>(
        energyAttribute?.status === ValueStatus.Available ? (energyAttribute.value as string) : undefined
    );
    const [selectedTariffType, setSelectedTariffType] = useState<string | undefined>(
        tariffTypeAttribute?.status === ValueStatus.Available ? (tariffTypeAttribute.value as string) : "STANDARD"
    );
    const [price, setPrice] = useState<string>("");
    const [selectedUnit, setSelectedUnit] = useState<string | undefined>(
        unitAttribute?.status === ValueStatus.Available ? (unitAttribute.value as string) : undefined
    );
    const [dateRange, setDateRange] = useState<Range[]>([
        {
            startDate: startDateAttribute?.value ?? dateFnsStartOfDay(new Date()),
            endDate: endDateAttribute?.value ?? dateFnsStartOfDay(new Date()),
            key: 'selection'
        }
    ]);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const fadeInVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
    };
    
    const slideInVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.4, type: "spring", stiffness: 300 } }
    };
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<UpdatedHistoryItem | null>(null);
    const [dateOverlapWarning, setDateOverlapWarning] = useState<string>("");
    
    // --- State for Edit/Delete --- 
    // Commenting out edit-related state as the feature is disabled
    /*
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<UpdatedHistoryItem | null>(null);
    */
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<UpdatedHistoryItem | null>(null);
    // --- End State for Edit/Delete --- 
    
    // --- State for Edit Dialog Form --- 
    // Commenting out edit-related state as the feature is disabled
    /*
    const [editPrice, setEditPrice] = useState<string>("");
    const [editUnit, setEditUnit] = useState<string | undefined>(undefined);
    const [editDateRange, setEditDateRange] = useState<Range[]>([{ 
        startDate: new Date(), 
        endDate: new Date(), 
        key: 'editSelection' 
    }]);
    const [editCompatibleUnits, setEditCompatibleUnits] = useState<UnitOption[]>(unitOptions);
    */
    // --- End State for Edit Dialog Form --- 

    useEffect(() => {
        const dataIsLoading = 
            energyAttribute?.status === ValueStatus.Loading || 
            priceAttribute?.status === ValueStatus.Loading || 
            unitAttribute?.status === ValueStatus.Loading ||
            startDateAttribute?.status === ValueStatus.Loading || 
            endDateAttribute?.status === ValueStatus.Loading ||
            (historyDataSource && historyDataSource.status === ValueStatus.Loading);
            
        setIsLoading(dataIsLoading === true);
        
        if (historyDataSource?.status === ValueStatus.Available) {
            console.log("History Data Source Items (Status Available):", historyDataSource.items?.map(item => ({ 
                id: item.id, 
                price: historyPriceAttribute?.get(item)?.value?.toString(), 
                unit: historyUnitAttribute?.get(item)?.value,
                startDate: historyStartDateAttribute?.get(item)?.value,
                endDate: historyEndDateAttribute?.get(item)?.value
             })));
       }
        
        if (!dataIsLoading) {
            const timer = setTimeout(() => setIsLoading(false), 300);
            return () => clearTimeout(timer);
        }
    }, [
        energyAttribute?.status, 
        priceAttribute?.status, 
        unitAttribute?.status,
        startDateAttribute?.status, 
        endDateAttribute?.status,
        historyDataSource?.status, // Add status dependency
        historyDataSource, 
        historyPriceAttribute, 
        historyUnitAttribute, 
        historyStartDateAttribute, 
        historyEndDateAttribute
    ]);

    const showToast = (message: string, type: "success" | "error" | "info" = "info"): void => {
        setToastMessage(message);
        setToastType(type);
        setToastOpen(true);
        
        setTimeout(() => {
            setToastOpen(false);
        }, 3000);
    };

    useEffect(() => {
        if (priceAttribute?.status === ValueStatus.Available && priceAttribute.value) {
            setPrice(priceAttribute.value.toString());
        } else {
            setPrice("");
        }
    }, [priceAttribute?.status, priceAttribute?.value]);

    useEffect(() => {
        const start = startDateAttribute?.status === ValueStatus.Available ? startDateAttribute.value : null;
        const end = endDateAttribute?.status === ValueStatus.Available ? endDateAttribute.value : null;
        
        const validStartDate = start instanceof Date ? start : dateFnsStartOfDay(new Date());
        const validEndDate = end instanceof Date ? end : dateFnsStartOfDay(new Date());

        setDateRange(prevRange => [{
            ...prevRange[0],
            startDate: validStartDate,
            endDate: validEndDate
        }]);
    }, [startDateAttribute?.status, startDateAttribute?.value, endDateAttribute?.status, endDateAttribute?.value]);

    useEffect(() => {
        if (energyAttribute?.status === ValueStatus.Available && energyAttribute.value) {
            setSelectedEnergy(energyAttribute.value as string);
        }
    }, [energyAttribute?.status, energyAttribute?.value]);

    useEffect(() => {
        if (tariffTypeAttribute?.status === ValueStatus.Available && tariffTypeAttribute.value) {
            setSelectedTariffType(tariffTypeAttribute.value as string);
        } else if (tariffTypeAttribute?.status === ValueStatus.Available && !tariffTypeAttribute.value) {
            setSelectedTariffType("STANDARD"); // Default value
        }
    }, [tariffTypeAttribute?.status, tariffTypeAttribute?.value]);

    useEffect(() => {
        // Sync selectedUnit FROM Mendix unitAttribute ON INITIAL LOAD or if Mendix value changes EXTERNALLY
        // We only set the state if the *local state* hasn't been set yet,
        // allowing user interaction to take precedence afterwards.
        if (unitAttribute?.status === ValueStatus.Available && unitAttribute.value && selectedUnit === undefined) {
            // console.log(`Initial Sync: Setting unit from Mendix prop: ${unitAttribute.value}`);
             setSelectedUnit(unitAttribute.value as string);
        }
        // We rely on the other useEffect (L556) to handle default unit logic based on energy selection.
    }, [unitAttribute?.status, unitAttribute?.value]); // Run ONLY if Mendix prop status/value changes, NOT on selectedUnit change

    useEffect(() => {
        // This useEffect handles setting a default unit *after* energy changes,
        // or clearing the unit if energy is deselected.
        if (selectedEnergy) {
            const compatibleUnits = getCompatibleUnitOptions(selectedEnergy);
            // const currentUnitOption = getUnitOption(selectedUnit); // Not strictly needed here

            // If a unit is selected AND it's NOT compatible with the new energy OR if NO unit is selected
            if ((selectedUnit && !compatibleUnits.some(unit => unit.key === selectedUnit)) || !selectedUnit ) {
                // console.log(`Energy changed to ${selectedEnergy}. Current unit ${selectedUnit} is incompatible or unset. Setting default compatible unit.`);
                if (compatibleUnits.length > 0) {
                    setSelectedUnit(compatibleUnits[0].key);
                } else {
                    setSelectedUnit(undefined); // No compatible units
                }
            }
            // If a unit IS selected and it IS compatible, DO NOTHING - let the user's choice persist.
            // else if (selectedUnit && compatibleUnits.some(unit => unit.key === selectedUnit)) {
                // console.log(`Energy changed to ${selectedEnergy}. Current unit ${selectedUnit} is compatible. Keeping it.`);
            // }

        } else {
            // If energy is deselected, maybe clear the unit? Or leave it? Let's leave it for now.
            // console.log("Energy deselected. Clearing unit.");
            // setSelectedUnit(undefined);
        }
    }, [selectedEnergy]); // Only depends on selectedEnergy

    useEffect(() => {
        // This useEffect handles setting a default tariff type after energy changes
        if (selectedEnergy) {
            const compatibleTariffs = getCompatibleTariffOptions(selectedEnergy);
            
            // If current tariff is not compatible with new energy, set to STANDARD or first compatible
            if (selectedTariffType && !compatibleTariffs.some(tariff => tariff.key === selectedTariffType)) {
                setSelectedTariffType("STANDARD");
            } else if (!selectedTariffType) {
                setSelectedTariffType("STANDARD"); // Default value
            }
        } else {
            // If no energy selected, reset to STANDARD
            setSelectedTariffType("STANDARD");
        }
    }, [selectedEnergy, selectedTariffType]); // Depends on both energy and current tariff

    useEffect(() => {
        // --- Update proactive overlap warning, considering edit mode --- 
        let overlaps = false;
        // Only check if we have the necessary data and either a selected energy (main form) OR an item being edited
        const shouldCheckOverlap = historyDataSource?.items && 
                                   dateRange[0]?.startDate && 
                                   dateRange[0]?.endDate && 
                                   selectedEnergy;
                                   // Remove check for editingItem: (selectedEnergy || editingItem);

        if (shouldCheckOverlap) {
            // Remove logic related to editingItem
            /*
            const currentIdToCheck = editingItem ? editingItem.id : null;
            const energyToCheck = editingItem ? editingItem.energy : selectedEnergy;
            const rangeToCheck = editingItem ? editDateRange[0] : dateRange[0];
            */
            const energyToCheck = selectedEnergy;
            const rangeToCheck = dateRange[0];

            // Ensure range object and energy type exist first
            if (rangeToCheck && energyToCheck) {
                const startDateValue = rangeToCheck.startDate;
                const endDateValue = rangeToCheck.endDate;

                // Ensure start and end dates within the range exist
                if (startDateValue && endDateValue) {
                    const newStartDate = dateFnsStartOfDay(startDateValue);
                    const newEndDate = dateFnsStartOfDay(endDateValue);

                    overlaps = historyDataSource.items.some((item: ObjectItem) => {
                        // Exclude the item being edited (if any) from the check
                        // Remove check for editingItem: if (item.id === currentIdToCheck) { return false; }

                        const itemEnergy = historyEnergyAttribute?.get(item)?.value as string | undefined;
                        const itemTariffType = historyTariffTypeAttribute?.get(item)?.value as string | undefined;
                        
                        // Must match both energy type AND tariff type
                        if (itemEnergy !== energyToCheck) return false;
                        if (itemTariffType !== selectedTariffType) return false;

                        const existingStartDate = historyStartDateAttribute?.get(item)?.value as Date | undefined;
                        const existingEndDate = historyEndDateAttribute?.get(item)?.value as Date | undefined;

                        if (!existingStartDate || !existingEndDate) return false;

                        return areIntervalsOverlapping(
                            { start: newStartDate, end: newEndDate },
                            { start: dateFnsStartOfDay(existingStartDate), end: dateFnsStartOfDay(existingEndDate) },
                            { inclusive: true }
                        );
                    });
                }
            }
        }

        if (overlaps) {
            // Set warning based on context (main form or edit dialog)
            // Remove check for editingItem
            /*
            const message = editingItem 
                ? "Attention: La période modifiée chevauche une autre période existante."
                : "Attention: La période sélectionnée chevauche une période existante.";
            */
            const message = "Attention: La période sélectionnée chevauche une période existante.";
            setDateOverlapWarning(message);
        } else {
            setDateOverlapWarning(""); // Clear warning
        }
        // --- End overlap check ---
    
    // Update dependencies to include edit state - Remove edit state dependencies
    }, [selectedEnergy, selectedTariffType, dateRange, /* editDateRange, editingItem, */ historyDataSource, historyEnergyAttribute, historyTariffTypeAttribute, historyStartDateAttribute, historyEndDateAttribute]); 

    const handleDateRangeChange = (rangesByKey: { [key: string]: Range }) => {
        const selection = rangesByKey.selection;
        setDateRange([{
             startDate: selection.startDate instanceof Date ? selection.startDate : new Date(),
             endDate: selection.endDate instanceof Date ? selection.endDate : new Date(),
             key: 'selection'
        }]);
    };

    const handleSave = useCallback(() => {
        if (!onSaveAction || !onSaveAction.canExecute) {
            console.warn("Save action cannot be executed.");
            showToast("Impossible d'exécuter l'action de sauvegarde.", "error");
            return;
        }
        
        // --- Input Validation --- 
        if (!selectedEnergy) {
            showToast("Veuillez sélectionner un type d'énergie.", "error");
            return;
        }
        if (!price.trim()) {
            showToast("Veuillez entrer un prix.", "error");
            return;
        }
        if (!selectedUnit) {
            showToast("Veuillez sélectionner une unité.", "error");
            return;
        }
        if (!dateRange[0]?.startDate || !dateRange[0]?.endDate) {
            showToast("Veuillez sélectionner une période de validité.", "error");
            return;
        }
        if (dateRange[0].startDate > dateRange[0].endDate) {
            showToast("La date de début ne peut pas être postérieure à la date de fin.", "error");
            return;
        }

        // --- Overlap Validation --- 
        if (historyDataSource?.items) {
            const newStartDate = dateFnsStartOfDay(dateRange[0].startDate);
            const newEndDate = dateFnsStartOfDay(dateRange[0].endDate);

            const overlaps = historyDataSource.items.some((item: ObjectItem) => {
                const itemEnergy = historyEnergyAttribute?.get(item)?.value as string | undefined;
                const itemTariffType = historyTariffTypeAttribute?.get(item)?.value as string | undefined;
                
                // Must match both energy type AND tariff type
                if (itemEnergy !== selectedEnergy) {
                    return false; // Only check against the same energy type
                }
                if (itemTariffType !== selectedTariffType) {
                    return false; // Only check against the same tariff type
                }

                const existingStartDate = historyStartDateAttribute?.get(item)?.value as Date | undefined;
                const existingEndDate = historyEndDateAttribute?.get(item)?.value as Date | undefined;

                if (!existingStartDate || !existingEndDate) {
                    return false; // Skip items with invalid dates
                }

                return areIntervalsOverlapping(
                    { start: newStartDate, end: newEndDate },
                    { start: dateFnsStartOfDay(existingStartDate), end: dateFnsStartOfDay(existingEndDate) },
                    { inclusive: true } // Consider exact start/end dates as overlap
                );
            });

            if (overlaps) {
                const tariffLabel = getTariffOption(selectedTariffType)?.label || selectedTariffType;
                showToast(`La période sélectionnée chevauche une période existante pour ${selectedEnergy} en tarif ${tariffLabel}.`, "error");
                return; // Prevent saving
            }
        }
        // --- End Overlap Validation ---

        // Rename variables inside this scope to avoid conflict
        const canEditEnergyAttr = energyAttribute?.status === ValueStatus.Available && !energyAttribute.readOnly;
        const canEditTariffTypeAttr = tariffTypeAttribute?.status === ValueStatus.Available && !tariffTypeAttribute.readOnly;
        const canEditPriceAttr = priceAttribute?.status === ValueStatus.Available && !priceAttribute.readOnly;
        const canEditUnitAttr = unitAttribute?.status === ValueStatus.Available && !unitAttribute.readOnly;
        const canEditStartDateAttr = startDateAttribute?.status === ValueStatus.Available && !startDateAttribute.readOnly;
        const canEditEndDateAttr = endDateAttribute?.status === ValueStatus.Available && !endDateAttribute.readOnly;

        // Check editability (show warnings but proceed if possible)
        if (!canEditEnergyAttr) {
            console.warn("Energy attribute not available or read-only.");
        }
        if (!canEditPriceAttr) {
            showToast("Le prix n'est pas modifiable.", "error");
            console.warn("Price attribute not available or read-only.");
            return; // Halt if price isn't editable
        }
         if (!canEditUnitAttr) {
            console.warn("Unit attribute not available or read-only.");
             // Decide if saving should proceed without setting unit
        }
        if (!canEditStartDateAttr) {
            showToast("La date de début n'est pas modifiable.", "error");
            console.warn("Start date attribute not available or read-only.");
            return; // Halt if dates aren't editable
        }
        if (!canEditEndDateAttr) {
            showToast("La date de fin n'est pas modifiable.", "error");
            console.warn("End date attribute not available or read-only.");
            return; // Halt if dates aren't editable
        }

        let priceValue: Big | undefined;
        try {
            // Ensure price is parsed correctly, handle potential empty string after trim
            const trimmedPrice = price.trim();
            if (!trimmedPrice) {
                showToast("Veuillez entrer un prix valide.", "error");
                return;
            }
            priceValue = new Big(trimmedPrice);
             if (priceValue.lt(0)) { // Check for negative price
                showToast("Le prix ne peut pas être négatif.", "error");
                return;
            }
        } catch (error) {
            showToast("Format de prix invalide.", "error");
            console.error("Invalid price format:", error);
            return;
        }
        
        // Set Mendix attributes - Use renamed variables for checks
        if (canEditEnergyAttr) {
            energyAttribute.setValue(selectedEnergy); // Already validated to exist
        }
        if (canEditTariffTypeAttr) {
            tariffTypeAttribute.setValue(selectedTariffType); // Already validated to exist
        }
        if (canEditPriceAttr) {
            priceAttribute.setValue(priceValue); // Already validated to be Big
        }
        if (canEditUnitAttr) {
            unitAttribute.setValue(selectedUnit); // Already validated to exist
        }
        if (canEditStartDateAttr) {
            startDateAttribute.setValue(dateRange[0].startDate); // Already validated to exist
        }
        if (canEditEndDateAttr) {
            endDateAttribute.setValue(dateRange[0].endDate); // Already validated to exist
        }

        console.log("DEBUG SAVE: Before executing onSaveAction");
        onSaveAction.execute();
        showToast("Données enregistrées avec succès.", "success");

        // --- Reset Form Fields After Successful Save ---
        console.log("DEBUG SAVE: Attempting to reset form fields..."); // Log before reset
        setSelectedEnergy(undefined); // Clear energy selection
        setSelectedTariffType("STANDARD"); // Reset to default tariff type
        setPrice(""); // Clear price input
        setSelectedUnit(undefined); // Clear unit selection
        setDateRange([{ 
            startDate: dateFnsStartOfDay(new Date()), // Reset dates to today
            endDate: dateFnsStartOfDay(new Date()),
            key: 'selection'
        }]);
        console.log("DEBUG SAVE: Form fields reset commands issued."); // Log after reset
        // --- End Reset Form Fields ---

    }, [
        onSaveAction,
        energyAttribute,
        tariffTypeAttribute,
        priceAttribute,
        unitAttribute,
        startDateAttribute,
        endDateAttribute,
        selectedEnergy,
        selectedTariffType,
        selectedUnit,
        price,
        dateRange,
        showToast, // Include showToast in dependencies
        historyDataSource, // Add dependencies for overlap check
        historyEnergyAttribute,
        historyTariffTypeAttribute,
        historyStartDateAttribute,
        historyEndDateAttribute
    ]);

    const currentEnergyOption = useMemo(() => getEnergyOption(selectedEnergy), [selectedEnergy]);
    const currentTariffOption = useMemo(() => getTariffOption(selectedTariffType), [selectedTariffType]);
    const compatibleUnits = useMemo(() => getCompatibleUnitOptions(selectedEnergy), [selectedEnergy]);
    const compatibleTariffs = useMemo(() => getCompatibleTariffOptions(selectedEnergy), [selectedEnergy]);

    const containerStyle = {
        ...style,
        backgroundColor: backgroundColor || undefined,
        color: textColor || undefined,
    };

    const isPriceEditable = priceAttribute?.status === ValueStatus.Available && !priceAttribute.readOnly;
    const isUnitEditable = unitAttribute?.status === ValueStatus.Available && !unitAttribute.readOnly;
    const isStartDateEditable = startDateAttribute?.status === ValueStatus.Available && !startDateAttribute.readOnly;
    const isEndDateEditable = endDateAttribute?.status === ValueStatus.Available && !endDateAttribute.readOnly;
    const canSave = props.onSaveAction && // Check props.onSaveAction first
                    props.onSaveAction.canExecute && 
                    isPriceEditable && 
                    isStartDateEditable && 
                    isEndDateEditable;

    const processedHistoryItems = useMemo((): UpdatedHistoryItem[] => {
        if (!historyDataSource || historyDataSource.status !== ValueStatus.Available || !historyDataSource.items) {
            return [];
        }
        
        return historyDataSource.items.map((item: ObjectItem) => {
            const historyEnergyValue = historyEnergyAttribute?.get(item)?.value as string | undefined;
            const historyTariffTypeValue = historyTariffTypeAttribute?.get(item)?.value as string | undefined;
            const historyPriceValue = historyPriceAttribute?.get(item)?.value as Big | undefined;
            const historyUnitValue = historyUnitAttribute?.get(item)?.value as string | undefined;
            const historyStartDateValue = historyStartDateAttribute?.get(item)?.value as Date | undefined;
            const historyEndDateValue = historyEndDateAttribute?.get(item)?.value as Date | undefined;
            const historyCreationDateValue = historyCreationDateAttribute?.get(item)?.value as Date | undefined;

            const option = getEnergyOption(historyEnergyValue); 
            const tariffOption = getTariffOption(historyTariffTypeValue);
            const unitOption = getUnitOption(historyUnitValue);
            const unitLabel = unitOption?.label || 'N/A';

            const originalPrice = historyPriceValue ? historyPriceValue.toFixed(2) : 'N/A';
            const formattedPriceTable = historyPriceValue ? `${originalPrice} ${unitOption?.label || '€'}` : 'N/A'; // Price for table
            
            const formattedStartDate = historyStartDateValue ? format(historyStartDateValue, 'dd/MM/yyyy', { locale: fr }) : 'N/A';
            const formattedEndDate = historyEndDateValue ? format(historyEndDateValue, 'dd/MM/yyyy', { locale: fr }) : 'N/A';
            const periodTable = `${formattedStartDate} - ${formattedEndDate}`; // Period for table

            const formattedCreationDate = historyCreationDateValue ? format(historyCreationDateValue, 'dd/MM/yyyy HH:mm', { locale: fr }) : 'N/A';

            let duration = 'N/A';
            if (historyStartDateValue && historyEndDateValue) {
                const days = differenceInDays(historyEndDateValue, historyStartDateValue) + 1; 
                duration = `${days} jour${days > 1 ? 's' : ''}`;
            }
            
            return {
                id: item.id,
                originalObjectItem: item,
                energy: historyEnergyValue,
                energyLabel: option?.label || historyEnergyValue || 'Inconnu',
                energyColor: option?.styles?.main || 'grey',
                tariffType: historyTariffTypeValue,
                tariffLabel: tariffOption?.label || historyTariffTypeValue || 'Standard',
                tariffColor: tariffOption?.color || '#6b7280',
                tariffIcon: tariffOption?.icon || null,
                price: formattedPriceTable, // Use table formatted price
                period: periodTable, // Use table formatted period
                duration: duration,
                icon: option?.icon || null,
                startDate: historyStartDateValue,
                endDate: historyEndDateValue,
                // Add fields for dialog
                unitLabel: unitLabel,
                originalPrice: originalPrice,
                formattedStartDate: formattedStartDate,
                formattedEndDate: formattedEndDate,
                formattedCreationDate: formattedCreationDate
            };
        });
    }, [historyDataSource, historyEnergyAttribute, historyTariffTypeAttribute, historyPriceAttribute, historyUnitAttribute, historyStartDateAttribute, historyEndDateAttribute, historyCreationDateAttribute]);

    const priceInputStyle = useMemo(() => {
        if (!currentEnergyOption) return {};
        return {
            borderColor: currentEnergyOption.cssColorVar,
            boxShadow: `0 0 0 1px ${currentEnergyOption.cssColorVar}`,
        };
    }, [currentEnergyOption]);

    const isDateDisabled = useCallback((date: Date): boolean => {
        // Ensure selectedEnergy uses the lowercase enum key
        if (!selectedEnergy || !historyDataSource?.items) {
            return false;
        }

        return historyDataSource.items.some((item: ObjectItem) => {
            const itemEnergy = historyEnergyAttribute?.get(item)?.value as string | undefined;
            // Strict comparison using the enum keys
            if (itemEnergy !== selectedEnergy) { 
                return false;
            }

            const startDate = historyStartDateAttribute?.get(item)?.value as Date;
            const endDate = historyEndDateAttribute?.get(item)?.value as Date;

            if (!startDate || !endDate) {
                return false;
            }

            const dateToCheck = dateFnsStartOfDay(date);
            return isWithinInterval(dateToCheck, {
                start: dateFnsStartOfDay(startDate),
                end: dateFnsStartOfDay(endDate)
            });
        });
    }, [historyDataSource, historyEnergyAttribute, historyStartDateAttribute, historyEndDateAttribute, selectedEnergy]);

    const displayDateRange = useMemo(() => {
        const start = dateRange[0]?.startDate;
        const end = dateRange[0]?.endDate;
        if (start && end) {
            return `${format(start, 'dd/MM/yyyy', { locale: fr })} - ${format(end, 'dd/MM/yyyy', { locale: fr })}`;
        }
        return "Sélectionner une période";
    }, [dateRange]);

    // Function to open the info dialog
    const handleOpenInfoDialog = (item: UpdatedHistoryItem) => {
        setSelectedHistoryItem(item);
        setDialogOpen(true);
    };
    
    // --- Handlers for Edit/Delete --- (Partially implemented)
    // Commenting out the edit click handler as the feature is disabled
    /*
    const handleEditClick = (item: UpdatedHistoryItem) => {
        // Commenting out the edit functionality as requested
        
        // setEditingItem(item);
        // // Pre-fill edit form state
        // setEditPrice(item.originalPrice !== 'N/A' ? item.originalPrice : "");
        // setEditUnit(item.unitLabel !== 'N/A' ? unitOptions.find(u => u.label === item.unitLabel)?.key : undefined);
        // setEditDateRange([{
        //     startDate: item.startDate || new Date(),
        //     endDate: item.endDate || new Date(),
        //     key: 'editSelection'
        // }]);
        // // Update compatible units for the selected energy type
        // const energyKey = energyOptions.find(e => e.label === item.energyLabel)?.key;
        // setEditCompatibleUnits(getCompatibleUnitOptions(energyKey));
        
        // setEditDialogOpen(true); // Open the dialog
        
       console.log("Edit functionality is currently disabled.");
       showToast("La fonctionnalité de modification est temporairement désactivée.", "info");
    };
    */
    
    const handleDeleteClick = (item: UpdatedHistoryItem) => {
        setItemToDelete(item);
        setDeleteConfirmOpen(true); // Open the confirmation dialog
    };
    
    // Commenting out the edit save functionality as requested
    /*
    const handleEditSave = useCallback(() => { 
        if (!editingItem || !props.onEditAction) {
            showToast("Erreur: Impossible de trouver l'élément à modifier ou l'action.", "error");
            return;
        }
        
        const originalItem = editingItem.originalObjectItem;
        // const editAction = props.onEditAction.get(originalItem); // Keep reference if needed later
        
        // --- Input Validation ---
        if (!editPrice.trim()) {
            showToast("Veuillez entrer un prix.", "error");
            return;
        }
        if (!editUnit) {
            showToast("Veuillez sélectionner une unité.", "error");
            return;
        }
        // Date range validation removed as dates are not editable in the dialog anymore
        // if (!editDateRange[0]?.startDate || !editDateRange[0]?.endDate) { ... }
        // if (editDateRange[0].startDate > editDateRange[0].endDate) { ... }

        let priceValue: Big;
        try {
            const trimmedPrice = editPrice.trim();
            if (!trimmedPrice) throw new Error("Prix vide");
            priceValue = new Big(trimmedPrice);
            if (priceValue.lt(0)) {
                showToast("Le prix ne peut pas être négatif.", "error");
                return;
            }
        } catch (error) {
            showToast("Format de prix invalide.", "error");
            console.error("Invalid edit price format:", error);
            return;
        }

        // --- Overlap Validation (excluding self, using ORIGINAL dates) ---
        let overlapsWithOthers = false; // Initialize overlap flag
        if (historyDataSource?.items && editingItem.startDate && editingItem.endDate) { // Check if original dates exist
            const originalStartDate = dateFnsStartOfDay(editingItem.startDate);
            const originalEndDate = dateFnsStartOfDay(editingItem.endDate);
            const currentItemId = editingItem.id;

            overlapsWithOthers = historyDataSource.items.some((item: ObjectItem) => {
                // Exclude the item being edited from the check
                if (item.id === currentItemId) {
                    return false;
                }
                
                const itemEnergy = historyEnergyAttribute?.get(item)?.value as string | undefined;
                // Check against the same energy type as the item being edited
                if (itemEnergy !== editingItem.energy) { 
                    return false; 
                }

                const existingStartDate = historyStartDateAttribute?.get(item)?.value as Date | undefined;
                const existingEndDate = historyEndDateAttribute?.get(item)?.value as Date | undefined;

                if (!existingStartDate || !existingEndDate) return false;

                // Compare ORIGINAL dates of the editing item with others
                return areIntervalsOverlapping(
                    { start: originalStartDate, end: originalEndDate }, 
                    { start: dateFnsStartOfDay(existingStartDate), end: dateFnsStartOfDay(existingEndDate) },
                    { inclusive: true }
                );
            });

            if (overlapsWithOthers) {
                showToast("La période (originale) de cet élément chevauche une autre période existante pour ce type d'énergie. Modification impossible.", "error");
                console.warn(`DEBUG EDIT SAVE (${originalItem.id}): Overlap validation failed using original dates.`);
                return; // Prevent saving
            } else {
                 console.log(`DEBUG EDIT SAVE (${originalItem.id}): Overlap validation passed.`);
            }
        } else {
            console.log(`DEBUG EDIT SAVE (${originalItem.id}): Skipping overlap validation due to missing data.`);
        }
        // --- End Overlap Validation ---
        
        // --- Prepare for Commit ---
        console.log(`DEBUG EDIT SAVE (${originalItem.id}): Preparing to commit changes.`);
        console.log(`DEBUG EDIT SAVE (${originalItem.id}): Price to set:`, priceValue.toString());
        console.log(`DEBUG EDIT SAVE (${originalItem.id}): Unit to set:`, editUnit);

        // --- Update Mendix Object Attributes --- 
        try {
            const priceAttr = historyPriceAttribute?.get(originalItem);
            const unitAttr = historyUnitAttribute?.get(originalItem);
            const startDateAttr = historyStartDateAttribute?.get(originalItem); // Check read-only status
            const endDateAttr = historyEndDateAttribute?.get(originalItem); // Check read-only status

            // Log read-only status before attempting to set
            console.log(`DEBUG EDIT SAVE (${originalItem.id}): Price Attribute readOnly:`, priceAttr?.readOnly);
            console.log(`DEBUG EDIT SAVE (${originalItem.id}): Unit Attribute readOnly:`, unitAttr?.readOnly);
            console.log(`DEBUG EDIT SAVE (${originalItem.id}): StartDate Attribute readOnly:`, startDateAttr?.readOnly);
            console.log(`DEBUG EDIT SAVE (${originalItem.id}): EndDate Attribute readOnly:`, endDateAttr?.readOnly);

            let canCommit = true;

            if (priceAttr) {
                if (!priceAttr.readOnly) {
                    priceAttr.setValue(priceValue);
                } else {
                    console.warn(`DEBUG EDIT SAVE (${originalItem.id}): Price attribute is read-only. Cannot set value.`);
                    // Potentially set canCommit = false if this should prevent the commit
                    canCommit = false; // Explicitly prevent commit if price is read-only
                }
            } else {
                 console.error(`DEBUG EDIT SAVE (${originalItem.id}): Could not get price attribute.`);
                 canCommit = false;
            }
            
            if (unitAttr) {
                 if (!unitAttr.readOnly) {
                    unitAttr.setValue(editUnit);
                } else {
                     console.warn(`DEBUG EDIT SAVE (${originalItem.id}): Unit attribute is read-only. Cannot set value.`);
                     // Potentially set canCommit = false
                     canCommit = false; // Explicitly prevent commit if unit is read-only
                 }
            } else {
                console.error(`DEBUG EDIT SAVE (${originalItem.id}): Could not get unit attribute.`);
                canCommit = false;
            }
            
            // Do NOT attempt to set dates as they are not editable in the dialog
            // if (startDateAttr && !startDateAttr.readOnly) startDateAttr.setValue(...) 
            // if (endDateAttr && !endDateAttr.readOnly) endDateAttr.setValue(...)

            // Check canCommit flag BEFORE proceeding
            if (!canCommit) {
                 showToast("Erreur: Les champs Prix ou Unité ne sont pas modifiables. Vérifiez la configuration Mendix.", "error");
                 console.error(`DEBUG EDIT SAVE (${originalItem.id}): Commit blocked because Price or Unit attribute is read-only.`);
                 return; // Stop if essential attributes couldn't be accessed or set
            }

        } catch (error) {
            showToast("Erreur lors de la mise à jour des attributs locaux avant commit.", "error");
            console.error(`DEBUG EDIT SAVE (${originalItem.id}): Error setting attributes locally before commit:`, error);
            return; 
        }
        // --- End Update Mendix Object Attributes --- 

        // --- Commit Changes via mx.data.commit --- 
        console.log(`DEBUG EDIT SAVE (${originalItem.id}): Calling mx.data.commit...`);
        console.log(`DEBUG EDIT SAVE: originalItem just before commit:`, originalItem); // Log object state
        mx.data.commit({
            mxObject: originalItem,
            callback: () => {
                // Commit successful
                console.log(`DEBUG EDIT SAVE (${originalItem.id}): mx.data.commit successful.`);
                showToast("Modification enregistrée avec succès.", "success");
                setEditDialogOpen(false); // Close dialog
                
                // Optionally execute the Mendix action AFTER successful commit
                const editActionInstance = props.onEditAction?.get(originalItem);
                if (editActionInstance && editActionInstance.canExecute) {
                    console.log(`DEBUG EDIT SAVE (${originalItem.id}): Executing onEditAction after commit.`);
                    editActionInstance.execute(); 
                } else {
                    console.log(`DEBUG EDIT SAVE (${originalItem.id}): onEditAction not available/executable after commit.`);
                    // Consider if a manual refresh is needed if the action was responsible for it
                    // if (historyDataSource?.status === ValueStatus.Available) {
                    //     historyDataSource.reload();
                    // }
                }
            },
            error: (error: Error) => { // Explicitly type error
                // Commit failed 
                console.error(`DEBUG EDIT SAVE (${originalItem.id}): mx.data.commit FAILED. Error:`, error);
                // Try to log specific Mendix properties if available
                if ((error as any).message) {
                    console.error(`DEBUG EDIT SAVE (${originalItem.id}): Mendix error message:`, (error as any).message);
                }
                 if ((error as any).cause) {
                    console.error(`DEBUG EDIT SAVE (${originalItem.id}): Mendix error cause:`, (error as any).cause);
                }
                showToast(`Erreur lors de l'enregistrement Mendix: ${error.message || 'Erreur inconnue'}`, "error");
                
                // Rollback client-side changes on commit failure
                console.log(`DEBUG EDIT SAVE (${originalItem.id}): Rolling back client changes due to commit error.`);
                 mx.data.rollback({ 
                    mxObject: originalItem,
                    callback: () => console.log(`DEBUG EDIT SAVE (${originalItem.id}): Rollback successful.`),
                    error: (rbError: Error) => console.error(`DEBUG EDIT SAVE (${originalItem.id}): Rollback FAILED. Error:`, rbError)
                 });
            }
        });
        // --- End Commit Changes --- 

    }, [ 
        editingItem, 
        editPrice, 
        editUnit, 
        props.onEditAction, 
        showToast, 
        historyPriceAttribute, 
        historyUnitAttribute,
        historyStartDateAttribute, // Added for read-only check log
        historyEndDateAttribute,   // Added for read-only check log
        historyDataSource, // Needed for overlap check and potential reload
        historyEnergyAttribute, // Needed for overlap check
        // editDateRange is removed as it's no longer used for saving/overlap
    ]); 
    */
    // --- End Handlers --- 

    return (
        <Tooltip.Provider delayDuration={300}>
            <Toast.Provider swipeDirection="right">
                <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={fadeInVariants}
                        className={`widget-saisie ${className || ''}`} 
                        style={containerStyle}
                    >
                        <Tabs.Root className="widget-saisie-tabs" defaultValue="saisie">
                            <Tabs.List className="widget-saisie-tabs-list" aria-label="Gestion des prix">
                                <Tabs.Trigger className="widget-saisie-tabs-trigger" value="saisie">
                                    Saisie des prix
                                </Tabs.Trigger>
                                <Tabs.Trigger className="widget-saisie-tabs-trigger" value="historique">
                                    Historique des prix
                                </Tabs.Trigger>
                            </Tabs.List>

                            <Tabs.Content className="widget-saisie-tabs-content" value="saisie">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="widget-saisie-form-content"
                                >
                                    <motion.div 
                                        className="widget-saisie-group"
                                        variants={slideInVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
                                    >
                                        <Label.Root className="widget-saisie-label" htmlFor="energy-select">Type d'énergie</Label.Root>
                                        {isLoading ? <SkeletonLoader type="select" /> : (
                                            <Select.Root value={selectedEnergy} onValueChange={(value: string) => setSelectedEnergy(value)}>
                                                <Select.Trigger 
                                                    id="energy-select" className="widget-saisie-select-trigger" aria-label="Type d'énergie"
                                                    style={{ borderColor: currentEnergyOption?.cssColorVar, background: currentEnergyOption ? `linear-gradient(to right, ${currentEnergyOption.styles.main}10, transparent)` : 'transparent', fontSize: fontSizes.input }}
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                        {currentEnergyOption ? (
                                                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}
                                                                className="widget-saisie-energy-icon" style={{ color: currentEnergyOption.cssColorVar }}
                                                            >
                                                                {currentEnergyOption.icon}
                                                            </motion.span>
                                                        ) : (
                                                            <span className="widget-saisie-energy-icon"><QuestionMarkCircledIcon /></span>
                                                        )}
                                                        <Select.Value placeholder="Sélectionner..." />
                                                    </span>
                                                    <Select.Icon><motion.div animate={{ rotate: [0, 180, 360], transition: { duration: 0.4 } }}><ChevronDownIcon /></motion.div></Select.Icon>
                                                </Select.Trigger>
                                                <Select.Portal>
                                                    <Select.Content className="widget-saisie-select-content" position="popper" sideOffset={5}>
                                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                                            <Select.ScrollUpButton className="widget-saisie-select-scroll-button"><ChevronUpIcon /></Select.ScrollUpButton>
                                                            <Select.Viewport className="widget-saisie-select-viewport">
                                                                <Select.Group>
                                                                    <Select.Label className="widget-saisie-select-label">Types d'énergie</Select.Label>
                                                                    <Separator.Root className="widget-saisie-separator" />
                                                                    {energyOptions.map((option, index) => (
                                                                        <motion.div key={option.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                                                                            <SelectItem value={option.key} option={option}>{option.label}</SelectItem>
                                                                        </motion.div>
                                                                    ))}
                                                                </Select.Group>
                                                            </Select.Viewport>
                                                            <Select.ScrollDownButton className="widget-saisie-select-scroll-button"><ChevronDownIcon /></Select.ScrollDownButton>
                                                        </motion.div>
                                                    </Select.Content>
                                                </Select.Portal>
                                            </Select.Root>
                                        )}
                                    </motion.div>

                                    {/* Tariff Type Selector - conditionally rendered based on energy selection */}
                                    {selectedEnergy && compatibleTariffs.length > 1 && (
                                        <motion.div 
                                            className="widget-saisie-group"
                                            variants={slideInVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }}
                                        >
                                            <Label.Root className="widget-saisie-label" htmlFor="tariff-select">Type de tarif</Label.Root>
                                            {isLoading ? <SkeletonLoader type="select" /> : (
                                                <Select.Root value={selectedTariffType} onValueChange={(value: string) => setSelectedTariffType(value)}>
                                                    <Select.Trigger 
                                                        id="tariff-select" className="widget-saisie-select-trigger" aria-label="Type de tarif"
                                                        style={{ borderColor: currentTariffOption?.color, background: currentTariffOption ? `linear-gradient(to right, ${currentTariffOption.color}10, transparent)` : 'transparent', fontSize: fontSizes.input }}
                                                    >
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                            {currentTariffOption ? (
                                                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}
                                                                    className="widget-saisie-tariff-icon" style={{ color: currentTariffOption.color }}
                                                                >
                                                                    {currentTariffOption.icon}
                                                                </motion.span>
                                                            ) : (
                                                                <span className="widget-saisie-tariff-icon">{createElement(Settings)}</span>
                                                            )}
                                                            <Select.Value placeholder="Sélectionner..." />
                                                        </span>
                                                        <Select.Icon><motion.div animate={{ rotate: [0, 180, 360], transition: { duration: 0.4 } }}><ChevronDownIcon /></motion.div></Select.Icon>
                                                    </Select.Trigger>
                                                    <Select.Portal>
                                                        <Select.Content className="widget-saisie-select-content" position="popper" sideOffset={5}>
                                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                                                <Select.ScrollUpButton className="widget-saisie-select-scroll-button"><ChevronUpIcon /></Select.ScrollUpButton>
                                                                <Select.Viewport className="widget-saisie-select-viewport">
                                                                    <Select.Group>
                                                                        <Select.Label className="widget-saisie-select-label">Types de tarif</Select.Label>
                                                                        <Separator.Root className="widget-saisie-separator" />
                                                                        {compatibleTariffs.map((option, index) => (
                                                                            <motion.div key={option.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                                                                                <TariffSelectItem value={option.key} option={option}>{option.label}</TariffSelectItem>
                                                                            </motion.div>
                                                                        ))}
                                                                    </Select.Group>
                                                                </Select.Viewport>
                                                                <Select.ScrollDownButton className="widget-saisie-select-scroll-button"><ChevronDownIcon /></Select.ScrollDownButton>
                                                            </motion.div>
                                                        </Select.Content>
                                                    </Select.Portal>
                                                </Select.Root>
                                            )}
                                        </motion.div>
                                    )}

                                    <motion.div 
                                        className="widget-saisie-group"
                                        variants={slideInVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
                                    >
                                        <Label.Root htmlFor={`${props.name}-price`} className="widget-saisie-label">Prix</Label.Root>
                                        {isLoading ? (
                                            <div style={{ display: 'flex', gap: '8px' }}><div style={{ flex: 1 }}><SkeletonLoader type="input" /></div><div style={{ width: '90px' }}><SkeletonLoader type="select" /></div></div>
                                        ) : (
                                            <div className="widget-saisie-price-unit-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <motion.div className="widget-saisie-price-input-wrapper" style={{ position: 'relative', transition: 'all 0.2s ease', flex: 1 }}
                                                    whileHover={{ boxShadow: currentEnergyOption ? `0 0 8px ${currentEnergyOption.styles.main}40` : 'none' }}
                                                >
                                                    <input id={`${props.name}-price`} className="widget-saisie-price-input" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                                                        placeholder="Entrez le prix" disabled={!isPriceEditable}
                                                        style={{ ...priceInputStyle, background: currentEnergyOption ? `linear-gradient(to right, ${currentEnergyOption.styles.main}20, transparent)` : 'transparent', fontSize: fontSizes.input }}
                                                    />
                                                    {currentEnergyOption && (
                                                        <motion.div className="widget-saisie-energy-indicator" style={{ position: 'absolute', left: '0', top: '0', width: '4px', height: '100%', background: currentEnergyOption.styles.main, borderRadius: '4px 0 0 4px' }}
                                                            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.3 }}
                                                        />
                                                    )}
                                                </motion.div>
                                                <Select.Root value={selectedUnit} onValueChange={(value: string) => setSelectedUnit(value)} disabled={!isUnitEditable}>
                                                    <Select.Trigger id="unit-select" className="widget-saisie-unit-select-trigger" aria-label="Unité"
                                                        style={{ minWidth: '90px', borderColor: currentEnergyOption?.cssColorVar, transition: 'all 0.2s ease', backgroundColor: 'transparent', padding: '8px 12px', borderRadius: '4px', fontSize: fontSizes.input, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px', border: `1px solid ${currentEnergyOption?.cssColorVar || 'var(--border-color)'}`, background: currentEnergyOption ? `linear-gradient(to right, ${currentEnergyOption.styles.main}20, transparent)` : 'transparent' }}
                                                    >
                                                        <Select.Value placeholder="Unité" />
                                                        <Select.Icon><ChevronDownIcon /></Select.Icon>
                                                    </Select.Trigger>
                                                    <Select.Portal>
                                                        <Select.Content className="widget-saisie-select-content" position="popper" sideOffset={5}>
                                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                                                <Select.ScrollUpButton className="widget-saisie-select-scroll-button"><ChevronUpIcon /></Select.ScrollUpButton>
                                                                <Select.Viewport className="widget-saisie-select-viewport">
                                                                    <Select.Group>
                                                                        <Select.Label className="widget-saisie-select-label">Unités</Select.Label>
                                                                        <Separator.Root className="widget-saisie-separator" />
                                                                        {compatibleUnits.map((option, index) => (
                                                                            <motion.div key={option.key} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ backgroundColor: 'var(--hover-bg-color, rgba(0,0,0,0.03))' }}>
                                                                                <UnitSelectItem value={option.key} option={option}>{option.label}</UnitSelectItem>
                                                                            </motion.div>
                                                                        ))}
                                                                    </Select.Group>
                                                                </Select.Viewport>
                                                                <Select.ScrollDownButton className="widget-saisie-select-scroll-button"><ChevronDownIcon /></Select.ScrollDownButton>
                                                            </motion.div>
                                                        </Select.Content>
                                                    </Select.Portal>
                                                </Select.Root>
                                            </div>
                                        )}
                                    </motion.div>

                                    <motion.div 
                                        className="widget-saisie-group"
                                        variants={slideInVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}
                                    >
                                        <Label.Root className="widget-saisie-label" htmlFor="date-range-trigger">Période de validité</Label.Root>
                                        {isLoading ? <SkeletonLoader type="input" /> : (
                                            <React.Fragment>
                                                <Popover.Root open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                                    <Popover.Trigger asChild>
                                                        <motion.button
                                                            id="date-range-trigger"
                                                            className="widget-saisie-date-trigger"
                                                            aria-label="Sélectionner la période"
                                                            disabled={!isStartDateEditable || !isEndDateEditable}
                                                            style={{
                                                                width: '100%',
                                                                textAlign: 'left',
                                                                padding: '8px 12px',
                                                                border: `1px solid ${currentEnergyOption?.styles.main || 'var(--border-color)'}`,
                                                                borderRadius: '4px',
                                                                fontSize: fontSizes.input,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                background: currentEnergyOption ? `linear-gradient(to right, ${currentEnergyOption.styles.main}10, transparent)` : 'transparent'
                                                            }}
                                                            whileHover={{ boxShadow: currentEnergyOption ? `0 0 8px ${currentEnergyOption.styles.main}40` : 'none' }}
                                                        >
                                                            <span>{displayDateRange}</span>
                                                            <CalendarIcon />
                                                        </motion.button>
                                                    </Popover.Trigger>
                                                    <Popover.Portal>
                                                        <Popover.Content 
                                                            className="widget-saisie-popover-content date-popover-content" 
                                                            sideOffset={5}
                                                            style={{ zIndex: 100 }}
                                                            // Remove unused parameter 'e' 
                                                            onInteractOutside={() => { 
                                                                // console.log('Interact outside main picker');
                                                            }}
                                                        >
                                                            <DateRangePicker
                                                                onChange={handleDateRangeChange}
                                                                showSelectionPreview={true}
                                                                moveRangeOnFirstSelection={false}
                                                                months={1}
                                                                ranges={dateRange}
                                                                direction="horizontal"
                                                                locale={fr}
                                                                rangeColors={[currentEnergyOption?.styles.main || '#3d91ff']}
                                                                disabled={!isStartDateEditable || !isEndDateEditable}
                                                                staticRanges={staticRanges}
                                                                inputRanges={[]}
                                                                disabledDay={isDateDisabled}
                                                            />
                                                            {/* Add Validation Button Area */}
                                                            <div className="widget-saisie-popover-actions">
                                                                <button 
                                                                    className="widget-saisie-button primary-button validation-button"
                                                                    onClick={() => setDatePickerOpen(false)} // Close popover on click
                                                                >
                                                                    Valider
                                                                </button>
                                                            </div>
                                                            <Popover.Close className="widget-saisie-popover-close" aria-label="Close">
                                                                <Cross2Icon />
                                                            </Popover.Close>
                                                            <Popover.Arrow className="widget-saisie-popover-arrow" />
                                                        </Popover.Content>
                                                    </Popover.Portal>
                                                </Popover.Root>
                                                {dateOverlapWarning && (
                                                    <motion.div
                                                        className="widget-saisie-overlap-warning"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px', color: 'orange', fontSize: 'var(--font-size-small)' }}
                                                    >
                                                        <AlertTriangle size={14} />
                                                        <span>{dateOverlapWarning}</span>
                                                    </motion.div>
                                                )}
                                            </React.Fragment>
                                        )}
                                    </motion.div>

                                    <motion.div 
                                        className="widget-saisie-group"
                                        variants={slideInVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}
                                    >
                                        {isLoading ? <SkeletonLoader type="button" /> : (
                                            <motion.button
                                                className="widget-saisie-button" onClick={handleSave} disabled={!canSave}
                                                style={{ backgroundColor: currentEnergyOption ? currentEnergyOption.styles.main : primaryColor, color: '#ffffff', opacity: !canSave ? 0.5 : 1, border: `2px solid ${currentEnergyOption ? currentEnergyOption.styles.main : primaryColor}`, fontWeight: 'bold', fontSize: fontSizes.button }}
                                                whileHover={canSave ? { scale: 1.02, boxShadow: currentEnergyOption ? `0 0 8px ${currentEnergyOption.styles.main}50` : `0 0 8px ${primaryColor}50` } : {}}
                                                whileTap={canSave ? { scale: 0.98 } : {}} transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                                Enregistrer le prix
                                            </motion.button>
                                        )}
                                    </motion.div>
                                </motion.div>
                            </Tabs.Content>

                            <Tabs.Content className="widget-saisie-tabs-content" value="historique">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="widget-saisie-history-content"
                                >
                                    {historyDataSource && historyDataSource.status === ValueStatus.Available && historyDataSource.items ? (
                                        historyDataSource.items.length === 0 ? (
                                            <div className="widget-saisie-no-data"><p>Aucun historique disponible.</p></div>
                                        ) : (
                                            <div className="widget-saisie-table-container">
                                                <table className="widget-saisie-table" style={{ fontSize: fontSizes.table }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Énergie</th>
                                                            <th>Tarif</th>
                                                            <th>Prix</th>
                                                            <th>Période</th>
                                                            <th>Durée</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {processedHistoryItems.length === 0 ? (
                                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Aucun historique disponible.</td></tr>
                                                        ) : (
                                                            processedHistoryItems.map(item => (
                                                                <tr key={item.id}>
                                                                    <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <span 
                                                                                className="widget-saisie-energy-dot" 
                                                                                style={{ 
                                                                                    width: '10px', 
                                                                                    height: '10px', 
                                                                                    backgroundColor: item.energyColor, 
                                                                                    borderRadius: '50%',
                                                                                    display: 'inline-block' 
                                                                                }}
                                                                            ></span>
                                                                            {item.energyLabel}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <span 
                                                                                className="widget-saisie-tariff-icon" 
                                                                                style={{ 
                                                                                    color: item.tariffColor,
                                                                                    display: 'flex',
                                                                                    alignItems: 'center'
                                                                                }}
                                                                            >
                                                                                {item.tariffIcon}
                                                                            </span>
                                                                            {item.tariffLabel}
                                                                        </div>
                                                                    </td>
                                                                    <td>{item.price}</td>
                                                                    <td>{item.period}</td>
                                                                    <td>{item.duration}</td>
                                                                    <td>
                                                                        {(() => { // Wrap in IIFE to define constants
                                                                            const isDeleteActionExecutable = props.onDeleteAction && props.onDeleteAction.get(item.originalObjectItem).canExecute;
                                                                            return (
                                                                                <div className="widget-saisie-action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                                                    {/* Info Button */}
                                                                                    <Tooltip.Root>
                                                                                        <Tooltip.Trigger asChild>
                                                                                            <button className="widget-saisie-icon-button info-button" onClick={() => handleOpenInfoDialog(item)} aria-label="Voir détails">
                                                                                                <Info size={16} />
                                                                                            </button>
                                                                                        </Tooltip.Trigger>
                                                                                        <Tooltip.Portal>
                                                                                            <Tooltip.Content className="widget-saisie-tooltip-content" sideOffset={5}>Voir Détails<Tooltip.Arrow className="widget-saisie-tooltip-arrow" /></Tooltip.Content>
                                                                                        </Tooltip.Portal>
                                                                                    </Tooltip.Root>
                                                                                    {/* Delete Button */}
                                                                                    <Tooltip.Root>
                                                                                        <Tooltip.Trigger asChild>
                                                                                            <button className="widget-saisie-icon-button delete-button" onClick={() => handleDeleteClick(item)} aria-label="Supprimer" disabled={!isDeleteActionExecutable}>
                                                                                                <Trash2 size={16} />
                                                                                            </button>
                                                                                        </Tooltip.Trigger>
                                                                                        <Tooltip.Portal>
                                                                                            <Tooltip.Content className="widget-saisie-tooltip-content" sideOffset={5}>Supprimer<Tooltip.Arrow className="widget-saisie-tooltip-arrow" /></Tooltip.Content>
                                                                                        </Tooltip.Portal>
                                                                                    </Tooltip.Root>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    ) : (
                                         <div className="widget-saisie-no-data"><p>Chargement de l'historique...</p></div>
                                    )}
                                </motion.div>
                            </Tabs.Content>
                        </Tabs.Root>
                        
                        <AnimatePresence>
                            {toastOpen && (
                                <Toast.Root className={`widget-saisie-toast ${toastType === 'success' ? 'toast-success' : toastType === 'error' ? 'toast-error' : 'toast-info'}`} open={toastOpen} onOpenChange={setToastOpen} asChild>
                                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                                        <Toast.Title className="widget-saisie-toast-title">{toastType === 'success' ? 'Succès' : toastType === 'error' ? 'Erreur' : 'Info'}</Toast.Title>
                                        <Toast.Description className="widget-saisie-toast-description">{toastMessage}</Toast.Description>
                                        <Toast.Action className="widget-saisie-toast-action" altText="Fermer" asChild>
                                            <motion.button className="widget-saisie-toast-close" onClick={() => setToastOpen(false)} whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                                                <Cross2Icon />
                                            </motion.button>
                                        </Toast.Action>
                                    </motion.div>
                                </Toast.Root>
                            )}
                        </AnimatePresence>
                        <Toast.Viewport className="widget-saisie-toast-viewport" />

                        <Dialog.Portal>
                            <Dialog.Overlay className="widget-saisie-dialog-overlay" />
                            <Dialog.Content className="widget-saisie-dialog-content" asChild>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Dialog.Title className="widget-saisie-dialog-title">
                                        Détails du prix - {selectedHistoryItem?.energyLabel}
                                    </Dialog.Title>
                                    
                                    <div className="widget-saisie-dialog-section">
                                        <h3 className="widget-saisie-dialog-section-title">Informations sur le prix</h3>
                                        <div className="widget-saisie-dialog-grid">
                                            <div className="widget-saisie-dialog-item">
                                                <span className="widget-saisie-dialog-label">Type d'énergie:</span> 
                                                <span>{selectedHistoryItem?.energy}</span>
                                            </div>
                                            <div className="widget-saisie-dialog-item">
                                                <span className="widget-saisie-dialog-label">Type de tarif:</span> 
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ color: selectedHistoryItem?.tariffColor }}>
                                                        {selectedHistoryItem?.tariffIcon}
                                                    </span>
                                                    {selectedHistoryItem?.tariffLabel}
                                                </span>
                                            </div>
                                             <div className="widget-saisie-dialog-item">
                                                <span className="widget-saisie-dialog-label">Date de début:</span> 
                                                <span>{selectedHistoryItem?.formattedStartDate}</span>
                                            </div>
                                             <div className="widget-saisie-dialog-item">
                                                <span className="widget-saisie-dialog-label">Prix:</span> 
                                                <span>{selectedHistoryItem?.originalPrice} €</span>
                                            </div>
                                            <div className="widget-saisie-dialog-item">
                                                <span className="widget-saisie-dialog-label">Date de fin:</span> 
                                                <span>{selectedHistoryItem?.formattedEndDate}</span>
                                            </div>
                                             <div className="widget-saisie-dialog-item">
                                                <span className="widget-saisie-dialog-label">Devise:</span> 
                                                <span>{selectedHistoryItem?.unitLabel}</span>
                                            </div>
                                             <div className="widget-saisie-dialog-item">
                                                <span className="widget-saisie-dialog-label">Durée:</span> 
                                                <span>{selectedHistoryItem?.duration}</span>
                                            </div>
                                            <div className="widget-saisie-dialog-item">
                                                <span className="widget-saisie-dialog-label">Date de création:</span>
                                                <span>{selectedHistoryItem?.formattedCreationDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Dialog.Close asChild>
                                        <button className="widget-saisie-dialog-close" aria-label="Fermer">
                                            <X size={20} />
                                        </button>
                                    </Dialog.Close>
                                 </motion.div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </motion.div>
                </Dialog.Root>
                
                {/* --- Delete Confirmation Dialog --- */}
                <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="widget-saisie-dialog-overlay" />
                        <Dialog.Content className="widget-saisie-dialog-content widget-saisie-delete-dialog-content" asChild>
                             <motion.div /* Animation */ >
                                <Dialog.Title className="widget-saisie-dialog-title delete-title">
                                    <AlertTriangle size={20} style={{ marginRight: '10px', color: 'var(--error-color)' }} />
                                    Confirmer la suppression
                                </Dialog.Title>
                                <Dialog.Description className="widget-saisie-dialog-description" style={{ margin: '15px 0' }}>
                                    Êtes-vous sûr de vouloir supprimer définitivement le prix pour 
                                    <strong style={{ color: itemToDelete?.energyColor }}> {itemToDelete?.energyLabel} </strong> 
                                    pour la période du {itemToDelete?.formattedStartDate} au {itemToDelete?.formattedEndDate} ?
                                    Cette action est irréversible.
                                </Dialog.Description>
                                
                                <div className="widget-saisie-dialog-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                    <Dialog.Close asChild>
                                        <button className="widget-saisie-button secondary-button">Annuler</button>
                                    </Dialog.Close>
                                    <button 
                                        className="widget-saisie-button delete-confirm-button" 
                                        onClick={() => {
                                            // Call onDeleteAction
                                            if (itemToDelete && props.onDeleteAction && props.onDeleteAction.get(itemToDelete.originalObjectItem).canExecute) {
                                                props.onDeleteAction.get(itemToDelete.originalObjectItem).execute();
                                                showToast("Élément supprimé avec succès.", "success"); // Optimistic feedback
                                            } else {
                                                 showToast("Impossible de supprimer l'élément.", "error");
                                            }
                                            setDeleteConfirmOpen(false); // Close dialog
                                        }}
                                    >
                                        Confirmer la suppression {/* Text moved inside button */}
                                    </button>
                                </div>
                                 
                                <Dialog.Close asChild>
                                    <button className="widget-saisie-dialog-close" aria-label="Fermer">
                                        <X size={18} />
                                    </button>
                                </Dialog.Close>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
                 
            </Toast.Provider>
        </Tooltip.Provider>
    );
}
