import { ReactElement, createElement } from "react";

interface NoSelectionProps {
    message?: string;
    title?: string;
}

export const NoSelection = ({ 
    message = "Veuillez sélectionner au moins une machine pour visualiser les données.",
    title = "Aucune machine sélectionnée"
}: NoSelectionProps): ReactElement => {
    return (
        <div className="card-base flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
            <div className="flex justify-center mb-6">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="100" 
                    height="100" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-blue-400"
                >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">{title}</h2>
            <p className="text-gray-600 max-w-md mb-6">{message}</p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 max-w-md">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Comment faire ?</h3>
                <p className="text-sm text-blue-700">
                    Pour visualiser les données, vous devez d'abord sélectionner une ou plusieurs machines 
                    à l'aide du sélecteur disponible dans votre application Mendix.
                </p>
            </div>
            <div className="flex space-x-4">
                <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                    onClick={() => {
                        window.alert("Pour sélectionner des machines, utilisez le filtre ou le sélecteur disponible dans votre application Mendix.");
                    }}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-2"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                    </svg>
                    Aide
                </button>
                <button 
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm flex items-center"
                    onClick={() => window.location.reload()}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-2"
                    >
                        <path d="M21 2v6h-6"></path>
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                        <path d="M3 22v-6h6"></path>
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                    </svg>
                    Actualiser
                </button>
            </div>
        </div>
    );
}; 