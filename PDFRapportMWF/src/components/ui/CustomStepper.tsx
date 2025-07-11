import React, { createElement } from "react";
import { Steps, ConfigProvider } from "antd";
import { motion } from "framer-motion";
import { 
    CalendarOutlined, 
    DatabaseOutlined,
    SyncOutlined, 
    FileTextOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined
} from "@ant-design/icons";
import { ComponentStep } from "../../types/widget";
import { palette } from "../../constants/config";
import styles from "./CustomStepper.module.css";

interface CustomStepperProps {
    currentStep: ComponentStep;
    hasValidDates: boolean;
    isProcessing: boolean;
}

export const CustomStepper: React.FC<CustomStepperProps> = ({
    currentStep,
    hasValidDates,
    isProcessing
}) => {
    // Thème harmonisé avec la palette projet
    const stepperTheme = {
        components: {
            Steps: {
                colorPrimary: palette.primary,
                colorSuccess: palette.electric,
                colorError: palette.error,
                colorTextDisabled: palette.gray[400],
                colorBorder: palette.gray[200],
                colorFillContent: palette.gray[50],
                titleLineHeight: 1.4,
                descriptionMaxWidth: 140,
            }
        }
    };

    // Fonction pour obtenir l'étape actuelle pour le stepper
    const getCurrentStepIndex = (): number => {
        if (!hasValidDates) {
            return 0;
        }
        
        if (currentStep === "fetchingInitialData" || currentStep === "processingPdfData") {
            return 1;
        }
        
        if (currentStep === "readyForDownload") {
            return 2;
        }
        
        if (currentStep === "error") {
            return 1;
        }
        
        return hasValidDates ? 1 : 0;
    };

    const currentIndex = getCurrentStepIndex();

    // Définition des étapes avec statut simplifié
    const getStepStatus = (stepIndex: number): "wait" | "process" | "finish" | "error" => {
        if (currentStep === "error" && stepIndex === 1) {
            return "error";
        }
        
        if (stepIndex < currentIndex) {
            return "finish";
        } else if (stepIndex === currentIndex) {
            return "process";
        } else {
            return "wait";
        }
    };

    // Icônes simplifiées selon le statut
    const getStepIcon = (stepIndex: number) => {
        const status = getStepStatus(stepIndex);
        
        switch (stepIndex) {
            case 0: // Période
                if (status === "finish") return <CheckCircleOutlined />;
                if (status === "process") return <CalendarOutlined />;
                return <ClockCircleOutlined />;
                
            case 1: // Données
                if (status === "error") return <ExclamationCircleOutlined />;
                if (status === "finish") return <CheckCircleOutlined />;
                if (status === "process") {
                    return isProcessing ? <SyncOutlined spin /> : <DatabaseOutlined />;
                }
                return <DatabaseOutlined />;
                
            case 2: // Rapport
                if (status === "finish") return <CheckCircleOutlined />;
                if (status === "process") return <FileTextOutlined />;
                return <FileTextOutlined />;
                
            default:
                return <ClockCircleOutlined />;
        }
    };

    // Titres courts et clairs
    const stepsItems = [
        {
            title: "Période",
            icon: getStepIcon(0),
            status: getStepStatus(0)
        },
        {
            title: "Données",
            icon: getStepIcon(1),
            status: getStepStatus(1)
        },
        {
            title: "Rapport",
            icon: getStepIcon(2),
            status: getStepStatus(2)
        }
    ];

    return (
        <ConfigProvider theme={stepperTheme}>
            <motion.div
                className={styles.stepperContainer}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Steps
                    current={currentIndex}
                    items={stepsItems}
                    size="small"
                    direction="horizontal"
                    responsive={true}
                />
            </motion.div>
        </ConfigProvider>
    );
}; 