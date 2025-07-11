import React, { createElement } from "react";
import { View, Text } from "@react-pdf/renderer";
import { IPETableRenderProps } from "../../types/widget";
import { formatIpeValue, truncateName } from "../../utils/formatting";
import { calculateTotals, calculateIPEByEnergy, calculateOptimalPagination, calculateTableRows } from "../../utils/calculations";
import { pdfStyles } from "./PDFStyles";

export const IPETableRenderer: React.FC<IPETableRenderProps> = ({ 
    items, 
    title, 
    columnName, 
    separateFromMain = false 
}) => {
    const totals = calculateTotals(items);
    const totalIPEs = calculateIPEByEnergy(
        { Elec: totals.totalElec, Gaz: totals.totalGaz, Air: totals.totalAir },
        totals.totalProduction
    );
    const isMachineLevel = columnName === "Machine";
    const firstColIpeStyle = isMachineLevel ? pdfStyles.tableColIPEWideName : pdfStyles.tableColIPE;
    const dataColIpeStyle = isMachineLevel ? pdfStyles.tableColIPEDynamic : pdfStyles.tableColIPE;

    // Calculer la pagination optimale
    const mainTableRows = calculateTableRows(items.length);
    const ipeTableRows = calculateTableRows(items.length);
    const pagination = calculateOptimalPagination(mainTableRows, ipeTableRows);

    return (
        <View break={separateFromMain}>
            <Text style={pdfStyles.subsectionTitle}>{title} - IPE par énergie</Text>
            {pagination.ipeChunks.map((chunkSize, chunkIndex) => {
                // Calculer les indices de début pour ce chunk
                const startIndex = pagination.ipeChunks.slice(0, chunkIndex).reduce((sum, size) => sum + size, 0);
                const chunk = items.slice(startIndex, startIndex + chunkSize);
                
                return (
                    <View key={`ipe-chunk-${chunkIndex}`} style={pdfStyles.table} break={chunkIndex > 0}>
                        {/* En-tête du tableau */}
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]} wrap={false}>
                            <View style={firstColIpeStyle}>
                                <Text style={pdfStyles.tableCellBold}>{columnName}</Text>
                            </View>
                            <View style={dataColIpeStyle}>
                                <Text style={pdfStyles.tableCellBold}>IPE Elec</Text>
                            </View>
                            <View style={dataColIpeStyle}>
                                <Text style={pdfStyles.tableCellBold}>IPE Gaz</Text>
                            </View>
                            <View style={dataColIpeStyle}>
                                <Text style={pdfStyles.tableCellBold}>IPE Air</Text>
                            </View>
                        </View>
                        {/* Lignes de données */}
                        {chunk.map((item) => {
                            const ipes = calculateIPEByEnergy(item.consumption, item.production);
                            return (
                                <View key={item.id.toString()} style={pdfStyles.tableRow} minPresenceAhead={8}>
                                    <View style={firstColIpeStyle}>
                                        <Text style={pdfStyles.tableCell}>{truncateName(item.displayName, isMachineLevel ? 35 : 25)}</Text>
                                    </View>
                                    <View style={dataColIpeStyle}>
                                        <Text style={pdfStyles.tableCell}>
                                            {formatIpeValue(ipes.ipeElec, "Elec")}
                                        </Text>
                                    </View>
                                    <View style={dataColIpeStyle}>
                                        <Text style={pdfStyles.tableCell}>
                                            {formatIpeValue(ipes.ipeGaz, "Gaz")}
                                        </Text>
                                    </View>
                                    <View style={dataColIpeStyle}>
                                        <Text style={pdfStyles.tableCell}>
                                            {formatIpeValue(ipes.ipeAir, "Air")}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                        {/* Ligne TOTAL seulement sur le dernier chunk */}
                        {chunkIndex === pagination.ipeChunks.length - 1 && (
                            <View style={[pdfStyles.tableRow, { backgroundColor: "#f9fafb" }]} wrap={false}>
                                <View style={firstColIpeStyle}>
                                    <Text style={pdfStyles.tableCellBold}>TOTAL</Text>
                                </View>
                                <View style={dataColIpeStyle}>
                                    <Text style={pdfStyles.tableCellBold}>
                                        {formatIpeValue(totalIPEs.ipeElec, "Elec")}
                                    </Text>
                                </View>
                                <View style={dataColIpeStyle}>
                                    <Text style={pdfStyles.tableCellBold}>
                                        {formatIpeValue(totalIPEs.ipeGaz, "Gaz")}
                                    </Text>
                                </View>
                                <View style={dataColIpeStyle}>
                                    <Text style={pdfStyles.tableCellBold}>
                                        {formatIpeValue(totalIPEs.ipeAir, "Air")}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}; 