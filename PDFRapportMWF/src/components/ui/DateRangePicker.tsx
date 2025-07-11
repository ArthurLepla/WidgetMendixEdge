import React, { createElement } from "react";
import { DatePicker, ConfigProvider } from "antd";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import dayjs, { Dayjs } from "dayjs";
import frFR from 'antd/locale/fr_FR';
import 'dayjs/locale/fr';
import { DateRangePickerProps } from "../../types/widget";
import { palette } from "../../constants/config";
import styles from "./DateRangePicker.module.css";

// Configuration de dayjs en français
dayjs.locale('fr');

const { RangePicker } = DatePicker;

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
    value, 
    onChange, 
    disabled = false
}) => {
    // Configuration du thème Ant Design pour les DatePickers
    const datePickerTheme = {
        components: {
            DatePicker: {
                colorPrimary: palette.primary,
                colorBorder: palette.gray[300],
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "'Barlow', sans-serif",
                controlHeight: 48,
                paddingSM: 12,
                paddingXS: 16
            }
        }
    };

    // Conversion des dates pour Ant Design (dayjs)
    const dayjsValue: [Dayjs | null, Dayjs | null] = [
        value[0] ? dayjs(value[0]) : null,
        value[1] ? dayjs(value[1]) : null
    ];

    // Gestion du changement de dates
    const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (!dates) {
            onChange([null, null]);
            return;
        }
        
        const [start, end] = dates;
        onChange([
            start ? start.toDate() : null,
            end ? end.toDate() : null
        ]);
    };

    // Raccourcis de dates avec animation
    const handleQuickSelect = (days: number) => {
        const end = dayjs();
        const start = end.subtract(days, 'day');
        onChange([start.toDate(), end.toDate()]);
    };

    return (
        <ConfigProvider theme={datePickerTheme} locale={frFR}>
            <motion.div 
                className={styles.dateRangeContainer}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Raccourcis rapides - animation simple */}
                <div className={styles.quickSelectGrid}>
                    {[
                        { label: '7 derniers jours', days: 7 },
                        { label: '30 derniers jours', days: 30 },
                        { label: 'Ce mois', days: dayjs().date() },
                        { label: '3 mois', days: 90 }
                    ].map((period) => (
                        <motion.button
                            key={period.label}
                            onClick={() => handleQuickSelect(period.days)}
                            disabled={disabled}
                            className={styles.quickSelectButton}
                            whileHover={!disabled ? { scale: 1.02 } : {}}
                            whileTap={!disabled ? { scale: 0.98 } : {}}
                            transition={{ duration: 0.15 }}
                        >
                            {period.label}
                        </motion.button>
                    ))}
                </div>

                {/* DatePicker Range d'Ant Design - animation discrète */}
                <div className={styles.datePickersGrid}>
                    <div className={styles.datePickerField}>
                        <label className={styles.datePickerLabel}>
                            Période de rapport
                        </label>
                        
                        <RangePicker
                            value={dayjsValue}
                            onChange={handleDateChange}
                            disabled={disabled}
                            placeholder={['Date de début', 'Date de fin']}
                            format="DD/MM/YYYY"
                            allowClear
                            maxDate={dayjs()}
                            separator="→"
                            showTime={false}
                        />
                    </div>
                </div>

                {/* Texte d'aide - simple et professionnel */}
                <div className={styles.helpText}>
                    <Lightbulb size={14} />
                    <span>
                        Utilisez les raccourcis de période ou sélectionnez manuellement (maximum 365 jours)
                    </span>
                </div>
            </motion.div>
        </ConfigProvider>
    );
}; 