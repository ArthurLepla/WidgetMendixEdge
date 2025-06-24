/**
 * Constantes de style selon la règle R8
 * R8: Taille min 24×24px, libellé tronqué > 20 car + tooltip, couleurs WCAG AA
 */
export declare const STYLE_CONSTANTS: {
    readonly MIN_NODE_SIZE: 24;
    readonly MIN_NODE_WIDTH: 24;
    readonly MIN_NODE_HEIGHT: 24;
    readonly MAX_LABEL_LENGTH: 20;
    readonly TRUNCATE_SUFFIX: "...";
    readonly WCAG_COLORS: {
        readonly PRIMARY: "#1976D2";
        readonly SECONDARY: "#388E3C";
        readonly ERROR: "#D32F2F";
        readonly WARNING: "#F57C00";
        readonly TEXT: "#212121";
        readonly TEXT_SECONDARY: "#757575";
        readonly BACKGROUND: "#FFFFFF";
        readonly SURFACE: "#F5F5F5";
        readonly HOVER: "#E3F2FD";
        readonly SELECTED: "#1976D2";
        readonly DISABLED: "#BDBDBD";
    };
    readonly SPACING: {
        readonly SMALL: 4;
        readonly MEDIUM: 8;
        readonly LARGE: 16;
        readonly XLARGE: 24;
    };
    readonly TYPOGRAPHY: {
        readonly FONT_FAMILY: "'Barlow', sans-serif";
        readonly FONT_SIZE: {
            readonly SMALL: "12px";
            readonly MEDIUM: "14px";
            readonly LARGE: "16px";
            readonly XLARGE: "18px";
        };
        readonly FONT_WEIGHT: {
            readonly NORMAL: 400;
            readonly MEDIUM: 500;
            readonly BOLD: 600;
        };
    };
    readonly LINK: {
        readonly MIN_SPACING: 8;
        readonly DEFAULT_OPACITY: 0.7;
        readonly HOVER_OPACITY: 0.9;
    };
    readonly TOOLTIP: {
        readonly MAX_WIDTH: 300;
        readonly PADDING: 12;
        readonly BORDER_RADIUS: 4;
        readonly BACKGROUND: "rgba(0, 0, 0, 0.9)";
        readonly TEXT_COLOR: "#FFFFFF";
        readonly Z_INDEX: 1000;
    };
};
export type WCAGColor = keyof typeof STYLE_CONSTANTS.WCAG_COLORS;
export type SpacingSize = keyof typeof STYLE_CONSTANTS.SPACING;
export type FontSize = keyof typeof STYLE_CONSTANTS.TYPOGRAPHY.FONT_SIZE;
//# sourceMappingURL=StyleConstants.d.ts.map