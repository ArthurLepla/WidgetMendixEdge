/* eslint-disable linebreak-style */
/* eslint-disable prettier/prettier */
import * as React from "react";
import { createElement } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("tw-p-3", className)}
      locale={fr}
      classNames={{
        months: "tw-flex tw-flex-col sm:tw-flex-row tw-space-y-4 sm:tw-space-x-4 sm:tw-space-y-0",
        month: "tw-space-y-4",
        caption: "tw-flex tw-justify-center tw-pt-1 tw-relative tw-items-center",
        caption_label: " tw-font-medium",
        nav: "tw-space-x-1 tw-flex tw-items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "tw-h-12 tw-w-12 tw-bg-transparent tw-p-0 tw-opacity-80 hover:tw-opacity-100 tw-border-2 tw-border-primary"
        ),
        nav_button_previous: "tw-absolute tw-left-1",
        nav_button_next: "tw-absolute tw-right-1",
        table: "tw-w-full tw-border-collapse tw-space-y-1",
        head_row: "tw-flex",
        head_cell: cn(
          "tw-text-muted-foreground tw-rounded-md tw-w-10 tw-font-normal tw-text-base",
          "tw-flex tw-items-center tw-justify-center"
        ),
        row: "tw-flex tw-w-full tw-mt-2",
        cell: cn(
          "tw-h-10 tw-w-10 tw-text-center tw-text-sm tw-p-0 tw-relative",
          "tw-flex tw-items-center tw-justify-center",
          "[&:has([aria-selected].day-range-end)]:tw-rounded-r-md",
          "[&:has([aria-selected].day-outside)]:tw-bg-accent/50",
          "[&:has([aria-selected])]:tw-bg-accent",
          "first:[&:has([aria-selected])]:tw-rounded-l-md",
          "last:[&:has([aria-selected])]:tw-rounded-r-md",
          "focus-within:tw-relative focus-within:tw-z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "tw-h-10 tw-w-10 tw-p-0 tw-font-normal aria-selected:tw-opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary hover:tw-text-primary-foreground focus:tw-bg-primary focus:tw-text-primary-foreground",
        day_today: "tw-bg-accent tw-text-accent-foreground",
        day_outside:
          "day-outside tw-text-muted-foreground tw-opacity-50 aria-selected:tw-bg-accent/50 aria-selected:tw-text-muted-foreground aria-selected:tw-opacity-30",
        day_disabled: "tw-text-muted-foreground tw-opacity-50",
        day_range_middle:
          "aria-selected:tw-bg-accent aria-selected:tw-text-accent-foreground",
        day_hidden: "tw-invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="tw-h-8 tw-w-8 tw-text-primary" />,
        IconRight: () => <ChevronRight className="tw-h-8 tw-w-8 tw-text-primary" />,
      }}
      weekStartsOn={1}
      formatters={{
        formatCaption: (date) => {
          return format(date, "MMMM yyyy", { locale: fr });
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar }; 