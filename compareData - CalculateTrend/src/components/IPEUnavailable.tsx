import { createElement } from "react";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  ipeCount: number;
  fallbackReason: string;
  recommendedMode: "double" | "single" | "fallback";
  selectedAssets: string[];
  availableAssets: string[];
}

export function IPEUnavailable({ 
  ipeCount, 
  fallbackReason, 
  recommendedMode, 
  selectedAssets,
  availableAssets 
}: Props) {
  const recommendation =
    recommendedMode === "fallback"
      ? "Passez au mode \"Énergétique\" pour visualiser la consommation."
      : recommendedMode === "single"
      ? "Sélectionnez le mode IPE simple pour afficher les données disponibles."
      : "Activez le mode IPE double pour une vue complète.";

  const getThemeColors = () => {
    switch (recommendedMode) {
      case "fallback": 
        return {
          gradient: "linear-gradient(135deg, #fff7ed 0%, #fef2f2 100%)",
          border: "#fed7aa",
          iconBg: "#ffedd5",
          iconColor: "#ea580c",
          title: "#9a3412",
          subtitle: "#c2410c",
          description: "#ea580c"
        };
      case "single": 
        return {
          gradient: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)",
          border: "#bfdbfe",
          iconBg: "#dbeafe",
          iconColor: "#2563eb",
          title: "#1e3a8a",
          subtitle: "#1d4ed8",
          description: "#2563eb"
        };
      case "double": 
        return {
          gradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
          border: "#bbf7d0",
          iconBg: "#dcfce7",
          iconColor: "#16a34a",
          title: "#14532d",
          subtitle: "#15803d",
          description: "#16a34a"
        };
      default: 
        return {
          gradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          border: "#fde68a",
          iconBg: "#fef3c7",
          iconColor: "#d97706",
          title: "#92400e",
          subtitle: "#b45309",
          description: "#d97706"
        };
    }
  };

  const theme = getThemeColors();

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '48px 16px',
    },
    card: {
      width: '100%',
      maxWidth: '896px',
      borderRadius: '24px',
      border: `2px solid ${theme.border}`,
      backgroundColor: 'white',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      overflow: 'hidden',
    },
    cardContent: {
      background: theme.gradient,
      padding: '48px',
    },
    contentWrapper: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '32px',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    iconContainer: {
      flexShrink: 0,
      borderRadius: '16px',
      backgroundColor: theme.iconBg,
      color: theme.iconColor,
      padding: '24px',
      alignSelf: 'center',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    content: {
      flex: 1,
      textAlign: 'center' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: theme.title,
      marginBottom: '16px',
      lineHeight: 1.2,
      margin: 0,
    },
    infoSection: {
      marginBottom: '32px',
    },
    subtitle: {
      fontSize: '18px',
      color: theme.subtitle,
      fontWeight: 600,
      marginBottom: '12px',
      margin: 0,
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 12px',
      borderRadius: '9999px',
      fontSize: '14px',
      fontWeight: 600,
      backgroundColor: theme.iconBg,
      color: theme.iconColor,
      marginBottom: '12px',
    },
    description: {
      fontSize: '16px',
      color: theme.description,
      lineHeight: 1.6,
      margin: 0,
    },
    assetsInfo: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      fontSize: '14px',
      color: '#374151',
    },
    recommendationCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
    },
    recommendationContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    },
    lightbulbIcon: {
      flexShrink: 0,
      backgroundColor: '#fef3c7',
      color: '#d97706',
      borderRadius: '12px',
      padding: '12px',
    },
    recommendationText: {
      flex: 1,
    },
    recommendationTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#111827',
      marginBottom: '8px',
      margin: 0,
    },
    recommendationDescription: {
      color: '#374151',
      lineHeight: 1.6,
      marginBottom: '16px',
      margin: '0 0 16px 0',
    },
    actionLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      color: '#2563eb',
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={styles.card}
      >
        <div style={styles.cardContent}>
          <div style={styles.contentWrapper}>
            {/* Icône animée */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
              style={styles.iconContainer}
            >
              <AlertTriangle size={48} strokeWidth={2.5} />
            </motion.div>

            {/* Contenu principal */}
            <div style={styles.content}>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={styles.title}
              >
                Mode IPE non disponible
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={styles.infoSection}
              >
                <p style={styles.subtitle}>
                  Les assets sélectionnés ne possèdent pas de données IPE disponibles
                </p>
                
                <div style={{ marginBottom: '12px' }}>
                  <span style={styles.badge}>
                    {ipeCount} IPE disponible{ipeCount > 1 ? "s" : ""}
                  </span>
                </div>

                <p style={styles.description}>
                  {fallbackReason}
                </p>

                {/* Informations sur les assets */}
                {selectedAssets.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    style={styles.assetsInfo}
                  >
                    <div style={{ marginBottom: '8px', fontWeight: 600 }}>
                      Assets sélectionnés ({selectedAssets.length}):
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: 1.4 }}>
                      {selectedAssets.join(', ')}
                    </div>
                    {availableAssets.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                        Assets avec IPE disponibles: {availableAssets.join(', ')}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Carte de recommandation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={styles.recommendationCard}
              >
                <div style={styles.recommendationContent}>
                  <motion.div
                    initial={{ rotate: -45 }}
                    animate={{ rotate: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    style={styles.lightbulbIcon}
                  >
                    <Lightbulb size={24} />
                  </motion.div>
                  
                  <div style={styles.recommendationText}>
                    <h3 style={styles.recommendationTitle}>
                      Recommandation
                    </h3>
                    <p style={styles.recommendationDescription}>
                      {recommendation}
                    </p>
                    {availableAssets.length > 0 && (
                      <p style={{ fontSize: '14px', color: '#059669', margin: 0 }}>
                        💡 Essayez de sélectionner d'autres assets qui ont des données IPE disponibles.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
