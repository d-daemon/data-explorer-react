import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';

// Import getBasePath function
const getBasePath = () => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? `/${segments[0]}` : '';
};

interface ChartData {
    data: Array<{
        hour?: string;
        date?: string;
        month?: string;
        range?: string;
        count: number;
    }>;
}

export const AnalyticsCharts: React.FC = () => {
    const { isConnected, events, trackClick } = useAnalytics({ autoTrack: false });
    const [hourlyData, setHourlyData] = useState<ChartData | null>(null);
    const [dailyData, setDailyData] = useState<ChartData | null>(null);
    const [monthlyData, setMonthlyData] = useState<ChartData | null>(null);
    const [durationData, setDurationData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchChartData = async () => {
        try {
            const [hourly, daily, monthly, duration] = await Promise.all([
                fetch(`${getBasePath()}/api/analytics/charts/hourly`).then(res => res.json()),
                fetch(`${getBasePath()}/api/analytics/charts/daily`).then(res => res.json()),
                fetch(`${getBasePath()}/api/analytics/charts/monthly`).then(res => res.json()),
                fetch(`${getBasePath()}/api/analytics/charts/duration`).then(res => res.json())
            ]);

            setHourlyData(hourly);
            setDailyData(daily);
            setMonthlyData(monthly);
            setDurationData(duration);
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Always fetch data on mount, regardless of connection status
        fetchChartData();
        
        // Set up polling for real-time updates every 5 seconds
        const interval = setInterval(() => {
            fetchChartData();
        }, 5000);
        
        return () => clearInterval(interval);
    }, []); // Only run on mount

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }


    // Debug info removed to reduce console spam

    return (
        <div className="space-y-6">
            <Row gutter={[16, 16]}>
                {/* Hourly Visits - Last 24 Hours */}
                <Col xs={24} lg={12}>
                    <Card 
                        title="Visits by Hour (Last 24 Hours)" 
                        className="h-96"
                        onClick={() => trackClick('hourly-visits-chart')}
                        style={{ cursor: 'pointer' }}
                        data-tracked="true"
                    >
                        <div className="text-xs text-gray-500 mb-2">
                            Total visits: {hourlyData?.data?.reduce((sum, d) => sum + d.count, 0) || 0}
                            {hourlyData?.data && hourlyData.data.length > 0 && (
                                <span className="ml-2">
                                    | Max: {Math.max(...hourlyData.data.map(d => d.count))}
                                </span>
                            )}
                        </div>
                        {hourlyData?.data && hourlyData.data.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={hourlyData.data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="hour" 
                                        tick={{ fontSize: 12 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Line 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#1890ff" 
                                        strokeWidth={2}
                                        dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-80 text-gray-500">
                                No data available for hourly visits
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Daily Visits - Last 30 Days */}
                <Col xs={24} lg={12}>
                    <Card 
                        title="Visits by Day (Last 30 Days)" 
                        className="h-96"
                        onClick={() => trackClick('daily-visits-chart')}
                        style={{ cursor: 'pointer' }}
                        data-tracked="true"
                    >
                        <div className="text-xs text-gray-500 mb-2">
                            Total visits: {dailyData?.data?.reduce((sum, d) => sum + d.count, 0) || 0}
                            {dailyData?.data && dailyData.data.length > 0 && (
                                <span className="ml-2">
                                    | Max: {Math.max(...dailyData.data.map(d => d.count))}
                                </span>
                            )}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyData?.data || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12 }}
                                    interval="preserveStartEnd"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#52c41a" 
                                    strokeWidth={2}
                                    dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Monthly Visits - Last 3 Months */}
                <Col xs={24} lg={12}>
                    <Card 
                        title="Visits by Month (Last 3 Months)" 
                        className="h-96"
                        onClick={() => trackClick('monthly-visits-chart')}
                        style={{ cursor: 'pointer' }}
                        data-tracked="true"
                    >
                        <div className="text-xs text-gray-500 mb-2">
                            Total visits: {monthlyData?.data?.reduce((sum, d) => sum + d.count, 0) || 0}
                            {monthlyData?.data && monthlyData.data.length > 0 && (
                                <span className="ml-2">
                                    | Max: {Math.max(...monthlyData.data.map(d => d.count))}
                                </span>
                            )}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData?.data || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 12 }}
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
                </Col>

                {/* Duration Distribution */}
                <Col xs={24} lg={12}>
                    <Card 
                        title="Duration Distribution" 
                        className="h-96"
                        onClick={() => trackClick('duration-distribution-chart')}
                        style={{ cursor: 'pointer' }}
                        data-tracked="true"
                    >
                        <div className="text-xs text-gray-500 mb-2">
                            Total sessions: {durationData?.data?.reduce((sum, d) => sum + d.count, 0) || 0}
                            {durationData?.data && durationData.data.length > 0 && (
                                <span className="ml-2">
                                    | Max: {Math.max(...durationData.data.map(d => d.count))}
                                </span>
                            )}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={durationData?.data || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="range" 
                                    tick={{ fontSize: 10 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar 
                                    dataKey="count" 
                                    fill="#fa8c16" 
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}; 