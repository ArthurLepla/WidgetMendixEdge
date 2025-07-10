import { ReactElement, createElement, useEffect, useState, useRef, useMemo } from "react";
import { ListValue, ListAttributeValue, EditableValue, ActionValue } from "mendix";
import { cn } from "../../lib/utils";
import { Check, ChevronDown, Search } from "lucide-react";

export interface Option {
    label: string;
    value: string;
}

export interface MultiSelectProps {
    className?: string;
    enabled?: boolean;
    allowMultiple?: boolean;
    dataSource?: ListValue;
    displayAttribute?: ListAttributeValue<string>;
    selectedAttribute?: EditableValue<string>;
    placeholder?: string;
    onChange?: ActionValue;
    onSelectionChange?: ActionValue;
}

export function MultiSelect({
    className,
    enabled = true,
    allowMultiple = true,
    dataSource,
    displayAttribute,
    selectedAttribute,
    placeholder = "Sélectionner...",
    onChange,
    onSelectionChange
}: MultiSelectProps): ReactElement {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const MAX_VISIBLE_ITEMS = 2;

    const options = dataSource?.items?.map(item => ({
        label: displayAttribute?.get(item).value || "",
        value: displayAttribute?.get(item).value || ""
    })) || [];

    const normalizeString = (str: string) => 
        str.toLowerCase()
           .normalize('NFD')
           .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
           .replace(/[^a-z0-9\s]/g, ''); // Garde uniquement les lettres, chiffres et espaces

    const filteredOptions = useMemo(() => {
        const normalizedQuery = normalizeString(searchQuery);
        
        if (!normalizedQuery) return options;

        return options.filter(option => {
            const normalizedLabel = normalizeString(option.label);
            
            // Vérifie si le label contient tous les mots de la recherche
            const searchWords = normalizedQuery.split(/\s+/).filter(Boolean);
            return searchWords.every(word => normalizedLabel.includes(word));
        });
    }, [options, searchQuery]);

    const selectedValues = useMemo(() => {
        const rawValue = selectedAttribute?.value || "";
        try {
            return rawValue
                .split(",")
                .filter(Boolean)
                .map((v: string) => v.trim())
                .filter((v, i, arr) => arr.indexOf(v) === i);
        } catch (e) {
            console.error("Erreur parsing:", e);
            return [];
        }
    }, [selectedAttribute?.value]);

    const visibleItems = selectedValues.slice(0, MAX_VISIBLE_ITEMS);
    const remainingCount = selectedValues.length - MAX_VISIBLE_ITEMS;

    useEffect(() => {
        if (dataSource?.status === "available" && !dataSource.items?.length) {
            dataSource.reload();
        }
    }, [dataSource]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        // Valide les valeurs 0.3s après la mise à jour
    }, [dataSource?.status, selectedAttribute?.status, dataSource?.items]);

    const handleSelect = async (option: Option) => {
        if (!enabled || !selectedAttribute || selectedAttribute.status !== "available") {
            return;
        }

        setIsLoading(true);
        try {
            const currentRawValue = selectedAttribute.value || "";
            const currentValues = currentRawValue.split(',').filter(Boolean).map(v => v.trim());
            
            let newValues = currentValues.includes(option.value)
                ? currentValues.filter((v: string) => v !== option.value)
                : [...currentValues, option.value];
            
            newValues = [...new Set(newValues)];

            if (!allowMultiple) {
                newValues = [option.value];
                setIsOpen(false);
                setSearchQuery("");
            }

            // S'assurer que la valeur est bien assignée avant de continuer
            await selectedAttribute.setValue(newValues.join(","));

            if (dataSource?.status === "available") {
                const validValues = newValues.filter((value: string) => 
                    dataSource.items?.some(item => 
                        displayAttribute?.get(item).value === value
                    )
                );
                if (validValues.length !== newValues.length) {
                    await selectedAttribute.setValue(validValues.join(","));
                }
            }

            // Exécuter les actions de manière séquentielle avec un court délai pour s'assurer que la valeur est bien mise à jour
            if (onChange) {
                await onChange.execute();
            }
            if (onSelectionChange) {
                await onSelectionChange.execute();
            }
        } catch (error) {
            console.error("Erreur lors de la sélection:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAll = async () => {
        if (!enabled || !selectedAttribute || selectedAttribute.status !== "available" || !allowMultiple) {
            return;
        }

        setIsLoading(true);
        try {
            const allValues = filteredOptions.map(opt => opt.value);
            const areAllSelected = filteredOptions.every(opt => selectedValues.includes(opt.value));
            const newValues = areAllSelected 
                ? selectedValues.filter(v => !allValues.includes(v))
                : [...new Set([...selectedValues, ...allValues])];

            // S'assurer que la valeur est bien assignée
            await selectedAttribute.setValue(newValues.join(","));
            
            // Exécuter les actions de manière séquentielle
            if (onChange) {
                await onChange.execute();
            }
            if (onSelectionChange) {
                await onSelectionChange.execute();
            }
        } catch (error) {
            console.error("Erreur lors de la sélection multiple:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!enabled) {
        return createElement("div");
    }

    return (
        <div ref={containerRef} className={cn("tw-relative", className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={cn(
                    "tw-flex tw-h-14 tw-w-full tw-items-center tw-justify-between",
                    "tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-4 tw-py-3",
                    "tw-text-xl tw-font-medium",
                    "tw-ring-offset-background",
                    "hover:tw-bg-accent hover:tw-text-accent-foreground",
                    "focus:tw-outline-none focus:tw-ring-2 tw-ring-primary focus:tw-ring-offset-2",
                    "disabled:tw-cursor-not-allowed disabled:tw-opacity-50",
                    isLoading && "tw-opacity-50"
                )}
            >
                <div className="tw-flex-1 tw-flex tw-items-center tw-gap-2 tw-min-w-0 tw-h-8 tw-overflow-hidden">
                    {selectedValues.length ? (
                        <div className="tw-flex tw-items-center tw-gap-2 tw-min-w-0">
                            {visibleItems.map(value => (
                                <span 
                                    key={value} 
                                    className="tw-bg-primary/10 tw-text-primary tw-px-2 tw-py-1 tw-rounded tw-inline-flex tw-items-center tw-shrink-0"
                                >
                                    {options.find(opt => opt.value === value)?.label || value}
                                </span>
                            ))}
                            {remainingCount > 0 && (
                                <span className="tw-bg-primary/5 tw-text-primary tw-px-2 tw-py-1 tw-rounded tw-inline-flex tw-items-center tw-shrink-0">
                                    +{remainingCount}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="tw-text-muted-foreground">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className={cn(
                    "tw-h-6 tw-w-6 tw-opacity-50 tw-transition-transform tw-shrink-0 tw-ml-2",
                    isOpen && "tw-rotate-180"
                )} />
            </button>
            {isOpen && (
                <div className="tw-absolute tw-w-full tw-z-50 tw-top-[calc(100%+5px)]">
                    <div className="tw-max-h-[300px] tw-overflow-auto tw-rounded-lg tw-border tw-bg-popover tw-text-popover-foreground tw-shadow-md">
                        <div className="tw-sticky tw-top-0 tw-z-10 tw-bg-popover tw-border-b tw-px-3 tw-py-2">
                            <div className="tw-relative">
                                <Search className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-text-muted-foreground lucide-search" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher..."
                                    className={cn(
                                        "tw-w-full",
                                        "tw-text-base tw-bg-transparent",
                                        "tw-border tw-border-input tw-rounded-md",
                                        "focus:tw-outline-none focus:tw-ring-2 tw-ring-primary focus:tw-ring-offset-2",
                                        "placeholder:tw-text-muted-foreground"
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        
                        {allowMultiple && filteredOptions.length > 0 && (
                            <div
                                className={cn(
                                    "tw-relative tw-flex tw-cursor-pointer tw-items-center tw-justify-between",
                                    "tw-rounded-sm tw-px-3 tw-py-2.5 tw-text-lg tw-border-b",
                                    "hover:tw-bg-accent hover:tw-text-accent-foreground",
                                    filteredOptions.every(opt => selectedValues.includes(opt.value)) && "tw-bg-primary/10"
                                )}
                                onClick={handleSelectAll}
                            >
                                {filteredOptions.length === options.length ? "Tout sélectionner" : `Sélectionner les ${filteredOptions.length} résultats`}
                                {filteredOptions.every(opt => selectedValues.includes(opt.value)) && (
                                    <Check className="tw-h-5 tw-w-5 tw-text-primary" />
                                )}
                            </div>
                        )}
                        
                        {filteredOptions.length === 0 ? (
                            <div className="tw-px-3 tw-py-2.5 tw-text-lg tw-text-muted-foreground tw-text-center">
                                Aucun résultat
                            </div>
                        ) : (
                            filteredOptions.map(option => {
                                const isSelected = selectedValues.includes(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        className={cn(
                                            "tw-relative tw-flex tw-cursor-pointer tw-items-center tw-justify-between",
                                            "tw-rounded-sm tw-px-3 tw-py-2.5 tw-text-lg",
                                            "hover:tw-bg-accent hover:tw-text-accent-foreground",
                                            "data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50",
                                            isSelected && "tw-bg-primary/10"
                                        )}
                                        onClick={() => handleSelect(option)}
                                    >
                                        {option.label}
                                        {isSelected && <Check className="tw-h-5 tw-w-5 tw-text-primary" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}