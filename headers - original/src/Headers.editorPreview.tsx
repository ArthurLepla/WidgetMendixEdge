import { ReactElement, createElement } from "react";
import { HeadersPreviewProps } from "../typings/HeadersProps";

export function preview(_props: HeadersPreviewProps): ReactElement {
    return <div>Preview du widget Headers</div>;
}

export function getPreviewCss(): string {
    return require("./ui/Headers.css");
}
