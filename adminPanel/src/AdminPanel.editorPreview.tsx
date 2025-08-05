import { ReactElement, createElement } from "react";
import { AdminPanelPreviewProps } from "../typings/AdminPanelProps";
import { Layout, Tabs, Card, Row, Col, Statistic } from "antd";
import { Database, ToggleLeft, Zap, Activity, Droplet, Wind } from "lucide-react";

const { Content } = Layout;

export function preview(_props: AdminPanelPreviewProps): ReactElement {
    return (
        <Layout style={{ minHeight: 400, background: "#f5f7fa" }}>
            <Content style={{ padding: 24 }}>
                <Tabs
                    defaultActiveKey="1"
                    items={[
                        {
                            key: "1",
                            label: (
                                <span>
                                    <Database size={16} style={{ marginRight: 8 }} />
                                    Assets
                                </span>
                            ),
                            children: (
                                <Row gutter={[16, 16]}>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="Total Assets"
                                                value={42}
                                                prefix={<Database size={20} />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="Electric"
                                                value={15}
                                                prefix={<Zap size={20} />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="Gas"
                                                value={12}
                                                prefix={<Activity size={20} />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="Water"
                                                value={8}
                                                prefix={<Droplet size={20} />}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            )
                        },
                        {
                            key: "2",
                            label: (
                                <span>
                                    <ToggleLeft size={16} style={{ marginRight: 8 }} />
                                    Features
                                </span>
                            ),
                            children: <div>Features Preview</div>
                        }
                    ]}
                />
            </Content>
        </Layout>
    );
}

export function getPreviewCss(): string {
    return require("./ui/AdminPanel.css");
}