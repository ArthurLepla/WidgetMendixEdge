import { createElement, useEffect, useState, useMemo } from "react";
import { Big } from "big.js";
import { ValueStatus } from "mendix";
import { Inbox } from "lucide-react";
import { DetailswidgetContainerProps } from "../typings/DetailswidgetProps";
import { energyConfigs, getAdaptedEnergyConfig, BaseUnit } from "./utils/energy";
import { IPECard } from "./components/IPECard";
import { ChartContainer } from "./components/ChartContainer";

// Fonction pour générer des données simulées pour le mode dev
function generateSimulatedData(
    energyType: string,
    viewMode: string
): Array<{ timestamp: Date; value: Big; name: string }> {
    const now = new Date();
    const data: Array<{ timestamp: Date; value: Big; name: string }> = [];
    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        let baseValue = 0;
        let variance = 0;
        switch (energyType) {
            case "electricity":
                baseValue = 45;
                variance = 15;
                break;
            case "gas":
                baseValue = 20;
                variance = 8;
                break;
            case "water":
                baseValue = 120;
                variance = 30;
                break;
            case "air":
                baseValue = 18;
                variance = 4;
                break;
            default:
                baseValue = 50;
                variance = 20;
        }

        if (viewMode === "ipe") {
            baseValue = 90;
            variance = 10;
        }

        const randomValue = baseValue + (Math.random() * 2 - 1) * variance;
        const hourDate = new Date(date);
        for (let hour = 0; hour < 24; hour += 3) {
            hourDate.setHours(hour);
            const hourFactor = hour >= 8 && hour <= 20 ? 1.2 : 0.7;
            data.push({
                timestamp: new Date(hourDate),
                value: new Big(randomValue * hourFactor),
                name: "Machine de Test (Simulée)"
            });
        }
    }

    return data;
}

// Fonction pour générer des valeurs simulées pour les cartes IPE
function generateSimulatedCardValue(
    energyType: string,
    cardIndex: number
): Big {
    let baseValue = 0;
    switch (energyType) {
        case "electricity":
            baseValue = cardIndex === 1 ? 350 : cardIndex === 2 ? 120 : 92;
            break;
        case "gas":
            baseValue = cardIndex === 1 ? 180 : cardIndex === 2 ? 45 : 85;
            break;
        case "water":
            baseValue = cardIndex === 1 ? 950 : cardIndex === 2 ? 320 : 88;
            break;
        case "air":
            baseValue = cardIndex === 1 ? 140 : cardIndex === 2 ? 60 : 95;
            break;
        default:
            baseValue = cardIndex === 1 ? 200 : cardIndex === 2 ? 80 : 90;
    }
    const variance = baseValue * 0.1;
    return new Big(baseValue + (Math.random() * 2 - 1) * variance);
}

// Composant pour afficher le message d'absence de données
const NoDataMessage = () => (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-8 tw-text-center tw-min-h-[200px]">
        <Inbox className="tw-h-16 tw-w-16 tw-text-gray-400 tw-mb-4" />
        <div className="tw-text-gray-500 tw-text-xl tw-mb-2">
            Aucune donnée disponible
        </div>
        <div className="tw-text-gray-400 tw-text-base">
            Aucune donnée n'a pu être récupérée pour la période sélectionnée
        </div>
    </div>
);

export function Detailswidget(props: DetailswidgetContainerProps): JSX.Element | null {
    const {
        devMode,
        viewMode,
        ipeMode,
        energyType,
        baseUnit,
        // IPE 1 (principal)
        consumptionDataSource,
        timestampAttr,
        consumptionAttr,
        NameAttr,
        startDate,
        endDate,
        card1Title,
        card1Icon,
        card1Unit,
        card1DataSource,
        card1ValueAttr,
        card2Title,
        card2Icon,
        card2Unit,
        card2DataSource,
        card2ValueAttr,
        card3Title,
        card3Icon,
        card3Unit,
        card3DataSource,
        card3ValueAttr,
        // IPE 2 (secondaire)
        consumptionDataSource2,
        timestampAttr2,
        consumptionAttr2,
        NameAttr2,
        startDate2,
        endDate2,
        card1Title2,
        card1Icon2,
        card1Unit2,
        card1DataSource2,
        card1ValueAttr2,
        card2Title2,
        card2Icon2,
        card2Unit2,
        card2DataSource2,
        card2ValueAttr2,
        card3Title2,
        card3Icon2,
        card3Unit2,
        card3DataSource2,
        card3ValueAttr2,
        // Noms des IPE
        ipe1Name,
        ipe2Name
    } = props;

    // État pour gérer quel IPE est actif en mode double
    const [activeIPE, setActiveIPE] = useState<1 | 2>(1);

    // États pour les données des deux IPE
    const [data1, setData1] = useState<Array<{ timestamp: Date; value: Big; name: string | undefined }>>([]);
    const [data2, setData2] = useState<Array<{ timestamp: Date; value: Big; name: string | undefined }>>([]);
    
    // États pour les cartes des deux IPE
    const [card1Data1, setCard1Data1] = useState<Big | undefined>(undefined);
    const [card2Data1, setCard2Data1] = useState<Big | undefined>(undefined);
    const [card3Data1, setCard3Data1] = useState<Big | undefined>(undefined);
    const [card1Data2, setCard1Data2] = useState<Big | undefined>(undefined);
    const [card2Data2, setCard2Data2] = useState<Big | undefined>(undefined);
    const [card3Data2, setCard3Data2] = useState<Big | undefined>(undefined);
    
    const [isDataReady, setIsDataReady] = useState(false);

    const energyConfig = viewMode === "ipe" ? energyConfigs.IPE : getAdaptedEnergyConfig(energyType, baseUnit as BaseUnit);
    const baseEnergyConfig = getAdaptedEnergyConfig(energyType, baseUnit as BaseUnit);

    // Fonctions pour obtenir les propriétés de l'IPE actuel
    const getCurrentIPEProps = () => {
        if (ipeMode === "single" || activeIPE === 1) {
            console.log("🔄 getCurrentIPEProps - Sélection IPE 1:", {
                mode: ipeMode,
                activeIPE,
                dataLength: data1.length,
                hasData: data1.length > 0
            });
            return {
                consumptionDataSource,
                timestampAttr,
                consumptionAttr,
                NameAttr,
                startDate,
                endDate,
                card1Title,
                card1Icon,
                card1Unit,
                card1DataSource,
                card1ValueAttr,
                card2Title,
                card2Icon,
                card2Unit,
                card2DataSource,
                card2ValueAttr,
                card3Title,
                card3Icon,
                card3Unit,
                card3DataSource,
                card3ValueAttr,
                data: data1,
                card1Data: card1Data1,
                card2Data: card2Data1,
                card3Data: card3Data1
            };
        } else {
            console.log("🔄 getCurrentIPEProps - Sélection IPE 2:", {
                mode: ipeMode,
                activeIPE,
                dataLength: data2.length,
                hasData: data2.length > 0
            });
            return {
                consumptionDataSource: consumptionDataSource2,
                timestampAttr: timestampAttr2,
                consumptionAttr: consumptionAttr2,
                NameAttr: NameAttr2,
                startDate: startDate2,
                endDate: endDate2,
                card1Title: card1Title2,
                card1Icon: card1Icon2,
                card1Unit: card1Unit2,
                card1DataSource: card1DataSource2,
                card1ValueAttr: card1ValueAttr2,
                card2Title: card2Title2,
                card2Icon: card2Icon2,
                card2Unit: card2Unit2,
                card2DataSource: card2DataSource2,
                card2ValueAttr: card2ValueAttr2,
                card3Title: card3Title2,
                card3Icon: card3Icon2,
                card3Unit: card3Unit2,
                card3DataSource: card3DataSource2,
                card3ValueAttr: card3ValueAttr2,
                data: data2,
                card1Data: card1Data2,
                card2Data: card2Data2,
                card3Data: card3Data2
            };
        }
    };

    const currentProps = getCurrentIPEProps();

    const isConsumptionDataReady1 = consumptionDataSource?.status === ValueStatus.Available;
    const isConsumptionDataReady2 = consumptionDataSource2?.status === ValueStatus.Available;
    const isCard1DataReady1 = card1DataSource?.status === ValueStatus.Available;
    const isCard2DataReady1 = card2DataSource?.status === ValueStatus.Available;
    const isCard3DataReady1 = card3DataSource?.status === ValueStatus.Available;
    const isCard1DataReady2 = card1DataSource2?.status === ValueStatus.Available;
    const isCard2DataReady2 = card2DataSource2?.status === ValueStatus.Available;
    const isCard3DataReady2 = card3DataSource2?.status === ValueStatus.Available;

    const [simulatedStartDate, setSimulatedStartDate] = useState<Date | null>(null);
    const [simulatedEndDate, setSimulatedEndDate] = useState<Date | null>(null);

    // Mode développement : génération de données simulées
    useEffect(() => {
        if (devMode) {
            const now = new Date();
            const start = new Date(now);
            start.setDate(start.getDate() - 30);
            setSimulatedStartDate(start);
            setSimulatedEndDate(now);
            
            // Générer des données pour les deux IPE
            setData1(generateSimulatedData(energyType, viewMode));
            if (ipeMode === "double") {
                setData2(generateSimulatedData(energyType, viewMode));
            }
            
            // Générer des données pour les cartes
            if (viewMode === "ipe" || card1Title) {
                setCard1Data1(generateSimulatedCardValue(energyType, 1));
                setCard1Data2(generateSimulatedCardValue(energyType, 1));
            }
            if (viewMode === "ipe" || card2Title) {
                setCard2Data1(generateSimulatedCardValue(energyType, 2));
                setCard2Data2(generateSimulatedCardValue(energyType, 2));
            }
            if (viewMode === "ipe" || card3Title) {
                setCard3Data1(generateSimulatedCardValue(energyType, 3));
                setCard3Data2(generateSimulatedCardValue(energyType, 3));
            }
        }
    }, [devMode, energyType, viewMode, ipeMode, card1Title, card2Title, card3Title]);

    // Chargement des données principales IPE 1
    useEffect(() => {
        if (
            !devMode &&
            (ipeMode === "single" || ipeMode === "double") &&
            isConsumptionDataReady1 &&
            timestampAttr &&
            consumptionAttr
        ) {
            const itemsRaw = consumptionDataSource?.items ?? [];
            const items = itemsRaw
                .map(item => {
                    const timestamp = timestampAttr.get(item).value;
                    const value = consumptionAttr.get(item).value;
                    const nameValue = NameAttr ? NameAttr.get(item).value : undefined;

                    if (timestamp && value) {
                        return {
                            timestamp: new Date(timestamp),
                            value: new Big(value.toString()),
                            name: nameValue as string | undefined
                        };
                    }
                    return null;
                })
                .filter(
                    (item): item is { timestamp: Date; value: Big; name: string | undefined } => item !== null
                );

            const sortedItems = items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            setData1(sortedItems);
            console.log("📊 IPE 1 - Données chargées:", sortedItems.length, "points");
        }
    }, [devMode, ipeMode, isConsumptionDataReady1, timestampAttr, consumptionAttr, NameAttr, consumptionDataSource]);

    // Chargement des données principales IPE 2
    useEffect(() => {
        if (
            !devMode &&
            ipeMode === "double" &&
            isConsumptionDataReady2 &&
            timestampAttr2 &&
            consumptionAttr2
        ) {
            const itemsRaw = consumptionDataSource2?.items ?? [];
            const items = itemsRaw
                .map(item => {
                    const timestamp = timestampAttr2.get(item).value;
                    const value = consumptionAttr2.get(item).value;
                    const nameValue = NameAttr2 ? NameAttr2.get(item).value : undefined;

                    if (timestamp && value) {
                        return {
                            timestamp: new Date(timestamp),
                            value: new Big(value.toString()),
                            name: nameValue as string | undefined
                        };
                    }
                    return null;
                })
                .filter(
                    (item): item is { timestamp: Date; value: Big; name: string | undefined } => item !== null
                );

            const sortedItems = items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            setData2(sortedItems);
            console.log("📊 IPE 2 - Données chargées:", sortedItems.length, "points");
        }
    }, [devMode, ipeMode, isConsumptionDataReady2, timestampAttr2, consumptionAttr2, NameAttr2, consumptionDataSource2]);

    // Chargement des données des cartes IPE 1
    useEffect(() => {
        if (
            !devMode &&
            (viewMode === "ipe" || card1DataSource) &&
            isCard1DataReady1 &&
            card1ValueAttr
        ) {
            const first = card1DataSource?.items?.[0];
            if (first) {
                const value = card1ValueAttr.get(first);
                if (value?.value) setCard1Data1(new Big(value.value.toString()));
            }
        }
    }, [devMode, viewMode, isCard1DataReady1, card1ValueAttr, card1DataSource]);

    useEffect(() => {
        if (
            !devMode &&
            (viewMode === "ipe" || card2DataSource) &&
            isCard2DataReady1 &&
            card2ValueAttr
        ) {
            const first = card2DataSource?.items?.[0];
            if (first) {
                const value = card2ValueAttr.get(first);
                if (value?.value) setCard2Data1(new Big(value.value.toString()));
            }
        }
    }, [devMode, viewMode, isCard2DataReady1, card2ValueAttr, card2DataSource]);

    useEffect(() => {
        if (
            !devMode &&
            (viewMode === "ipe" || card3DataSource) &&
            isCard3DataReady1 &&
            card3ValueAttr
        ) {
            const first = card3DataSource?.items?.[0];
            if (first) {
                const value = card3ValueAttr.get(first);
                if (value?.value) setCard3Data1(new Big(value.value.toString()));
            }
        }
    }, [devMode, viewMode, isCard3DataReady1, card3ValueAttr, card3DataSource]);

    // Chargement des données des cartes IPE 2
    useEffect(() => {
        if (
            !devMode &&
            ipeMode === "double" &&
            (viewMode === "ipe" || card1DataSource2) &&
            isCard1DataReady2 &&
            card1ValueAttr2
        ) {
            const first = card1DataSource2?.items?.[0];
            if (first) {
                const value = card1ValueAttr2.get(first);
                if (value?.value) setCard1Data2(new Big(value.value.toString()));
            }
        }
    }, [devMode, ipeMode, viewMode, isCard1DataReady2, card1ValueAttr2, card1DataSource2]);

    useEffect(() => {
        if (
            !devMode &&
            ipeMode === "double" &&
            (viewMode === "ipe" || card2DataSource2) &&
            isCard2DataReady2 &&
            card2ValueAttr2
        ) {
            const first = card2DataSource2?.items?.[0];
            if (first) {
                const value = card2ValueAttr2.get(first);
                if (value?.value) setCard2Data2(new Big(value.value.toString()));
            }
        }
    }, [devMode, ipeMode, viewMode, isCard2DataReady2, card2ValueAttr2, card2DataSource2]);

    useEffect(() => {
        if (
            !devMode &&
            ipeMode === "double" &&
            (viewMode === "ipe" || card3DataSource2) &&
            isCard3DataReady2 &&
            card3ValueAttr2
        ) {
            const first = card3DataSource2?.items?.[0];
            if (first) {
                const value = card3ValueAttr2.get(first);
                if (value?.value) setCard3Data2(new Big(value.value.toString()));
            }
        }
    }, [devMode, ipeMode, viewMode, isCard3DataReady2, card3ValueAttr2, card3DataSource2]);

    // État global prêt
    useEffect(() => {
        const mainReady1 = devMode || isConsumptionDataReady1;
        const mainReady2 = ipeMode === "single" || devMode || isConsumptionDataReady2;
        
        const cardsReady1 =
            viewMode !== "ipe" ||
            ((card1Data1 !== undefined || !card1DataSource || devMode) &&
                (card2Data1 !== undefined || !card2DataSource || devMode) &&
                (card3Data1 !== undefined || !card3DataSource || devMode));
                
        const cardsReady2 =
            ipeMode === "single" ||
            viewMode !== "ipe" ||
            ((card1Data2 !== undefined || !card1DataSource2 || devMode) &&
                (card2Data2 !== undefined || !card2DataSource2 || devMode) &&
                (card3Data2 !== undefined || !card3DataSource2 || devMode));
                
        setIsDataReady(mainReady1 && mainReady2 && cardsReady1 && cardsReady2);
    }, [
        devMode, ipeMode, viewMode,
        isConsumptionDataReady1, isConsumptionDataReady2,
        card1Data1, card2Data1, card3Data1,
        card1Data2, card2Data2, card3Data2,
        card1DataSource, card2DataSource, card3DataSource,
        card1DataSource2, card2DataSource2, card3DataSource2
    ]);

    const effectiveStartDate = devMode
        ? simulatedStartDate ?? undefined
        : currentProps.startDate?.value;
    const effectiveEndDate = devMode ? simulatedEndDate ?? undefined : currentProps.endDate?.value;

    const filteredDataForExport = useMemo(() => {
        if (!effectiveStartDate || !effectiveEndDate) return currentProps.data;
        return currentProps.data.filter(item => {
            const d = new Date(item.timestamp);
            return d >= new Date(effectiveStartDate) && d <= new Date(effectiveEndDate);
        });
    }, [currentProps.data, effectiveStartDate, effectiveEndDate]);

    const exportData = filteredDataForExport.map(item => ({
        timestamp: item.timestamp,
        value: item.value.toNumber(),
        name: item.name
    }));

    const baseFilename = `consommation_${energyType}`;
    const dateRangeString = `_${
        effectiveStartDate ? new Date(effectiveStartDate).toISOString().split("T")[0] : ""
    }_${
        effectiveEndDate ? new Date(effectiveEndDate).toISOString().split("T")[0] : ""
    }`;

    if (!isDataReady) {
        return null; // Encore en cours de chargement
    }

    // Vérifier si on a des données à afficher
    const hasData = currentProps.data.length > 0;

    const ipeCards = (
        <div className="tw-flex tw-flex-row tw-gap-6 tw-h-full">
            {(currentProps.card1DataSource || devMode || currentProps.card1Title) && (
                <IPECard
                    icon={currentProps.card1Icon}
                    title={currentProps.card1Title || "Consommation"}
                    value={currentProps.card1Data}
                    unit={currentProps.card1Unit || baseEnergyConfig.unit}
                    color={energyConfig.color}
                    type={
                        energyType === "gas"
                            ? "gaz"
                            : energyType === "water"
                            ? "eau"
                            : energyType === "air"
                            ? "air"
                            : "elec"
                    }
                />
            )}
            {(currentProps.card2DataSource || devMode || currentProps.card2Title) && (
                <IPECard
                    icon={currentProps.card2Icon}
                    title={currentProps.card2Title || "Production"}
                    value={currentProps.card2Data}
                    unit={currentProps.card2Unit || baseEnergyConfig.unit}
                    color={energyConfig.color}
                    type="production"
                />
            )}
            {(currentProps.card3DataSource || devMode || currentProps.card3Title) && (
                <IPECard
                    icon={currentProps.card3Icon}
                    title={currentProps.card3Title || "IPE"}
                    value={currentProps.card3Data}
                    unit={currentProps.card3Unit || baseEnergyConfig.ipeUnit}
                    color={energyConfig.color}
                    type="ipe"
                />
            )}
        </div>
    );

    if (viewMode === "energetic") {
        return (
            <ChartContainer
                data={hasData ? exportData : []}
                energyConfig={energyConfig}
                startDate={effectiveStartDate}
                endDate={effectiveEndDate}
                filename={`${baseFilename}${dateRangeString}`}
                showLineChart={hasData}
                showHeatMap={hasData}
                showExportButton={hasData}
                title={`Consommation ${energyConfig.label.toLowerCase()}`}
                noDataContent={!hasData ? <NoDataMessage /> : undefined}
            />
        );
    }

    if (viewMode === "ipe") {
        const ipeConfig = {
            ...energyConfigs.IPE,
            unit: currentProps.card3Unit || baseEnergyConfig.ipeUnit,
            label: energyConfigs.IPE.label || "IPE"
        };
        
        const titleSuffix = ipeMode === "double" ? ` - ${activeIPE === 1 ? (ipe1Name || "IPE 1") : (ipe2Name || "IPE 2")}` : "";
        
        // Debug logs pour diagnostiquer le problème du toggle
        console.log("=== DEBUG TOGGLE IPE ===");
        console.log("ipeMode:", ipeMode);
        console.log("showIPEToggle:", ipeMode === "double");
        console.log("ipe1Name:", ipe1Name);
        console.log("ipe2Name:", ipe2Name);
        console.log("activeIPE:", activeIPE);
        console.log("onIPEToggle:", !!setActiveIPE);
        console.log("========================");
        
        return (
            <ChartContainer
                data={hasData ? exportData : []}
                energyConfig={ipeConfig}
                startDate={effectiveStartDate}
                endDate={effectiveEndDate}
                filename={`ipe_${baseFilename}${dateRangeString}`}
                showLineChart={hasData}
                showHeatMap={false}
                showExportButton={hasData}
                extraHeaderContent={ipeCards}
                title={
                    currentProps.card3Title
                        ? `Indice de Performance Énergétique (${currentProps.card3Title})${titleSuffix}`
                        : `Indice de Performance Énergétique${titleSuffix}`
                }
                noDataContent={!hasData ? <NoDataMessage /> : undefined}
                showIPEToggle={ipeMode === "double"}
                ipe1Name={ipe1Name}
                ipe2Name={ipe2Name}
                activeIPE={activeIPE}
                onIPEToggle={setActiveIPE}
            />
        );
    }

    return (
        <ChartContainer
            data={hasData ? exportData : []}
            energyConfig={energyConfig}
            startDate={effectiveStartDate}
            endDate={effectiveEndDate}
            filename={`${baseFilename}_general${dateRangeString}`}
            showLineChart={hasData}
            showHeatMap={false}
            showExportButton={hasData}
            extraHeaderContent={ipeCards}
            title={`Vue Générale ${energyConfig.label.toLowerCase()}`}
            noDataContent={!hasData ? <NoDataMessage /> : undefined}
        />
    );
}