import { ReactElement, createElement } from "react";
import { KPISection } from "./components/KPISection";
import { Big } from "big.js";
import { ValueStatus } from "mendix";
import { AcceuilPreviewProps } from "../typings/AcceuilProps";

declare function require(name: string): string;

type MockListValue = {
    status: ValueStatus;
    items: any[];
    totalCount: number;
    hasMoreItems: boolean;
    offset: number;
    limit: number;
    setOffset: () => void;
    setLimit: () => void;
    requestTotalCount: () => void;
    reload: () => void;
    filter: {
        type: string;
        value: string;
    };
    sortOrder: any[];
};

type MockAttributeValue<T> = {
    status: ValueStatus;
    value: T;
    displayValue: string;
    validation: undefined;
    readOnly: boolean;
    formatter: {
        format: (value: T) => string;
        parse: (value: string) => T;
    };
    setValue: () => void;
    setTextValue: () => void;
    setFormatter: () => void;
    setValidator: () => void;
    getValue: () => T;
    toString: () => string;
    valueOf: () => T;
};

export function preview(props: AcceuilPreviewProps): ReactElement {
    const mockListAttributeValue = (value: number): MockAttributeValue<Big> => ({
        status: ValueStatus.Available,
        value: new Big(value),
        displayValue: value.toString(),
        validation: undefined,
        readOnly: false,
        formatter: {
            format: (value: Big) => value.toString(),
            parse: (value: string) => new Big(value)
        },
        setValue: () => {},
        setTextValue: () => {},
        setFormatter: () => {},
        setValidator: () => {},
        getValue: () => new Big(value),
        toString: () => value.toString(),
        valueOf: () => new Big(value)
    });

    const mockListValue: MockListValue = {
        status: ValueStatus.Available,
        items: [],
        totalCount: 0,
        hasMoreItems: false,
        offset: 0,
        limit: 50,
        setOffset: () => {},
        setLimit: () => {},
        requestTotalCount: () => {},
        reload: () => {},
        filter: {
            type: "equals",
            value: ""
        },
        sortOrder: []
    };

    return (
        <div className="widget-energy-dashboard">
            <div className="max-w-full mx-auto space-y-6 relative">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="flex justify-center">
                        <p className="text-2xl md:text-3xl text-[#374151] max-w-3xl text-center leading-normal font-barlow">
                            {props.subtitle || "Découvrez et optimisez la performance énergétique de vos installations"}
                        </p>
                    </div>
                </div>

                {/* KPI Section */}
                <KPISection
                    electricityDataSource={mockListValue as any}
                    electricityValueAttribute={mockListAttributeValue(125000) as any}
                    electricityUnit="kWh"
                    
                    gasDataSource={mockListValue as any}
                    gasValueAttribute={mockListAttributeValue(45000) as any}
                    gasUnit="m3"
                    
                    waterDataSource={mockListValue as any}
                    waterValueAttribute={mockListAttributeValue(8500) as any}
                    waterUnit="m3"
                    
                    airDataSource={mockListValue as any}
                    airValueAttribute={mockListAttributeValue(12000) as any}
                    airUnit="m3"
                />

                {/* Autres sections... */}
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/Acceuil.css") + require("./ui/KPISection.css");
}
