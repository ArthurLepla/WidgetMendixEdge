/**
 * Types pour les structures de données Mendix
 */

// Type pour les valeurs de liste Mendix
export interface ListValue<T = any> {
    status: "available" | "loading" | "unavailable";
    items?: T[];
    refresh?: () => void;
}

// Type pour les valeurs d'attribut Mendix
export interface EditableValue<T> {
    value: T;
    displayValue: string;
    status: "available" | "loading" | "unavailable";
    readOnly: boolean;
    validation?: string;
    get: () => T;
    set: (value: T) => void;
    toJSON: () => T;
    toString: () => string;
}

// Type pour les attributs de liste Mendix
export interface ListAttributeValue<T> {
    get: (object: any) => EditableValue<T> | null;
}
