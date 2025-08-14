import { ReactElement, createElement } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DeltaProps {
    value: number;
}

export function Delta({ value }: DeltaProps): ReactElement {
    const isUp = value >= 0;
    const Icon = isUp ? TrendingUp : TrendingDown;
    const color = isUp ? "#0f9d58" : "#d93025";
    return (
        <div className="flex items-center gap-1 text-xs" style={{ color }}>
            <Icon className="icon-sm" />
            {value === 0 ? "–" : `${value.toFixed(1)}%`}
        </div>
    );
}
