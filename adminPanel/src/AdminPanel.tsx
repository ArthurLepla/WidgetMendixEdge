import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

import { AdminPanelContainerProps } from "../typings/AdminPanelProps";

import "./ui/AdminPanel.css";

export function AdminPanel({ sampleText }: AdminPanelContainerProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText ? sampleText : "World"} />;
}
