/* eslint-disable prettier/prettier */
import * as React from "react";
import { createElement } from "react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { TimePicker } from "./time-picker";
import * as Popover from "@radix-ui/react-popover";
//import { ReactElement } from "react";
import { EditableValue, ActionValue, ValueStatus } from "mendix";

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
        console.log("handlePresetSelect called with preset:", preset.label);
        const range = preset.getValue();
        console.log("Preset range:", range);
        setTempDate(range);
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
        <div className={cn("tw-grid tw-gap-2 tw-font-barlow", className)}>
            <Popover.Root open={open} onOpenChange={handlePopoverChange}>
                <Popover.Trigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            "tw-h-14 tw-justify-start tw-text-left tw-font-normal tw-bg-white",
                            !date && "tw-text-muted-foreground hover:tw-border-input",
                            "tw-shadow-sm"
                        )}
                    >
                        <CalendarIcon className="tw-mr-4 tw-h-6 tw-w-6 tw-text-muted-foreground" />
                        {date?.from ? (
                            date.to ? (
                                <React.Fragment>
                                    {format(date.from, "dd MMM, yyyy HH:mm", { locale: fr })} -{" "}
                                    {format(date.to, "dd MMM, yyyy HH:mm", { locale: fr })}
                                </React.Fragment>
                            ) : (
                                format(date.from, "dd MMM, yyyy HH:mm", { locale: fr })
                            )
                        ) : (
                            <span className="tw-text-lg">Sélectionner une plage de dates</span>
                        )}
                    </Button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content 
                        className="tw-w-auto tw-p-0 tw-bg-popover tw-rounded-lg tw-border tw-shadow-lg tw-flex tw-z-50" 
                        align="end"
                        side="bottom"
                        sideOffset={5}
                        alignOffset={0}
                        avoidCollisions={true}
                    >
                        <div className="tw-flex tw-flex-col tw-gap-3 tw-p-5 tw-border-r tw-min-w-[200px]">
                            <div className="tw-text-lg tw-font-medium tw-mb-2 tw-font-barlow">Périodes prédéfinies</div>
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="ghost"
                                    className="tw-justify-start tw-font-barlow"
                                    onClick={() => handlePresetSelect(preset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                        <div className="tw-flex tw-flex-col tw-p-4">
                            <div className="tw-p-5 tw-border-b">
                                <div className="tw-text-xl tw-font-medium tw-mb-3">Sélectionner une plage de dates</div>
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <CalendarIcon className="tw-h-6 tw-w-6 tw-text-muted-foreground" />
                                    <span className="tw-text-lg">
                                        {tempDate?.from && tempDate?.to ? (
                                            <React.Fragment>
                                                {format(tempDate.from, "dd MMM, yyyy HH:mm", { locale: fr })} -{" "}
                                                {format(tempDate.to, "dd MMM, yyyy HH:mm", { locale: fr })}
                                            </React.Fragment>
                                        ) : (
                                            "Sélectionner les dates..."
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="tw-p-5">
                                <div className="tw-flex tw-gap-8">
                                    <Calendar
                                        className="tw-font-barlow"
                                        initialFocus
                                        mode="range"
                                        defaultMonth={tempDate?.from}
                                        selected={tempDate}
                                        onSelect={handleSelect}
                                        numberOfMonths={2}
                                    />
                                </div>

                                {tempDate?.from && (
                                    <div className="tw-mt-5 tw-space-y-4">
                                        <div className="tw-flex tw-items-center tw-gap-5">
                                            <div className="tw-flex-1">
                                                <div className="tw-text-base tw-font-medium tw-mb-2">Début:</div>
                                                <TimePicker value={tempDate.from} onChange={handleFromTimeChange} />
                                            </div>
                                            {tempDate.to && (
                                                <div className="tw-flex-1">
                                                    <div className="tw-text-base tw-font-medium tw-mb-2">Fin:</div>
                                                    <TimePicker value={tempDate.to} onChange={handleToTimeChange} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="tw-flex tw-items-center tw-justify-end tw-gap-3 tw-border-t tw-p-5">
                                <Button
                                    variant="outline"
                                    className="tw-text-lg"
                                    onClick={handleCancel}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    className="tw-text-lg"
                                    onClick={handleApply}
                                >
                                    Appliquer
                                </Button>
                            </div>
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
} 