import React from 'react';
import { Card, Descriptions, Typography, Tag, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface MetadataDisplayProps {
  metadata: {
    source_system: string;
    description: string;
    last_updated: string;
    itso: {
      owner: string;
      contact: string;
      team: string;
    };
    misc: {
      [key: string]: any;
    };
  } | null;
}

export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ metadata }) => {
  if (!metadata) {
    return null;
  }

  return (
    <Card 
      title={
        <Space>
          <InfoCircleOutlined />
          <span>Data Dictionary Information</span>
        </Space>
      }
      size="small"
    >
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Source System" span={2}>
          <Tag color="blue">{metadata.source_system}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Description" span={2}>
          {metadata.description}
        </Descriptions.Item>
        
        <Descriptions.Item label="Last Updated">
          {metadata.last_updated}
        </Descriptions.Item>
        
        <Descriptions.Item label="Owner">
          {metadata.itso.owner}
        </Descriptions.Item>
        
        <Descriptions.Item label="Contact">
          {metadata.itso.contact}
        </Descriptions.Item>
        
        <Descriptions.Item label="Team">
          {metadata.itso.team}
        </Descriptions.Item>
        
        {/* Display misc properties */}
        {Object.entries(metadata.misc).map(([key, value]) => (
          <Descriptions.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Card>
  );
};


