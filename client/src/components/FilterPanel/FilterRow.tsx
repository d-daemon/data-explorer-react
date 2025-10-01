import React from 'react';
import { Row, Col, Select, Input, Switch, Button, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { FilterConfig } from '../../types';
import { useDataStore } from '../../stores/dataStore';

interface FilterRowProps {
  filter: FilterConfig;
}

const OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'in_list', label: 'In list (comma-separated)' }
];

export const FilterRow: React.FC<FilterRowProps> = ({ filter }) => {
  const { columns, updateFilter, removeFilter, toggleFilter } = useDataStore();

  return (
    <div style={{ 
      padding: '8px', 
      borderRadius: '6px', 
      marginBottom: '8px',
      border: '1px solid',
      opacity: filter.enabled ? 1 : 0.6
    }}>
      <Row gutter={8} align="middle">
        <Col flex="auto">
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Row gutter={8}>
              <Col span={8}>
                <Select
                  value={filter.column}
                  onChange={(value) => updateFilter(filter.id, { column: value })}
                  style={{ width: '100%' }}
                  size="small"
                  placeholder="Select column"
                >
                  {columns.map(col => (
                    <Select.Option key={col.key} value={col.key}>
                      {col.name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col span={8}>
                <Select
                  value={filter.operator}
                  onChange={(value) => updateFilter(filter.id, { operator: value })}
                  style={{ width: '100%' }}
                  size="small"
                >
                  {OPERATORS.map(op => (
                    <Select.Option key={op.value} value={op.value}>
                      {op.label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col span={8}>
                <Input
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                  placeholder={filter.operator === 'in_list' ? 'value1, value2, value3' : 'Enter value...'}
                  size="small"
                />
              </Col>
            </Row>
          </Space>
        </Col>
        <Col>
          <Space>
            <Switch
              checked={filter.enabled}
              onChange={() => toggleFilter(filter.id)}
              size="small"
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeFilter(filter.id)}
              size="small"
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};