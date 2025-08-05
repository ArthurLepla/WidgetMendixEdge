import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";
import { AdminPanelPreviewProps } from "../typings/AdminPanelProps";

export function preview({ sampleText }: AdminPanelPreviewProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText} />;
}

export function getPreviewCss(): string {
    return require("./ui/AdminPanel.css");
}
