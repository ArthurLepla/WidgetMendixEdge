/* eslint-disable prettier/prettier */
/* eslint-disable linebreak-style */
import * as React from "react";
import { createElement } from "react";
import styles from "./time-picker.module.css";

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({ value, onChange, className, disabled = false }: TimePickerProps) {
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
    <div className={`${styles.container} ${className || ''}`}>
      <select
        value={hours}
        onChange={handleHourChange}
        disabled={disabled}
        className={styles.select}
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>
            {i.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
      <span className={styles.separator}>:</span>
      <select
        value={minutes}
        onChange={handleMinuteChange}
        disabled={disabled}
        className={styles.select}
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