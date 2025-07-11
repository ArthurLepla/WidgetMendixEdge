import * as React from "react";
import { createElement, Fragment } from "react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isAfter, isBefore, getDaysInMonth, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import { EditableValue, ActionValue, ValueStatus } from "mendix";
import "./DateRangePickerV2.css";
import * as Popover from "@radix-ui/react-popover";

// Types et interfaces
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

export interface DateRangePickerV2Props {
  className?: string;
  startDateAttribute?: EditableValue<Date>;
  endDateAttribute?: EditableValue<Date>;
  onDateChange?: ActionValue;
  placeholder?: string;
}

// Composant Calendar personnalisé
interface CustomCalendarProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  month: Date;
  onMonthChange: (date: Date) => void;
  hidePrev?: boolean;
  hideNext?: boolean;
  disablePrev?: boolean;
  disableNext?: boolean;
  hoveredDate?: Date | null;
  onDayMouseEnter?: (date: Date) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ 
  selected, 
  onSelect, 
  month, 
  onMonthChange, 
  hidePrev = false, 
  hideNext = false, 
  disablePrev = false, 
  disableNext = false,
  hoveredDate,
  onDayMouseEnter
}) => {
  const daysInMonth = getDaysInMonth(month);
  const startDay = getDay(startOfMonth(month)); // 0 = Sunday, 1 = Monday
  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  
  const handleDayClick = (day: number) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    if (!selected || !selected.from || selected.to) {
      onSelect({ from: date, to: undefined });
    } else {
      onSelect({ from: selected.from, to: date });
    }
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(month);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    onMonthChange(newMonth);
  };
  
  const rangeFrom = selected?.from ? startOfDay(selected.from) : null;
  const rangeTo = selected?.to ? startOfDay(selected.to) : (hoveredDate ? startOfDay(hoveredDate) : null);

  return (
    <div className="drp-calendar">
      <div className="drp-calendar-header">
        <button
          type="button"
          className="drp-calendar-nav"
          onClick={() => navigateMonth('prev')}
          disabled={disablePrev || hidePrev}
          aria-label="Mois précédent"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="drp-calendar-title">
          {format(month, 'MMMM yyyy', { locale: fr })}
        </h3>
        <button
          type="button"
          className="drp-calendar-nav"
          onClick={() => navigateMonth('next')}
          disabled={disableNext || hideNext}
          aria-label="Mois suivant"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="drp-calendar-grid">
        {weekDays.map((day) => (
          <div key={day} className="drp-calendar-weekday">
            {day}
          </div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="drp-calendar-day-empty" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayDate = new Date(month.getFullYear(), month.getMonth(), day);
          
          let isStart = false;
          let isEnd = false;
          let inRange = false;
          
          if (rangeFrom && rangeTo) {
            const start = isBefore(rangeFrom, rangeTo) ? rangeFrom : rangeTo;
            const end = isAfter(rangeTo, rangeFrom) ? rangeTo : rangeFrom;
            
            isStart = isSameDay(dayDate, start);
            isEnd = isSameDay(dayDate, end);
            inRange = isAfter(dayDate, start) && isBefore(dayDate, end);
          } else if (rangeFrom) {
            isStart = isSameDay(dayDate, rangeFrom);
          }
          
          const isSelected = isStart || isEnd;
          
          const classNames = ['drp-calendar-day'];
          if (isSelected) classNames.push('drp-calendar-day--selected');
          if (inRange) classNames.push('drp-calendar-day--in-range');
          if (isStart) classNames.push('drp-calendar-day--range-start');
          if (isEnd) classNames.push('drp-calendar-day--range-end');

          return (
            <motion.button
              key={day}
              className={classNames.join(' ')}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => onDayMouseEnter?.(dayDate)}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
              type="button"
            >
              {day}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// Composant TimePicker avec input et boutons +/-
const TimePicker: React.FC<{
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  const hours = value.getHours();
  const minutes = value.getMinutes();
  
  // État local pour gérer la saisie en cours
  const [minuteInputValue, setMinuteInputValue] = React.useState(minutes.toString().padStart(2, "0"));
  
  // Synchroniser l'input avec la valeur réelle
  React.useEffect(() => {
    setMinuteInputValue(minutes.toString().padStart(2, "0"));
  }, [minutes]);
  
  const adjustHours = (delta: number) => {
    if (disabled) return;
    const newDate = new Date(value);
    let newHours = hours + delta;
    if (newHours < 0) newHours = 23;
    if (newHours > 23) newHours = 0;
    newDate.setHours(newHours);
    onChange(newDate);
  };
  
  const adjustMinutes = (delta: number) => {
    if (disabled) return;
    const newDate = new Date(value);
    let newMinutes = minutes + delta;
    if (newMinutes < 0) newMinutes = 55;
    if (newMinutes > 55) newMinutes = 0;
    // Round to nearest 5 minutes
    newMinutes = Math.round(newMinutes / 5) * 5;
    newDate.setMinutes(newMinutes);
    onChange(newDate);
  };
  
  const handleHourInput = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (disabled) return;
    const hourValue = parseInt(e.target.value, 10);
    if (!isNaN(hourValue) && hourValue >= 0 && hourValue <= 23) {
      const newDate = new Date(value);
      newDate.setHours(hourValue);
      onChange(newDate);
    }
  };
  
  const handleMinuteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    // Permettre la saisie libre, validation et arrondi sur blur
    setMinuteInputValue(e.target.value);
  };
   
  const handleMinuteBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    let minuteValue = parseInt(e.target.value, 10);
    if (isNaN(minuteValue) || minuteValue < 0) {
      minuteValue = 0;
    } else if (minuteValue > 59) {
      minuteValue = 55;
    } else {
      // Round to nearest 5 minutes only on blur
      minuteValue = Math.round(minuteValue / 5) * 5;
    }
    const newDate = new Date(value);
    newDate.setMinutes(minuteValue);
    onChange(newDate);
    // Synchroniser l'input avec la valeur arrondie
    setMinuteInputValue(minuteValue.toString().padStart(2, "0"));
  };
  
  const handleHourBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    let hourValue = parseInt(e.target.value, 10);
    if (isNaN(hourValue) || hourValue < 0) {
      hourValue = 0;
    } else if (hourValue > 23) {
      hourValue = 23;
    }
    const newDate = new Date(value);
    newDate.setHours(hourValue);
    onChange(newDate);
  };

  return (
    <div className={`drp-time-input ${disabled ? 'drp-time-input--disabled' : ''}`}>
      <Clock size={16} className="drp-time-input-icon" />
      
      {/* Hours input */}
      <div className="drp-input-group">
        <button 
          type="button" 
          className="drp-input-btn drp-input-btn--left"
          onClick={() => adjustHours(-1)}
          disabled={disabled}
        >
          −
        </button>
        <input
          type="number"
          min="0"
          max="23"
          value={hours.toString().padStart(2, "0")}
          onChange={handleHourInput}
          onBlur={handleHourBlur}
          disabled={disabled}
          className="drp-input-field"
        />
        <button 
          type="button" 
          className="drp-input-btn drp-input-btn--right"
          onClick={() => adjustHours(1)}
          disabled={disabled}
        >
          +
        </button>
      </div>
      
      <span className="drp-time-separator">:</span>
      
      {/* Minutes input */}
      <div className="drp-input-group">
        <button 
          type="button" 
          className="drp-input-btn drp-input-btn--left"
          onClick={() => adjustMinutes(-5)}
          disabled={disabled}
        >
          −
        </button>
        <input
          type="number"
          min="0"
          max="59"
          value={minuteInputValue}
          onChange={handleMinuteInput}
          onBlur={handleMinuteBlur}
          disabled={disabled}
          className="drp-input-field"
        />
        <button 
          type="button" 
          className="drp-input-btn drp-input-btn--right"
          onClick={() => adjustMinutes(5)}
          disabled={disabled}
        >
          +
        </button>
      </div>
    </div>
  );
};

// Composant principal
export function DateRangePickerV2({
  className,
  startDateAttribute,
  endDateAttribute,
  onDateChange,
  placeholder = "Sélectionner une plage de dates"
}: DateRangePickerV2Props): JSX.Element {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
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
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);
  const [leftMonth, setLeftMonth] = React.useState(new Date());
  const [rightMonth, setRightMonth] = React.useState(() => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return next;
  });
  
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  
  // Debug: Surveiller les changements d'état
  React.useEffect(() => {
    console.log('DateRangePickerV2: State changed - open:', open);
    
    if (open) {
      // Vérifier si l'élément est dans le DOM après un délai
      setTimeout(() => {
        const dropdownElement = document.querySelector('.drp-dropdown');
        console.log('DateRangePickerV2: Dropdown element found in DOM:', !!dropdownElement);
        if (dropdownElement) {
          console.log('DateRangePickerV2: Dropdown element styles:', window.getComputedStyle(dropdownElement));
          console.log('DateRangePickerV2: Dropdown element rect:', dropdownElement.getBoundingClientRect());
        }
      }, 100);
    }
  }, [open]);
  
  // Synchronisation avec Mendix
  React.useEffect(() => {
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
  
  // Radix Popover gère la fermeture quand on clique à l'extérieur, donc on supprime cet effet.

  const handleDayMouseEnter = (day: Date) => {
    if (tempDate?.from && !tempDate.to) {
      setHoveredDate(day);
    }
  };

  const handleDayMouseLeave = () => {
    setHoveredDate(null);
  };

  const handleSelect = (range: DateRange | undefined) => {
    setHoveredDate(null); // Clear hover on selection
    if (range?.to && (!tempDate?.to || range.to !== tempDate.to)) {
      const endDate = new Date(range.to);
      endDate.setHours(23);
      endDate.setMinutes(59);
      setTempDate({
        from: range.from,
        to: endDate
      });
    } else {
      setTempDate(range);
    }
  };
  
  const handleFromTimeChange = (newDate: Date) => {
    if (!tempDate?.from) return;
    const newFrom = new Date(tempDate.from);
    newFrom.setHours(newDate.getHours());
    newFrom.setMinutes(newDate.getMinutes());
    setTempDate({ ...tempDate, from: newFrom });
  };
  
  const handleToTimeChange = (newDate: Date) => {
    if (!tempDate?.to) return;
    const newTo = new Date(tempDate.to);
    newTo.setHours(newDate.getHours());
    newTo.setMinutes(newDate.getMinutes());
    setTempDate({ ...tempDate, to: newTo });
  };
  
  const handlePresetSelect = (preset: DatePreset) => {
    const range = preset.getValue();
    setDate(range);
    setTempDate(range);
    
    if (startDateAttribute?.status === ValueStatus.Available && range.from) {
      startDateAttribute.setValue(range.from);
    }
    if (endDateAttribute?.status === ValueStatus.Available && range.to) {
      endDateAttribute.setValue(range.to);
    }
    
    if (onDateChange?.canExecute) {
      onDateChange.execute();
    }
    
    setOpen(false);
  };
  
  const handleApply = () => {
    if (!tempDate?.from || !tempDate?.to) return;
    
    setDate(tempDate);
    
    if (startDateAttribute?.status === ValueStatus.Available) {
      startDateAttribute.setValue(tempDate.from);
    }
    if (endDateAttribute?.status === ValueStatus.Available) {
      endDateAttribute.setValue(tempDate.to);
    }
    
    if (onDateChange?.canExecute) {
      onDateChange.execute();
    }
    
    setOpen(false);
    setHoveredDate(null); // Clear hover on apply
  };
  
  const handleCancel = () => {
    setTempDate(date);
    setOpen(false);
    setHoveredDate(null); // Clear hover on cancel
  };
  
  const formatDisplayDate = () => {
    if (!date?.from || !date?.to) return placeholder;
    return `${format(date.from, "dd MMM yyyy, HH:mm", { locale: fr })} - ${format(date.to, "dd MMM yyyy, HH:mm", { locale: fr })}`;
  };
  
  const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();

  return (
    <div className={`drp-v2 ${className || ''}`}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <motion.button
            ref={triggerRef}
            className="drp-trigger"
            onClick={() => {
              console.log('DateRangePickerV2: Click triggered, current open state:', open);
              setOpen(!open);
            }}
            whileTap={{ scale: 0.995 }}
            type="button"
          >
            <CalendarIcon size={20} className="drp-trigger-icon" />
            <span className={`drp-trigger-text ${!date ? 'drp-trigger-text--placeholder' : ''}`}>
              {formatDisplayDate()}
            </span>
          </motion.button>
        </Popover.Trigger>
        <AnimatePresence>
          {open && (
            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={8}
                collisionPadding={16}
                className="drp-dropdown"
                style={{
                  zIndex: 10000,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="drp-container">
                    <div className="drp-sidebar">
                      <div className="drp-sidebar-title">Périodes rapides</div>
                      {presets.map((preset) => (
                        <motion.button
                          key={preset.label}
                          className="drp-preset"
                          onClick={() => handlePresetSelect(preset)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                        >
                          {preset.label}
                        </motion.button>
                      ))}
                    </div>
                    
                    <div className="drp-main">
                      <div className="drp-header">
                        <CalendarIcon size={20} className="drp-header-icon" />
                        <span className="drp-header-text">
                          {tempDate?.from && tempDate?.to ? (
                            <Fragment>
                              {format(tempDate.from, "dd MMM yyyy", { locale: fr })} -{" "}
                              {format(tempDate.to, "dd MMM yyyy", { locale: fr })}
                            </Fragment>
                          ) : (
                            "Sélectionnez vos dates"
                          )}
                        </span>
                      </div>
                      
                      <div className="drp-calendars" onMouseLeave={handleDayMouseLeave}>
                        <CustomCalendar
                          selected={tempDate}
                          onSelect={handleSelect}
                          month={leftMonth}
                          onMonthChange={setLeftMonth}
                          disableNext={monthIndex(leftMonth) >= monthIndex(rightMonth) - 1}
                          hoveredDate={hoveredDate}
                          onDayMouseEnter={handleDayMouseEnter}
                        />
                        <CustomCalendar
                          selected={tempDate}
                          onSelect={handleSelect}
                          month={rightMonth}
                          onMonthChange={setRightMonth}
                          disablePrev={monthIndex(rightMonth) <= monthIndex(leftMonth) + 1}
                          hoveredDate={hoveredDate}
                          onDayMouseEnter={handleDayMouseEnter}
                        />
                      </div>
                      
                      <div className="drp-time-section">
                        <div className="drp-time-group">
                          <label className="drp-time-label">Heure de début</label>
                          <TimePicker
                            value={tempDate?.from || new Date()}
                            onChange={handleFromTimeChange}
                            disabled={!tempDate?.from}
                          />
                        </div>
                        <div className="drp-time-group">
                          <label className="drp-time-label">Heure de fin</label>
                          <TimePicker
                            value={tempDate?.to || new Date()}
                            onChange={handleToTimeChange}
                            disabled={!tempDate?.to}
                          />
                        </div>
                      </div>
                      
                      <div className="drp-footer">
                        <button className="drp-button drp-button--secondary" onClick={handleCancel} type="button">
                          Annuler
                        </button>
                        <button className="drp-button drp-button--primary" onClick={handleApply} type="button">
                          Appliquer
                        </button>
                      </div>
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

export default DateRangePickerV2;