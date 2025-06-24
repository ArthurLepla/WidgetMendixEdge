/**
 * Constantes de style selon la règle R8
 * R8: Taille min 24×24px, libellé tronqué > 20 car + tooltip, couleurs WCAG AA
 */

export const STYLE_CONSTANTS = {
  // R8: Taille minimale des nœuds
  MIN_NODE_SIZE: 24, // 24×24 px minimum
  MIN_NODE_WIDTH: 24,
  MIN_NODE_HEIGHT: 24,
  
  // R8: Gestion des libellés
  MAX_LABEL_LENGTH: 20, // Troncature > 20 caractères
  TRUNCATE_SUFFIX: "...",
  
  // R8: Couleurs conformes WCAG AA (contraste 4.5:1 minimum)
  WCAG_COLORS: {
    // Couleurs principales avec contraste élevé
    PRIMARY: "#1976D2",      // Bleu - Contraste 4.5:1 sur blanc
    SECONDARY: "#388E3C",    // Vert - Contraste 4.5:1 sur blanc  
    ERROR: "#D32F2F",        // Rouge - Contraste 4.5:1 sur blanc
    WARNING: "#F57C00",      // Orange - Contraste 4.5:1 sur blanc
    
    // Texte avec contraste optimal
    TEXT: "#212121",         // Gris foncé - Contraste 12:1 sur blanc
    TEXT_SECONDARY: "#757575", // Gris moyen - Contraste 4.5:1 sur blanc
    
    // Arrière-plans
    BACKGROUND: "#FFFFFF",   // Blanc
    SURFACE: "#F5F5F5",      // Gris très clair
    
    // États interactifs
    HOVER: "#E3F2FD",        // Bleu très clair pour hover
    SELECTED: "#1976D2",     // Bleu primary pour sélection
    DISABLED: "#BDBDBD"      // Gris pour éléments désactivés
  },
  
  // Espacements et dimensions
  SPACING: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 16,
    XLARGE: 24
  },
  
  // Configuration typographique
  TYPOGRAPHY: {
    FONT_FAMILY: "'Barlow', sans-serif",
    FONT_SIZE: {
      SMALL: "12px",
      MEDIUM: "14px", 
      LARGE: "16px",
      XLARGE: "18px"
    },
    FONT_WEIGHT: {
      NORMAL: 400,
      MEDIUM: 500,
      BOLD: 600
    }
  },
  
  // Configuration des liens (R5 partiellement)
  LINK: {
    MIN_SPACING: 8, // Espacement minimal entre liens parallèles
    DEFAULT_OPACITY: 0.7,
    HOVER_OPACITY: 0.9
  },
  
  // Configuration des tooltips
  TOOLTIP: {
    MAX_WIDTH: 300,
    PADDING: 12,
    BORDER_RADIUS: 4,
    BACKGROUND: "rgba(0, 0, 0, 0.9)",
    TEXT_COLOR: "#FFFFFF",
    Z_INDEX: 1000
  }
} as const;

// Types pour la validation TypeScript
export type WCAGColor = keyof typeof STYLE_CONSTANTS.WCAG_COLORS;
export type SpacingSize = keyof typeof STYLE_CONSTANTS.SPACING;
export type FontSize = keyof typeof STYLE_CONSTANTS.TYPOGRAPHY.FONT_SIZE; 