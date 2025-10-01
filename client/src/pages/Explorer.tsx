import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, Alert } from 'antd';
import { useDataStore } from '../stores/dataStore';
import { useOptimizedDataApi } from '../hooks/useOptimizedDataApi';
import { FileManager } from '../components/FileManager';
import { FilterPanel } from '../components/FilterPanel';
import { DataTable } from '../components/DataTable';
import { SheetTabs } from '../components/SheetTabs';
import { MetadataDisplay } from '../components/MetadataDisplay';
import { dataApi } from '../services/api';
import { SystemMetadata } from '../types';

const { Title } = Typography;

export const Explorer: React.FC = () => {
  const { currentFile, currentSheet } = useDataStore();
  const { files, filesLoading, sheetData, sheetDataLoading } = useOptimizedDataApi();
  const [metadata, setMetadata] = useState<SystemMetadata>({});

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const metadataData = await dataApi.getMetadata();
        setMetadata(metadataData);
      } catch (error) {
        console.error('Error loading metadata:', error);
      }
    };

    loadMetadata();
  }, []);

  // Helper function to get metadata for current file
  const getCurrentFileMetadata = () => {
    if (!currentFile) return null;
    
    const metadataKey = currentFile.replace(/\.(xlsx|xls)$/i, '').toLowerCase();
    return metadata[metadataKey] || null;
  };

  return (
    <div className="space-y-8">
      <div>
        <Title 
          level={2} 
          className="text-3xl font-semibold text-gray-900 dark:text-white mb-3"
        >
          Data Explorer
        </Title>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Explore and analyze your data with powerful filtering and virtualization
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <FileManager />
        </div>
        
        {currentFile && (
          <>
            {getCurrentFileMetadata() && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mt-6">
                <MetadataDisplay metadata={getCurrentFileMetadata()} />
              </div>
            )}
            
            <SheetTabs currentFile={currentFile} />
            
            {currentSheet && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
                  <FilterPanel />
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-8">
                    {sheetDataLoading ? (
                      <div className="flex justify-center items-center py-16">
                        <Spin size="large" />
                      </div>
                    ) : sheetData && sheetData.data.length > 0 ? (
                      <DataTable />
                    ) : (
                      <Alert
                        message="No Data"
                        description="No data available for the selected sheet."
                        type="info"
                        showIcon
                        className="border-0 bg-blue-50 dark:bg-blue-900/20"
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
