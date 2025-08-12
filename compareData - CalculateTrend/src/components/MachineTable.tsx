import { ReactElement, createElement, useState } from "react";
import { Big } from "big.js";
import { EnergyType } from "../utils/energy";
import { formatSmartValue, compareValues, BaseUnit, getSmartUnit } from "../utils/unitConverter";

interface MachineTableProps {
    machines: {
        name: string;
        currentValue: Big;
        maxValue: Big;
        minValue: Big;
        sumValue: Big;
    }[];
    type: EnergyType;
    viewMode: "energetic" | "ipe";
    baseUnit?: BaseUnit;
    unit?: string; // Unité fournie par ChartContainer
}

type SortColumn = 'name' | 'currentValue' | 'minValue' | 'sumValue' | 'maxValue';
type SortDirection = 'asc' | 'desc';

export const MachineTable = ({ machines, type, viewMode, baseUnit = "auto", unit }: MachineTableProps): ReactElement => {
    const [sortColumn, setSortColumn] = useState<SortColumn>('currentValue');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const getSortIcon = (column: SortColumn) => {
        if (sortColumn !== column) {
            return <span className="text-gray-400">↕</span>;
        }
        return (
            <span className="text-gray-900">
                {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    const sortedMachines = [...machines].sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;
        
        if (sortColumn === 'name') {
            return multiplier * a.name.localeCompare(b.name);
        }
        
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        return multiplier * compareValues(aValue, bValue);
    });

    return (
        <div className="card-base">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th 
                                className="px-6 py-4 text-left text-[var(--font-size-table-header)] leading-[var(--line-height-table-header)] font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover-bg-gray-50 transition-colors duration-150"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-2">
                                    Machine {getSortIcon('name')}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-right text-[var(--font-size-table-header)] leading-[var(--line-height-table-header)] font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover-bg-gray-50 transition-colors duration-150"
                                onClick={() => handleSort('currentValue')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    Actuel {getSortIcon('currentValue')}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-right text-[var(--font-size-table-header)] leading-[var(--line-height-table-header)] font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover-bg-gray-50 transition-colors duration-150"
                                onClick={() => handleSort('sumValue')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    Somme {getSortIcon('sumValue')}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-right text-[var(--font-size-table-header)] leading-[var(--line-height-table-header)] font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover-bg-gray-50 transition-colors duration-150"
                                onClick={() => handleSort('minValue')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    Min {getSortIcon('minValue')}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-right text-[var(--font-size-table-header)] leading-[var(--line-height-table-header)] font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover-bg-gray-50 transition-colors duration-150"
                                onClick={() => handleSort('maxValue')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    Max {getSortIcon('maxValue')}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortedMachines.map((machine, index) => (
                            <tr 
                                key={index}
                                className="hover-bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-[var(--font-size-table-cell)] leading-[var(--line-height-table-cell)] font-medium text-gray-900">
                                    {machine.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-[var(--font-size-table-cell)] leading-[var(--line-height-table-cell)] text-right font-semibold text-gray-900">
                                    {viewMode === "ipe" && unit
                                        ? `${getSmartUnit(machine.currentValue, type, viewMode, baseUnit).value.toFixed(2)} ${unit}`
                                        : formatSmartValue(machine.currentValue, type, viewMode, baseUnit)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-[var(--font-size-table-cell)] leading-[var(--line-height-table-cell)] text-right font-semibold text-gray-900">
                                    {viewMode === "ipe" && unit
                                        ? `${getSmartUnit(machine.sumValue, type, viewMode, baseUnit).value.toFixed(2)} ${unit}`
                                        : formatSmartValue(machine.sumValue, type, viewMode, baseUnit)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-[var(--font-size-table-cell)] leading-[var(--line-height-table-cell)] text-right text-gray-900">
                                    {viewMode === "ipe" && unit
                                        ? `${getSmartUnit(machine.minValue, type, viewMode, baseUnit).value.toFixed(2)} ${unit}`
                                        : formatSmartValue(machine.minValue, type, viewMode, baseUnit)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-[var(--font-size-table-cell)] leading-[var(--line-height-table-cell)] text-right text-gray-900">
                                    {viewMode === "ipe" && unit
                                        ? `${getSmartUnit(machine.maxValue, type, viewMode, baseUnit).value.toFixed(2)} ${unit}`
                                        : formatSmartValue(machine.maxValue, type, viewMode, baseUnit)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}; 