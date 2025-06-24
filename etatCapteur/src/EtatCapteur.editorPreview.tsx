import { ReactElement, createElement } from "react";
import { EtatCapteurPreviewProps } from "../typings/EtatCapteurProps";
import "./ui/EtatCapteur.css";

export function preview({
    tableTitle = "Aperçu des capteurs",
    showIcons = true,
    showLastUpdate = true
}: EtatCapteurPreviewProps): ReactElement {
    const previewData = [
        { name: "Capteur 1", status: true, lastUpdate: "01/12/2023 14:30:00" },
        { name: "Capteur 2", status: false, lastUpdate: "01/12/2023 14:25:00" }
    ];

    return (
        <div className="etat-capteur-widget">
            {tableTitle && <h2 className="table-title">{tableTitle}</h2>}
            <table className="sensor-table">
                <thead>
                    <tr>
                        <th>Nom du capteur</th>
                        <th>État</th>
                        {showLastUpdate && <th>Dernière mise à jour</th>}
                    </tr>
                </thead>
                <tbody>
                    {previewData.map((sensor, index) => (
                        <tr key={`preview-sensor-${index}`}>
                            <td>{sensor.name}</td>
                            <td
                                className={`status ${sensor.status ? "connected" : "disconnected"}`}
                                title={
                                    sensor.status
                                        ? "Capteur connecté et fonctionnel"
                                        : "Capteur déconnecté ou en erreur"
                                }
                            >
                                {showIcons && <span className="status-icon">{sensor.status ? "✓" : "✗"}</span>}
                                <span className="status-text">{sensor.status ? "Connecté" : "Déconnecté"}</span>
                            </td>
                            {showLastUpdate && (
                                <td className="last-update" title="Date de dernière mise à jour">
                                    {sensor.lastUpdate}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/EtatCapteur.css");
}
