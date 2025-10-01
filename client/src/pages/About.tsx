import React from 'react';
import { Typography, Divider, Tag } from 'antd';
import { CodeOutlined, FileSearchOutlined, ThunderboltOutlined, GithubOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <Title level={1} className="text-4xl font-bold text-gray-900 dark:text-white">
          Data Explorer
        </Title>
        <Paragraph className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A modern, high-performance web app for exploring, searching, and managing enterprise data dictionaries — all in one place.
        </Paragraph>
      </section>

      {/* Overview Section */}
      <section>
        <Title level={2} className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Overview
        </Title>
        <Paragraph className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          Data Explorer lets data teams centralize their Excel-based dictionaries into a single, searchable interface. 
          Built with <Text strong>React</Text> and <Text strong>Node.js</Text>, it's designed for speed, collaboration, and scalability. No more digging through outdated spreadsheets.
        </Paragraph>
      </section>

      <Divider className="border-gray-200 dark:border-gray-700" />

      {/* Features Section */}
      <section>
        <Title level={2} className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
          Key Features
        </Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: <FileSearchOutlined className="text-blue-500 text-2xl mr-3" />, text: 'Load Excel files (.xlsx/.xls) with multi-sheet support' },
            { icon: <FileSearchOutlined className="text-blue-500 text-2xl mr-3" />, text: 'Global text search across all columns' },
            { icon: <ThunderboltOutlined className="text-blue-500 text-2xl mr-3" />, text: 'Dynamic filtering with multiple operators' },
            { icon: <ThunderboltOutlined className="text-blue-500 text-2xl mr-3" />, text: 'Virtualized tables for large datasets' },
            { icon: <CodeOutlined className="text-blue-500 text-2xl mr-3" />, text: 'Export results as Excel or CSV' },
            { icon: <CodeOutlined className="text-blue-500 text-2xl mr-3" />, text: 'Dark & Light themes, fully responsive' },
            { icon: <CodeOutlined className="text-blue-500 text-2xl mr-3" />, text: 'Fast rendering, optimized performance' },
          ].map((f, idx) => (
            <div key={idx} className="flex items-start bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              {f.icon}
              <span className="text-gray-700 dark:text-gray-300">{f.text}</span>
            </div>
          ))}
        </div>
      </section>

      <Divider className="border-gray-200 dark:border-gray-700" />

      {/* Tech Stack Section */}
      <section>
        <Title level={2} className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Technology Stack
        </Title>
        <div className="flex flex-wrap justify-center gap-3">
          <Tag color="blue" className="px-4 py-2 text-sm font-medium rounded-lg">React 19</Tag>
          <Tag color="green" className="px-4 py-2 text-sm font-medium rounded-lg">Node.js</Tag>
          <Tag color="purple" className="px-4 py-2 text-sm font-medium rounded-lg">TypeScript</Tag>
          <Tag color="orange" className="px-4 py-2 text-sm font-medium rounded-lg">Ant Design</Tag>
          <Tag color="red" className="px-4 py-2 text-sm font-medium rounded-lg">Express.js</Tag>
          <Tag color="cyan" className="px-4 py-2 text-sm font-medium rounded-lg">Vite</Tag>
          <Tag color="magenta" className="px-4 py-2 text-sm font-medium rounded-lg">Tailwind CSS</Tag>
        </div>
      </section>

      <Divider className="border-gray-200 dark:border-gray-700" />

      {/* Footer / Contact Section */}
      <footer className="text-center space-y-4">
        <Paragraph className="text-gray-700 dark:text-gray-300">
          Developed by <Text strong>d-daemon</Text> • Version <Text code>1.0.0</Text>
          <div className="flex justify-center gap-6 text-gray-500 dark:text-gray-400">
            <a href="https://github.com/d-daemon" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 dark:hover:text-white">
              <GithubOutlined className="text-2xl" />
            </a>
          </div>
          © {new Date().getFullYear()} Data Explorer. All rights reserved.
        </Paragraph>
      </footer>
    </div>
  );
};
