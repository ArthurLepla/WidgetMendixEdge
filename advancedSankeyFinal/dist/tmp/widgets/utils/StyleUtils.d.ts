/**
 * Utilitaires de style selon la règle R8
 * R8: Taille min 24×24px, libellé tronqué > 20 car + tooltip, couleurs WCAG AA
 */
/// <reference types="react" />
import { STYLE_CONSTANTS } from '../constants/StyleConstants';
export declare class StyleUtils {
    /**
     * R8: Tronque les libellés > 20 caractères et indique si tooltip nécessaire
     */
    static truncateLabel(text: string): {
        display: string;
        showTooltip: boolean;
    };
    /**
     * R8: Assure la taille minimale des nœuds (24×24px)
     */
    static ensureMinNodeSize(calculatedSize: number): number;
    /**
     * R8: Calcule les dimensions des nœuds en respectant le minimum
     */
    static calculateNodeDimensions(value: number, maxValue: number, baseSize: number): {
        width: number;
        height: number;
    };
    /**
     * R8: Valide la conformité WCAG AA d'une couleur
     * Vérifie que la couleur a un contraste suffisant
     */
    static validateWCAGContrast(colorKey: string): boolean;
    /**
     * R8: Retourne une couleur conforme WCAG AA
     */
    static getWCAGColor(colorKey: keyof typeof STYLE_CONSTANTS.WCAG_COLORS): string;
    /**
     * Génère les styles CSS pour un nœud selon R8
     */
    static getNodeStyle(options: {
        width: number;
        height: number;
        isSelected?: boolean;
        isHovered?: boolean;
        level?: number;
    }): React.CSSProperties;
    /**
     * Génère les styles pour les libellés selon R8
     */
    static getLabelStyle(options?: {
        fontSize?: keyof typeof STYLE_CONSTANTS.TYPOGRAPHY.FONT_SIZE;
        isSecondary?: boolean;
    }): React.CSSProperties;
    /**
     * Génère les styles pour les tooltips selon R8
     */
    static getTooltipStyle(): React.CSSProperties;
    /**
     * Valide qu'un élément respecte les règles R8
     */
    static validateR8Compliance(element: {
        width?: number;
        height?: number;
        labelLength?: number;
        colorKey?: string;
    }): {
        isCompliant: boolean;
        violations: string[];
    };
}
//# sourceMappingURL=StyleUtils.d.ts.map