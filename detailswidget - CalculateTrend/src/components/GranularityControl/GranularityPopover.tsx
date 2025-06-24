import { createElement, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings } from "lucide-react";
import { GranularityControl, GranularityControlProps } from "./GranularityControl";
import "./GranularityPopover.css";

export interface GranularityPopoverProps extends GranularityControlProps {}

export const GranularityPopover: React.FC<GranularityPopoverProps> = props => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="granularity-config-button" aria-label="Configurer la granularité">
          <Settings size={20} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="granularity-dialog-overlay" />
        <Dialog.Content className="granularity-dialog-content" aria-label="Configuration de la granularité">
          <GranularityControl {...props} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}; 