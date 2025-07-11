// Configuration globale du widget PDFReportWidget

// Constantes de conversion et formatage
export const KWH_TO_MWH_THRESHOLD = 1000;
export const MWH_DECIMAL_PLACES = 2;
export const KWH_DECIMAL_PLACES = 1;

// Constantes pour la pagination PDF
export const MAX_ROWS_PER_PAGE = 17;
export const TOLERANCE_OVERFLOW = 2; // On accepte 2 lignes de dépassement pour éviter les divisions ridicules
export const MIN_CHUNK_SIZE = 4; // Taille minimale d'un chunk pour éviter les chunks ridicules
export const ROWS_FOR_SECTION_TITLE = 1;
export const ROWS_FOR_TABLE_TITLE = 1;
export const ROWS_FOR_TABLE_HEADER = 1;
export const ROWS_FOR_TABLE_TOTAL = 1;
export const ROWS_FOR_SPACING = 1;

// Palette de couleurs selon les guidelines UI/UX
export const palette = {
    primary: "#18213e",
    electric: "#38a13c", 
    gas: "#f9be01",
    water: "#3293f3",
    air: "#66d8e6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    gray: {
        50: "#f9fafb",
        100: "#f3f4f6", 
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827"
    }
};

// Animation variants pour Framer Motion
export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeOut" }
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: "easeOut" }
};

// Nouveaux variants pour des transitions plus fluides
export const slideInLeft = {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: 0.4, ease: "easeOut" }
};

export const slideInRight = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.4, ease: "easeOut" }
};

export const bounceIn = {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
        opacity: 1, 
        scale: 1,
        transition: { 
            type: "spring", 
            stiffness: 260, 
            damping: 20 
        }
    },
    exit: { opacity: 0, scale: 0.3 },
    transition: { duration: 0.2 }
};

export const staggerChildren = {
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export const rotateIn = {
    initial: { opacity: 0, rotate: -180, scale: 0.5 },
    animate: { 
        opacity: 1, 
        rotate: 0, 
        scale: 1,
        transition: { 
            type: "spring", 
            stiffness: 200, 
            damping: 15 
        }
    },
    exit: { opacity: 0, rotate: 180, scale: 0.5 }
};

// Variants pour les micro-interactions
export const hoverScale = {
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
};

export const tapScale = {
    scale: 0.95,
    transition: { duration: 0.1, ease: "easeInOut" }
};

export const buttonHover = {
    scale: 1.05,
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    transition: { duration: 0.2, ease: "easeOut" }
};

export const buttonTap = {
    scale: 0.95,
    transition: { duration: 0.1, ease: "easeInOut" }
};

// Variants pour les transitions d'état
export const stateTransition = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
            duration: 0.5, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    },
    exit: { 
        opacity: 0, 
        y: -20, 
        scale: 0.95,
        transition: { duration: 0.3, ease: "easeIn" }
    }
};

// Variants pour les layout animations
export const layoutTransition = {
    layout: true,
    transition: {
        layout: { duration: 0.4, ease: "easeInOut" },
        opacity: { duration: 0.3 }
    }
};

// CSS pour l'animation de rotation (spinning)
export const spinKeyframes = `
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

@keyframes slideInFromLeft {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`; 