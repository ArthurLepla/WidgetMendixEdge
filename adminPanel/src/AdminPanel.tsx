import { ReactElement, createElement, useState, useMemo } from "react";
import { AdminPanelContainerProps } from "../typings/AdminPanelProps";
import { ValueStatus } from "mendix";
import { Tabs, Layout, Card, Row, Col, Statistic, Button, Space, message, ConfigProvider, theme, App } from "antd";
import { 
    Database, 
    ToggleLeft, 
    RefreshCw, 
    Flame,
    Zap,
    Droplet,
    Settings,
    Wind
} from "lucide-react";
import { motion } from "framer-motion";
import { AssetsTab } from "./components/AssetsTabs";
import { FeaturesTab } from "./components/FeaturesTabs";
import "./ui/AdminPanel.css";

const { Content } = Layout;

export function AdminPanel(props: AdminPanelContainerProps): ReactElement {
    const [activeTab, setActiveTab] = useState("assets");
    const [loading, setLoading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    // KPIs pour les assets
    const assetsKPIs = useMemo(() => {
        if (!props.assetsDatasource || props.assetsDatasource.status !== ValueStatus.Available) {
            return { total: 0, electric: 0, gas: 0, water: 0, air: 0 };
        }

        const items = props.assetsDatasource.items || [];
        
        let electric = 0;
        let gas = 0;
        let water = 0;
        let air = 0;
        
        items.forEach(item => {
            if (props.assetIsElec?.get(item)?.value === true) electric++;
            if (props.assetIsGaz?.get(item)?.value === true) gas++;
            if (props.assetIsEau?.get(item)?.value === true) water++;
            if (props.assetIsAir?.get(item)?.value === true) air++;
        });
        
        return { total: items.length, electric, gas, water, air };
    }, [props.assetsDatasource, props.assetIsElec, props.assetIsGaz, props.assetIsEau, props.assetIsAir]);

    // KPIs pour les features
    const featuresKPIs = useMemo(() => {
        if (!props.featuresDatasource || props.featuresDatasource.status !== ValueStatus.Available) {
            return { total: 0, active: 0, inactive: 0 };
        }

        const items = props.featuresDatasource.items || [];
        let active = 0;
        let inactive = 0;
        
        items.forEach(item => {
            if (props.featureIsEnabled?.get(item)?.value === true) {
                active++;
            } else {
                inactive++;
            }
        });
        
        return { total: items.length, active, inactive };
    }, [props.featuresDatasource, props.featureIsEnabled]);

    const handleSync = async () => {
        if (props.syncAction && props.syncAction.canExecute) {
            setLoading(true);
            try {
                await props.syncAction.execute();
                message.success("Synchronisation réussie");
            } catch (error) {
                message.error("Échec de la synchronisation");
            } finally {
                setLoading(false);
            }
        }
    };

    const tabItems = [
        {
            key: "assets",
            label: (
                <Space size={4}>
                    <Database size={16} />
                    <span>Assets</span>
                </Space>
            ),
            children: (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Space direction="vertical" size={24} style={{ width: "100%" }}>
                        {/* KPIs simplifiés */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Total"
                                        value={assetsKPIs.total}
                                        prefix={<Database size={18} />}
                                        className="statistic-primary"
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Électrique"
                                        value={assetsKPIs.electric}
                                        prefix={<Zap size={18} />}
                                        className="statistic-electric"
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Gaz"
                                        value={assetsKPIs.gas}
                                        prefix={<Flame size={18} />}
                                        className="statistic-gas"
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Eau"
                                        value={assetsKPIs.water}
                                        prefix={<Droplet size={18} />}
                                        className="statistic-water"
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Air"
                                        value={assetsKPIs.air}
                                        prefix={<Wind size={18} />}
                                        className="statistic-air"
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Bouton de synchronisation simplifié */}
                        <div>
                            <Button
                                type="primary"
                                icon={<RefreshCw size={16} className={loading ? "spin" : ""} />}
                                onClick={handleSync}
                                loading={loading}
                            >
                                Synchroniser
                            </Button>
                        </div>

                        {/* Contenu principal */}
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
                <Space size={4}>
                    <ToggleLeft size={16} />
                    <span>Features</span>
                </Space>
            ),
            children: (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Space direction="vertical" size={24} style={{ width: "100%" }}>
                        {/* KPIs simplifiés */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Total"
                                        value={featuresKPIs.total}
                                        prefix={<Settings size={18} />}
                                        className="statistic-primary"
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Actives"
                                        value={featuresKPIs.active}
                                        valueStyle={{ color: "#52c41a" }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Inactives"
                                        value={featuresKPIs.inactive}
                                        valueStyle={{ color: "#8c8c8c" }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Contenu des features */}
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
                    colorPrimary: "#18213e",
                    borderRadius: 8,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                },
                components: {
                    Card: {
                        paddingLG: 20,
                        paddingContentHorizontal: 20,
                    },
                    Button: {
                        controlHeight: 36,
                        paddingContentHorizontal: 16,
                    },
                    Tabs: {
                        inkBarColor: "#18213e",
                        itemSelectedColor: "#18213e",
                        itemHoverColor: "#18213e",
                    },
                    Switch: {
                        colorPrimary: "#18213e",
                        colorPrimaryHover: "#2a3a5a",
                    },
                    Table: {
                        headerBg: "#fafafa",
                        headerColor: "#18213e",
                        rowHoverBg: "rgba(24, 33, 62, 0.04)",
                    },
                    Statistic: {
                        contentFontSize: 28,
                        titleFontSize: 13,
                    }
                }
            }}
        >
            <App>
                <Layout className="admin-panel-container">
                    <Content className="admin-panel-content">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
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
            </App>
        </ConfigProvider>
    );
}