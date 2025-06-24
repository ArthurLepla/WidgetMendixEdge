import { ReactElement, createElement } from "react";
import { CompareDataPreviewProps } from "../typings/CompareDataProps";
import { MachineCard } from "./components/MachineCard";
import { LineChart } from "./components/LineChart";
import { MachineTable } from "./components/MachineTable";
import { PieChart } from "./components/PieChart";
import { Big } from "big.js";
import { EnergyType, ViewMode } from "./utils/types";

export function preview({ energyType = "electricity", viewMode = "energetic" }: CompareDataPreviewProps): ReactElement {
    // Données de prévisualisation pour les graphiques
    const previewMachines = [
        {
            name: "Machine de production A",
            currentValue: new Big(150.5),
            maxValue: new Big(200.8),
            minValue: new Big(50.2),
            sumValue: new Big(725.3)
        },
        {
            name: "Machine de production B",
            currentValue: new Big(80.7),
            maxValue: new Big(120.4),
            minValue: new Big(30.9),
            sumValue: new Big(475.6)
        },
        {
            name: "Machine de production C",
            currentValue: new Big(95.3),
            maxValue: new Big(145.7),
            minValue: new Big(45.2),
            sumValue: new Big(590.4)
        },
        {
            name: "Machine de production D",
            currentValue: new Big(120.8),
            maxValue: new Big(180.2),
            minValue: new Big(60.5),
            sumValue: new Big(710.3)
        }
    ];

    // Création de données temporelles plus détaillées
    const generateTimePoints = () => {
        const points = [];
        const baseDate = new Date(2024, 0, 1, 8, 0); // 1er janvier 2024, 8h00
        
        for (let i = 0; i < 12; i++) {
            points.push(new Date(baseDate.getTime() + i * 30 * 60000)); // Ajoute 30 minutes à chaque fois
        }
        return points;
    };

    const timePoints = generateTimePoints();

    const previewChartData = previewMachines.map(machine => {
        // Génération de valeurs qui suivent une tendance réaliste
        const values = timePoints.map((_, index) => {
            const baseValue = machine.currentValue.toNumber();
            const variation = Math.sin(index / 2) * (machine.maxValue.minus(machine.minValue).div(new Big(4))).toNumber();
            return new Big(baseValue + variation);
        });

        return {
            name: machine.name,
            timestamps: timePoints,
            values: values.map(v => new Big(v))
        };
    });

    return (
        <div className="mx-auto p-4">
            <div className="grid-responsive-4 mb-4">
                {previewMachines.map((machine, index) => (
                    <MachineCard
                        key={index}
                        name={machine.name}
                        currentValue={machine.currentValue}
                        maxValue={machine.maxValue}
                        minValue={machine.minValue}
                        sumValue={machine.sumValue}
                        type={energyType as EnergyType}
                        viewMode={viewMode as ViewMode}
                    />
                ))}
            </div>
            <div className="flex gap-6 mb-4">
                <div className="w-2/3">
                    <LineChart 
                        data={previewChartData} 
                        type={energyType as EnergyType} 
                        viewMode={viewMode as ViewMode}
                    />
                </div>
                <div className="w-1/3">
                    <PieChart 
                        machines={previewMachines} 
                        type={energyType as EnergyType} 
                        viewMode={viewMode as ViewMode}
                    />
                </div>
            </div>
            <div className="mt-4">
                <MachineTable 
                    machines={previewMachines} 
                    type={energyType as EnergyType} 
                    viewMode={viewMode as ViewMode}
                />
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/CompareData.css");
}
