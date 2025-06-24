import { ReactElement, createElement } from "react";
import { AssetTableauContainerProps } from "../typings/AssetTableauProps";
import { AssetTableauComponent } from "./components/AssetTableauComponent";

import "./ui/AssetTableau.css";

export function AssetTableau(props: AssetTableauContainerProps): ReactElement {
    return <AssetTableauComponent {...props} />;
}
