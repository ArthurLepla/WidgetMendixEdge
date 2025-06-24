import { ReactElement, createElement } from "react";

interface ErrorCardProps {
    message: string;
    title?: string;
}

export const ErrorCard = ({ 
    message, 
    title = "Une erreur est survenue" 
}: ErrorCardProps): ReactElement => {
    return (
        <div className="card-base p-8 min-h-[400px] flex flex-col items-center justify-center">
            <div className="flex justify-center mb-6">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="80" 
                    height="80" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-red-500"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800 text-center">{title}</h2>
            <div className="text-gray-600 max-w-md text-center">
                <p>{message}</p>
            </div>
        </div>
    );
}; 