import { ReactElement, createElement, useCallback } from "react";
import { ActionValue, DynamicValue, WebIcon } from "mendix";
import Button from "antd/es/button";
import { Icon } from "mendix/components/web/Icon";
import { cn } from "../../lib/utils";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { LoadingService } from "../services/LoadingService";

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

    const handleButtonClick = useCallback((button: { label: string; action?: ActionValue }) => {
        onChange(button.label);
        
        if (button.action?.canExecute) {
            LoadingService.executeAction(
                button.action,
                loadingMessage,
                useSimpleLoader
            );
        }
    }, [onChange, loadingMessage, useSimpleLoader]);

    return (
        <div className={cn("button-group-container", className)}>
            <div className="button-group">
                <div className="button-group-buttons">
                    {buttons.map(button => {
                        const isSelected = button.label === value;
                        
                        return (
                            <Button
                                key={button.label}
                                type={isSelected ? "primary" : "default"}
                                onClick={() => handleButtonClick(button)}
                                className={cn(
                                    "button-group-item",
                                    isSelected && "ant-btn-primary"
                                )}
                                icon={button.icon?.value && <Icon icon={button.icon.value} />}
                                title={button.label}
                            >
                                {button.label}
                            </Button>
                        );
                    })}
                </div>
            </div>
            <LoadingOverlay 
                isLoading={isLoading}
                message={LoadingService.getMessage()}
            />
        </div>
    );
}