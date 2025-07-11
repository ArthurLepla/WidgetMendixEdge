declare module '*.ttf' {
    const content: string;
    export default content;
}

declare module '*.otf' {
    const content: string;
    export default content;
}

declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
} 