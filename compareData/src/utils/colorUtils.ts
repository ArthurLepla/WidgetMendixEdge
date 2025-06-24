// Génère un hash déterministe à partir d'une string
const stringHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convertit en entier 32bits
    }
    return Math.abs(hash);
};

// Palette de base avec 16 couleurs soigneusement choisies
const BASE_PALETTE = [
    '#38a13c', '#3293f3', '#F9BE01', '#66D8E6',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEEAD', '#D4A5A5', '#9A9EAB', '#A8E6CE',
    '#FF9F65', '#6C5B7B', '#F8B195', '#355C7D'
];

// Génération dynamique de couleurs complémentaires
const generateComplementaryColors = (baseSize: number, totalSize: number): string[] => {
    const colors: string[] = [];
    const goldenRatio = 0.618033988749895;
    
    for (let i = baseSize; i < totalSize; i++) {
        const hue = (i * goldenRatio * 360) % 360;
        const saturation = 65 + Math.random() * 25; // 65-90%
        const lightness = 45 + Math.random() * 15; // 45-60%
        colors.push(`hsl(${hue},${saturation}%,${lightness}%)`);
    }
    
    return colors;
};

// Palette étendue à 60 couleurs (16 fixes + 44 générées)
export const COLOR_PALETTE = [
    ...BASE_PALETTE,
    ...generateComplementaryColors(BASE_PALETTE.length, 60)
];

// Version alternative avec couleurs prédéfinies soigneusement sélectionnées
// export const COLOR_PALETTE = [
//   '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
//   '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78',
//   '#98df8a', '#ff9896', '#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7',
//   '#dbdb8d', '#9edae5', '#393b79', '#637939', '#8c6d31', '#843c39',
//   '#7b4173', '#5254a3', '#6b6ecf', '#9c9ede', '#3182bd', '#6baed6',
//   '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2',
//   '#31a354', '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8',
//   '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9',
//   '#9c9ede', '#b5cf6b', '#cedb9c', '#e7ba52', '#e7cb94', '#843c39',
//   '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd'
// ];

export const getColorForName = (machineName: string): string => {
    const hash = stringHash(machineName);
    const baseColor = BASE_PALETTE[hash % BASE_PALETTE.length];
    
    // Si on dépasse la palette de base, ajouter une variation lumineuse
    if (COLOR_PALETTE.length > BASE_PALETTE.length) {
        const variation = COLOR_PALETTE[
            BASE_PALETTE.length + (hash % (COLOR_PALETTE.length - BASE_PALETTE.length))
        ];
        return hash % 2 === 0 ? baseColor : variation;
    }
    
    return baseColor;
}; 