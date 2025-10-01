import React, { useEffect, useState } from 'react';
import { Card, Select, Space, Typography, Tag, Button, Spin } from 'antd';
import { FileOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDataStore } from '../../stores/dataStore';
import { useDataApi } from '../../hooks/useDataApi';
import { useAnalytics } from '../../hooks/useAnalytics';
import { dataApi } from '../../services/api';
import { SystemMetadata, ExcelFile } from '../../types';

const { Text } = Typography;

export const FileManager: React.FC = () => {
  const { 
    currentFile, 
    setCurrentFile,
    setFiles
  } = useDataStore();
  
  const { files, filesLoading, refetchFiles } = useDataApi();
  const { trackClick } = useAnalytics({ autoTrack: false });
  const [metadata, setMetadata] = useState<SystemMetadata>({});
  const [metadataLoading, setMetadataLoading] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      setMetadataLoading(true);
      try {
        const metadataData = await dataApi.getMetadata();
        setMetadata(metadataData);
      } catch (error) {
        console.error('Error loading metadata:', error);
      } finally {
        setMetadataLoading(false);
      }
    };

    loadMetadata();
  }, []);

  // Helper function to get metadata key from filename
  const getMetadataKeyFromFilename = (filename: string): string => {
    // Remove file extension and convert to lowercase for matching
    return filename.replace(/\.(xlsx|xls)$/i, '').toLowerCase();
  };

  // Helper function to get source system from filename
  const getSourceSystemFromFilename = (filename: string): string => {
    const metadataKey = getMetadataKeyFromFilename(filename);
    return metadata[metadataKey]?.source_system || filename;
  };

  // Helper function to get filename from source system
  const getFilenameFromSourceSystem = (sourceSystem: string): string => {
    for (const [key, meta] of Object.entries(metadata)) {
      if (meta.source_system === sourceSystem) {
        // Find the corresponding file that matches this metadata key
        const matchingFile = files.find((file: ExcelFile) => 
          getMetadataKeyFromFilename(file.filename) === key
        );
        return matchingFile?.filename || sourceSystem;
      }
    }
    return sourceSystem;
  };

  const handleFileChange = (sourceSystemOrFilename: string) => {
    // Convert source system back to filename for internal use
    const actualFilename = getFilenameFromSourceSystem(sourceSystemOrFilename);
    trackClick(`file-${actualFilename}`);
    setCurrentFile(actualFilename);
  };

  return (
    <Card 
      title={
        <Space>
          <FileOutlined />
          <span>File Manager</span>
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            trackClick('refresh-files');
            refetchFiles();
          }}
          loading={filesLoading}
          size="small"
          aria-label="Refresh File List"
          data-tracked="true"
        >
          Refresh
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div data-tracked="true">
          <Text strong>Select Data Dictionary:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Choose a data dictionary..."
            value={currentFile ? getSourceSystemFromFilename(currentFile) : undefined}
            onChange={handleFileChange}
            loading={filesLoading || metadataLoading}
            showSearch
            optionFilterProp="children"
            notFoundContent={filesLoading || metadataLoading ? <Spin size="small" /> : "No data dictionaries found"}
          >
            {files.map((file: ExcelFile) => {
              const sourceSystem = getSourceSystemFromFilename(file.filename);
              return (
                <Select.Option key={file.filename} value={sourceSystem}>
                  <Space>
                    <span>{sourceSystem}</span>
                    <Tag color="blue" style={{ fontSize: '10px' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </Tag>
                  </Space>
                </Select.Option>
              );
            })}
          </Select>
        </div>
      </Space>
    </Card>
  );
};