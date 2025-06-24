# React Component Template for Mendix Widget

## Basic Structure

```typescript
import { ReactElement, useState, useCallback, useMemo } from "react";
import { Icon } from "lucide-react";

interface Props {
    // Component props
    className?: string;
    data?: any;
    onClick?: () => void;
}

export function MyComponent({ 
    className = "", 
    data,
    onClick 
}: Props): ReactElement {
    // State management
    const [state, setState] = useState<string>("");

    // Memoized calculations
    const processedData = useMemo(() => {
        // Process data here
        return data;
    }, [data]);

    // Event handlers
    const handleClick = useCallback(() => {
        if (onClick) {
            onClick();
        }
    }, [onClick]);

    return (
        <div 
            className={`p-4 rounded-lg shadow-md ${className}`}
            onClick={handleClick}
        >
            <Icon className="w-6 h-6 text-primary" />
            {/* Component content */}
        </div>
    );
}
```

## Best Practices

1. **Props**
   - Always type props with TypeScript
   - Provide default values when possible
   - Document complex props with JSDoc
   - Use prop destructuring

2. **Styling**
   - Use Tailwind classes
   - Accept className prop for customization
   - Structure classes logically
   - Use conditional classes with template literals

3. **State and Effects**
   - Use React hooks (useState, useEffect)
   - Separate logic into custom hooks
   - Properly cleanup in useEffect
   - Use appropriate dependency arrays

4. **Performance**
   - Use React.memo for presentational components
   - Optimize re-renders with useMemo/useCallback
   - Avoid unnecessary calculations in render
   - Implement proper memoization strategies
