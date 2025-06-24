import { ReactElement, createElement } from "react";
// On importe plus HelloWorldSample car on ne l'utilise plus directement ici
// import { HelloWorldSample } from "./components/HelloWorldSample";
import { FadTablePreviewProps } from "../typings/FadTableProps";

// La fonction preview n'a plus besoin de déstructurer les props car on ne les utilise pas
// On préfixe props avec _ pour indiquer qu'il est volontairement inutilisé
export function preview(_props: FadTablePreviewProps): ReactElement {
    // On affiche un simple placeholder pour le moment
    // Plus tard, on pourrait essayer d'afficher une version très simplifiée du tableau
    // ou utiliser les props pour rendre la preview plus représentative.
    return <div>FAD Table Preview</div>;
    // Alternative si on veut garder le composant HelloWorldSample mais sans props:
    // return <HelloWorldSample />;
}

export function getPreviewCss(): string {
    return require("./ui/FadTable.css");
}
