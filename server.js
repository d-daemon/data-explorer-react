const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./server/dist/config/swagger');

// App configuration
const { APP_NAME } = require('./config');
const basePath = `/${APP_NAME}`;

// Import server routes and middleware
const fileRoutes = require('./server/dist/routes/fileRoutes').fileRoutes;
const metadataRoutes = require('./server/dist/routes/metadataRoutes').metadataRoutes;

// Import analytics functionality
const AnalyticsService = require('./server/dist/services/AnalyticsService').default;
const { createAnalyticsRoutes } = require('./server/dist/routes/analyticsRoutes');

const app = express();
const server = createServer(app);
const port = process.env.APP_PORT || process.env.PORT || 3000;

// Initialize Socket.IO server
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? process.env.CORS_ORIGIN || true 
            : "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    path: `${basePath}/socket.io/`,
    transports: ['polling'],
    allowEIO3: true
});

// Initialize analytics service
const analyticsService = new AnalyticsService();
analyticsService.setSocketServer(io);

// Create analytics routes with the shared service instance
const analyticsRoutes = createAnalyticsRoutes(analyticsService);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI setup
app.use(`${basePath}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Data Dictionary Explorer API Documentation'
}));

// API routes
app.use(`${basePath}/api/files`, fileRoutes);
app.use(`${basePath}/api/metadata`, metadataRoutes);
app.use(`${basePath}/api/analytics`, analyticsRoutes);

// Health check endpoint
app.get(`${basePath}/api/health`, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from the built react app
console.log('Serving static files from:', path.join(__dirname, 'client/dist'));
app.use(basePath, express.static(path.join(__dirname, 'client/dist')));

// Handle react routing, return all requests to React app
app.get('/{*splat}', (req, res) => {
    // Don't intercept API or API docs routes
    if (req.path.startsWith(`${basePath}/api/`) || req.path.startsWith(`${basePath}/api-docs`)) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send initial events to the client
    const recentEvents = analyticsService.getRecentEvents();
    socket.emit('analytics_events', recentEvents);
    
    // Handle track_event from client
    socket.on('track_event', (data) => {
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

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Socket.IO server initialized`);
    console.log(`App name: ${APP_NAME}`);
    console.log(`React app available at http://localhost:${port}${basePath}/`);
    console.log(`API available at http://localhost:${port}${basePath}/api`);
});

module.exports = app;
