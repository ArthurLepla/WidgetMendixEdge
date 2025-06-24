import { ReactElement, createElement } from "react";
// import { HelloWorldSample } from "./components/HelloWorldSample";
import { SaisiePreviewProps } from "../typings/SaisieProps";

export function preview(props: SaisiePreviewProps): ReactElement {
    const { className, styleObject } = props;
    return (
        <div className={`widget-saisie ${className}`} style={styleObject}>
             Saisie Widget Preview
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/Saisie.css");
}
