import { ReactElement, createElement } from "react";
import { DynamicValue, WebImage } from "mendix";

export interface HeroProps {
    logoUrl?: DynamicValue<WebImage>;
    title?: string;
    subtitle?: string;
}

export function Hero({ logoUrl, title, subtitle }: HeroProps): ReactElement {
    return (
        <div className="se-flex se-flex-col se-items-center se-justify-center se-py-16 se-px-4">
            {logoUrl?.value && (
                <img src={logoUrl.value.uri} alt="Smart Energy Logo" className="se-w-64 se-h-auto se-mb-8" />
            )}
            {title && <h1 className="se-text-4xl se-font-bold se-text-smart-navy se-mb-4 se-text-center">{title}</h1>}
            {subtitle && <p className="se-text-xl se-text-gray-600 se-text-center">{subtitle}</p>}
        </div>
    );
}
