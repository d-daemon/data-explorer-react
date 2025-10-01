import { Request, Response } from 'express';
import AnalyticsService from '../services/AnalyticsService';

export class AnalyticsController {
    private analyticsService: AnalyticsService;

    constructor(analyticsService: AnalyticsService) {
        this.analyticsService = analyticsService;
    }

    getRecentEvents = (req: Request, res: Response) => {
        try {
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined;
            const events = this.analyticsService.getRecentEvents(pageSize);
            res.json({ events, count: events.length });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch analytics events' });
        }
    };

    getEventCount = (req: Request, res: Response) => {
        try {
            const count = this.analyticsService.getEventCount();
            res.json({ count });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch event count' });
        }
    };

    getVisitsByHour = (req: Request, res: Response) => {
        try {
            const data = this.analyticsService.getVisitsByHour();
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch visits by hour' });
        }
    };

    getVisitsByDay = (req: Request, res: Response) => {
        try {
            const data = this.analyticsService.getVisitsByDay();
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch visits by day' });
        }
    };

    getVisitsByMonth = (req: Request, res: Response) => {
        try {
            const data = this.analyticsService.getVisitsByMonth();
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch visits by month' });
        }
    };

    getDurationDistribution = (req: Request, res: Response) => {
        try {
            const data = this.analyticsService.getDurationDistribution();
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch duration distribution' });
        }
    };

    getComponentInteractions = (req: Request, res: Response) => {
        try {
            const data = this.analyticsService.getComponentInteractions();
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch component interactions' });
        }
    };
} 