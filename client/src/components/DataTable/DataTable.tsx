import React, { useMemo, useState } from 'react';
import { Table, Space, Button, Typography, Dropdown, MenuProps, Checkbox, List, Popover, Input, theme } from 'antd';
import { DownloadOutlined, SettingOutlined } from '@ant-design/icons';
import { useOptimizedDataApi } from '../../hooks/useOptimizedDataApi';
import { ColumnInfo } from '../../types';

const { Text } = Typography;
const { Search } = Input;

export const DataTable: React.FC = () => {
  const { sheetData, sheetDataLoading, exportData, exportLoading, toggleColumnSelection } = useOptimizedDataApi();
  const { token } = theme.useToken();
  const [columnsPopoverOpen, setColumnsPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Extract data from optimized response
  const data = useMemo(() => {
    if (!sheetData?.data) return [];
    if (!searchTerm) return sheetData.data;
    // Global search: filter any cell containing the search term
    const lower = searchTerm.toLowerCase();
    return sheetData.data.filter((row: any) =>
      Object.values(row).some(val => String(val ?? '').toLowerCase().includes(lower))
    );
  }, [sheetData, searchTerm]);

  const columns = useMemo(() => {
    return sheetData?.columns || [];
  }, [sheetData]);

  const visibleColumns = useMemo(() => {
    return columns.filter((col: ColumnInfo) => col.selected);
  }, [columns]);

  // Define custom column widths once
  const customColumnWidths: Record<string, number> = {
    "#": 60
  };

  const tableColumns = useMemo(() => {
    return visibleColumns.map((col: ColumnInfo) => ({
      title: col.name,
      dataIndex: col.key,
      key: col.key,
      sorter: (a: any, b: any) => {
        const valueA = String(a[col.key] || '');
        const valueB = String(b[col.key] || '');
        return valueA.localeCompare(valueB);
      },
      ellipsis: false,
      width: customColumnWidths[col.key] || col.width || 300,
      render: (text: any) => {
        if (text === null || text === undefined || text === '') {
          return <Text type="secondary">-</Text>;
        }
        return String(text);
      }
    }));
  }, [visibleColumns]);

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'xlsx',
      label: 'Export as Excel (.xlsx)',
      onClick: () => exportData({ format: 'xlsx' })
    },
    {
      key: 'csv',
      label: 'Export as CSV (.csv)',
      onClick: () => exportData({ format: 'csv' })
    }
  ];

  // Reset all columns to selected
  const resetColumns = () => {
    columns.forEach((col: ColumnInfo) => {
      if (!col.selected) {
        toggleColumnSelection(col.key);
      }
    });
  };

  // Columns popover content with checkboxes
  const columnsPopoverContent = (
    <div style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: `1px solid ${token.colorBorder}`,
        marginBottom: 8
      }}>
        <Text strong>Select Columns</Text>
        <Button
          type="link"
          size="small"
          onClick={resetColumns}
          style={{ padding: 0, height: 'auto' }}
        >
          Reset All
        </Button>
      </div>
      <List
        size="small"
        dataSource={columns}
        renderItem={(col: ColumnInfo) => (
          <List.Item style={{ padding: '8px 12px' }}>
            <Checkbox
              checked={col.selected}
              onChange={() => toggleColumnSelection(col.key)}
              style={{ width: '100%' }}
            >
              <Text style={{ fontSize: '13px' }}>{col.name}</Text>
            </Checkbox>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <div className="data-table-container table-cell-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Text strong>
            Showing {data.length} records
          </Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            ({visibleColumns.length} of {columns.length} columns visible)
          </Text>
        </div>
        <Space>
          <Search
            placeholder="Search all columns"
            allowClear
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 220 }}
            size="small"
          />
          <Popover
            content={columnsPopoverContent}
            title={null}
            trigger="click"
            open={columnsPopoverOpen}
            onOpenChange={setColumnsPopoverOpen}
            placement="bottomRight"
            overlayStyle={{ zIndex: 1000 }}
          >
            <Button icon={<SettingOutlined />} size="small">
              Columns ({visibleColumns.length})
            </Button>
          </Popover>
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              loading={exportLoading}
              size="small"
            >
              Export
            </Button>
          </Dropdown>
        </Space>
      </div>
      <Table
        columns={tableColumns}
        dataSource={data}
        pagination={false}
        scroll={{ y: 500, x: 'max-content' }}
        size="small"
        bordered
        rowKey={(record) => record["#"]} // TODO: Tactical: add a unique key for each record in Excel. Strategic: need a systematic way to improve this.
        loading={sheetDataLoading}
        sticky
        style={{ background: token.colorBgContainer }}
        virtual
        tableLayout="auto"
      />
    </div>
  );
};