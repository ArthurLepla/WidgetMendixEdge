import { ReactElement, createElement } from "react";
import { AssetTableauPreviewProps } from "../typings/AssetTableauProps";

export function preview({ mode }: AssetTableauPreviewProps): ReactElement {
    return (
        <div className="asset-tableau-preview">
            <div className="preview-header">
                <span className={`mode-badge mode-${mode}`}>{mode?.toUpperCase()}</span>
                <span className="widget-info">Asset Tableau Widget</span>
            </div>
            <div className="preview-hierarchy">
                <div className="level-item">
                    📁 Root Asset
                    <div className="level-children">
                        <div className="level-item">📁 Child Asset</div>
                        <div className="level-item">📁 Child Asset</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/AssetTableau.css");
}
