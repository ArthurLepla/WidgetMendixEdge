import { createElement, useState, useEffect, useRef } from "react";
import { DownloadCloud, FileText, File} from "lucide-react";
import { downloadCsv, downloadExcel, downloadJson, Row } from "./ExportLogic";
import "./ExportMenu.css";

interface ExportMenuProps {
  data: Row[];
  filename?: string;
  className?: string;
  machineName?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ 
  data, 
  filename = "export",
  className = "",
  machineName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  
  // Gérer les exports
  const handleExport = (format: "csv" | "xlsx" | "json") => {
    if (format === "csv") downloadCsv(data, filename, machineName);
    if (format === "xlsx") downloadExcel(data, filename, machineName);
    if (format === "json") downloadJson(data, filename, machineName);
    setIsOpen(false);
  };
  
  // Déclencher l'ouverture/fermeture du menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className={`export-menu ${className}`} ref={menuRef}>
      {/* Bouton principal */}
      <button 
        onClick={toggleMenu}
        className={`export-button ${isOpen ? 'open' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="export-button-content">
          <DownloadCloud size={18} className="export-button-icon" />
          <span className="export-button-text">Exporter</span>
        </div>
      </button>
      
      {/* Menu déroulant */}
      {isOpen && (
        <div 
          className="dropdown-menu"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Indication sur les données agrégées */}
          <div className="dropdown-info-notice">
            <p>Les données exportées sont des valeurs agrégées.</p>
          </div>

          {/* Options d'export avec icônes colorées */}
          <div className="dropdown-content">
            <button 
              onClick={() => handleExport("csv")}
              className="dropdown-item"
              role="menuitem"
            >
              <div className="dropdown-item-icon-wrapper blue">
                <FileText size={16} className="icon-blue" />
              </div>
              <div className="dropdown-item-content">
                <span className="dropdown-item-title">CSV</span>
                <span className="dropdown-item-description">Format texte</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleExport("xlsx")}
              className="dropdown-item"
              role="menuitem"
            >
              <div className="dropdown-item-icon-wrapper green">
                <File size={16} className="icon-green" />
              </div>
              <div className="dropdown-item-content">
                <span className="dropdown-item-title">Excel</span>
                <span className="dropdown-item-description">Format Excel</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleExport("json")}
              className="dropdown-item"
              role="menuitem"
            >
              <div className="dropdown-item-icon-wrapper purple">
                <FileText size={16} className="icon-purple" />
              </div>
              <div className="dropdown-item-content">
                <span className="dropdown-item-title">JSON</span>
                <span className="dropdown-item-description">Format développeur</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};