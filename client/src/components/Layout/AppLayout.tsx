import React, { useState, useEffect } from 'react';
import { Layout, Menu, Space, Typography, Button, Tooltip } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';
import { 
  TableOutlined, 
  InfoCircleOutlined, 
  BarChartOutlined,
  SunOutlined,
  MoonOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  isDarkMode,
  onThemeChange,
}) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
      const { trackClick } = useAnalytics({ autoTrack: false });

  // Keyboard event handler for "[" key
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '[') {
        setCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const menuItems = [
    {
      key: '/',
      icon: <TableOutlined />,
      label: <Link to="/" className="text-inherit no-underline">Data Explorer</Link>,
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: <Link to="/analytics" className="text-inherit no-underline">Analytics</Link>,
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about" className="text-inherit no-underline">About</Link>,
    },
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Fixed Top Navbar */}
      <Header 
        className="flex items-center justify-between px-6"
        style={{
          backgroundColor: isDarkMode ? '#030612' : '#ffffff',
          borderBottom: `1px solid ${isDarkMode ? '#1f2937' : '#e5e7eb'}`,
          height: '50px',
          padding: '0 24px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}
      >
        <div className="flex items-center">
          <Title 
            level={4} 
            className="m-0 font-semibold"
            style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
          >
            d-daemon
          </Title>
        </div>
        
        <div className="flex items-center space-x-4">
          <Tooltip title="GitHub Repository">
            <a
              href="https://github.com/d-daemon/data-explorer-react"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
              style={{ marginRight: 8 }}
              aria-label="GitHub Repository"
              onClick={(e) => {
                trackClick('github-repository');
                // Small delay to ensure tracking completes before navigation
                e.preventDefault();
                const href = e.currentTarget.href;
                setTimeout(() => {
                  window.open(href, '_blank', 'noopener,noreferrer');
                }, 100);
              }}
              data-tracked="true"
            >
              <FontAwesomeIcon icon={faGithub} size="lg" color={isDarkMode ? '#fff' : '#181717'} />
            </a>
          </Tooltip>
          <Button
            type="text"
            icon={isDarkMode ? <SunOutlined style={{ fontSize: '20px' }} /> : <MoonOutlined style={{ fontSize: '20px' }} />}
            onClick={() => {
              trackClick('toggle-theme');
              onThemeChange(!isDarkMode);
            }}
            className="flex items-center justify-center"
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            data-tracked="true"
          />
        </div>
      </Header>

      <Layout style={{ marginTop: '50px', height: 'calc(100vh - 50px)' }}>
        {/* Fixed Sidebar */}
        <Sider 
          width={280} 
          collapsed={collapsed}
          collapsedWidth={80}
          theme={isDarkMode ? 'dark' : 'light'}
          className="shadow-sm relative flex flex-col"
          style={{
            backgroundColor: isDarkMode ? '#030612' : '#ffffff',
            position: 'fixed',
            left: 0,
            top: '50px',
            bottom: 0,
            zIndex: 999
          }}
          trigger={null}
        >
          {/* Collapse toggle on sidebar */}
          <div className="p-4 flex justify-end">
            <Tooltip title="Toggle: [" placement="right">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => {
                  trackClick('toggle-sidebar');
                  setCollapsed(!collapsed);
                }}
                className="flex items-center justify-center"
                aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                data-tracked="true"
              />
            </Tooltip>
          </div>
          <div className="p-8 text-center">
            <Title 
              level={3} 
              className="m-0 font-semibold"
              style={{margin:"0 0 12px"}}
            >
              {collapsed ? 'D&A' : 'Data & Analytics'}
            </Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            theme={isDarkMode ? 'dark' : 'light'}
            className="border-0 flex-1"
            style={{
              backgroundColor: isDarkMode ? '#030612' : '#ffffff',
            }}
          />
        </Sider>
        
        {/* Scrollable Main Content */}
        <Layout style={{ 
          marginLeft: collapsed ? '80px' : '280px',
          transition: 'margin-left 0.2s'
        }}>
          <Content 
            className="py-8"
            style={{
              overflowY: 'auto',
              height: 'calc(100vh - 50px)',
              paddingLeft: '16px',
              paddingRight: '16px'
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};