import { ReactElement, useCallback, createElement } from "react";
import { ActionValue, DynamicValue, WebIcon } from "mendix";
import { Icon } from "mendix/components/web/Icon";
import { cn } from "../../lib/utils";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { LoadingService } from "../services/LoadingService";
import { Root as SegmentedControl, List, Trigger } from "./segmented-control";

export interface ButtonGroupProps {
    className?: string;
    buttons: Array<{
        label: string;
        icon?: DynamicValue<WebIcon>;
        action?: ActionValue;
        defaultSelected: boolean;
    }>;
    value: string;
    onChange: (value: string) => void;
    useSimpleLoader?: boolean;
    loadingMessage?: string;
}

export function ButtonGroup({
    buttons,
    value,
    onChange,
    className,
    useSimpleLoader = false,
    loadingMessage = "Chargement en cours"
}: ButtonGroupProps): ReactElement {
    const isLoading = LoadingService.isLoading();

    const handleValueChange = useCallback(
        (newValue: string) => {
            onChange(newValue);
            const button = buttons.find(b => b.label === newValue);
            if (button?.action?.canExecute) {
                LoadingService.executeAction(button.action, loadingMessage, useSimpleLoader);
            }
        },
        [onChange, buttons, loadingMessage, useSimpleLoader]
    );

    return (
        <div className={cn("button-group-container", className)}>
            <SegmentedControl value={value} onValueChange={handleValueChange}>
                <List>
                    {buttons.map(button => (
                        <Trigger
                            key={button.label}
                            value={button.label}
                            title={button.label}
                            disabled={button.action ? !button.action.canExecute : false}
                        >
                            {button.icon?.value && <Icon icon={button.icon.value} />}
                            {button.label}
                        </Trigger>
                    ))}
                </List>
            </SegmentedControl>
            <LoadingOverlay isLoading={isLoading} message={LoadingService.getMessage()} />
        </div>
    );
}