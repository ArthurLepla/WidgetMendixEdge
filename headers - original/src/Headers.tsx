import { ReactElement, createElement } from "react";
import { HeadersContainerProps } from "../typings/HeadersProps";
import { HeaderContainer } from "./components/HeaderContainer";
import "./ui/Headers.css";
import "./styles/loader.css";
// S'assurer que le service est importé dès le démarrage
import "./components/services/LoadingService";

export function Headers(props: HeadersContainerProps): ReactElement {
    return (
        <div className="tw-font-barlow">
            <HeaderContainer {...props} />
        </div>
    );
}