import { ReactElement, createElement, useMemo, useState } from "react";
import { EtatCapteurContainerProps } from "../typings/EtatCapteurProps";
import { ObjectItem, ListAttributeValue } from "mendix";
import "./ui/EtatCapteur.css";

interface SensorData {
    name: string | null;
    isConnected: boolean;
    lastUpdate: string | null;
}

const RefreshIcon = (): ReactElement => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 3a5 5 0 0 0-5 5H1l3.5 3.5L8 8H6a2 2 0 1 1 2 2v2a4 4 0 1 0-4-4H2a6 6 0 1 1 6 6v-2a4 4 0 0 0 0-8z"/>
    </svg>
);

const formatDateString = (dateStr: string | null): string => {
    if (!dateStr) return "Non disponible";
    
    try {
        // Vérifier si la date est déjà au format DD/MM/YYYY HH:mm ou DD/MM/YYYY HH:mm:ss
        const dateRegexWithSeconds = /^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})$/;
        const dateRegexWithoutSeconds = /^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2})$/;

        if (dateRegexWithSeconds.test(dateStr)) {
            return dateStr; // Déjà au bon format avec secondes
        }

        if (dateRegexWithoutSeconds.test(dateStr)) {
            // Ajouter les secondes (00) si elles sont manquantes
            return `${dateStr}:00`;
        }

        // Si la date est dans un autre format, essayer de la parser
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return dateStr; // Si le parsing échoue, retourner la chaîne originale
        }

        // Formater la date au format français avec secondes
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(date).replace(/\//g, "/");
    } catch (error) {
        console.error("EtatCapteur: Erreur lors du formatage de la date", error);
        return dateStr;
    }
};

export function EtatCapteur({
    sensorDataSource,
    nameAttribute,
    statusAttribute,
    lastUpdateAttribute,
    tableTitle,
    showIcons = true,
    showLastUpdate = true,
    refreshAction
}: EtatCapteurContainerProps): ReactElement {
    const [isLoading, setIsLoading] = useState(false);

    if (!sensorDataSource || !nameAttribute || !statusAttribute) {
        console.warn("EtatCapteur: Configuration incomplète du widget");
        return <div className="etat-capteur-widget">Configuration incorrecte du widget</div>;
    }

    const sensors = sensorDataSource.items ?? [];

    const handleRefresh = async (): Promise<void> => {
        if (refreshAction && refreshAction.canExecute && !isLoading) {
            setIsLoading(true);
            try {
                await refreshAction.execute();
            } catch (error) {
                console.error("EtatCapteur: Erreur lors de l'actualisation", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const getValue = useMemo(() => {
        return <T extends string>(item: ObjectItem, attribute: ListAttributeValue<T>): T | null => {
            if (!item || !attribute) {
                return null;
            }

            try {
                const attributeValue = attribute.get(item);
                return attributeValue?.value as T ?? null;
            } catch (error) {
                console.error("EtatCapteur: Erreur lors de la récupération de la valeur", error);
                return null;
            }
        };
    }, []);

    const isConnected = (status: string | null): boolean => {
        if (!status) return false;
        return status.toLowerCase() === 'true';
    };

    const getSensorData = useMemo(() => {
        return (sensor: ObjectItem): SensorData => {
            if (!sensor) {
                return {
                    name: null,
                    isConnected: false,
                    lastUpdate: null
                };
            }

            const status = getValue(sensor, statusAttribute);
            const lastUpdate = lastUpdateAttribute ? getValue(sensor, lastUpdateAttribute) : null;

            return {
                name: getValue(sensor, nameAttribute),
                isConnected: isConnected(status),
                lastUpdate: lastUpdate ? formatDateString(lastUpdate) : null
            };
        };
    }, [getValue, nameAttribute, statusAttribute, lastUpdateAttribute]);

    const renderSensorRow = useMemo(() => {
        return (sensor: ObjectItem, index: number): ReactElement => {
            const { name, isConnected: connected, lastUpdate } = getSensorData(sensor);
            const statusClass = connected ? "connected" : "disconnected";
            const statusIcon = connected ? "✓" : "✗";

            return (
                <tr key={`sensor-${index}`}>
                    <td>{name ?? "Sans nom"}</td>
                    <td
                        className={`status ${statusClass}`}
                        title={connected ? "Capteur connecté et fonctionnel" : "Capteur déconnecté ou en erreur"}
                    >
                        {showIcons && <span className="status-icon">{statusIcon}</span>}
                        <span className="status-text">
                            {connected ? "Connecté" : "Déconnecté"}
                        </span>
                    </td>
                    {showLastUpdate && lastUpdateAttribute && (
                        <td className="last-update" title="Date de dernière mise à jour">
                            {lastUpdate ?? "Non disponible"}
                        </td>
                    )}
                </tr>
            );
        };
    }, [getSensorData, showIcons, showLastUpdate, lastUpdateAttribute]);

    const renderRefreshButton = (): ReactElement | null => {
        if (!refreshAction?.canExecute) return null;
        
        return (
            <button onClick={handleRefresh} className="refresh-button" disabled={isLoading}>
                <RefreshIcon />
                <span>{isLoading ? "Actualisation..." : "Actualiser"}</span>
            </button>
        );
    };

    if (sensors.length === 0) {
        return (
            <div className="etat-capteur-widget">
                <div className="no-data">Aucun capteur disponible</div>
                {renderRefreshButton()}
            </div>
        );
    }

    return (
        <div className="etat-capteur-widget">
            <div className="widget-header">
                {tableTitle && <h2 className="table-title">{tableTitle}</h2>}
                {renderRefreshButton()}
            </div>
            {isLoading && <div className="loading-overlay"><div className="loading-spinner"></div></div>}
            <table className="sensor-table">
                <thead>
                    <tr>
                        <th>Nom du capteur</th>
                        <th>État</th>
                        {showLastUpdate && lastUpdateAttribute && <th>Dernière mise à jour</th>}
                    </tr>
                </thead>
                <tbody>
                    {sensors.map(renderSensorRow)}
                </tbody>
            </table>
        </div>
    );
}
