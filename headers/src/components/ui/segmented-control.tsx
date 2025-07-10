import { createElement } from "react";
import * as React from "react";
import { Slottable } from "@radix-ui/react-slot";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import mergeRefs from "merge-refs";
import { useTabObserver } from "../../hooks/use-tab-observer";
import { cn } from "../../lib/utils";

const SegmentedControlRoot = TabsPrimitive.Root;
SegmentedControlRoot.displayName = "SegmentedControlRoot";

const SegmentedControlList = React.forwardRef<
    React.ComponentRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
        floatingBgClassName?: string;
    }
>(({ children, className, floatingBgClassName, ...rest }, forwardedRef) => {
    const [lineStyle, setLineStyle] = React.useState({ width: 0, left: 0 });

    const { mounted, listRef } = useTabObserver({
        onActiveTabChange: (_, activeTab) => {
            const { offsetWidth: width, offsetLeft: left } = activeTab;
            setLineStyle({ width, left });
        }
    });

    return (
        <TabsPrimitive.List
            ref={mergeRefs(forwardedRef, listRef)}
            className={cn(
                "tw-relative tw-isolate tw-grid tw-w-full tw-auto-cols-fr tw-grid-flow-col tw-gap-1 tw-rounded-lg tw-bg-muted tw-p-1",
                className
            )}
            {...rest}
        >
            <Slottable>{children}</Slottable>

            {/* floating bg */}
            <div
                className={cn(
                    "tw-absolute tw-inset-y-1 tw-left-0 -tw-z-10 tw-rounded-md tw-bg-background tw-shadow-sm tw-transition-transform tw-duration-300",
                    {
                        "tw-hidden": !mounted
                    },
                    floatingBgClassName
                )}
                style={{
                    transform: `translate3d(${lineStyle.left}px, 0, 0)`,
                    width: `${lineStyle.width}px`,
                    transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)"
                }}
                aria-hidden="true"
            />
        </TabsPrimitive.List>
    );
});
SegmentedControlList.displayName = "SegmentedControlList";

const SegmentedControlTrigger = React.forwardRef<
    React.ComponentRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...rest }, forwardedRef) => {
    return (
        <TabsPrimitive.Trigger
            ref={forwardedRef}
            className={cn(
                // base
                "tw-peer",
                "tw-relative tw-z-10 tw-h-16 tw-whitespace-nowrap tw-rounded-md tw-px-6 tw-text-2xl tw-text-primary tw-outline-none",
                "tw-flex tw-items-center tw-justify-center tw-gap-2",
                "tw-transition-all tw-duration-200 tw-ease-out",

                // focus
                "focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2",
                
                // active - stronger primary color and bold
                "data-[state=active]:tw-text-primary data-[state=active]:tw-font-semibold data-[state=active]:tw-cursor-default",
                
                // disabled
                "data-[disabled]:tw-opacity-50 data-[disabled]:tw-cursor-not-allowed",
                className
            )}
            style={{
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                const target = e.currentTarget;
                if (target.getAttribute('data-state') !== 'active' && !target.hasAttribute('data-disabled')) {
                    target.style.backgroundColor = '#e5e7eb'; // gray-200
                }
            }}
            onMouseLeave={(e) => {
                const target = e.currentTarget;
                if (target.getAttribute('data-state') !== 'active') {
                    target.style.backgroundColor = 'transparent';
                }
            }}
            {...rest}
        />
    );
});
SegmentedControlTrigger.displayName = "SegmentedControlTrigger";

const SegmentedControlContent = React.forwardRef<
    React.ComponentRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ ...rest }, forwardedRef) => {
    return <TabsPrimitive.Content ref={forwardedRef} {...rest} />;
});
SegmentedControlContent.displayName = "SegmentedControlContent";

export {
    SegmentedControlRoot as Root,
    SegmentedControlList as List,
    SegmentedControlTrigger as Trigger,
    SegmentedControlContent as Content
}; 