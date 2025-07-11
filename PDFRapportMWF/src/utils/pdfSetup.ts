import { Font } from "@react-pdf/renderer";
import FontAwesomeTTF from "../fonts/Font-Awesome-6-Free-Solid-900.ttf";
import BarlowRegular from "../fonts/Barlow-Regular.ttf";
import BarlowBold from "../fonts/Barlow-Bold.ttf";

let fontsInitialized = false;

// Enregistrement des polices personnalisées pour le PDF
export const initializePDFFonts = (): void => {
    if (fontsInitialized) {
        console.log("PDF Fonts already initialized");
        return;
    }
    
    try {
        console.log("Initializing PDF fonts...");
        
        Font.register({
            family: 'FontAwesome',
            fonts: [{ src: FontAwesomeTTF }]
        });

        Font.register({
            family: 'Barlow',
            fonts: [
                { src: BarlowRegular, fontWeight: 'normal' },
                { src: BarlowBold, fontWeight: 'bold' }
            ]
        });
        
        fontsInitialized = true;
        console.log("PDF Fonts initialized successfully");
    } catch (error) {
        console.error("Error initializing PDF fonts:", error);
        // Continue sans les polices personnalisées
    }
};

// Fonction pour obtenir le nom de fichier PDF par défaut
export const getDefaultPDFFileName = (): string => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    return `rapport_consommation_energie_${dateStr}.pdf`;
}; 