import { ReactElement, createElement, useCallback, useEffect, useState } from "react";
import { Zap, Flame, Droplets, Wind } from "lucide-react";

interface QuickNavCardsProps {
    onElectricityClick?: () => void;
    onGasClick?: () => void;
    onWaterClick?: () => void;
    onAirClick?: () => void;
    showElectricity?: boolean;
    showGas?: boolean;
    showWater?: boolean;
    showAir?: boolean;
    onLoadingChange?: (isLoading: boolean) => void;
}

export const QuickNavCards = (props: QuickNavCardsProps): ReactElement => {
    // État local pour suivre quelle action est en cours
    const [activeAction, setActiveAction] = useState<string | null>(null);
    
    // Effet pour écouter les changements de route/page
    useEffect(() => {
        // Fonction pour détecter les changements de page
        const handleRouteChange = () => {
            // Si une action était en cours, considérer qu'elle est terminée
            if (activeAction && props.onLoadingChange) {
                props.onLoadingChange(false);
                setActiveAction(null);
            }
        };
        
        // Écouter l'événement de chargement de page
        window.addEventListener('load', handleRouteChange);
        
        // Ajouter un temporisateur de sécurité pour éviter un loader infini
        // au cas où l'événement de navigation ne se déclencherait pas
        let safetyTimeout: number | null = null;
        
        if (activeAction) {
            safetyTimeout = window.setTimeout(() => {
                if (props.onLoadingChange) {
                    props.onLoadingChange(false);
                    setActiveAction(null);
                }
            }, 8000); // Timeout de sécurité plus long (8 secondes)
        }
        
        return () => {
            window.removeEventListener('load', handleRouteChange);
            if (safetyTimeout) {
                clearTimeout(safetyTimeout);
            }
        };
    }, [activeAction, props.onLoadingChange]);

    const handleCardClick = useCallback((cardId: string, action?: () => void) => {
        if (action) {
            // Activer le loader et enregistrer l'action en cours
            if (props.onLoadingChange) {
                props.onLoadingChange(true);
                setActiveAction(cardId);
            }
            
            // Exécuter l'action de navigation
            action();
        }
    }, [props.onLoadingChange]);

    const cards = [
        {
            id: "electricity",
            title: "Électricité",
            description: "Suivi de la consommation électrique",
            icon: <Zap className="se-w-8 se-h-8 se-text-yellow-500" />,
            onClick: props.onElectricityClick,
            show: props.showElectricity
        },
        {
            id: "gas",
            title: "Gaz",
            description: "Analyse de la consommation de gaz",
            icon: <Flame className="se-w-8 se-h-8 se-text-orange-500" />,
            onClick: props.onGasClick,
            show: props.showGas
        },
        {
            id: "water",
            title: "Eau",
            description: "Gestion de la consommation d'eau",
            icon: <Droplets className="se-w-8 se-h-8 se-text-blue-500" />,
            onClick: props.onWaterClick,
            show: props.showWater
        },
        {
            id: "air",
            title: "Air",
            description: "Qualité et circulation de l'air",
            icon: <Wind className="se-w-8 se-h-8 se-text-green-500" />,
            onClick: props.onAirClick,
            show: props.showAir
        }
    ];

    const visibleCards = cards.filter(card => card.show);
    const gridCols = {
        1: "se-grid-cols-1",
        2: "se-grid-cols-2",
        3: "se-grid-cols-3",
        4: "se-grid-cols-4"
    };

    return (
        <div className={`se-grid ${gridCols[visibleCards.length as 1 | 2 | 3 | 4]} se-gap-6`}>
            {visibleCards.map(card => (
                <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id, card.onClick)}
                    className="se-bg-white se-rounded-xl se-shadow-lg se-p-6 
                              se-border se-border-[var(--border-color)]
                              se-transition-all se-duration-300 se-ease-in-out
                              se-transform hover:se-shadow-xl hover:se-scale-105
                              se-cursor-pointer"
                >
                    <div className="se-flex se-flex-col se-items-center se-text-center">
                        <div className="se-p-3 se-rounded-full se-bg-gray-50 se-mb-4">
                            {card.icon}
                        </div>
                        <h3 className="se-text-2xl se-font-semibold se-mt-2 se-text-gray-800">
                            {card.title}
                        </h3>
                        <p className="se-mt-2 se-text-gray-600 se-text-sm">
                            {card.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};