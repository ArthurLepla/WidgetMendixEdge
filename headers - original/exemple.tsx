import { ReactElement, createElement, useState, useEffect, CSSProperties } from "react";
import { ImprovedCalendarDvContainerProps } from "../typings/ImprovedCalendarDvProps";
import { ValueStatus } from "mendix";
import "./ui/ImprovedCalendarDv.css";

function toNullableDate(value: Date | undefined | null): Date | null {
    return value ?? null;
}

export function ImprovedCalendarDv({ startDateAttribute, endDateAttribute, onChange }: ImprovedCalendarDvContainerProps): ReactElement {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState('Select Date Range');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
    const [selectedTimes, setSelectedTimes] = useState<{ start: string; end: string }>({ start: "00:00", end: "23:59" });

    useEffect(() => {
        if (startDateAttribute.status === ValueStatus.Available) {
            const startDate = toNullableDate(startDateAttribute.value);
            setSelectedDates(prev => ({ ...prev, start: startDate }));
            if (startDate) {
                setSelectedTimes(prev => ({ ...prev, start: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}` }));
            }
        }
        if (endDateAttribute.status === ValueStatus.Available) {
            const endDate = toNullableDate(endDateAttribute.value);
            setSelectedDates(prev => ({ ...prev, end: endDate }));
            if (endDate) {
                setSelectedTimes(prev => ({ ...prev, end: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}` }));
            }
        }
    }, [startDateAttribute.value, endDateAttribute.value]);

    const styles: { [key: string]: CSSProperties } = {
        container: {
            fontFamily: 'Barlow, sans-serif',
            position: 'relative',
            width: '100%',
            margin: '0 auto',
        },
        selector: {
            padding: '21.6px 16px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            transition: 'all 0.3s ease',
            borderTopRightRadius: '10px',   // Ajoute un arrondi au coin supérieur droit
            borderBottomRightRadius: '10px',    // Ajoute un arrondi au coin supérieur gauche
        },
        selectorText: {
            fontSize: '15px',
            color: '#333',
        },
        arrow: {
            marginLeft: '10px',
            color: '#007AFF',
        },
        popup: {
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: '0',
            right: '0',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            width: '100%',
            padding: '20px',
        },
        content: {
            display: 'flex',
            flexDirection: 'row',
        },
        predefinedRanges: {
            width: '180px',
            marginRight: '20px',
        },
        rangesTitle: {
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#333',
        },
        rangeButton: {
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '15px',
            margin: '4px 0',
            border: 'none',
            backgroundColor: '#F2F2F7',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            fontSize: '14px',
            color: '#007AFF',
        },
        calendar: {
            flex: 1,
        },
        calendarHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
        },
        currentMonth: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
        },
        navButton: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            color: '#007AFF',
        },
        calendarDays: {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
        },
        dayHeader: {
            textAlign: 'center',
            fontWeight: 'bold',
            padding: '8px',
            fontSize: '14px',
            color: '#666',
        },
        calendarDay: {
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
        },
        selectedDay: {
            backgroundColor: '#007AFF',
            color: '#ffffff',
        },
        inRangeDay: {
            backgroundColor: '#E5F1FF',
            color: '#007AFF',
        },
        todayDay: {
            border: '2px solid #007AFF',
        },
        timeSelectors: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px',
        },
        timeLabel: {
            fontSize: '14px',
            marginRight: '8px',
            color: '#666',
        },
        timeInput: {
            padding: '4px',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
            fontSize: '12px',
            width: '80px',
        },
        applyButton: {
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#007AFF',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            width: '100%',
        },
    };

    const predefinedRanges = [
        { label: "Aujourd'hui", getValue: () => {
            const today = new Date();
            return { start: today, end: today, startTime: "00:00", endTime: "23:59" };
        }},
        { label: "Cette semaine", getValue: () => {
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            return { start: startOfWeek, end: endOfWeek, startTime: "00:00", endTime: "23:59" };
        }},
        { label: "Ce mois-ci", getValue: () => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return { start: startOfMonth, end: endOfMonth, startTime: "00:00", endTime: "23:59" };
        }},
        { label: "Dernières 24 heures", getValue: () => {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            return { start: yesterday, end: now, startTime: now.getHours() + ":" + now.getMinutes(), endTime: now.getHours() + ":" + now.getMinutes() };
        }},
    ];

    const handlePredefinedRange = (range: { getValue: () => { start: Date; end: Date; startTime: string; endTime: string } }) => {
        const { start, end, startTime, endTime } = range.getValue();
        setSelectedDates({ start, end });
        setSelectedTimes({ start: startTime, end: endTime });
        updateSelectedRange(start, end, startTime, endTime);
    };

    const updateSelectedRange = (start: Date | null, end: Date | null, startTime: string, endTime: string) => {
        if (start && end) {
            setSelectedRange(`${start.toLocaleDateString()} ${startTime} - ${end.toLocaleDateString()} ${endTime}`);
        } else if (start) {
            setSelectedRange(`${start.toLocaleDateString()} ${startTime} - Select end date`);
        } else {
            setSelectedRange('Select Date Range');
        }
    };

    const handleDateClick = (date: Date) => {
        setSelectedDates(prev => {
            if (!prev.start || (prev.start && prev.end)) {
                return { start: date, end: null };
            } else {
                const newEnd = date;
                const newStart = prev.start;
                if (newEnd < newStart) {
                    return { start: newEnd, end: newStart };
                } else {
                    return { start: newStart, end: newEnd };
                }
            }
        });
    };

    const handleTimeChange = (type: 'start' | 'end', value: string) => {
        setSelectedTimes(prev => ({ ...prev, [type]: value }));
    };

    const applySelection = () => {
        if (selectedDates.start && selectedDates.end) {
            const startDateTime = new Date(selectedDates.start);
            const [startHours, startMinutes] = selectedTimes.start.split(':');
            startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

            const endDateTime = new Date(selectedDates.end);
            const [endHours, endMinutes] = selectedTimes.end.split(':');
            endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

            if (startDateAttribute.status === ValueStatus.Available) {
                startDateAttribute.setValue(startDateTime);
            }
            if (endDateAttribute.status === ValueStatus.Available) {
                endDateAttribute.setValue(endDateTime);
            }
            updateSelectedRange(startDateTime, endDateTime, selectedTimes.start, selectedTimes.end);
            setIsOpen(false);

            // Déclencher l'action onChange si elle est définie
            if (onChange && onChange.canExecute) {
                onChange.execute();
            }
        }
    };

    const renderCalendar = () => {
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} style={styles.calendarDay}></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
            const isSelected = (selectedDates.start && date.toDateString() === selectedDates.start.toDateString()) ||
                               (selectedDates.end && date.toDateString() === selectedDates.end.toDateString());
            const isInRange = selectedDates.start && selectedDates.end && 
                              date > selectedDates.start && date < selectedDates.end;
            const isToday = date.toDateString() === new Date().toDateString();
            
            const dayStyle = {
                ...styles.calendarDay,
                ...(isSelected ? styles.selectedDay : {}),
                ...(isInRange ? styles.inRangeDay : {}),
                ...(isToday ? styles.todayDay : {})
            };
            
            days.push(
                <div 
                    key={i}
                    style={dayStyle}
                    onClick={() => handleDateClick(date)}
                >
                    {i}
                </div>
            );
        }
        return days;
    };

    return (
        <div style={styles.container}>
            <div style={styles.selector} onClick={() => setIsOpen(!isOpen)}>
                <span style={styles.selectorText}>{selectedRange}</span>
                <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                <div style={styles.popup}>
                    <div style={styles.content}>
                        <div style={styles.predefinedRanges}>
                            <h3 style={styles.rangesTitle}>Plages prédéfinies</h3>
                            {predefinedRanges.map((range, index) => (
                                <button 
                                    key={index}
                                    style={styles.rangeButton}
                                    onClick={() => handlePredefinedRange(range)}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>

                        <div style={styles.calendar}>
                            <div style={styles.calendarHeader}>
                                <button style={styles.navButton} onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>{'<'}</button>
                                <span style={styles.currentMonth}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                <button style={styles.navButton} onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>{'>'}</button>
                            </div>
                            <div style={styles.calendarDays}>
                                {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map(day => (
                                    <div key={day} style={styles.dayHeader}>{day}</div>
                                ))}
                                {renderCalendar()}
                            </div>
                            <div style={styles.timeSelectors}>
                                <div>
                                    <label style={styles.timeLabel}>Début:</label>
                                    <input
                                        type="time"
                                        value={selectedTimes.start}
                                        onChange={(e) => handleTimeChange('start', e.target.value)}
                                        style={styles.timeInput}
                                    />
                                </div>
                                <div>
                                    <label style={styles.timeLabel}>Fin:</label>
                                    <input
                                        type="time"
                                        value={selectedTimes.end}
                                        onChange={(e) => handleTimeChange('end', e.target.value)}
                                        style={styles.timeInput}
                                    />
                                </div>
                            </div>
                            <button style={styles.applyButton} onClick={applySelection}>Appliquer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}