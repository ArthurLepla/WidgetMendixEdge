/* eslint-disable prettier/prettier */
import { ReactElement, createElement, useState } from "react";
import { cn } from "../lib/utils";
import { TreeSelect } from "./ui/TreeSelect";
import { DateRangePickerV2 } from "./ui/DateRangePickerV2";
import { BreadcrumbNav } from "./ui/breadcrumb-nav";
import { EnergySelector } from "./ui/energy-selector";
import { ButtonGroup } from "./ui/button-group";
import { HeadersContainerProps, SelectedEnergyEnum } from "../../typings/HeadersProps";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useLoading } from "./services/useLoading";

const defaultFirstGroupButtons = [
    { label: "Détails", defaultSelected: true },
    { label: "Comparatif", defaultSelected: false }
];

const defaultSecondGroupButtons = [
    { label: "Énergétique", defaultSelected: true },
    { label: "IPE", defaultSelected: false }
];

export function HeaderContainer({ 
    class: className,
    headerTitle = "Exploitation",
    showHeaderTitle = true,
    breadcrumbItems = [],
    buttonGroupEnabled = true,
    firstGroupButtons = defaultFirstGroupButtons,
    secondGroupButtons = defaultSecondGroupButtons,
    multiSelectorEnabled = true,
    allowMultipleSelection = true,
    itemsDataSource,
    itemNameAttribute,
    parentNameAttribute,
    levelAttribute,
    selectedItemsAttribute,
    startDateAttribute,
    endDateAttribute,
    onDateChange,
    energySelectorEnabled = false,
    electricityEnabled = true,
    gasEnabled = true,
    waterEnabled = true,
    airEnabled = true,
    selectedEnergy = "none",
    onElectricitySelect,
    onGasSelect,
    onWaterSelect,
    onAirSelect,
    dateRangePickerEnabled = false,
    onChange,
    onSelectionChange,
    homeAction
}: HeadersContainerProps): ReactElement {
    const [selectedFirstGroup, setSelectedFirstGroup] = useState<string>(
        firstGroupButtons?.find(btn => btn.defaultSelected)?.label || firstGroupButtons?.[0]?.label || ""
    );
    const [selectedSecondGroup, setSelectedSecondGroup] = useState<string>(
        secondGroupButtons?.find(btn => btn.defaultSelected)?.label || secondGroupButtons?.[0]?.label || ""
    );
    
    // Utilisation du hook useLoading pour gestion du loader
    const { isLoading, message } = useLoading();

    const getEnergyColor = (energy: SelectedEnergyEnum): string => {
        switch (energy) {
            case "electricity":
                return "tw-bg-[#38a13c]"; // vert électricité
            case "gas":
                return "tw-bg-[#F9BE01]"; // jaune gaz
            case "water":
                return "tw-bg-[#3293f3]"; // bleu eau
            case "air":
                return "tw-bg-[#66D8E6]"; // bleu clair air
            default:
                return "tw-bg-gray-200"; // gris par défaut
        }
    };

    return (
        <header className="tw-w-full tw-bg-white tw-font-barlow tw-relative">
            {/* LoadingOverlay simplifié */}
            <LoadingOverlay 
                isLoading={isLoading} 
                message={message}
            />
            
            {/* Breadcrumb section */}
            <div className="tw-h-24 tw-flex tw-items-center tw-border-b tw-border-gray-100">
                <div className="tw-px-8 sm:tw-px-10">
                    <BreadcrumbNav
                        homeAction={homeAction?.execute}
                        items={breadcrumbItems}
                        className="tw-text-2xl tw-text-gray-600 tw-flex tw-flex-wrap tw-items-center"
                    />
                </div>
            </div>

            {/* Main header content */}
            <div className={cn(
                "tw-px-8 sm:tw-px-10 lg:tw-px-12 tw-py-8 tw-space-y-8",
                "tw-bg-background tw-shadow-lg tw-rounded-xl",
                "tw-font-barlow tw-relative",
                "tw-pb-12",
                className
            )}>
                {/* First line */}
                <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-[250px_1fr_auto] tw-items-center tw-gap-4 lg:tw-gap-8">
                    {/* Left section - Title */}
                    {showHeaderTitle && (
                        <h1 className="tw-text-3xl sm:tw-text-5xl tw-font-bold tw-text-primary tw-font-barlow tw-leading-tight">
                            {headerTitle}
                        </h1>
                    )}

                    {/* Center section - Energy selector */}
                    <div className="tw-flex tw-justify-center tw-items-center">
                        {energySelectorEnabled && (
                            <EnergySelector 
                                value={selectedEnergy}
                                electricityEnabled={electricityEnabled}
                                gasEnabled={gasEnabled}
                                waterEnabled={waterEnabled}
                                airEnabled={airEnabled}
                                onElectricitySelect={onElectricitySelect}
                                onGasSelect={onGasSelect}
                                onWaterSelect={onWaterSelect}
                                onAirSelect={onAirSelect}
                            />
                        )}
                    </div>

                    {/* Right section - Selectors */}
                    <div className="tw-flex tw-flex-col lg:tw-flex-row tw-items-stretch tw-space-y-4 lg:tw-space-y-0 lg:tw-space-x-4 xl:tw-space-x-6">
                        {multiSelectorEnabled && (
                            <TreeSelect
                                class="tw-w-full xl:tw-w-[320px] tw-font-barlow"
                                itemsDataSource={itemsDataSource}
                                itemNameAttribute={itemNameAttribute}
                                parentNameAttribute={parentNameAttribute}
                                levelAttribute={levelAttribute}
                                selectedItemsAttribute={selectedItemsAttribute}
                                allowMultipleSelection={allowMultipleSelection}
                                placeholder="Sélectionner des assets..."
                                variant="minimal"
                                onChange={onChange}
                                onSelectionChange={onSelectionChange}
                            />
                        )}
                        
                        {dateRangePickerEnabled && (
                            <DateRangePickerV2 
                                startDateAttribute={startDateAttribute}
                                endDateAttribute={endDateAttribute}
                                onDateChange={onDateChange}
                                className={cn(
                                    "tw-w-full",
                                    "lg:tw-w-[280px]",
                                    "xl:tw-w-[320px]",
                                    "tw-font-barlow"
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* Section des groupes de boutons */}
                {buttonGroupEnabled && (
                    <div className="tw-flex tw-flex-col sm:tw-flex-row tw-items-stretch tw-gap-6 tw-mt-8">
                        <div className="tw-h-10">
                            {firstGroupButtons && firstGroupButtons.length > 0 && (
                                <ButtonGroup 
                                    buttons={firstGroupButtons}
                                    value={selectedFirstGroup}
                                    onChange={setSelectedFirstGroup}
                                    className="tw-h-full"
                                    useSimpleLoader={false}
                                    loadingMessage="Chargement en cours..."
                                />
                            )}
                        </div>
                        <div className="tw-h-10">
                            {secondGroupButtons && secondGroupButtons.length > 0 && (
                                <ButtonGroup 
                                    buttons={secondGroupButtons}
                                    value={selectedSecondGroup}
                                    onChange={setSelectedSecondGroup}
                                    className="tw-h-full"
                                    useSimpleLoader={false}
                                    loadingMessage="Chargement en cours..."
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Barre de statut améliorée */}
                <div className={cn(
                    "tw-absolute tw-bottom-0 tw-left-0 tw-right-0",
                    "tw-h-2.5",
                    "tw-transition-all tw-duration-500",
                    "tw-rounded-b-xl",
                    "tw-opacity-90",
                    "tw-shadow-inner",
                    getEnergyColor(selectedEnergy)
                )}>
                    {/* Overlay pour effet de brillance */}
                    <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-white/10 tw-via-transparent tw-to-white/10" />
                </div>
            </div>
        </header>
    );
}