import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import AnalyticsService from '../services/AnalyticsService';

// Function to create routes with a shared analytics service instance
export const createAnalyticsRoutes = (analyticsService: AnalyticsService) => {
    const router = Router();
    const analyticsController = new AnalyticsController(analyticsService);

    /**
     * @swagger
     * /analytics/events:
     *   get:
     *     summary: Get recent analytics events
     *     description: Retrieve the most recent analytics events tracked by the system
     *     tags: [Analytics]
     *     parameters:
     *       - in: query
     *         name: pageSize
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 1000
     *         description: Number of events to return
     *     responses:
     *       200:
     *         description: Analytics events retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 events:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/AnalyticsEvent'
     *                 count:
     *                   type: number
     *                   description: Number of events returned
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get('/events', analyticsController.getRecentEvents);

    /**
     * @swagger
     * /analytics/count:
     *   get:
     *     summary: Get total event count
     *     description: Retrieve the total number of analytics events tracked
     *     tags: [Analytics]
     *     responses:
     *       200:
     *         description: Event count retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 count:
     *                   type: number
     *                   description: Total number of events
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get('/count', analyticsController.getEventCount);

    /**
     * @swagger
     * /analytics/charts/hourly:
     *   get:
     *     summary: Get hourly visits chart data
     *     description: Retrieve data for hourly visits distribution chart
     *     tags: [Analytics]
     *     responses:
     *       200:
     *         description: Hourly visits data retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/ChartData'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get('/charts/hourly', analyticsController.getVisitsByHour);

    /**
     * @swagger
     * /analytics/charts/daily:
     *   get:
     *     summary: Get daily visits chart data
     *     description: Retrieve data for daily visits distribution chart
     *     tags: [Analytics]
     *     responses:
     *       200:
     *         description: Daily visits data retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/ChartData'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get('/charts/daily', analyticsController.getVisitsByDay);

    /**
     * @swagger
     * /analytics/charts/monthly:
     *   get:
     *     summary: Get monthly visits chart data
     *     description: Retrieve data for monthly visits distribution chart
     *     tags: [Analytics]
     *     responses:
     *       200:
     *         description: Monthly visits data retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/ChartData'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get('/charts/monthly', analyticsController.getVisitsByMonth);

    /**
     * @swagger
     * /analytics/charts/duration:
     *   get:
     *     summary: Get duration distribution chart data
     *     description: Retrieve data showing the distribution of visit durations
     *     tags: [Analytics]
     *     responses:
     *       200:
     *         description: Duration distribution data retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/ChartData'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get('/charts/duration', analyticsController.getDurationDistribution);

    /**
     * @swagger
     * /analytics/charts/components:
     *   get:
     *     summary: Get component interactions chart data
     *     description: Retrieve data showing interactions with different UI components
     *     tags: [Analytics]
     *     responses:
     *       200:
     *         description: Component interactions data retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/ChartData'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get('/charts/components', analyticsController.getComponentInteractions);

    return router;
}; 