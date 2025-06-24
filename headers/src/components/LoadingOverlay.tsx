import { ReactElement, useState, useEffect, createElement } from "react";
import { Zap, Flame, Droplet, Wind } from "lucide-react";

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

// Constantes pour les animations
const ANIMATION_DURATIONS = {
    ENERGY_CYCLE: 3000,
};

// Composant pour les particules
const ParticleEffect = ({ position, color, delay }: { position: { x: number, y: number }, color: string, delay: number }) => {
    return (
        <div 
            className="particle-effect"
            style={{
                '--particle-color': color,
                '--particle-delay': `${delay}s`,
                '--particle-x': position.x,
                '--particle-y': position.y,
            } as React.CSSProperties}
        />
    );
};

// Création de positions pour les particules sur un cercle
const getParticlePositions = (count: number) => {
    return Array.from({ length: count }, (_, i) => {
        const angle = (i * 2 * Math.PI) / count;
        return {
            x: Math.cos(angle),
            y: Math.sin(angle),
            delay: i * 0.08
        };
    });
};

export const LoadingOverlay = ({ 
    isLoading, 
    message = "Chargement en cours"}: LoadingOverlayProps): ReactElement | null => {
    const [activeEnergy, setActiveEnergy] = useState(0);
    const particlePositions = getParticlePositions(12);
    
    // Types d'énergie avec leurs propriétés
    const energyTypes = [
        { name: 'Électricité', Icon: Zap, color: '#38a13c' },
        { name: 'Gaz', Icon: Flame, color: '#F9BE01' },
        { name: 'Eau', Icon: Droplet, color: '#3293f3' },
        { name: 'Air', Icon: Wind, color: '#66D8E6' }
    ];

    // Cycle automatique des énergies
    useEffect(() => {
        if (!isLoading) return;
        
        const energyInterval = setInterval(() => {
            setActiveEnergy(prev => (prev + 1) % energyTypes.length);
        }, ANIMATION_DURATIONS.ENERGY_CYCLE);
        
        return () => clearInterval(energyInterval);
    }, [isLoading, energyTypes.length]);

    if (!isLoading) return null;

    const currentEnergy = energyTypes[activeEnergy];
    const CurrentIcon = currentEnergy.Icon;

    return (
        <div className="loading-isolated fixed inset-0 bg-white/60 backdrop-blur-md z-50 flex items-center justify-center transition-all duration-300" style={{ position: 'fixed', display: 'flex' }}>
            <div className="loader-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div className="relative flex flex-col items-center" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Conteneur principal du loader */}
                    <div className="loader-circle" style={{ position: 'relative', display: 'flex' }}>
                        {/* Cercle de fond avec animation de pulse */}
                        <div className="loader-pulse-circle" style={{ '--pulse-color': currentEnergy.color } as React.CSSProperties} />
                        
                        {/* Cercle animé avec effet lumineux */}
                        <div className="loader-glow-circle" style={{ '--glow-color': currentEnergy.color } as React.CSSProperties} />
                        
                        {/* Points orbitaux */}
                        <div className="loader-orbit">
                            {[...Array(10)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="orbit-point" 
                                    style={{
                                        '--orbit-point-color': i % 4 === activeEnergy ? currentEnergy.color : '#e5e5e5',
                                        '--orbit-point-active': i % 4 === activeEnergy ? 1 : 0,
                                        '--orbit-point-angle': `${i * 36}deg`,
                                        '--orbit-point-delay': `${i * 0.1}s`
                                    } as React.CSSProperties}
                                />
                            ))}
                        </div>
                        
                        {/* Arrière-plan de l'icône */}
                        <div className="icon-background" style={{ '--icon-bg-color': currentEnergy.color } as React.CSSProperties} />
                        
                        {/* Icône centrale */}
                        <div className="icon-container">
                            <div className="icon-wrapper" key={currentEnergy.name}>
                                {/* Halo derrière l'icône */}
                                <div className="icon-halo" style={{ '--halo-color': currentEnergy.color } as React.CSSProperties} />
                                
                                {/* Icône qui pulse */}
                                <div className="icon-pulse" style={{ '--icon-color': currentEnergy.color } as React.CSSProperties}>
                                    <CurrentIcon className="w-10 h-10" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Particules qui émanent */}
                        {particlePositions.map((pos, i) => (
                            <ParticleEffect 
                                key={i} 
                                position={pos} 
                                color={currentEnergy.color} 
                                delay={pos.delay} 
                            />
                        ))}
                    </div>
                    
                    {/* Label d'énergie */}
                    <div className="energy-label" style={{ '--energy-color': currentEnergy.color } as React.CSSProperties}>
                        <div className="energy-indicator" style={{ '--indicator-color': currentEnergy.color } as React.CSSProperties} />
                        <div className="energy-name" style={{ '--name-color': currentEnergy.color } as React.CSSProperties}>
                            {currentEnergy.name}
                        </div>
                    </div>
                    
                    {/* Message principal */}
                    <div className="loading-message">
                        <span>{message}</span>
                    </div>
                    
                    {/* Indicateurs d'énergie */}
                    <div className="energy-indicators">
                        {energyTypes.map((energy, index) => (
                            <div 
                                key={index} 
                                className="energy-dot" 
                                style={{
                                    '--dot-color': index === activeEnergy ? energy.color : '#e5e5e5',
                                    '--dot-active': index === activeEnergy ? 1 : 0
                                } as React.CSSProperties}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};