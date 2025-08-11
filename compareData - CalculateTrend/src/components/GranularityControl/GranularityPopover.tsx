import { createElement, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings, X } from "lucide-react";
import { GranularityControl, GranularityControlProps } from "./GranularityControl";
import { SegmentGroup } from '@ark-ui/react';
import "./GranularityPopover.css";

export interface GranularityPopoverProps extends GranularityControlProps {}

// Exemple minimal SegmentGroup Ark UI (doc officielle)
const FrameworkSegmentGroup = () => {
  const frameworks = ['React', 'Solid', 'Svelte', 'Vue'];
  const [value, setValue] = useState<string | null>('React');
  return (
    <SegmentGroup.Root value={value} onValueChange={e => setValue(e.value)}>
      <SegmentGroup.Indicator />
      {frameworks.map(framework => (
        <SegmentGroup.Item key={framework} value={framework}>
          <SegmentGroup.ItemText>{framework}</SegmentGroup.ItemText>
          <SegmentGroup.ItemControl />
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  );
};

export const GranularityPopover: React.FC<GranularityPopoverProps> = props => {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button 
          className="granularity-config-button" 
          aria-label="Configurer la granularité"
          disabled={props.isDisabled}
        >
          <Settings size={20} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="granularity-dialog-overlay" />
        <Dialog.Content className="granularity-dialog-content" aria-label="Configuration de la granularité">
          <div className="granularity-popover-header">
            <h2 className="granularity-popover-title">Configuration de la granularité</h2>
            <Dialog.Close asChild>
              <button className="granularity-popover-close" aria-label="Fermer">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          <div className="granularity-popover-content">
            {/* SegmentGroup Ark UI minimal (démo) */}
            <FrameworkSegmentGroup />
            {/* Contrôle métier */}
            <GranularityControl {...props} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}; 