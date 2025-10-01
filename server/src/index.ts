import express, { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { fileRoutes } from './routes/fileRoutes';
import { metadataRoutes } from './routes/metadataRoutes';
import { createAnalyticsRoutes } from './routes/analyticsRoutes';
import AnalyticsService from './services/AnalyticsService';

// App configuration
const { APP_NAME } = require('../../config');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  path: `/${APP_NAME}/socket.io/`
});

const PORT = process.env.APP_PORT || process.env.PORT || 3001;

// Initialize analytics service
const analyticsService = new AnalyticsService();
analyticsService.setSocketServer(io);

// Create analytics routes with the shared service instance
const analyticsRoutes = createAnalyticsRoutes(analyticsService);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from docs directory
app.use('/docs', express.static(path.join(__dirname, '../docs')));

// Swagger UI setup
app.use(`/${APP_NAME}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Data Dictionary Explorer API Documentation'
}));

// Create API router with BASE_PATH prefix
const apiRouter = express.Router();

// Mount individual route modules on the API router (without BASE_PATH prefix)
apiRouter.use('/files', fileRoutes);
apiRouter.use('/metadata', metadataRoutes);
apiRouter.use('/analytics', analyticsRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API server is running and healthy
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */
// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount the API router with APP_NAME prefix
app.use(`/${APP_NAME}/api`, apiRouter);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  console.log('Serving static files from:', path.join(__dirname, '../../client/dist'));
  app.use(`/${APP_NAME}`, express.static(path.join(__dirname, '../../client/dist')));
  
  app.get(`/${APP_NAME}/*`, (req: Request, res: Response) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }
    res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'));
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  // Send current events to newly connected client
  const events = analyticsService.getRecentEvents();
  socket.emit('analytics_events', events);
  
  // Handle track_event from client
          socket.on('track_event', (data) => {
            console.log('Server received track_event:', data);
            analyticsService.handleVisit(
                data.timeZone,
                data.event,
                data.baseUrl,
                data.duration,
                data.component
            );
        });

        socket.on('request_events', () => {
            const recentEvents = analyticsService.getRecentEvents();
            socket.emit('analytics_events', recentEvents);
        });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
  console.log(`Docs directory: ${path.join(__dirname, '../docs')}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});