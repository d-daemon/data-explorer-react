import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';

const { Title, Text } = Typography;

interface ComponentInteraction {
    component: string;
    count: number;
}

export const ComponentInteractions: React.FC = () => {
    const { isConnected } = useAnalytics({ autoTrack: false });
    const [componentData, setComponentData] = useState<ComponentInteraction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComponentData = async () => {
        try {
            const getBasePath = () => {
                const path = window.location.pathname;
                const segments = path.split('/').filter(Boolean);
                return segments.length > 0 ? `/${segments[0]}` : '';
            };
            
            const response = await fetch(`${getBasePath()}/api/analytics/charts/components`);
            const result = await response.json();
            setComponentData(result.data || []);
        } catch (error) {
            console.error('Failed to fetch component interactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Always fetch data on mount, regardless of connection status
        fetchComponentData();
        
        // Set up polling for real-time updates every 5 seconds
        const interval = setInterval(() => {
            fetchComponentData();
        }, 5000);
        
        return () => clearInterval(interval);
    }, []); // Only run on mount

    const columns = [
        {
            title: 'Component',
            dataIndex: 'component',
            key: 'component',
            render: (component: string) => (
                <Tag color="purple" style={{ fontSize: '12px' }}>
                    {component}
                </Tag>
            ),
        },
        {
            title: 'Clicks',
            dataIndex: 'count',
            key: 'count',
            render: (count: number) => (
                <Text strong>{count}</Text>
            ),
            sorter: (a: ComponentInteraction, b: ComponentInteraction) => a.count - b.count,
            defaultSortOrder: 'descend' as const,
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <Title level={4} className="mb-4">
                    Component Interaction Analytics
                </Title>
                <Text type="secondary" className="mb-6 block">
                    Track which components users interact with most across the entire application
                </Text>

                {/* Chart */}
                {componentData.length > 0 && (
                    <div className="mb-6">
                        <Card title="Component Click Distribution" className="h-96">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={componentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="component" 
                                        tick={{ fontSize: 10 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar 
                                        dataKey="count" 
                                        fill="#722ed1" 
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                )}

                {/* Table */}
                                       <Card title="Top 5 Component Interactions">
                           <Table
                               dataSource={componentData.slice(0, 5)}
                               columns={columns}
                               rowKey="component"
                               pagination={false}
                               size="small"
                               scroll={{ x: 400 }}
                           />
                       </Card>

                {componentData.length === 0 && (
                    <div className="text-center py-8">
                        <Text type="secondary">
                            No component interactions recorded yet. Start clicking around the application to see data here!
                        </Text>
                    </div>
                )}
            </Card>
        </div>
    );
}; 