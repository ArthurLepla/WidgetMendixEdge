# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a multi-widget Mendix development repository containing multiple pluggable widgets for an energy management system. Each widget is in its own directory and operates independently.

### Key Widgets

- **advancedSankeyFinal**: D3-based Sankey diagram widget for visualizing energy flow hierarchies
- **compareData**: Energy consumption comparison widget with chart visualization  
- **detailswidget**: Detailed energy consumption analytics with IPE (Indice de Performance Énergétique) calculations
- **PDFRapportMWF**: PDF report generation widget for energy data
- **SyntheseWidget**: Energy synthesis dashboard with multiple chart types
- **headers**: Header navigation component with date range selection and filters
- **assetTableau**: Asset hierarchy table management widget
- **acceuil**: Homepage widget with KPI displays and quick navigation
- **fadTable**: Hierarchical energy data table widget

## Development Commands

All widgets use the Mendix pluggable widgets tools. Navigate to any widget directory first, then run:

### Standard Commands (Available in all widgets)
```bash
npm install              # Install dependencies (use --legacy-peer-deps for npm v7+)
npm start               # Watch mode - bundles to dist/ and test project
npm run dev             # Development server mode
npm run build           # Production build
npm run lint            # Lint TypeScript and React code
npm run lint:fix        # Auto-fix linting issues
npm run release         # Create release package
```

### Widget-Specific Commands

**advancedSankeyFinal**:
```bash
npm run test            # Run Jest tests
npm run test:coverage   # Run tests with coverage
```

**detailswidget**:
```bash
npm run test            # Run Vitest tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Coverage reports
npm run debug:widget    # Debug mode with test UI and Storybook
```

**acceuil, SyntheseWidget, headers**:
```bash
npm run watch:tailwind  # Watch Tailwind CSS compilation
```

## Architecture

### Widget Development Pattern
Each widget follows the standard Mendix pluggable widget structure:
- `src/[WidgetName].tsx` - Main widget component
- `src/[WidgetName].xml` - Widget configuration XML
- `src/components/` - React components
- `src/utils/` - Utility functions
- `src/ui/` - CSS and styling
- `typings/[WidgetName]Props.d.ts` - TypeScript prop definitions

### Energy Management System Components

**Energy Types**: The system handles four energy types consistently across widgets:
- `elec` (electricity) - kWh, green theme
- `gaz` (gas) - m³, yellow theme  
- `eau` (water) - m³, blue theme
- `air` (compressed air) - m³, gray theme

**Data Processing**: 
- Uses `Big.js` for precise decimal calculations
- Smart unit conversion system in `utils/smartUnitUtils.ts`
- IPE (Energy Performance Index) calculations for efficiency metrics
- Time-series data processing with granularity controls

**Common Utilities**:
- Energy configuration objects with colors, icons, and units
- Date range selection components
- Export functionality (Excel, PDF)
- Debug logging systems for development

### Key Technical Patterns

**State Management**: 
- React hooks for local component state
- Feature toggles using custom hooks (`use-feature-toggle.ts`)
- Context providers for complex state (loading, navigation)

**Data Validation**:
- Mendix ValueStatus checking for data availability
- Type-safe data processing with detailed error handling
- Smart fallback systems for missing energy data

**Styling**:
- CSS Modules for component-scoped styles
- Tailwind CSS for utility-first styling (newer widgets)
- Consistent design system across widgets
- Responsive design following mobile-first principles

## Testing

**advancedSankeyFinal**: Uses Jest with React Testing Library
**detailswidget**: Uses Vitest with React Testing Library and Storybook

Test files are located in `src/components/__tests__/` or `src/test/`.

## UI/UX Guidelines

This repository includes comprehensive UI/UX cursor rules emphasizing:
- WCAG 2.1 AA accessibility standards
- Mobile-first responsive design
- Consistent visual hierarchy and typography
- Touch-friendly interfaces (44px minimum touch targets)
- Progressive disclosure patterns
- Clear error messaging and loading states

## Mendix Integration

Widgets integrate with Mendix through:
- Props definitions in TypeScript definition files
- XML configuration for Studio Pro
- Mendix data sources and microflows
- ValueStatus handling for reactive data updates

## Development Notes

- Each widget has its own `node_modules` and can be developed independently  
- The `dist/` folder contains built widget packages for Mendix deployment
- Use `pluggable-widgets-tools` for all build processes
- React 18.2.0 is pinned across all widgets for consistency
- TypeScript is used throughout with strict type checking