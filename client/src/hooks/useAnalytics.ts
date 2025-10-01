import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { AnalyticsEvent } from '../types/analytics';

// Global flag to prevent multiple beforeunload listeners
let globalBeforeUnloadListenerAdded = false;

// Get the base path from the current URL
const getBasePath = () => {
    const pathname = window.location.pathname;
    // Extract the base path (e.g., /app-name from /app-name/analytics)
    const pathParts = pathname.split('/').filter(Boolean);
    return pathParts.length > 0 ? `/${pathParts[0]}` : '';
};

interface UseAnalyticsOptions {
    serverUrl?: string;
    autoTrack?: boolean;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
    // Get server URL from environment or use backend server
    const getServerUrl = () => {
        if (options.serverUrl) return options.serverUrl;
        
        // For production, use the same origin as the current page
        if (process.env.NODE_ENV === 'production') {
            return window.location.origin;
        }
        
        // For development, use the development server
        return 'http://localhost:3000';
    };

    const { autoTrack = true } = options;
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const pageLoadTimeRef = useRef<number>(Date.now());

    const trackEvent = useCallback((
        event: string = 'page_visit',
        baseUrl: string = window.location.href,
        duration?: number,
        component?: string
    ) => {
        if (socketRef.current && socketRef.current.connected) {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const eventData = {
                timeZone,
                event,
                duration,
                baseUrl,
                component
            };
            socketRef.current.emit('track_event', eventData);
        }
    }, []);

    const trackPageVisit = useCallback(() => {
        const duration = Date.now() - pageLoadTimeRef.current;
        trackEvent('page_visit', window.location.href, duration);
    }, [trackEvent]);

    const trackClick = useCallback((component: string) => {
        trackEvent('component_click', window.location.href, undefined, component);
    }, [trackEvent]);

    const refreshData = useCallback(() => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('request_events');
        }
    }, []);

    useEffect(() => {
        const serverUrl = getServerUrl();
        
        // Small delay to ensure server is ready
        const connectTimeout = setTimeout(() => {
            try {
                const basePath = getBasePath();
                console.log('Socket.IO Connection Debug:', {
                    serverUrl,
                    basePath,
                    path: `${basePath}/socket.io/`,
                    environment: process.env.NODE_ENV,
                    currentUrl: window.location.href
                });

                socketRef.current = io(serverUrl, {
                    transports: ['polling'], // Use only polling to avoid WebSocket errors
                    timeout: 10000,
                    forceNew: false,
                    path: `${basePath}/socket.io/`,
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    reconnectionAttempts: 10,
                    withCredentials: true
                });

                const socket = socketRef.current;

                socket.on('connect', () => {
                    setIsConnected(true);
                    setConnectionError(null);
                    
                    // Auto-track page visits when connected
                    if (autoTrack) {
                        trackPageVisit();
                    }
                });

                socket.on('connect_error', (error) => {
                    console.error('Socket.IO connection error:', error);
                    setIsConnected(false);
                    setConnectionError(`Connection failed: ${error.message}`);
                });

                socket.on('disconnect', (reason) => {
                    setIsConnected(false);
                    if (reason === 'io server disconnect') {
                        setConnectionError('Server disconnected');
                    }
                });

                socket.on('analytics_events', (initialEvents: AnalyticsEvent[]) => {
                    setEvents(initialEvents);
                });

                socket.on('analytics_event', (newEvent: AnalyticsEvent) => {
                    setEvents(prev => {
                        const updated = [...prev, newEvent];
                        // Keep only the latest 30 events
                        return updated.slice(-30);
                    });
                });
            } catch (error) {
                setConnectionError(`Failed to initialize connection: ${error}`);
                console.error('Analytics initialization error:', error);
            }
        }, 100);

        return () => {
            clearTimeout(connectTimeout);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [autoTrack]); // Removed trackPageVisit to prevent re-connecting on every render

    // Track page unload - only add one global listener
    useEffect(() => {
        if (!globalBeforeUnloadListenerAdded) {
            const handleBeforeUnload = () => {
                const duration = Date.now() - pageLoadTimeRef.current;
                // Find any active socket connection to send the event
                if (socketRef.current && socketRef.current.connected) {
                    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    socketRef.current.emit('track_event', {
                        timeZone,
                        event: 'page_exit',
                        duration,
                        baseUrl: window.location.href
                    });
                }
            };

            window.addEventListener('beforeunload', handleBeforeUnload);
            globalBeforeUnloadListenerAdded = true;
            
            // Don't remove the listener in cleanup to keep it global
        }
    }, []);

    return {
        events,
        isConnected,
        connectionError,
        trackEvent,
        trackPageVisit,
        trackClick,
        refreshData,
        socketRef
    };
};