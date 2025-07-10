/* eslint-disable prettier/prettier */
/* eslint-disable linebreak-style */
import * as React from "react";
import { createElement } from "react";
import { cn } from "../../lib/utils";

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const hours = value.getHours();
  const minutes = value.getMinutes();

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(value);
    newDate.setHours(parseInt(e.target.value, 10));
    onChange(newDate);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(value);
    newDate.setMinutes(parseInt(e.target.value, 10));
    onChange(newDate);
  };

  return (
    <div className={cn("tw-flex tw-items-center tw-gap-2 tw-w-full", className)}>
      <select
        value={hours}
        onChange={handleHourChange}
        className="tw-flex-1 tw-h-14 tw-rounded-md tw-border tw-border-input tw-bg-transparent tw-px-3 tw-py-1 tw-text-base focus:tw-ring-2 focus:tw-ring-primary/20 tw-outline-none"
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>
            {i.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
      <span className="tw-text-base tw-font-medium tw-text-muted-foreground">:</span>
      <select
        value={minutes}
        onChange={handleMinuteChange}
        className="tw-flex-1 tw-h-14 tw-rounded-md tw-border tw-border-input tw-bg-transparent tw-px-3 tw-py-1 tw-text-base focus:tw-ring-2 focus:tw-ring-primary/20 tw-outline-none"
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>
            {i.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  );
} 