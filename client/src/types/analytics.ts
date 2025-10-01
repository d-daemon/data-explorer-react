export interface AnalyticsEvent {
    timeZone?: string;
    event: string;
    duration?: number;
    baseUrl: string;
    timestamp: string;
    uuid: string;
    component?: string;
}

export interface AnalyticsResponse {
    events: AnalyticsEvent[];
    count: number;
} 