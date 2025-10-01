import { randomUUID, type UUID } from 'node:crypto';
import { Temporal } from '@js-temporal/polyfill';
import type { Server } from 'socket.io';

// Simple timezone validation function
const isValidTimezone = (timezone?: string): boolean => {
  if (!timezone) return true;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

interface AnalyticsEvent {
    timeZone?: string;
    event: string;
    duration?: number;
    baseUrl: string;
    timestamp: string;
    uuid: UUID;
    component?: string;
}

export default class AnalyticsService {
    private recentEventsList: AnalyticsEvent[] = [];
    private allEventsList: AnalyticsEvent[] = [];
    private io: Server | null = null;
    private readonly maxEvents = 30;

    setSocketServer(io: Server) {
        this.io = io;
    }

    handleVisit(
        timeZone?: string,
        event: string = 'page_visit',
        baseUrl: string = '',
        duration?: number,
        component?: string
    ) {
        console.log('AnalyticsService.handleVisit called:', { timeZone, event, baseUrl, duration, component });
        
        // Validate timezone and duration
        // For page_visit events, allow any duration (including 0)
        // For other events, require duration > 750ms or undefined
        const isValidDuration = event === 'page_visit' || 
            duration === undefined || 
            duration > 750;
            
        console.log('Validation results:', { isValidTimezone: isValidTimezone(timeZone), isValidDuration });
            
        if (isValidTimezone(timeZone) && isValidDuration) {
            
            const analyticsEvent: AnalyticsEvent = {
                timeZone,
                event: (event ?? '').toString(),
                duration,
                baseUrl,
                timestamp: Temporal.Now.instant().toJSON(),
                uuid: randomUUID(),
                component
            };

            console.log('Storing event:', analyticsEvent);
            this.recentEventsList.push(analyticsEvent);
            this.allEventsList.push(analyticsEvent);
            
            console.log('After storing - recentEventsList length:', this.recentEventsList.length);
            console.log('After storing - allEventsList length:', this.allEventsList.length);
            
            // Keep only the latest 30 events for recent display
            if (this.recentEventsList.length > this.maxEvents) {
                this.recentEventsList = this.recentEventsList.slice(-this.maxEvents);
            }
            
            // Temporarily disable clearOldEntries to debug
            // this.clearOldEntries();

            // Emit to connected clients
            if (this.io) {
                this.io.emit('analytics_event', analyticsEvent);
            }

            // Temporarily disable clearOldEntries to debug
            // this.clearOldEntries();
        }
    }

    private isRecent(instant: Temporal.Instant) {
        const now = Temporal.Now.instant();
        const hoursDiff = now.since(instant, { largestUnit: 'hour' }).hours;
        console.log('isRecent check:', { 
            eventTime: instant.toString(), 
            now: now.toString(), 
            hoursDiff, 
            isRecent: hoursDiff <= 24 
        });
        return hoursDiff <= 24;
    }

    private clearOldEntries() {
        console.log('clearOldEntries called. Before filtering:');
        console.log('recentEventsList length:', this.recentEventsList.length);
        console.log('allEventsList length:', this.allEventsList.length);
        
        // Clear old entries from both lists
        this.recentEventsList = this.recentEventsList.filter((event) => {
            const isRecent = this.isRecent(Temporal.Instant.from(event.timestamp));
            console.log('Event timestamp:', event.timestamp, 'isRecent:', isRecent);
            return isRecent;
        });
        this.allEventsList = this.allEventsList.filter((event) => {
            const isRecent = this.isRecent(Temporal.Instant.from(event.timestamp));
            return isRecent;
        });
        
        console.log('After filtering:');
        console.log('recentEventsList length:', this.recentEventsList.length);
        console.log('allEventsList length:', this.allEventsList.length);
    }

    getRecentEvents(pageSize?: number) {
        // Temporarily disable clearOldEntries to debug
        // this.clearOldEntries();
        if (pageSize) {
            return this.recentEventsList.slice(-pageSize);
        }
        return this.recentEventsList;
    }

    getEventCount() {
        // Temporarily disable clearOldEntries to debug
        // this.clearOldEntries();
        return this.recentEventsList.length;
    }

    // Get visits by hour for the last 24 hours
    getVisitsByHour() {
        // Temporarily disable clearOldEntries to debug
        // this.clearOldEntries();
        const now = new Date();
        const hours = Array.from({ length: 24 }, (_, i) => {
            const hourStart = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
            hourStart.setMinutes(0, 0, 0);
            const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
            return {
                hour: hourStart.getHours().toString().padStart(2, '0'),
                count: this.allEventsList.filter(event => {
                    const eventTime = new Date(event.timestamp);
                    return event.event === 'page_visit' && 
                           eventTime >= hourStart && eventTime < hourEnd;
                }).length
            };
        });
        return hours;
    }

    // Get visits by day for the last 30 days
    getVisitsByDay() {
        // Temporarily disable clearOldEntries to debug
        // this.clearOldEntries();
        const now = new Date();
        const days = Array.from({ length: 30 }, (_, i) => {
            const dayStart = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            return {
                date: dayStart.toISOString().slice(0, 10),
                count: this.allEventsList.filter(event => {
                    const eventTime = new Date(event.timestamp);
                    return event.event === 'page_visit' && 
                           eventTime >= dayStart && eventTime < dayEnd;
                }).length
            };
        });
        return days;
    }

    // Get visits by month for the last 3 months
    getVisitsByMonth() {
        // Temporarily disable clearOldEntries to debug
        // this.clearOldEntries();
        const now = new Date();
        const months = Array.from({ length: 3 }, (_, i) => {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
            const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
            return {
                month: monthStart.toISOString().slice(0, 7),
                count: this.allEventsList.filter(event => {
                    const eventTime = new Date(event.timestamp);
                    return event.event === 'page_visit' && 
                           eventTime >= monthStart && eventTime < monthEnd;
                }).length
            };
        });
        return months;
    }

    // Get duration distribution
    getDurationDistribution() {
        // Temporarily disable clearOldEntries to debug
        // this.clearOldEntries();
        const durations = this.allEventsList
            .filter(event => event.duration && event.duration > 0)
            .map(event => event.duration!);

        if (durations.length === 0) return [];

        const min = Math.min(...durations);
        const max = Math.max(...durations);
        const range = max - min;
        const bucketCount = 10;
        const bucketSize = range / bucketCount;

        const buckets = Array.from({ length: bucketCount }, (_, i) => {
            const bucketStart = min + (i * bucketSize);
            const bucketEnd = bucketStart + bucketSize;
            const count = durations.filter(d => d >= bucketStart && d < bucketEnd).length;
            return {
                range: `${Math.round(bucketStart)}-${Math.round(bucketEnd)}ms`,
                count
            };
        });

        return buckets;
    }

    // Get component interactions
    getComponentInteractions() {
        // Temporarily disable clearOldEntries to debug
        // this.clearOldEntries();
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const recentEvents = this.allEventsList.filter(event => 
            new Date(event.timestamp) >= oneDayAgo && event.component
        );

        const componentCounts = recentEvents.reduce((acc, event) => {
            const component = event.component || 'unknown';
            acc[component] = (acc[component] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const distribution = Object.entries(componentCounts).map(([component, count]) => ({
            component,
            count
        })).sort((a, b) => b.count - a.count);

        return distribution;
    }
} 