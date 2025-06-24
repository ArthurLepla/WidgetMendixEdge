/**
 * États de la machine à états finis (FSM) pour le widget Sankey
 * Respecte les règles R2 et R4 de navigation et d'affichage
 */

export enum SankeyState {
  /** Chargement initial des données */
  Loading = "Loading",
  
  /** Affichage de la racine et ses enfants directs (R4) */
  ShowingRoot = "ShowingRoot",
  
  /** Affichage d'un nœud et ses enfants directs (R4) */
  ShowingChildren = "ShowingChildren",
  
  /** Transition vers un nouveau nœud racine */
  NavigatingTo = "NavigatingTo",
  
  /** Erreur de traitement des données */
  Error = "Error",
  
  /** Aucune donnée pour la période sélectionnée */
  NoData = "NoData"
}

export interface SankeyContext {
  /** Racine actuelle (R2: nœud avec index minimal niveau 0, puis change au clic) */
  currentRoot: string | null;
  
  /** Tous les nœuds disponibles avant filtrage */
  availableNodes: ExtendedNode[];
  
  /** Nœuds visibles selon R4 (racine + enfants directs uniquement) */
  filteredNodes: ExtendedNode[];
  
  /** Liens visibles correspondant aux nœuds filtrés */
  filteredLinks: SimplifiedLink[];
  
  /** 🔧 NOUVEAU: Tous les liens disponibles (pour navigation hasChildren) */
  allLinks: SimplifiedLink[];
  
  /** Message d'erreur le cas échéant */
  error?: string;
  
  /** Historique de navigation pour breadcrumbs */
  navigationPath: Array<{ id: string; name: string }>;
}

export interface SankeyEvent {
  type: 'LOAD_DATA' | 'NODE_CLICK' | 'NAVIGATE_HOME' | 'ERROR' | 'NO_DATA';
  payload?: {
    nodeId?: string;
    nodes?: ExtendedNode[];
    links?: SimplifiedLink[];
    error?: string;
  };
}

// Types importés (éviter les erreurs de compilation)
import { ExtendedNode, SimplifiedLink } from '../types/SankeyTypes'; 