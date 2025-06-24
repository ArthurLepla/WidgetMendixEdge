import React from "react";
import { createElement, useState, useEffect, useRef } from "react";
import { DownloadCloud, FileText, File, X, Loader2 } from "lucide-react";
import { downloadCsv, downloadExcel, downloadJson, Row } from "./ExportLogic";
import "./ExportModal.css";

interface ExportModalProps {
  data: Row[];
  filename?: string;
  trigger?: React.ReactElement;
}

export const ExportModal: React.FC<ExportModalProps> = ({ 
  data, 
  filename = "export", 
  trigger 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<"csv" | "xlsx" | "json" | false>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && !loading) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Bloquer le scroll du body quand la modal est ouverte
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Restaurer le scroll du body
      document.body.style.overflow = "auto";
    };
  }, [isOpen, loading]);
  
  // Gérer la touche Escape pour fermer la modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !loading) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading]);
  
  const handleExport = (format: "csv" | "xlsx" | "json") => {
    setLoading(format);
    setTimeout(() => {
      if (format === "csv") downloadCsv(data, filename);
      if (format === "xlsx") downloadExcel(data, filename);
      if (format === "json") downloadJson(data, filename);
      setLoading(false);
      setIsOpen(false);
    }, 300);
  };
  
  // Personnalisation du trigger
  const triggerButton = trigger ? (
    // Cloner le trigger et lui ajouter un onClick
    React.cloneElement(trigger, {
      onClick: () => setIsOpen(true)
    })
  ) : (
    <button 
      onClick={() => setIsOpen(true)}
      className="export-trigger-button"
    >
      <div className="export-trigger-content">
        <DownloadCloud size={18} />
        <span>Exporter</span>
      </div>
    </button>
  );
  
  return (
    <div>
      {triggerButton}
      {isOpen && (
        <div>
          {/* Overlay */}
          <div className="modal-overlay" />
          
          {/* Modal */}
          <div 
            className="modal-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div ref={modalRef} className="modal-content">
              <div className="modal-inner">
                <div className="modal-header">
                  <h2 id="modal-title" className="modal-title">
                    Télécharger les données
                  </h2>
                  <button
                    onClick={() => !loading && setIsOpen(false)}
                    className="modal-close-button"
                    aria-label="Fermer"
                    disabled={loading !== false}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <p className="modal-description">
                  Choisissez le format dans lequel vous souhaitez exporter les données affichées.
                </p>
                
                <div className="export-options">
                  <button
                    onClick={() => handleExport("csv")}
                    className="export-option-button csv-button"
                    disabled={loading !== false}
                  >
                    {loading === "csv" ? (
                      <Loader2 size={18} className="button-icon loader" />
                    ) : (
                      <FileText size={18} className="button-icon" />
                    )}
                    <span>Télécharger en CSV</span>
                  </button>
                  
                  <button
                    onClick={() => handleExport("xlsx")}
                    className="export-option-button excel-button"
                    disabled={loading !== false}
                  >
                    {loading === "xlsx" ? (
                      <Loader2 size={18} className="button-icon loader" />
                    ) : (
                      <File size={18} className="button-icon" />
                    )}
                    <span>Télécharger en Excel</span>
                  </button>
                  
                  <button
                    onClick={() => handleExport("json")}
                    className="export-option-button json-button"
                    disabled={loading !== false}
                  >
                    {loading === "json" ? (
                      <Loader2 size={18} className="button-icon loader" />
                    ) : (
                      <FileText size={18} className="button-icon" />
                    )}
                    <span>Télécharger en JSON</span>
                  </button>
                </div>
                
                <div className="modal-footer">
                  <button
                    onClick={() => !loading && setIsOpen(false)}
                    className="cancel-button"
                    disabled={loading !== false}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};