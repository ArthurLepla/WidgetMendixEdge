import { ReactElement, createElement, useState, useMemo } from "react";
import { Row, Col, Tree, Card, Table, Tag, Input, Space, Empty, Spin, Typography } from "antd";
import { Search, Folder, File, Zap, Activity, Droplet, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { ValueStatus } from "mendix";
import type { AdminPanelContainerProps } from "../../typings/AdminPanelProps";

const { Title, Text } = Typography;

interface AssetsTabProps extends AdminPanelContainerProps {
    selectedAsset: any;
    onSelectAsset: (asset: any) => void;
}

export function AssetsTab(props: AssetsTabProps): ReactElement {
    const [searchText, setSearchText] = useState("");
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

    // Build tree structure from assets
    const treeData = useMemo(() => {
        if (!props.assetsDatasource || props.assetsDatasource.status !== ValueStatus.Available) {
            return [];
        }

        const items = props.assetsDatasource.items || [];
        const assetMap = new Map();
        const rootAssets: any[] = [];

        // First pass: create all nodes
        items.forEach(item => {
            const id = item.id;
            const name = props.assetName ? item.get(props.assetName)?.displayValue || "" : "";
            
            assetMap.set(id, {
                key: id,
                title: name,
                item: item,
                children: [],
                icon: <Folder size={16} />
            });
        });

        // Second pass: build hierarchy (simplified - you'd need parent association)
        items.forEach(item => {
            const node = assetMap.get(item.id);
            // For now, just add to root - you'd check parent association here
            rootAssets.push(node);
        });

        return rootAssets;
    }, [props.assetsDatasource, props.assetName]);

    // Filter tree based on search
    const filteredTreeData = useMemo(() => {
        if (!searchText) return treeData;
        
        const filterNodes = (nodes: any[]): any[] => {
            return nodes.reduce((filtered, node) => {
                const matches = node.title.toLowerCase().includes(searchText.toLowerCase());
                const filteredChildren = node.children ? filterNodes(node.children) : [];
                
                if (matches || filteredChildren.length > 0) {
                    filtered.push({
                        ...node,
                        children: filteredChildren
                    });
                }
                
                return filtered;
            }, []);
        };

        return filterNodes(treeData);
    }, [treeData, searchText]);

    // Get variables for selected asset
    const variablesData = useMemo(() => {
        if (!props.selectedAsset || !props.variablesDatasource || 
            props.variablesDatasource.status !== ValueStatus.Available) {
            return [];
        }

        // Filter variables for selected asset - you'd need to check association
        return props.variablesDatasource.items?.map(item => ({
            key: item.id,
            name: props.variableName ? item.get(props.variableName)?.displayValue || "" : "",
            unit: props.variableUnit ? item.get(props.variableUnit)?.displayValue || "" : "",
            type: props.variableType ? item.get(props.variableType)?.displayValue || "" : ""
        })) || [];
    }, [props.selectedAsset, props.variablesDatasource, props.variableName, props.variableUnit, props.variableType]);

    const getEnergyTags = (item: any) => {
        const tags = [];
        if (props.assetIsElec && item.get(props.assetIsElec)?.value === true) {
            tags.push(<Tag icon={<Zap size={12} />} color="gold" key="elec">Electric</Tag>);
        }
        if (props.assetIsGaz && item.get(props.assetIsGaz)?.value === true) {
            tags.push(<Tag icon={<Activity size={12} />} color="red" key="gas">Gas</Tag>);
        }
        if (props.assetIsEau && item.get(props.assetIsEau)?.value === true) {
            tags.push(<Tag icon={<Droplet size={12} />} color="cyan" key="water">Water</Tag>);
        }
        if (props.assetIsAir && item.get(props.assetIsAir)?.value === true) {
            tags.push(<Tag icon={<Wind size={12} />} color="blue" key="air">Air</Tag>);
        }
        return tags;
    };

    const variableColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            width: 100,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type: string) => (
                <Tag color="blue">{type}</Tag>
            )
        }
    ];

    const handleTreeSelect = (selectedKeys: any[], info: any) => {
        if (info.node.item) {
            props.onSelectAsset(info.node.item);
        }
    };

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
                <Card 
                    title="Assets Hierarchy"
                    className="assets-tree-card"
                    extra={
                        <Input
                            placeholder="Search assets..."
                            prefix={<Search size={16} />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    }
                >
                    {props.assetsDatasource?.status === ValueStatus.Loading ? (
                        <Spin />
                    ) : filteredTreeData.length > 0 ? (
                        <Tree
                            treeData={filteredTreeData}
                            onSelect={handleTreeSelect}
                            expandedKeys={expandedKeys}
                            onExpand={setExpandedKeys}
                            showIcon
                            showLine={{ showLeafIcon: false }}
                            className="assets-tree"
                        />
                    ) : (
                        <Empty description="No assets found" />
                    )}
                </Card>
            </Col>
            
            <Col xs={24} md={16}>
                <motion.div
                    key={props.selectedAsset?.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card 
                        title={props.selectedAsset ? (
                            <Space>
                                <File size={20} />
                                <span>
                                    {props.assetName && props.selectedAsset.get(props.assetName)?.displayValue || "Asset Details"}
                                </span>
                            </Space>
                        ) : "Select an Asset"}
                        className="asset-details-card"
                    >
                        {props.selectedAsset ? (
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <div>
                                    <Title level={5}>Energy Types</Title>
                                    <Space wrap>
                                        {getEnergyTags(props.selectedAsset)}
                                    </Space>
                                </div>
                                
                                <div>
                                    <Title level={5}>Variables</Title>
                                    <Table
                                        dataSource={variablesData}
                                        columns={variableColumns}
                                        pagination={false}
                                        size="small"
                                        className="variables-table"
                                    />
                                </div>
                            </Space>
                        ) : (
                            <Empty description="Please select an asset from the hierarchy" />
                        )}
                    </Card>
                </motion.div>
            </Col>
        </Row>
    );
}