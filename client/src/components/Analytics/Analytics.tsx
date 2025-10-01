import React, { useState } from 'react';
import { Card, Table, Tag, Badge, Space, Typography, Tooltip, Button, Modal } from 'antd';
import { ReloadOutlined, EyeOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAnalytics } from '../../hooks/useAnalytics';
import { AnalyticsEvent } from '../../types/analytics';
import { AnalyticsCharts } from './AnalyticsCharts';
import { ComponentInteractions } from './ComponentInteractions';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

export const Analytics: React.FC = () => {
    const { events, isConnected, connectionError, trackEvent, trackClick, refreshData } = useAnalytics({ autoTrack: false });
    const [selectedEvent, setSelectedEvent] = useState<AnalyticsEvent | null>(null);

    const columns = [
        {
            title: 'Event',
            dataIndex: 'event',
            key: 'event',
            render: (event: string) => (
                <Tag color={event === 'page_visit' ? 'blue' : 'green'}>
                    {event}
                </Tag>
            ),
        },
        {
            title: 'Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp: string) => (
                <Space>
                    <ClockCircleOutlined />
                    <Text>{dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
                </Space>
            ),
            sorter: (a: AnalyticsEvent, b: AnalyticsEvent) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
            defaultSortOrder: 'descend' as const,
        },
        {
            title: 'Duration',
            dataIndex: 'duration',
            key: 'duration',
            render: (duration?: number) => 
                duration ? `${Math.round(duration)}ms` : '-',
        },
        {
            title: 'Component',
            dataIndex: 'component',
            key: 'component',
            render: (component?: string) => (
                component ? (
                    <Tag color="purple">{component}</Tag>
                ) : (
                    <Text type="secondary">-</Text>
                )
            ),
        },
        {
            title: 'Timezone',
            dataIndex: 'timeZone',
            key: 'timeZone',
            render: (timeZone?: string) => (
                <Space>
                    <GlobalOutlined />
                    <Text>{timeZone || 'Unknown'}</Text>
                </Space>
            ),
        },
        {
            title: 'URL',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            render: (url: string) => (
                <Tooltip title={url}>
                    <Text ellipsis style={{ maxWidth: 200 }}>
                        {new URL(url).pathname}
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: AnalyticsEvent) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        trackClick('view-event-details');
                        setSelectedEvent(record);
                    }}
                    size="small"
                    data-tracked="true"
                />
            ),
        },
    ];

    const handleTestEvent = () => {
        trackEvent('test_event', window.location.href, Math.random() * 1000 + 500);
    };

    const handleRefreshClick = () => {
        trackClick('refresh-analytics-data');
        refreshData();
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={3} className="mb-2">
                    Real-Time Analytics
                </Title>
                <Text type="secondary">
                    Track and visualize user interactions in real-time
                </Text>
            </div>

            {/* Analytics Charts */}
            <div className="mb-8">
                <AnalyticsCharts />
            </div>

            {/* Component Interactions */}
            <div className="mb-8">
                <ComponentInteractions />
            </div>

            {/* Recent Events */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <Title level={4} className="mb-2">
                            Recent Events
                        </Title>
                        <Space direction="vertical" size="small">
                            <Space>
                                <Badge 
                                    status={isConnected ? 'success' : 'error'} 
                                    text={isConnected ? 'Connected' : 'Disconnected'} 
                                />
                                <Text type="secondary">
                                    {events.length} events tracked
                                </Text>
                            </Space>
                            {connectionError && (
                                <Text type="warning" style={{ fontSize: '12px' }}>
                                    Analytics server not available - events will not be tracked
                                </Text>
                            )}
                        </Space>
                    </div>
                    <Space>
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={handleTestEvent}
                            data-tracked="true"
                        >
                            Test Event
                        </Button>
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={handleRefreshClick}
                            data-tracked="true"
                        >
                            Refresh Data
                        </Button>
                    </Space>
                </div>

                <Table
                    dataSource={events}
                    columns={columns}
                    rowKey="uuid"
                    pagination={false}
                    scroll={{ x: 800 }}
                    size="small"
                />
            </Card>

            {/* Event Detail Modal */}
            <Modal
                title="Event Details"
                open={!!selectedEvent}
                onCancel={() => {
                    trackClick('close-event-modal');
                    setSelectedEvent(null);
                }}
                footer={null}
                width={600}
            >
                {selectedEvent && (
                    <div className="space-y-4">
                        <div>
                            <Text strong>Event:</Text>
                            <Tag color="blue" className="ml-2">
                                {selectedEvent.event}
                            </Tag>
                        </div>
                        <div>
                            <Text strong>Timestamp:</Text>
                            <Text className="ml-2">
                                {dayjs(selectedEvent.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                            </Text>
                        </div>
                        <div>
                            <Text strong>Duration:</Text>
                            <Text className="ml-2">
                                {selectedEvent.duration ? `${Math.round(selectedEvent.duration)}ms` : 'N/A'}
                            </Text>
                        </div>
                        <div>
                            <Text strong>Component:</Text>
                            <Text className="ml-2">
                                {selectedEvent.component ? (
                                    <Tag color="purple">{selectedEvent.component}</Tag>
                                ) : (
                                    'N/A'
                                )}
                            </Text>
                        </div>
                        <div>
                            <Text strong>Timezone:</Text>
                            <Text className="ml-2">{selectedEvent.timeZone || 'Unknown'}</Text>
                        </div>
                        <div>
                            <Text strong>URL:</Text>
                            <Text className="ml-2 break-all">{selectedEvent.baseUrl}</Text>
                        </div>
                        <div>
                            <Text strong>UUID:</Text>
                            <Text className="ml-2 font-mono text-xs">{selectedEvent.uuid}</Text>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}; 