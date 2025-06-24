import { ReactElement, createElement, useState, useEffect } from "react";
import { Calendar, Info } from "lucide-react";

export interface DateRangeSelectorProps {
    onClickDay: () => void;
    onClickWeek: () => void;
    onClickMonth: () => void;
    activeButton: 'day' | 'week' | 'month';
    dateDebut?: Date;
    dateFin?: Date;
}

const formatDate = (date?: Date): string => {
    if (!date) return 'N/A';
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getPreviousPeriodDates = (period: 'day' | 'week' | 'month', dateDebut?: Date, dateFin?: Date): { debut: string, fin: string } => {
    if (!dateDebut || !dateFin) return { debut: 'N/A', fin: 'N/A' };

    const previousDebut = new Date(dateDebut);
    const previousFin = new Date(dateFin);

    switch (period) {
        case 'day':
            previousDebut.setDate(previousDebut.getDate() - 1);
            previousFin.setDate(previousFin.getDate() - 1);
            break;
        case 'week':
            previousDebut.setDate(previousDebut.getDate() - 7);
            previousFin.setDate(previousFin.getDate() - 7);
            break;
        case 'month':
            previousDebut.setMonth(previousDebut.getMonth() - 1);
            previousFin.setMonth(previousFin.getMonth() - 1);
            break;
    }

    return {
        debut: formatDate(previousDebut),
        fin: formatDate(previousFin)
    };
};

export const DateRangeSelector = ({ 
    onClickDay, 
    onClickWeek, 
    onClickMonth, 
    activeButton,
    dateDebut,
    dateFin
}: DateRangeSelectorProps): ReactElement => {
    const previousPeriod = getPreviousPeriodDates(activeButton, dateDebut, dateFin);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const toggleTooltip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsTooltipVisible(!isTooltipVisible);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.tooltip-container')) {
                setIsTooltipVisible(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className="card-base">
            <div className="flex items-center gap-6">
                <div className="icon-container bg-[#18213e]/10">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-[#18213e]" />
                </div>
                <div className="flex items-center gap-2">
                    <h3 className="title-medium">Sélection de la période</h3>
                    <div className={`relative group flex items-center tooltip-container ${isTooltipVisible ? 'show' : ''}`}>
                        <Info 
                            className="w-8 h-8 text-[#18213e] cursor-pointer hover:text-[#18213e]/80 transition-colors duration-200" 
                            onClick={toggleTooltip}
                        />
                        <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[500px] bg-white rounded-xl shadow-xl transition-all duration-300 z-50 p-8 border border-gray-100 ${
                            isTooltipVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}>
                            <div className="space-y-6">
                                <div>
                                    <div className="font-semibold text-[#18213e] text-2xl mb-4 flex items-center">
                                        <div className="w-4 h-4 rounded-full bg-[#18213e] mr-3"></div>
                                        Période actuelle
                                    </div>
                                    <div className="text-gray-600 pl-8 space-y-3">
                                        <div className="flex justify-between text-xl">
                                            <span className="text-gray-500 font-medium">Début :</span>
                                            <span className="font-semibold">{formatDate(dateDebut)}</span>
                                        </div>
                                        <div className="flex justify-between text-xl">
                                            <span className="text-gray-500 font-medium">Fin :</span>
                                            <span className="font-semibold">{formatDate(dateFin)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold text-[#18213e] text-2xl mb-4 flex items-center">
                                        <div className="w-4 h-4 rounded-full bg-[#18213e] mr-3"></div>
                                        Période précédente
                                    </div>
                                    <div className="text-gray-600 pl-8 space-y-3">
                                        <div className="flex justify-between text-xl">
                                            <span className="text-gray-500 font-medium">Début :</span>
                                            <span className="font-semibold">{previousPeriod.debut}</span>
                                        </div>
                                        <div className="flex justify-between text-xl">
                                            <span className="text-gray-500 font-medium">Fin :</span>
                                            <span className="font-semibold">{previousPeriod.fin}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-4 mt-6">
                <button
                    onClick={onClickDay}
                    className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
                        activeButton === 'day'
                            ? 'bg-[#18213e] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Aujourd'hui
                </button>
                <button
                    onClick={onClickWeek}
                    className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
                        activeButton === 'week'
                            ? 'bg-[#18213e] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Cette semaine
                </button>
                <button
                    onClick={onClickMonth}
                    className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
                        activeButton === 'month'
                            ? 'bg-[#18213e] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Ce mois-ci
                </button>
            </div>
        </div>
    );
};