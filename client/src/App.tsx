import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { AppLayout } from './components/Layout'
import { Explorer } from './pages/Explorer'
import { About } from './pages/About'
import { AnalyticsPage } from './pages/Analytics'
import { useGlobalClickTracking } from './hooks/useGlobalClickTracking'

function App() {
  // Initialize global click tracking
  useGlobalClickTracking();

  // Get theme from localStorage, system, or default to dark
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('theme');
      if (cached === 'dark') return true;
      if (cached === 'light') return false;
      if (window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    return true;
  };
  const [isDarkMode, setIsDarkMode] = React.useState(getInitialTheme);

  // Listen for system theme changes only if not overridden
  React.useEffect(() => {
    if (localStorage.getItem('theme')) return;
    if (!window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Cache theme changes
  const handleThemeChange = (dark: boolean) => {
    setIsDarkMode(dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: isDarkMode ? {
          // Custom dark theme colors
          colorBgContainer: '#1a1a1a',
          colorBgElevated: '#262626',
          colorBgLayout: '#0d0d0d',
          colorBgSpotlight: '#262626',
          colorBgMask: 'rgba(0, 0, 0, 0.45)',
          colorBorder: '#434343',
          colorBorderSecondary: '#303030',
          colorText: '#ffffff',
          colorTextSecondary: '#a6a6a6',
          colorTextTertiary: '#737373',
          colorTextQuaternary: '#595959',
          colorFill: '#434343',
          colorFillSecondary: '#303030',
          colorFillTertiary: '#262626',
          colorFillQuaternary: '#1f1f1f',
          colorPrimary: '#1890ff',
          colorPrimaryHover: '#40a9ff',
          colorPrimaryActive: '#096dd9',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#1890ff',

          // GitHub Dark theme colors
          // colorBgContainer: '#0d1117',
          // colorBgElevated: '#161b22',
          // colorBgLayout: '#0d1117',
          // colorBgSpotlight: '#161b22',
          // colorBgMask: 'rgba(1, 4, 9, 0.8)',
          // colorBorder: '#30363d',
          // colorBorderSecondary: '#21262d',
          // colorText: '#c9d1d9',
          // colorTextSecondary: '#8b949e',
          // colorTextTertiary: '#6e7681',
          // colorTextQuaternary: '#484f58',
          // colorFill: '#21262d',
          // colorFillSecondary: '#30363d',
          // colorFillTertiary: '#161b22',
          // colorFillQuaternary: '#0d1117',
          // colorPrimary: '#58a6ff',
          // colorPrimaryHover: '#79c0ff',
          // colorPrimaryActive: '#1f6feb',
          // colorSuccess: '#3fb950',
          // colorWarning: '#d29922',
          // colorError: '#f85149',
          // colorInfo: '#58a6ff',
        } : {
          // Custom light theme colors (optional)
          colorPrimary: '#1890ff',
        }
      }}
    >
      <AppLayout isDarkMode={isDarkMode} onThemeChange={handleThemeChange}>
        <Routes>
          <Route path="/" element={<Explorer />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/about" element={<About />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </AppLayout>
    </ConfigProvider>
  )
}

export default App