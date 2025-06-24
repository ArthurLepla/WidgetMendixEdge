import { createElement, useState, useEffect } from "react";
import { BarChart3, FileText, PieChart, PencilLine, ArrowRight} from "lucide-react";
import { motion } from "framer-motion";
import { ActionValue, DynamicValue, ListValue, ListAttributeValue, WebImage} from "mendix";
import Big from "big.js";
import "antd/dist/reset.css";
import "./ui/Acceuil.css";
import "./styles/loader.css";
import { KPISection } from "./components/KPISection";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { QuickNavCards } from "./components/QuickNavCards";
import { LoadingService } from "./components/services/LoadingService";

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: ActionValue;
    color: string;
}

interface CardProps {
    feature: Feature;
    isMain: boolean;
}

export interface Props {
    name: string;
    class: string;
    style?: object;
    tabIndex?: number;
    // Général
    title?: string;
    subtitle?: string;
    titleImage?: DynamicValue<WebImage>;

    // KPIs
    electricityDataSource?: ListValue;
    electricityValueAttribute?: ListAttributeValue<Big>;
    electricityUnit: "kWh" | "m3";
    
    gasDataSource?: ListValue;
    gasValueAttribute?: ListAttributeValue<Big>;
    gasUnit: "kWh" | "m3";
    
    waterDataSource?: ListValue;
    waterValueAttribute?: ListAttributeValue<Big>;
    waterUnit: "kWh" | "m3";
    
    airDataSource?: ListValue;
    airValueAttribute?: ListAttributeValue<Big>;
    airUnit: "kWh" | "m3";

    // QuickNav
    onElectricityNavClick?: ActionValue;
    onGasNavClick?: ActionValue;
    onWaterNavClick?: ActionValue;
    onAirNavClick?: ActionValue;
    showElectricityNav?: boolean;
    showGasNav?: boolean;
    showWaterNav?: boolean;
    showAirNav?: boolean;

    // Vue Synthétique
    syntheticViewDataSource?: ListValue;
    syntheticViewTitle?: string;
    syntheticViewDescription?: string;
    syntheticViewButtonText?: string;
    syntheticViewIcon?: React.ReactNode;
    onSyntheticViewClick?: ActionValue;

    // Vue Globale
    globalViewDataSource?: ListValue;
    globalViewTitle?: string;
    globalViewDescription?: string;
    globalViewIcon?: React.ReactNode;
    onGlobalViewClick?: ActionValue;

    // Vue Détaillée
    detailedViewDataSource?: ListValue;
    detailedViewTitle?: string;
    detailedViewDescription?: string;
    detailedViewIcon?: React.ReactNode;
    onDetailedViewClick?: ActionValue;

    // Rapports
    reportsDataSource?: ListValue;
    reportsTitle?: string;
    reportsDescription?: string;
    reportsIcon?: React.ReactNode;
    onReportsClick?: ActionValue;

    // Saisie de Données
    dataEntryDataSource?: ListValue;
    dataEntryTitle?: string;
    dataEntryDescription?: string;
    dataEntryIcon?: React.ReactNode;
    onDataEntryClick?: ActionValue;
}

function EnergyDashboardContent(props: Props): React.ReactElement {
    // État local pour suivre l'état de chargement
    const [isLoading, setIsLoading] = useState(false);
    
    // Abonnement au service de chargement
    useEffect(() => {
        const unsubscribe = LoadingService.subscribe(setIsLoading);
        
        // Écoute des événements de navigation
        const handleBeforeUnload = () => {
            // Si on quitte la page, on s'assure que le loader est désactivé
            LoadingService.endLoading();
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    
    // Fonction pour exécuter une action avec chargement
    const executeAction = (action?: ActionValue) => {
        if (action && action.canExecute) {
            LoadingService.startLoading();
            
            // Exécuter l'action
            action.execute();
            
            // On écoute les éventuels événements DOM qui pourraient indiquer que la 
            // navigation ou le chargement est terminé
            const checkLoading = () => {
                // L'état du document peut indiquer la fin du chargement
                if (document.readyState === 'complete') {
                    setTimeout(() => LoadingService.endLoading(), 500);
                    document.removeEventListener('readystatechange', checkLoading);
                }
            };
            
            document.addEventListener('readystatechange', checkLoading);
            
            // Timeout de sécurité pour éviter un loader infini
            setTimeout(() => {
                LoadingService.endLoading();
                document.removeEventListener('readystatechange', checkLoading);
            }, 8000);
        }
    };

    const Card = ({ feature, isMain }: CardProps) => {
        const handleClick = () => {
            executeAction(feature.onClick);
        };

        const baseClasses = "group bg-white shadow-[0_4px_20px_rgba(24,33,62,0.05)] transition-all duration-500 ease-out relative overflow-hidden text-left cursor-pointer h-full font-barlow border border-[rgba(24,33,62,0.06)] hover:border-[rgba(24,33,62,0.12)] hover:shadow-[0_8px_30px_rgba(24,33,62,0.12)]";
        const mainClasses = "p-12 rounded-[2rem] hover:scale-[1.02]";
        const secondaryClasses = "p-10 rounded-[1.5rem]";

        return (
            <motion.div
                onClick={handleClick}
                className={`${baseClasses} ${isMain ? mainClasses : secondaryClasses}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -5 }}
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#18213e] to-[rgba(24,33,62,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {isMain ? (
                    <div className="relative z-10 space-y-8">
                        <motion.div 
                            className="p-5 bg-[rgba(24,33,62,0.03)] w-fit rounded-2xl group-hover:bg-[rgba(24,33,62,0.06)] transition-colors duration-500"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            {feature.icon}
                        </motion.div>
                        <h2 className="text-3xl font-bold text-[#18213e] group-hover:text-[rgba(24,33,62,0.8)] transition-colors duration-500">
                            {feature.title}
                        </h2>
                        <p className="text-2xl text-[#374151] max-w-3xl font-normal leading-relaxed">
                            {feature.description}
                        </p>
                        <motion.div 
                            className="flex items-center text-[#18213e] font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 text-base"
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                        >
                            <span>En savoir plus</span>
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                        </motion.div>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="shrink-0">
                                <div className="p-5 bg-[rgba(24,33,62,0.03)] w-fit rounded-2xl group-hover:bg-[rgba(24,33,62,0.06)] transition-colors duration-500">
                                    {feature.icon}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-[#18213e] group-hover:text-[rgba(24,33,62,0.8)] transition-colors duration-500 mb-4">
                                    {feature.title}
                                </h2>
                                <p className="text-xl text-[#374151] font-normal leading-relaxed">
                                    {feature.description}
                                </p>
                                <motion.div 
                                    className="flex items-center text-[#18213e] font-medium mt-6 opacity-0 group-hover:opacity-100 transition-all duration-500 text-base"
                                    initial={{ x: -20 }}
                                    animate={{ x: 0 }}
                                >
                                    <span>En savoir plus</span>
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500" />
            </motion.div>
        );
    };

    const mainFeatures: Feature[] = [
        {
            icon: props.globalViewIcon || createElement(PieChart, { className: "w-10 h-10 text-[#18213e]" }),
            title: props.globalViewTitle || "Vue Globale",
            description: props.globalViewDescription || "Visualisez les flux énergétiques et identifiez vos plus gros consommateurs grâce au diagramme de Sankey",
            onClick: props.onGlobalViewClick,
            color: "indigo"
        },
        {
            icon: props.detailedViewIcon || createElement(BarChart3, { className: "w-10 h-10 text-[#18213e]" }),
            title: props.detailedViewTitle || "Vue Détaillée",
            description: props.detailedViewDescription || "Analysez en profondeur les consommations et comparez les performances entre différentes périodes",
            onClick: props.onDetailedViewClick,
            color: "indigo"
        }
    ];

    const secondaryFeatures: Feature[] = [
        {
            icon: props.reportsIcon || createElement(FileText, { className: "w-10 h-10 text-[#18213e]" }),
            title: props.reportsTitle || "Rapports",
            description: props.reportsDescription || "Générez et consultez vos rapports d'analyse énergétique",
            onClick: props.onReportsClick,
            color: "indigo"
        },
        {
            icon: props.dataEntryIcon || createElement(PencilLine, { className: "w-10 h-10 text-[#18213e]" }),
            title: props.dataEntryTitle || "Saisie de Données",
            description: props.dataEntryDescription || "Enregistrez et mettez à jour vos données de consommation",
            onClick: props.onDataEntryClick,
            color: "indigo"
        }
    ];

    const handleSyntheticViewClick = () => {
        executeAction(props.onSyntheticViewClick);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8 relative overflow-hidden">
            {/* Ajout du LoadingOverlay */}
            <LoadingOverlay isLoading={isLoading} />
            
            <div className="max-w-full mx-auto space-y-6 relative">
                {/* Header Section */}
                <div className="text-center mb-16">
                    {props.titleImage?.value && (
                        <div className="mb-8">
                            <img 
                                src={props.titleImage.value.uri} 
                                alt="Logo"
                                className="w-auto h-auto mx-auto object-contain"
                            />
                        </div>
                    )}
                    <div className="flex justify-center">
                        <p className="text-2xl md:text-3xl text-[#374151] max-w-3xl text-center leading-normal font-barlow">
                            {props.subtitle || "Découvrez et optimisez la performance énergétique de vos installations"}
                        </p>
                    </div>
                </div>

                {/* Ajout du titre pour la KPISection */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-[#18213e]">
                        Consommations du mois en cours
                    </h2>
                </div>

                {/* Remplacer la section KPI par le composant KPISection */}
                <KPISection
                    electricityDataSource={props.electricityDataSource}
                    electricityValueAttribute={props.electricityValueAttribute}
                    electricityUnit={props.electricityUnit}
                    gasDataSource={props.gasDataSource}
                    gasValueAttribute={props.gasValueAttribute}
                    gasUnit={props.gasUnit}
                    waterDataSource={props.waterDataSource}
                    waterValueAttribute={props.waterValueAttribute}
                    waterUnit={props.waterUnit}
                    airDataSource={props.airDataSource}
                    airValueAttribute={props.airValueAttribute}
                    airUnit={props.airUnit}
                />

                {/* Section QuickNavCards */}
                {(props.showElectricityNav || props.showGasNav || props.showWaterNav || props.showAirNav) && (
                    <div className="mb-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-semibold text-[#18213e]">
                                Accès rapide aux ressources
                            </h2>
                        </div>
                        <QuickNavCards
                            onElectricityClick={props.onElectricityNavClick?.canExecute ? 
                                () => executeAction(props.onElectricityNavClick) : undefined}
                            onGasClick={props.onGasNavClick?.canExecute ? 
                                () => executeAction(props.onGasNavClick) : undefined}
                            onWaterClick={props.onWaterNavClick?.canExecute ? 
                                () => executeAction(props.onWaterNavClick) : undefined}
                            onAirClick={props.onAirNavClick?.canExecute ? 
                                () => executeAction(props.onAirNavClick) : undefined}
                            showElectricity={props.showElectricityNav}
                            showGas={props.showGasNav}
                            showWater={props.showWaterNav}
                            showAir={props.showAirNav}
                        />
                    </div>
                )}

                {/* Enhanced Synthetic View */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="group bg-white p-8 md:p-12 rounded-3xl shadow-sm transition-all duration-300 ease-out hover:scale-[1.01] relative overflow-hidden cursor-pointer hover:shadow-lg mb-6 font-barlow border border-[rgba(24,33,62,0.08)] hover:border-[rgba(24,33,62,0.15)]"
                    onClick={handleSyntheticViewClick}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#18213e] to-[rgba(24,33,62,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Animated Visual Elements */}
                    <div className="absolute right-[10%] -translate-x-1/4 w-[32rem] h-[32rem]">
                        {/* Premier halo */}
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0]
                            }}
                            transition={{ 
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute inset-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00a6e9]/40 via-[#00a6e9]/20 to-[#00a6e9]/35 rounded-full blur-3xl" />
                        </motion.div>
                        
                        {/* Second halo avec timing décalé */}
                        <motion.div
                            animate={{ 
                                scale: [1.2, 1, 1.2],
                                rotate: [90, 0, 90]
                            }}
                            transition={{ 
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute inset-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00a6e9]/30 via-[#00a6e9]/15 to-[#00a6e9]/25 rounded-full blur-3xl" />
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-[60%]">
                        <div className="p-4 bg-[rgba(24,33,62,0.05)] w-fit rounded-xl group-hover:bg-[rgba(24,33,62,0.1)] transition-colors mb-8">
                            {props.syntheticViewIcon || createElement(PieChart, { className: "w-12 h-12 text-[#18213e]" })}
                        </div>
                        <h2 className="text-4xl font-bold text-[#18213e] mb-8">
                            {props.syntheticViewTitle || "Vue Synthétique"}
                        </h2>
                        <p className="text-2xl text-[#374151] font-normal mb-12">
                            {props.syntheticViewDescription || "Accédez à une vue d'ensemble détaillée de vos consommations et découvrez des opportunités d'optimisation pour chaque ressource énergétique."}
                        </p>
                        <motion.div 
                            whileHover={{ x: 10 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <button className="inline-flex items-center px-8 py-4 bg-[#18213e] hover:bg-[rgba(24,33,62,0.9)] text-white rounded-lg font-medium transition-colors text-xl font-barlow">
                                {props.syntheticViewButtonText || "Accéder à la synthèse"}
                                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Features */}
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                    {mainFeatures.map((feature, index) => (
                        <Card key={index} feature={feature} isMain={true} />
                    ))}
                </div>

                {/* Secondary Features */}
                <div className="grid md:grid-cols-2 gap-8">
                    {secondaryFeatures.map((feature, index) => (
                        <Card key={index} feature={feature} isMain={false} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Le composant principal reste inchangé
function EnergyDashboard(props: Props): React.ReactElement {
    return createElement("div", {
        className: `widget-energy-dashboard ${props.class}`,
        style: props.style,
        tabIndex: props.tabIndex,
        children: <EnergyDashboardContent {...props} />
    });
}

export default EnergyDashboard;