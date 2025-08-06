import { ReactElement, createElement, useState } from "react";
import { Card, List, Switch, Input, Space, Typography, Badge, Empty, Spin, App } from "antd";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { ValueStatus } from "mendix";
import type { AdminPanelContainerProps } from "../../typings/AdminPanelProps";

const { Text } = Typography;

export function FeaturesTab(props: AdminPanelContainerProps): ReactElement {
    const { message } = App.useApp();
    const [searchText, setSearchText] = useState("");

    const handleToggle = async (item: any, checked: boolean) => {
        if (props.onFeatureToggle && props.onFeatureToggle.get(item)) {
            const action = props.onFeatureToggle.get(item);
            
            if (action.canExecute) {
                try {
                    await action.execute();
                    message.success(`Feature ${checked ? "activée" : "désactivée"}`);
                } catch (error) {
                    message.error("Échec de la modification");
                    console.error(error);
                }
            } else {
                message.warning("Action non disponible");
            }
        } else {
            message.warning("Configuration manquante");
        }
    };

    const filteredFeatures = props.featuresDatasource?.items?.filter(item => {
        if (!searchText) return true;
        const name = props.featureName?.get(item)?.displayValue || "";
        return name.toLowerCase().includes(searchText.toLowerCase());
    }) || [];

    return (
        <Card 
            title="Feature Toggles"
            className="features-card"
            extra={
                <Input
                    placeholder="Rechercher..."
                    prefix={<Search size={16} />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                    style={{ width: 250 }}
                />
            }
        >
            {props.featuresDatasource?.status === ValueStatus.Loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                </div>
            ) : filteredFeatures.length > 0 ? (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                    dataSource={filteredFeatures}
                    renderItem={(item, index) => {
                        const name = props.featureName?.get(item)?.displayValue || "";
                        const isEnabled = props.featureIsEnabled?.get(item)?.value === true;
                        const configValue = props.featureConfigValue?.get(item)?.displayValue || "";

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                            >
                                <List.Item>
                                    <Card
                                        className={`feature-card ${isEnabled ? 'enabled' : ''}`}
                                    >
                                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                            <div className="feature-header">
                                                <Text strong className="feature-title">
                                                    {name}
                                                </Text>
                                                <Switch
                                                    checked={isEnabled}
                                                    onChange={(checked) => handleToggle(item, checked)}
                                                    size="small"
                                                />
                                            </div>
                                            
                                            {configValue && (
                                                <Text type="secondary" className="feature-config">
                                                    {configValue}
                                                </Text>
                                            )}
                                            
                                            <div className="feature-status">
                                                <Badge 
                                                    status={isEnabled ? "success" : "default"} 
                                                    text={isEnabled ? "Active" : "Inactive"}
                                                />
                                            </div>
                                        </Space>
                                    </Card>
                                </List.Item>
                            </motion.div>
                        );
                    }}
                />
            ) : (
                <Empty 
                    description="Aucune feature trouvée" 
                    style={{ padding: '40px' }}
                />
            )}
        </Card>
    );
}