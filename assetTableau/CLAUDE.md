# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm install` - Install dependencies (use `--legacy-peer-deps` for NPM v7+)
- `npm start` - Watch for changes and auto-bundle to `dist/` and Mendix test project
- `npm run dev` - Start web development server
- `npm run build` - Build the widget for production
- `npm run lint` - Run linting checks
- `npm run lint:fix` - Fix linting issues automatically
- `npm run release` - Create a release build

## Testing
- Tests are located in `src/components/__tests__/`
- Run tests with standard Jest commands via the Mendix toolchain
- FSM (Finite State Machine) tests ensure 100% coverage of state transitions

## Architecture

This is a Mendix pluggable widget implementing a hierarchical asset management tableau with industrial data visualization capabilities.

### Core Architecture Patterns

**Hexagonal Architecture**: Domain types in `src/components/types.ts` follow hexagonal principles with business logic isolated from framework concerns.

**Finite State Machine**: Widget state managed via FSM pattern in `src/components/states.ts` with strict state transitions for data loading, editing, saving, and validation.

**Level-Based Hierarchy**: Supports up to 5 configurable hierarchy levels (Usine → Secteur → Atelier → ETH → Machine) with parent-child relationships.

### Key Components

- **Main Entry**: `src/AssetTableau.tsx` - Mendix container integration
- **Core Logic**: `src/components/AssetTableauComponent.tsx` - FSM-driven main component
- **Business Types**: `src/components/types.ts` - Domain models with AssetNode, DataSourceConfig
- **State Management**: `src/components/states.ts` - FSM with correlation IDs for observability
- **Hierarchy View**: `src/components/LevelBasedHierarchyView.tsx` - Level-based rendering
- **Toolbar**: `src/components/ModernToolbar.tsx` - Search, filters, and controls
- **Details Panel**: `src/components/EnhancedDetailsPanel.tsx` - Entity editing interface

### Data Flow Architecture

**Configuration-Driven**: Each hierarchy level configured via XML properties with separate name, parent, and unit attributes. Optional transient save attributes for staging edits.

**Mendix Integration**: Uses ListValue for data sources, ListAttributeValue for attributes, EditableValue for inline editing, and ObjectItem for entity manipulation.

**Dual-Mode Operation**: Dev mode shows all attributes, Prod mode shows only editable fields.

### Widget Configuration (AssetTableau.xml)

5 hierarchy levels each requiring:
- DataSource (ListValue) 
- Name/Parent/Unit attributes (ListAttributeValue)
- Optional save attributes (transient EditableValue)
- Level-specific save actions (microflows)

Permissions: allowEdit, allowDelete (dev only), allowCreate (dev only)
UI Options: showSearch, showFilters, expandedByDefault

### State Machine States
INITIALIZING → LOADING_DATA → READY ⟷ EDITING → SAVING → READY
Error states: ERROR (with RESET transition back to LOADING_DATA)
Validation: VALIDATING → READY

### Dependencies
- React 18.x with TypeScript
- lucide-react for icons  
- classnames for conditional CSS
- Mendix Widgets Framework for platform integration