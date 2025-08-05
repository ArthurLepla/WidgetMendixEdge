import { ReactElement, createElement, useState, useEffect, useMemo } from "react";
import { AdminPanelContainerProps } from "../typings/AdminPanelProps";
import { ValueStatus } from "mendix";
import { Tabs, Layout, Card, Row, Col, Statistic, Button, Space, message, ConfigProvider, theme } from "antd";
import { 
    Database, 
    ToggleLeft, 
    RefreshCw, 
    Activity,
    Zap,
    Droplet,
    Wind,
    Gauge,
    CheckCircle2,
    XCircle,
    Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AssetsTab } from "./components/AssetsTab";
import { FeaturesTab } from "./components/FeaturesTab";
import "./ui/AdminPanel.css";

const { Content } = Layout;

export function AdminPanel(props: AdminPanelContainerProps): ReactElement {
    const [activeTab, setActiveTab] = useState("assets");
    const [loading, setLoading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    // Calculate KPIs for assets
    const assetsKPIs = useMemo(() => {
        if (!props.assetsDatasource || props.assetsDatasource.status !== ValueStatus.Available) {
            return { total: 0, electric: 0, gas: 0, water: 0, air: 0 };
        }

        const items = props.assetsDatasource.items || [];
        return {
            total: items.length,
            electric: items.filter(item => 
                props.assetIsElec && item.get(props.assetIsElec)?.value === true
            ).length,
            gas: items.filter(item => 
                props.assetIsGaz && item.get(props.assetIsGaz)?.value === true
            ).length,
            water: items.filter(item => 
                props.assetIsEau && item.get(props.assetIsEau)?.value === true
            ).length,
            air: items.filter(item => 
                props.assetIsAir && item.get(props.assetIsAir)?.value === true
            ).length
        };
    }, [props.assetsDatasource, props.assetIsElec, props.assetIsGaz, props.assetIsEau, props.assetIsAir]);

    // Calculate KPIs for features
    const featuresKPIs = useMemo(() => {
        if (!props.featuresDatasource || props.featuresDatasource.status !== ValueStatus.Available) {
            return { total: 0, active: 0, inactive: 0 };
        }

        const items = props.featuresDatasource.items || [];
        return {
            total: items.length,
            active: items.filter(item => 
                props.featureIsEnabled && item.get(props.featureIsEnabled)?.value === true
            ).length,
            inactive: items.filter(item => 
                props.featureIsEnabled && item.get(props.featureIsEnabled)?.value === false
            ).length
        };
    }, [props.featuresDatasource, props.featureIsEnabled]);

    const handleSync = async () => {
        if (props.syncAction && props.syncAction.canExecute) {
            setLoading(true);
            try {
                await props.syncAction.execute();
                message.success("Synchronization completed successfully");
            } catch (error) {
                message.error("Synchronization failed");
            } finally {
                setLoading(false);
            }
        }
    };

    const tabItems = [
        {
            key: "assets",
            label: (
                <Space>
                    <Database size={16} />
                    <span>Assets</span>
                </Space>
            ),
            children: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        {/* KPIs Row */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={6}>
                                <Card hoverable>
                                    <Statistic
                                        title="Total Assets"
                                        value={assetsKPIs.total}
                                        prefix={<Database size={20} />}
                                        valueStyle={{ color: "#1890ff" }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card hoverable>
                                    <Statistic
                                        title="Electric"
                                        value={assetsKPIs.electric}
                                        prefix={<Zap size={20} />}
                                        valueStyle={{ color: "#faad14" }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card hoverable>
                                    <Statistic
                                        title="Gas"
                                        value={assetsKPIs.gas}
                                        prefix={<Activity size={20} />}
                                        valueStyle={{ color: "#ff7875" }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card hoverable>
                                    <Statistic
                                        title="Water"
                                        value={assetsKPIs.water}
                                        prefix={<Droplet size={20} />}
                                        valueStyle={{ color: "#5cdbd3" }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Sync Button */}
                        <Row>
                            <Col span={24}>
                                <Button
                                    type="primary"
                                    icon={<RefreshCw size={16} className={loading ? "spin" : ""} />}
                                    onClick={handleSync}
                                    loading={loading}
                                    size="large"
                                >
                                    Synchronize Assets
                                </Button>
                            </Col>
                        </Row>

                        {/* Assets Main Content */}
                        <AssetsTab
                            {...props}
                            selectedAsset={selectedAsset}
                            onSelectAsset={setSelectedAsset}
                        />
                    </Space>
                </motion.div>
            )
        },
        {
            key: "features",
            label: (
                <Space>
                    <ToggleLeft size={16} />
                    <span>Features</span>
                </Space>
            ),
            children: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        {/* KPIs Row */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                                <Card hoverable>
                                    <Statistic
                                        title="Total Features"
                                        value={featuresKPIs.total}
                                        prefix={<Settings size={20} />}
                                        valueStyle={{ color: "#1890ff" }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card hoverable>
                                    <Statistic
                                        title="Active"
                                        value={featuresKPIs.active}
                                        prefix={<CheckCircle2 size={20} />}
                                        valueStyle={{ color: "#52c41a" }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card hoverable>
                                    <Statistic
                                        title="Inactive"
                                        value={featuresKPIs.inactive}
                                        prefix={<XCircle size={20} />}
                                        valueStyle={{ color: "#ff4d4f" }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Features Content */}
                        <FeaturesTab {...props} />
                    </Space>
                </motion.div>
            )
        }
    ];

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    colorPrimary: "#1890ff",
                    borderRadius: 8,
                },
            }}
        >
            <Layout className="admin-panel-container">
                <Content className="admin-panel-content">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabItems}
                            size="large"
                            className="admin-panel-tabs"
                        />
                    </motion.div>
                </Content>
            </Layout>
        </ConfigProvider>
    );
}