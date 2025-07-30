import { createElement, useState, useRef } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { DownloadCloud, FileText, File, ChevronDown } from "lucide-react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Gérer les exports
  const handleExport = (format: "csv" | "xlsx" | "json") => {
    if (format === "csv") downloadCsv(data, filename, machineName);
    if (format === "xlsx") downloadExcel(data, filename, machineName);
    if (format === "json") downloadJson(data, filename, machineName);
    setIsOpen(false);
  };

  // Contenu du menu dropdown compatible Ant Design v5
  const menuItems: MenuProps['items'] = [
    {
      key: 'info',
      label: (
        <div className="dropdown-info-notice">
          <p>Les données exportées sont des valeurs agrégées.</p>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'csv',
      label: (
        <div className="dropdown-item" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
          <div className="dropdown-item-icon-wrapper blue">
            <FileText size={28} className="icon-blue" />
          </div>
          <div className="dropdown-item-content">
            <span className="dropdown-item-title">CSV</span>
            <span className="dropdown-item-description">Format texte</span>
          </div>
        </div>
      ),
      onClick: () => handleExport("csv")
    },
    {
      key: 'xlsx',
      label: (
        <div className="dropdown-item" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
          <div className="dropdown-item-icon-wrapper green">
            <File size={28} className="icon-green" />
          </div>
          <div className="dropdown-item-content">
            <span className="dropdown-item-title">Excel</span>
            <span className="dropdown-item-description">Format Excel</span>
          </div>
        </div>
      ),
      onClick: () => handleExport("xlsx")
    },
    {
      key: 'json',
      label: (
        <div className="dropdown-item" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
          <div className="dropdown-item-icon-wrapper purple">
            <FileText size={28} className="icon-purple" />
          </div>
          <div className="dropdown-item-content">
            <span className="dropdown-item-title">JSON</span>
            <span className="dropdown-item-description">Format développeur</span>
          </div>
        </div>
      ),
      onClick: () => handleExport("json")
    }
  ];

  return (
    <div ref={containerRef} className={`export-menu ${className}`} style={{ position: 'relative' }}>
      <Dropdown
        open={isOpen}
        onOpenChange={setIsOpen}
        menu={{ items: menuItems }}
        trigger={["click"]}
        placement="bottomRight"
        overlayClassName="export-dropdown-antd"
        getPopupContainer={() => containerRef.current || document.body}
        destroyPopupOnHide={true}
        autoAdjustOverflow={false}
        align={{
          points: ['tr', 'br'], // top-right du dropdown avec bottom-right du trigger
          offset: [0, 8],
          targetOffset: [0, 0],
          overflow: {
            adjustX: false,
            adjustY: false
          }
        }}
      >
        <button
          className={`export-button ${isOpen ? 'open' : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Exporter les données"
          style={{ justifyContent: 'space-between' }}
        >
          <div className="export-button-content">
            <DownloadCloud size={18} className="export-button-icon" />
            <span className="export-button-text">Exporter</span>
          </div>
          <div 
            className={`granularity-chevron-wrapper${isOpen ? ' open' : ''}`}
            style={{ marginLeft: '0.5rem' }}
          >
            <ChevronDown 
              size={18} 
              className={`granularity-chevron${isOpen ? ' open' : ''}`}
              style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            />
          </div>
        </button>
      </Dropdown>
    </div>
  );
};