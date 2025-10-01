import React from 'react';
import { Card, Button, Space, Input, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useDataStore } from '../../stores/dataStore';
import { FilterRow } from './FilterRow';
import { useAnalytics } from '../../hooks/useAnalytics';

const { Text } = Typography;

export const FilterPanel: React.FC = () => {
  const { filters, searchTerm, addFilter, setSearchTerm } = useDataStore();
  const { trackClick } = useAnalytics({ autoTrack: false });

  return (
    <Card 
      title="Search & Filters" 
      size="small"
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            trackClick('add-filter');
            addFilter();
          }}
          size="small"
          aria-label="Add New Filter"
          data-tracked="true"
        >
          Add Filter
        </Button>
      }
      className="filter-panel"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Global Search */}
        <div>
          <Text strong>Global Search:</Text>
          <Input
            placeholder="Search across all columns..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginTop: 8 }}
            allowClear
            aria-label="Global Search Input"
          />
        </div>

        {/* Filters */}
        {filters.length > 0 && (
          <div>
            <Text strong>Active Filters:</Text>
            <div style={{ marginTop: 8 }}>
              {filters.map((filter) => (
                <FilterRow key={filter.id} filter={filter} />
              ))}
            </div>
          </div>
        )}

        {filters.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Text type="secondary">
              No filters applied. Use global search above or click "Add Filter" to get started.
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};
