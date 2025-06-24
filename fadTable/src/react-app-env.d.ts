/// <reference types="react-scripts" />

// Déclaration pour les modules CSS
declare module "*.module.css" {
    const classes: { [key: string]: string };
    export default classes;
}

// Déclaration pour les modules SCSS (si vous en utilisez plus tard)
declare module "*.module.scss" {
    const classes: { [key: string]: string };
    export default classes;
}

// Vous pouvez ajouter d'autres déclarations ici si nécessaire
// pour les images, etc.
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
