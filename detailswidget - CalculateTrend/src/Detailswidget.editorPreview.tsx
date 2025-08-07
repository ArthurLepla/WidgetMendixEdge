import { createElement } from "react";
import { DetailswidgetPreviewProps } from "../typings/DetailswidgetProps";
import { energyConfigs } from "./utils/energy";
import { Zap, Factory, Gauge } from "lucide-react";
import "./components/IPECard.css";
import { IPECard } from "./components/IPECard";
import Big from "big.js";

export function preview(props: DetailswidgetPreviewProps): JSX.Element {
    if (props.viewMode === "ipe") {
        return (
            <div className="tw-w-full tw-h-full tw-flex tw-flex-col tw-gap-6">
                <div className="tw-w-full tw-rounded-xl tw-shadow-xl tw-p-8">
                    <div className="tw-flex tw-flex-row tw-gap-8 tw-h-full">
                        <IPECard
                            title={props.card1Title}
                            value={new Big(0)}
                            color="#000000"
                            type="consumption"
                        />
                        <IPECard
                            title={props.card2Title}
                            value={new Big(0)}
                            color="#000000"
                            type="production"
                        />
                        <IPECard
                            title={props.card3Title}
                            value={new Big(0)}
                            color="#000000"
                            type="ipe"
                        />
                    </div>
                </div>
                <div className="tw-w-full tw-bg-white tw-rounded-xl tw-shadow-xl tw-p-8">
                    <div className="tw-w-full tw-h-96 tw-bg-gray-100 tw-rounded-xl tw-flex tw-items-center tw-justify-center">
                        <span className="tw-text-gray-500">Evolution de l'indice de performance énergétique</span>
                    </div>
                </div>
            </div>
        );
    }

    const energyConfig = energyConfigs[props.energyType];
    const previewCards = [
        { title: props.card1Title || "Card 1", type: "consumption" },
        { title: props.card2Title || "Card 2", type: "production" },
        { title: props.card3Title || "Card 3", type: "ipe" }
    ];

    return (
        <div className="tw-w-full tw-h-full tw-flex tw-flex-col tw-gap-6">
            <div className="tw-w-full tw-bg-white tw-rounded-xl tw-shadow-xl tw-p-8">
                <div className="tw-flex tw-flex-row tw-gap-8">
                    {previewCards.map((card, index) => (
                        <div key={index} className="ipe-card">
                            <div className="ipe-card-content">
                                <div className="ipe-card-header">
                                    <div className="ipe-card-icon-container">
                                        {card.type === "consumption" && <Zap size={56} strokeWidth={2} />}
                                        {card.type === "production" && <Factory size={56} strokeWidth={2} />}
                                        {card.type === "ipe" && <Gauge size={56} strokeWidth={2} />}
                                    </div>
                                    <div className="ipe-card-title">
                                        {card.title}
                                    </div>
                                </div>
                                <div className="ipe-card-value-container">
                                    <div className="ipe-card-value" style={{ color: energyConfig.color }}>
                                        {(123.45 * (index + 1)).toFixed(2)}
                                        <span className="ipe-card-unit">
                                            {energyConfig.unit}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="tw-bg-gray-100 tw-rounded-lg tw-h-[400px] tw-flex tw-items-center tw-justify-center">
                <span className="tw-text-gray-600">Graphique linéaire</span>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/Detailswidget.css");
}
