import React, { createElement } from "react";
import { Document, Page, Text, View, Image, Link } from "@react-pdf/renderer";
import { PDFDocumentProps } from "../../types/widget";
import { formatDatePeriod } from "../../utils/formatting";
import { collectItemsByType } from "../../utils/calculations";
import { TableRenderer } from "./TableRenderer";
import { IPETableRenderer } from "./IPETableRenderer";
import { pdfStyles } from "./PDFStyles";

export const PDFDocumentLayout: React.FC<PDFDocumentProps> = ({
    reportTitle,
    reportDescription,
    logoUrl,
    treeData,
    dateStart,
    dateEnd
}) => {
    // Collection des données par type
    const secteurs = collectItemsByType(treeData, "Secteur");
    const ateliers = collectItemsByType(treeData, "Atelier");
    const machines = collectItemsByType(treeData, "Machine");

    console.log("PDFDocumentLayout: Collected items - Secteurs:", secteurs.length, "Ateliers:", ateliers.length, "Machines:", machines.length);

    // Fonction pour rendre une section complète avec gestion intelligente de la pagination
    const renderSection = (items: any[], sectionTitle: string, columnName: string, sectionId: string) => {
        if (items.length === 0) {
            return (
                <Page size="A4" style={pdfStyles.page}>
                    <Text style={pdfStyles.sectionTitle} id={sectionId}>{sectionTitle}</Text>
                    <Text style={pdfStyles.introText}>Aucune donnée de {columnName.toLowerCase()} disponible.</Text>
                    <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }: any) => (
                        `${pageNumber} / ${totalPages}`
                    )} fixed />
                </Page>
            );
        }

        return (
            <Page size="A4" style={pdfStyles.page} wrap>
                <Text style={pdfStyles.sectionTitle} id={sectionId}>{sectionTitle}</Text>
                <View>
                    <TableRenderer items={items} title="Tableau des Consommations" columnName={columnName} />
                    <View style={{ marginTop: 30 }}></View>
                    <IPETableRenderer 
                        items={items} 
                        title="Tableau des IPE" 
                        columnName={columnName} 
                        separateFromMain={true}
                    />
                </View>
                <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }: any) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        );
    };

    interface PageNumberProps {
        pageNumber: number;
        totalPages: number;
    }

    return (
        <Document author="MyWidget" title={reportTitle}>
            {/* Page de couverture */}
            <Page size="A4" style={pdfStyles.coverPage}>
                <View style={pdfStyles.coverContent}>
                    {logoUrl && <Image style={pdfStyles.logo} src={{ uri: logoUrl, method: 'GET', headers: {}, body: ''}} />}
                    <Text style={pdfStyles.reportTitleText}>{reportTitle}</Text>
                    {reportDescription && (
                        <Text style={pdfStyles.subtitleText}>{reportDescription}</Text>
                    )}
                    <Text style={[pdfStyles.subtitleText, { fontSize: 16, marginTop: 20 }]}>
                        {formatDatePeriod(dateStart, dateEnd)}
                    </Text>
                </View>
                 <Text style={pdfStyles.generationDateText}>
                    Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
                </Text>
            </Page>

            {/* Table des matières */}
            <Page size="A4" style={[pdfStyles.page, pdfStyles.tocPage]}>
                <Text style={pdfStyles.sectionTitle}>Table des Matières</Text>
                <Link src="#introduction">
                    <Text style={pdfStyles.tocEntry}>1. Introduction</Text>
                </Link>
                <Link src="#synthese">
                    <Text style={pdfStyles.tocEntry}>2. Synthèse des Consommations</Text>
                </Link>
                <Link src="#secteurs">
                    <Text style={pdfStyles.tocEntry}>3. Analyse par Secteurs</Text>
                </Link>
                <Link src="#ateliers">
                    <Text style={pdfStyles.tocEntry}>4. Analyse par Ateliers</Text>
                </Link>
                <Link src="#machines">
                    <Text style={pdfStyles.tocEntry}>5. Analyse par Machines</Text>
                </Link>
                <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }: PageNumberProps) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>

            {/* Introduction */}
            <Page size="A4" style={pdfStyles.page}>
                <Text style={pdfStyles.sectionTitle} id="introduction">1. Introduction</Text>
                <Text style={pdfStyles.introText}>
                    Ce rapport présente une analyse détaillée des consommations énergétiques et de la production 
                    de votre installation industrielle pour la période : {formatDatePeriod(dateStart, dateEnd).toLowerCase()}. 
                    Les données sont organisées selon une hiérarchie à trois niveaux : Secteurs, Ateliers et Machines.
                </Text>
                <Text style={pdfStyles.introText}>
                    L'objectif est de fournir une vision claire des performances énergétiques à chaque niveau organisationnel, 
                    permettant d'identifier les opportunités d'optimisation et d'amélioration de l'efficacité énergétique.
                </Text>
                <View style={pdfStyles.summaryBox}>
                    <Text style={pdfStyles.summaryText}>
                        • L'électricité est exprimée en kWh ou MWh{"\n"}
                        • Le gaz et l'air comprimé sont exprimés en m³ ou km³{"\n"}
                        • L'IPE (Indicateur de Performance Énergétique) représente la consommation par pièce produite{"\n"}
                        • Les totaux sont calculés automatiquement pour chaque niveau
                    </Text>
                </View>
                <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }: PageNumberProps) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>

            {/* Synthèse */}
            <Page size="A4" style={pdfStyles.page}>
                <Text style={pdfStyles.sectionTitle} id="synthese">2. Synthèse des Consommations</Text>
                <View style={pdfStyles.summaryBox}>
                    <Text style={pdfStyles.summaryText}>
                        Nombre de secteurs analysés : {secteurs.length}{"\n"}
                        Nombre d'ateliers analysés : {ateliers.length}{"\n"}
                        Nombre de machines analysées : {machines.length}
                    </Text>
                </View>
                <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }: PageNumberProps) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>

            {/* Secteurs */}
            {renderSection(secteurs, "3. Analyse par Secteurs", "Secteur", "secteurs")}

            {/* Ateliers */}
            {renderSection(ateliers, "4. Analyse par Ateliers", "Atelier", "ateliers")}

            {/* Machines */}
            {renderSection(machines, "5. Analyse par Machines", "Machine", "machines")}
        </Document>
    );
}; 