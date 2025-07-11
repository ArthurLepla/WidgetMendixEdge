import React, { createElement } from "react";
import { View, Text } from "@react-pdf/renderer";
import { TableRenderProps } from "../../types/widget";
import { formatEnergyValue, truncateName } from "../../utils/formatting";
import { calculateTotals, calculateOptimalPagination, calculateTableRows } from "../../utils/calculations";
import { pdfStyles } from "./PDFStyles";

export const TableRenderer: React.FC<TableRenderProps> = ({ items, title, columnName }) => {
    const totals = calculateTotals(items);
    const isMachineLevel = columnName === "Machine";
    const firstColStyle = isMachineLevel ? pdfStyles.tableColWide : pdfStyles.tableColNarrow;
    const dataColStyle = isMachineLevel ? pdfStyles.tableColDynamic : pdfStyles.tableCol;

    // Calculer la pagination optimale
    const mainTableRows = calculateTableRows(items.length);
    const ipeTableRows = calculateTableRows(items.length);
    const pagination = calculateOptimalPagination(mainTableRows, ipeTableRows);

    return (
        <View>
            <Text style={pdfStyles.subsectionTitle}>{title}</Text>
            {pagination.mainChunks.map((chunkSize, chunkIndex) => {
                // Calculer les indices de début pour ce chunk
                const startIndex = pagination.mainChunks.slice(0, chunkIndex).reduce((sum, size) => sum + size, 0);
                const chunk = items.slice(startIndex, startIndex + chunkSize);
                
                return (
                    <View key={`main-chunk-${chunkIndex}`} style={pdfStyles.table} break={chunkIndex > 0}>
                        {/* En-tête du tableau */}
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]} wrap={false}>
                            <View style={firstColStyle}>
                                <Text style={pdfStyles.tableCellBold}>{columnName}</Text>
                            </View>
                            <View style={dataColStyle}>
                                <Text style={pdfStyles.tableCellBold}>Électricité</Text>
                            </View>
                            <View style={dataColStyle}>
                                <Text style={pdfStyles.tableCellBold}>Gaz</Text>
                            </View>
                            <View style={dataColStyle}>
                                <Text style={pdfStyles.tableCellBold}>Air</Text>
                            </View>
                            <View style={dataColStyle}>
                                <Text style={pdfStyles.tableCellBold}>Prod</Text>
                            </View>
                        </View>
                        {/* Lignes de données */}
                        {chunk.map((item) => (
                            <View key={item.id.toString()} style={pdfStyles.tableRow} minPresenceAhead={8}>
                                <View style={firstColStyle}>
                                    <Text style={pdfStyles.tableCell}>{truncateName(item.displayName, isMachineLevel ? 35 : 25)}</Text>
                                </View>
                                <View style={dataColStyle}>
                                    <Text style={pdfStyles.tableCell}>
                                        {formatEnergyValue(item.consumption["Elec"], "Elec")}
                                    </Text>
                                </View>
                                <View style={dataColStyle}>
                                    <Text style={pdfStyles.tableCell}>
                                        {formatEnergyValue(item.consumption["Gaz"], "Gaz")}
                                    </Text>
                                </View>
                                <View style={dataColStyle}>
                                    <Text style={pdfStyles.tableCell}>
                                        {formatEnergyValue(item.consumption["Air"], "Air")}
                                    </Text>
                                </View>
                                <View style={dataColStyle}>
                                    <Text style={pdfStyles.tableCell}>
                                        {item.production !== undefined ? 
                                            (Number.isFinite(item.production) ? 
                                                item.production.toFixed(0) + " pcs" : 
                                                (item.production === Infinity ? "∞" : "-")) : 
                                            "-"}
                                    </Text>
                                </View>
                            </View>
                        ))}
                        {/* Ligne TOTAL seulement sur le dernier chunk */}
                        {chunkIndex === pagination.mainChunks.length - 1 && (
                            <View style={[pdfStyles.tableRow, { backgroundColor: "#f9fafb" }]} wrap={false}>
                                <View style={firstColStyle}>
                                    <Text style={pdfStyles.tableCellBold}>TOTAL</Text>
                                </View>
                                <View style={dataColStyle}>
                                    <Text style={pdfStyles.tableCellBold}>
                                        {formatEnergyValue(totals.totalElec, "Elec")}
                                    </Text>
                                </View>
                                <View style={dataColStyle}>
                                    <Text style={pdfStyles.tableCellBold}>
                                        {formatEnergyValue(totals.totalGaz, "Gaz")}
                                    </Text>
                                </View>
                                <View style={dataColStyle}>
                                    <Text style={pdfStyles.tableCellBold}>
                                        {formatEnergyValue(totals.totalAir, "Air")}
                                    </Text>
                                </View>
                                <View style={dataColStyle}>
                                    <Text style={pdfStyles.tableCellBold}>
                                        {totals.totalProduction.toFixed(0)} pcs
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