/**
 * Utilitaires de style selon la règle R8
 * R8: Taille min 24×24px, libellé tronqué > 20 car + tooltip, couleurs WCAG AA
 */

import { STYLE_CONSTANTS } from '../constants/StyleConstants';

export class StyleUtils {
  
  /**
   * R8: Tronque les libellés > 20 caractères et indique si tooltip nécessaire
   */
  static truncateLabel(text: string): { display: string; showTooltip: boolean } {
    if (!text || text.length <= STYLE_CONSTANTS.MAX_LABEL_LENGTH) {
      return { display: text, showTooltip: false };
    }
    
    const truncated = text.substring(0, STYLE_CONSTANTS.MAX_LABEL_LENGTH - STYLE_CONSTANTS.TRUNCATE_SUFFIX.length) + STYLE_CONSTANTS.TRUNCATE_SUFFIX;
    
    console.log(`🔤 R8: Libellé tronqué: "${text}" → "${truncated}"`);
    
    return {
      display: truncated,
      showTooltip: true
    };
  }
  
  /**
   * R8: Assure la taille minimale des nœuds (24×24px)
   */
  static ensureMinNodeSize(calculatedSize: number): number {
    const minSize = Math.max(calculatedSize, STYLE_CONSTANTS.MIN_NODE_SIZE);
    
    if (calculatedSize < STYLE_CONSTANTS.MIN_NODE_SIZE) {
      console.log(`📐 R8: Taille ajustée: ${calculatedSize}px → ${minSize}px (minimum requis)`);
    }
    
    return minSize;
  }
  
  /**
   * R8: Calcule les dimensions des nœuds en respectant le minimum
   */
  static calculateNodeDimensions(value: number, maxValue: number, baseSize: number): { width: number; height: number } {
    // Calcul proportionnel
    const ratio = maxValue > 0 ? value / maxValue : 0;
    const calculatedHeight = Math.max(baseSize * ratio, STYLE_CONSTANTS.MIN_NODE_HEIGHT);
    
    return {
      width: this.ensureMinNodeSize(baseSize),
      height: this.ensureMinNodeSize(calculatedHeight)
    };
  }
  
  /**
   * R8: Valide la conformité WCAG AA d'une couleur
   * Vérifie que la couleur a un contraste suffisant
   */
  static validateWCAGContrast(colorKey: string): boolean {
    const validColors = Object.keys(STYLE_CONSTANTS.WCAG_COLORS);
    const isValid = validColors.includes(colorKey);
    
    if (!isValid) {
      console.warn(`⚠️ R8: Couleur ${colorKey} non conforme WCAG AA`);
    }
    
    return isValid;
  }
  
  /**
   * R8: Retourne une couleur conforme WCAG AA
   */
  static getWCAGColor(colorKey: keyof typeof STYLE_CONSTANTS.WCAG_COLORS): string {
    return STYLE_CONSTANTS.WCAG_COLORS[colorKey];
  }
  
  /**
   * Génère les styles CSS pour un nœud selon R8
   */
  static getNodeStyle(options: {
    width: number;
    height: number;
    isSelected?: boolean;
    isHovered?: boolean;
    level?: number;
  }): React.CSSProperties {
    
    const { width, height, isSelected, isHovered, level } = options;
    
    // Couleur selon le niveau (adaptation UX existante)
    let backgroundColor: string;
    switch (level) {
      case 0:
        backgroundColor = this.getWCAGColor('PRIMARY');
        break;
      case 1:
        backgroundColor = this.getWCAGColor('SECONDARY');
        break;
      case 2:
        backgroundColor = this.getWCAGColor('WARNING');
        break;
      default:
        backgroundColor = this.getWCAGColor('TEXT_SECONDARY');
    }
    
    // États interactifs
    if (isSelected) {
      backgroundColor = this.getWCAGColor('SELECTED');
    } else if (isHovered) {
      backgroundColor = this.getWCAGColor('HOVER');
    }
    
    return {
      width: this.ensureMinNodeSize(width),
      height: this.ensureMinNodeSize(height),
      backgroundColor,
      borderRadius: STYLE_CONSTANTS.SPACING.SMALL,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      filter: isHovered ? 'drop-shadow(3px 3px 4px rgba(0,0,0,0.3))' : 'drop-shadow(2px 2px 3px rgba(0,0,0,0.2))',
      minWidth: STYLE_CONSTANTS.MIN_NODE_WIDTH,
      minHeight: STYLE_CONSTANTS.MIN_NODE_HEIGHT
    };
  }
  
  /**
   * Génère les styles pour les libellés selon R8
   */
  static getLabelStyle(options: {
    fontSize?: keyof typeof STYLE_CONSTANTS.TYPOGRAPHY.FONT_SIZE;
    isSecondary?: boolean;
  } = {}): React.CSSProperties {
    
    const { fontSize = 'MEDIUM', isSecondary = false } = options;
    
    return {
      fontFamily: STYLE_CONSTANTS.TYPOGRAPHY.FONT_FAMILY,
      fontSize: STYLE_CONSTANTS.TYPOGRAPHY.FONT_SIZE[fontSize],
      fontWeight: STYLE_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
      color: isSecondary ? this.getWCAGColor('TEXT_SECONDARY') : this.getWCAGColor('TEXT'),
      textShadow: '1px 1px 2px rgba(255,255,255,0.8)' // Améliore la lisibilité
    };
  }
  
  /**
   * Génère les styles pour les tooltips selon R8
   */
  static getTooltipStyle(): React.CSSProperties {
    return {
      maxWidth: STYLE_CONSTANTS.TOOLTIP.MAX_WIDTH,
      padding: STYLE_CONSTANTS.TOOLTIP.PADDING,
      borderRadius: STYLE_CONSTANTS.TOOLTIP.BORDER_RADIUS,
      backgroundColor: STYLE_CONSTANTS.TOOLTIP.BACKGROUND,
      color: STYLE_CONSTANTS.TOOLTIP.TEXT_COLOR,
      fontSize: STYLE_CONSTANTS.TYPOGRAPHY.FONT_SIZE.SMALL,
      fontFamily: STYLE_CONSTANTS.TYPOGRAPHY.FONT_FAMILY,
      fontWeight: STYLE_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.NORMAL,
      zIndex: STYLE_CONSTANTS.TOOLTIP.Z_INDEX,
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      pointerEvents: 'none' as const
    };
  }
  
  /**
   * Valide qu'un élément respecte les règles R8
   */
  static validateR8Compliance(element: {
    width?: number;
    height?: number;
    labelLength?: number;
    colorKey?: string;
  }): { isCompliant: boolean; violations: string[] } {
    
    const violations: string[] = [];
    
    // Vérifier la taille minimale
    if (element.width && element.width < STYLE_CONSTANTS.MIN_NODE_WIDTH) {
      violations.push(`Largeur ${element.width}px < minimum requis ${STYLE_CONSTANTS.MIN_NODE_WIDTH}px`);
    }
    
    if (element.height && element.height < STYLE_CONSTANTS.MIN_NODE_HEIGHT) {
      violations.push(`Hauteur ${element.height}px < minimum requis ${STYLE_CONSTANTS.MIN_NODE_HEIGHT}px`);
    }
    
    // Vérifier la longueur des libellés
    if (element.labelLength && element.labelLength > STYLE_CONSTANTS.MAX_LABEL_LENGTH) {
      violations.push(`Libellé ${element.labelLength} caractères > maximum ${STYLE_CONSTANTS.MAX_LABEL_LENGTH} (tooltip requis)`);
    }
    
    // Vérifier la conformité WCAG
    if (element.colorKey && !this.validateWCAGContrast(element.colorKey)) {
      violations.push(`Couleur ${element.colorKey} non conforme WCAG AA`);
    }
    
    const isCompliant = violations.length === 0;
    
    if (isCompliant) {
      console.log(`✅ R8: Conformité validée`);
    } else {
      console.warn(`⚠️ R8: Violations détectées:`, violations);
    }
    
    return { isCompliant, violations };
  }
} 