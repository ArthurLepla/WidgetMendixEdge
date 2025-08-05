import { ReactElement, createElement, useState } from "react";
import { Card, List, Switch, Tag, Input, Space, Typography, Badge, message, Empty, Spin } from "antd";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ValueStatus } from "mendix";
import type { AdminPanelContainerProps } from "../../typings/AdminPanelProps";

const { Text, Paragraph } = Typography;

export function FeaturesTab(props: AdminPanelContainerProps): ReactElement {
    const [searchText, setSearchText] = useState("");

    const handleToggle = async (item: any, checked: boolean) => {
        if (props.featureIsEnabled) {
            item.set(props.featureIsEnabled, checked);
            
            if (props.onFeatureToggle && props.onFeatureToggle.canExecute) {
                try {
                    await props.onFeatureToggle.execute();
                    message.success(`Feature ${checked ? 'enabled' : 'disabled'} successfully`);
                } catch (error) {
                    message.error('Failed to update feature');
                }
            }
        }
    };

    const filteredFeatures = props.featuresDatasource?.items?.filter(item => {
        if (!searchText) return true;
        const name = props.featureName ? item.get(props.featureName)?.displayValue || "" : "";
        return name.toLowerCase().includes(searchText.toLowerCase());
    }) || [];

    return (
        <Card 
            title="Feature Toggles"
            className="features-card"
            extra={
                <Input
                    placeholder="Search features..."
                    prefix={<Search size={16} />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                    style={{ width: 250 }}
                />
            }
        >
            {props.featuresDatasource?.status === ValueStatus.Loading ? (
                <Spin size="large" />
            ) : filteredFeatures.length > 0 ? (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                    dataSource={filteredFeatures}
                    renderItem={(item, index) => {
                        const name = props.featureName ? item.get(props.featureName)?.displayValue || "" : "";
                        const isEnabled = props.featureIsEnabled ? item.get(props.featureIsEnabled)?.value === true : false;
                        const configValue = props.featureConfigValue ? item.get(props.featureConfigValue)?.displayValue || "" : "";

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <List.Item>
                                    <Card
                                        hoverable
                                        className={`feature-card ${isEnabled ? 'enabled' : 'disabled'}`}
                                    >
                                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                            <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                                                <Badge 
                                                    status={isEnabled ? "success" : "default"} 
                                                    text={
                                                        <Text strong style={{ fontSize: 16 }}>
                                                            {name}
                                                        </Text>
                                                    }
                                                />
                                                <Switch
                                                    checked={isEnabled}
                                                    onChange={(checked) => handleToggle(item, checked)}
                                                    checkedChildren={<CheckCircle2 size={14} />}
                                                    unCheckedChildren={<XCircle size={14} />}
                                                />
                                            </Space>
                                            
                                            {configValue && (
                                                <Paragraph 
                                                    ellipsis={{ rows: 2 }} 
                                                    type="secondary"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    Config: {configValue}
                                                </Paragraph>
                                            )}
                                            
                                            <Tag color={isEnabled ? "success" : "default"}>
                                                {isEnabled ? "Active" : "Inactive"}
                                            </Tag>
                                        </Space>
                                    </Card>
                                </List.Item>
                            </motion.div>
                        );
                    }}
                />
            ) : (
                <Empty description="No features found" />
            )}
        </Card>
    );
}