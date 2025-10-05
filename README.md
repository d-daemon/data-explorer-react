# Data Explorer

<div align="center">

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB.svg?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000.svg?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101.svg?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4.svg?style=for-the-badge&logo=prettier)](https://prettier.io/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

A modern, high-performance web application for exploring, searching, and managing enterprise data dictionaries. Built with React and Node.js, it provides a centralized interface for Excel-based data dictionaries with real-time analytics and advanced filtering capabilities.

---

## Features

### Data Management

- **Excel File Support**: Upload and manage Excel (.xlsx/.xls) data dictionaries
- **Multi-Sheet Navigation**: Browse through multiple sheets within Excel files
- **Metadata Display**: View comprehensive metadata for each data dictionary
- **File System Integration**: Direct access to files in the `/server/docs` directory

### Data Exploration

- **Advanced Filtering**: Create complex filters with multiple operators (contains, equals, starts with, etc.)
- **Real-time Search**: Instant search across all data with debounced input
- **Virtualized Tables**: High-performance rendering of large datasets using react-window
- **Column Management**: Show/hide columns and customize table views
- **Pagination**: Efficient handling of large datasets with configurable page sizes

### Analytics & Tracking

- **Real-time Analytics**: Track user interactions and page visits using Socket.IO
- **Interactive Charts**: Visualize analytics data with hourly, daily, and monthly trends
- **Event Tracking**: Monitor component interactions, page visits, and user behavior
- **Connection Status**: Real-time connection monitoring for analytics

### User Experience

- **Dark/Light Theme**: Automatic theme detection with manual override
- **Responsive Design**: Mobile-friendly interface built with Ant Design
- **Keyboard Shortcuts**: Quick navigation with keyboard shortcuts (e.g., `[` to toggle sidebar)
- **Modern UI**: Clean, professional interface with smooth animations

---

## Architecture

### Frontend (React + TypeScript)

- **Framework**: React 19 with TypeScript
- **State Management**: Zustand for global state
- **UI Library**: Ant Design with custom theming
- **Routing**: React Router v7
- **Data Fetching**: React Query for server state management
- **Styling**: Tailwind CSS with PostCSS
- **Build Tool**: Vite

### Backend (Node.js + Express)

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with compiled JavaScript
- **Real-time**: Socket.IO for WebSocket connections
- **File Processing**: XLSX library for Excel file handling
- **API Documentation**: Swagger/OpenAPI integration
- **Security**: Helmet, CORS, and input validation

### Key Components

#### Client-Side

- **AppLayout**: Main application layout with navigation and theme switching
- **Explorer**: Primary data exploration interface
- **FileManager**: File selection and management
- **DataTable**: Virtualized table with filtering and search
- **FilterPanel**: Advanced filtering interface
- **Analytics**: Real-time analytics dashboard with charts
- **MetadataDisplay**: System metadata visualization

#### Server-Side

- **FileController**: Handles Excel file operations and data retrieval
- **MetadataController**: Manages system metadata
- **AnalyticsController**: Processes analytics data and API endpoints
- **AnalyticsService**: Real-time event tracking and storage
- **ExcelService**: Excel file parsing and data extraction
- **FileSystemService**: File system operations

---

## API Endpoints

### Files

- `GET /api/files` - List all available Excel files
- `GET /api/files/{filename}` - Get file information and sheet names
- `GET /api/files/{filename}/sheets/{sheetname}` - Get sheet data with pagination and filtering

### Metadata

- `GET /api/metadata` - Get system metadata for all files

### Analytics

- `GET /api/analytics/events` - Get recent analytics events
- `GET /api/analytics/count` - Get total event count
- `GET /api/analytics/charts/{type}` - Get chart data (hourly, daily, monthly, duration)

### System

- `GET /api/health` - Health check endpoint
- `GET /api-docs` - Swagger API documentation

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Development Setup

1. **Clone and install dependencies**:

   ```bash
   git clone <repository-url>
   cd data-explorer-react
   npm install
   ```

2. **Start development servers**:

   ```bash
   npm run dev
   ```

   This starts both the React frontend (port 3000) and Node.js backend (port 3001) concurrently.

3. **Individual development commands**:

   ```bash
   npm run dev:client    # Frontend only
   npm run dev:server    # Backend only
   ```

### Production Deployment

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Start the production server**:

   ```bash
   npm start
   ```

   This runs `node server.js` which serves both the built React app and API.

### Environment Variables

- `APP_NAME`: Application name (default: "data-explorer-react")
- `APP_PORT` or `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Allowed CORS origins
- `NODE_ENV`: Environment mode (development/production)

---

## Usage

### Data Dictionary Management

1. **Add Excel Files**: Place your Excel data dictionary files in `/server/docs/`
2. **Select File**: Use the File Manager to choose a data dictionary
3. **Browse Sheets**: Navigate between different sheets using the sheet tabs
4. **View Metadata**: System metadata is automatically displayed for each file

### Data Exploration Usage

1. **Apply Filters**: Use the Filter Panel to create complex data filters
2. **Search**: Use the global search to find specific data across all columns
3. **Customize View**: Show/hide columns and adjust table settings
4. **Navigate**: Use pagination to browse through large datasets

### Analytics Usage

1. **View Dashboard**: Navigate to the Analytics page to see real-time data
2. **Monitor Usage**: Track page visits, user interactions, and system performance
3. **Analyze Trends**: Use interactive charts to understand usage patterns

---

## File Structure

```
data-explorer-react/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── stores/        # Zustand state management
│   │   └── types/         # TypeScript type definitions
│   └── dist/              # Built frontend assets
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # API route handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # Express route definitions
│   │   └── types/         # TypeScript type definitions
│   ├── docs/              # Excel data dictionary files
│   └── dist/              # Compiled backend code
├── config.js              # Application configuration
├── server.js              # Production server entry point
└── package.json           # Root package configuration
```

---

## Technology Stack

### Frontend

| Technology   | Version | Purpose             |
| ------------ | ------- | ------------------- |
| React        | 19.1.0  | UI Framework        |
| TypeScript   | 5.8.3   | Type Safety         |
| Ant Design   | 5.26.3  | UI Components       |
| React Router | 7.6.3   | Client-side Routing |
| Zustand      | 5.0.6   | State Management    |
| React Query  | 5.81.5  | Server State        |
| Tailwind CSS | 4.1.11  | Styling             |
| Vite         | 7.0.0   | Build Tool          |

### Backend

| Technology         | Version | Purpose                 |
| ------------------ | ------- | ----------------------- |
| Node.js            | Latest  | Runtime Environment     |
| Express            | 5.1.0   | Web Framework           |
| TypeScript         | 5.8.3   | Type Safety             |
| Socket.IO          | 4.8.1   | Real-time Communication |
| XLSX               | 0.18.5  | Excel File Processing   |
| Swagger UI Express | 5.0.1   | API Documentation       |

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Install** packages: `npm install`
5. **Run** tests: `npm test`
6. **Build** the project: `npm run build`
7. **Start** the server: `npm start`
8. **Submit** a pull request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## License

This project is licensed under the **MIT License**.

---
