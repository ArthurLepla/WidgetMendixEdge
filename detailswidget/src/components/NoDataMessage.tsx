import { createElement } from "react";
import { EnergyConfig } from "../utils/energy";
import { AlertCircle } from "lucide-react";

interface NoDataMessageProps {
    energyConfig: EnergyConfig;
    startDate?: Date;
    endDate?: Date;
}

export const NoDataMessage = ({ energyConfig, startDate, endDate }: NoDataMessageProps): React.ReactElement => {
    const formatDate = (date?: Date): string => {
        if (!date) {
            return "Non définie";
        }
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    };

    return (
        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-min-h-[200px] tw-max-h-[400px] tw-w-full tw-py-8">
            <AlertCircle size={64} className={`tw-mb-4 ${energyConfig.color}`} strokeWidth={1.5} />
            <div className="tw-text-center tw-max-w-md">
                <h3 className="tw-text-lg tw-font-semibold tw-mb-3 tw-text-[#18213e]">Aucune donnée disponible</h3>
                <p className="tw-text-sm tw-text-[#18213e] tw-opacity-70 tw-mb-4">
                    Aucune donnée de consommation {energyConfig.label.toLowerCase()} n&apos;a été trouvée pour la période sélectionnée.
                </p>
                {(startDate || endDate) && (
                    <div className="tw-text-xs tw-text-[#18213e] tw-opacity-60 tw-bg-gray-50 tw-p-3 tw-rounded-lg">
                        <div className="tw-mb-1">
                            <span className="tw-font-medium">Début :</span> {formatDate(startDate)}
                        </div>
                        <div>
                            <span className="tw-font-medium">Fin :</span> {formatDate(endDate)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
