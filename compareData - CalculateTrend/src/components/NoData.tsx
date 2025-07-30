import { ReactElement, createElement } from "react";

interface NoDataProps {
    message: string;
    title?: string;
    isNoMachineSelected?: boolean;
}

export const NoData = ({ message, title = "Aucune donnée disponible", isNoMachineSelected = false }: NoDataProps): ReactElement => {
    if (isNoMachineSelected) {
        return (
            <div className="card-base bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-4 rounded-full mb-5">
                        <svg 
                            className="w-12 h-12 text-blue-500"
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                        Aucune machine sélectionnée
                    </h2>
                    <div className="text-gray-600 mb-5">
                        Pour visualiser les données, veuillez sélectionner au moins une machine dans les options de filtrage.
                    </div>
                    <div className="bg-gray-50 p-3 w-full rounded-md border border-gray-200">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-600">Utilisez les filtres en haut de la page pour sélectionner les machines à analyser.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <svg 
                className="w-24 h-24 mb-4 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {title}
            </h3>
            <p className="text-gray-500 max-w-md">
                {message}
            </p>
        </div>
    );
}; 