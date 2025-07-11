/* eslint-disable prettier/prettier */
import * as React from "react";
import { createElement, Fragment } from "react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { TimePicker } from "./time-picker";
import * as Popover from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "framer-motion";
import { EditableValue, ActionValue, ValueStatus } from "mendix";
import styles from "./date-range-picker.module.css";

interface DatePreset {
  label: string;
  getValue: () => DateRange;
}

const presets: DatePreset[] = [
  {
    label: "Aujourd'hui",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date())
    })
  },
  {
    label: "Cette semaine",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 })
    })
  },
  {
    label: "Ce mois-ci",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: "Mois dernier",
    getValue: () => {
      const now = new Date();
      const firstDayLastMonth = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
      const lastDayLastMonth = endOfMonth(firstDayLastMonth);
      return {
        from: firstDayLastMonth,
        to: lastDayLastMonth
      };
    }
  }
];

// Sous-composant pour la colonne des préréglages
const PresetsColumn: React.FC<{ onSelect: (preset: DatePreset) => void }> = ({ onSelect }) => (
    <div className={styles.presets}>
        <div className={styles.presetsTitle}>Périodes</div>
        {presets.map((preset) => (
            <motion.button
                key={preset.label}
                className={styles.presetButton}
                onClick={() => onSelect(preset)}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
            >
                {preset.label}
            </motion.button>
        ))}
    </div>
);

// Sous-composant pour la vue calendrier et les sélecteurs de temps
const CalendarView: React.FC<{
    selected: DateRange | undefined;
    onSelect: (range: DateRange | undefined) => void;
    onFromTimeChange: (date: Date) => void;
    onToTimeChange: (date: Date) => void;
}> = ({ selected, onSelect, onFromTimeChange, onToTimeChange }) => (
    <div className={styles.calendarContainer}>
        <Calendar
            initialFocus
            mode="range"
            defaultMonth={selected?.from}
            selected={selected}
            onSelect={onSelect}
            numberOfMonths={2}
        />
        <div className={styles.timePickerContainer}>
            <div>
                <div className={styles.timePickerLabel}>Début</div>
                <TimePicker 
                    value={selected?.from || new Date()} 
                    onChange={onFromTimeChange} 
                    disabled={!selected?.from}
                />
            </div>
            <div>
                <div className={styles.timePickerLabel}>Fin</div>
                <TimePicker 
                    value={selected?.to || new Date()} 
                    onChange={onToTimeChange} 
                    disabled={!selected?.to}
                />
            </div>
        </div>
    </div>
);

// Sous-composant pour le pied de page avec les boutons d'action
const ActionFooter: React.FC<{ onCancel: () => void; onApply: () => void; }> = ({ onCancel, onApply }) => (
    <div className={styles.footer}>
        <Button variant="outline" data-variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={onApply} data-variant="primary">Appliquer</Button>
    </div>
);

export interface DateRangePickerProps {
    className?: string;
    startDateAttribute?: EditableValue<Date>;
    endDateAttribute?: EditableValue<Date>;
    onDateChange?: ActionValue;
}

export function DateRangePicker({
    className,
    startDateAttribute,
    endDateAttribute,
    onDateChange,
    onChange,
}: DateRangePickerProps & {
    onChange?: (range: DateRange | undefined) => void;
}): JSX.Element {
    console.log("DateRangePicker props:", {
        startDateAttribute,
        endDateAttribute,
        onDateChange,
        hasOnChange: !!onChange
    });

    const [date, setDate] = React.useState<DateRange | undefined>(() => {
        console.log("Initializing state with:", {
            startDateStatus: startDateAttribute?.status,
            startDateValue: startDateAttribute?.value,
            endDateStatus: endDateAttribute?.status,
            endDateValue: endDateAttribute?.value
        });
        
        if (startDateAttribute?.status === ValueStatus.Available || endDateAttribute?.status === ValueStatus.Available) {
            return {
                from: startDateAttribute?.value ? new Date(startDateAttribute.value) : undefined,
                to: endDateAttribute?.value ? new Date(endDateAttribute.value) : undefined
            };
        }
        return undefined;
    });
    const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);
    const [open, setOpen] = React.useState(false);

    // Synchroniser les changements des attributs Mendix
    React.useEffect(() => {
        console.log("useEffect triggered with:", {
            startDateStatus: startDateAttribute?.status,
            startDateValue: startDateAttribute?.value,
            endDateStatus: endDateAttribute?.status,
            endDateValue: endDateAttribute?.value
        });

        if (startDateAttribute?.status === ValueStatus.Available || endDateAttribute?.status === ValueStatus.Available) {
            const newRange = {
                from: startDateAttribute?.value ? new Date(startDateAttribute.value) : undefined,
                to: endDateAttribute?.value ? new Date(endDateAttribute.value) : undefined
            };
            setDate(newRange);
            if (!open) {
                setTempDate(newRange);
            }
        }
    }, [startDateAttribute?.status, startDateAttribute?.value, endDateAttribute?.status, endDateAttribute?.value, open]);

    const handleSelect = (range: DateRange | undefined) => {
        console.log("handleSelect called with range:", range);
        
        if (range?.to && (!tempDate?.to || range.to !== tempDate.to)) {
            console.log("Setting end date to 23:59");
            const endDate = new Date(range.to);
            endDate.setHours(23);
            endDate.setMinutes(59);
            const newTempDate = {
                from: range.from,
                to: endDate
            };
            console.log("New tempDate:", newTempDate);
            setTempDate(newTempDate);
        } else {
            console.log("Setting tempDate directly:", range);
            setTempDate(range);
        }
    };

    const handleFromTimeChange = (newDate: Date) => {
        console.log("handleFromTimeChange called with:", newDate);
        if (!tempDate?.from) return;
        const newFrom = new Date(tempDate.from);
        newFrom.setHours(newDate.getHours());
        newFrom.setMinutes(newDate.getMinutes());
        console.log("New from date:", newFrom);
        setTempDate({ ...tempDate, from: newFrom });
    };

    const handleToTimeChange = (newDate: Date) => {
        console.log("handleToTimeChange called with:", newDate);
        if (!tempDate?.to) return;
        const newTo = new Date(tempDate.to);
        newTo.setHours(newDate.getHours());
        newTo.setMinutes(newDate.getMinutes());
        console.log("New to date:", newTo);
        setTempDate({ ...tempDate, to: newTo });
    };

    const handlePresetSelect = (preset: DatePreset) => {
        const range = preset.getValue();
        // Appliquer directement la plage et mettre à jour Mendix
        setDate(range);

        if (startDateAttribute?.status === ValueStatus.Available && range.from) {
            startDateAttribute.setValue(range.from);
        }
        if (endDateAttribute?.status === ValueStatus.Available && range.to) {
            endDateAttribute.setValue(range.to);
        }

        if (onDateChange?.canExecute) {
            onDateChange.execute();
        }

        // Fermer le popover
        setOpen(false);
    };

    const handleApply = () => {
        console.log("handleApply called");
        console.log("tempDate:", tempDate);

        if (!tempDate?.from || !tempDate?.to) {
            console.log("Missing dates, returning early");
            return;
        }

        try {
            const startDateTime = new Date(tempDate.from);
            const endDateTime = new Date(tempDate.to);
            
            console.log("Start DateTime:", startDateTime);
            console.log("End DateTime:", endDateTime);

            // Mise à jour des attributs Mendix
            if (startDateAttribute?.status === ValueStatus.Available) {
                console.log("Setting start date attribute");
                startDateAttribute.setValue(startDateTime);
            }
            if (endDateAttribute?.status === ValueStatus.Available) {
                console.log("Setting end date attribute");
                endDateAttribute.setValue(endDateTime);
            }

            setDate(tempDate);

            // Déclencher l'action onChange si elle est définie et peut être exécutée
            if (onDateChange && onDateChange.canExecute) {
                console.log("Executing onDateChange action");
                onDateChange.execute();
            }

            setOpen(false);
        } catch (error) {
            console.error("Erreur lors de la mise à jour des dates:", error);
        }
    };

    const handlePopoverChange = (isOpen: boolean) => {
        setOpen(isOpen);
    };

    const handleCancel = () => {
        setTempDate(date);
        setOpen(false);
    };

    return (
        <div className={`${styles.dateRangePicker} ${className || ''}`}>
            <Popover.Root open={open} onOpenChange={handlePopoverChange}>
                <Popover.Trigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={`${styles.triggerButton} ${!date ? styles.triggerButtonMuted : ''}`}
                    >
                        <CalendarIcon className={styles.triggerIcon} />
                        <span className={styles.triggerText}>
                            {date?.from && date.to
                                ? `${format(date.from, "dd MMM yyyy, HH:mm", { locale: fr })} - ${format(date.to, "dd MMM yyyy, HH:mm", { locale: fr })}`
                                : "Sélectionner une plage de dates"}
                        </span>
                    </Button>
                </Popover.Trigger>
                <AnimatePresence>
                    {open && (
                        <Popover.Portal forceMount>
                            <Popover.Content
                                asChild
                                className={styles.popoverContent}
                                align="end"
                                side="bottom"
                                sideOffset={8}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ type: "spring", damping: 30, stiffness: 350 }}
                                >
                                    <div className={styles.container}>
                                        <PresetsColumn onSelect={handlePresetSelect} />
                                        <div className={styles.mainContent}>
                                            <div className={styles.header}>
                                                <CalendarIcon className={styles.headerIcon} size={24} /> {/* Increased icon size */}
                                                <span className={styles.headerText}>
                                                    {tempDate?.from && tempDate?.to ? (
                                                        <Fragment>
                                                            {format(tempDate.from, "dd MMM yyyy, HH:mm", { locale: fr })} -{" "}
                                                            {format(tempDate.to, "dd MMM yyyy, HH:mm", { locale: fr })}
                                                        </Fragment>
                                                    ) : (
                                                        "Sélectionnez une date de début et de fin"
                                                    )}
                                                </span>
                                            </div>
                                            <CalendarView 
                                                selected={tempDate}
                                                onSelect={handleSelect}
                                                onFromTimeChange={handleFromTimeChange}
                                                onToTimeChange={handleToTimeChange}
                                            />
                                            <ActionFooter onCancel={handleCancel} onApply={handleApply} />
                                        </div>
                                    </div>
                                </motion.div>
                            </Popover.Content>
                        </Popover.Portal>
                    )}
                </AnimatePresence>
            </Popover.Root>
        </div>
    );
} 