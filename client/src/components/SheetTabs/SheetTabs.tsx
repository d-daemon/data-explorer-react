import React, { useEffect, useState, useRef } from 'react';
import { Tabs, Spin } from 'antd';
import { useDataStore } from '../../stores/dataStore';
import { useAnalytics } from '../../hooks/useAnalytics';

interface SheetTabsProps {
  currentFile: string;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({ currentFile }) => {
  const { currentSheet, setCurrentSheet } = useDataStore();
  const [sheets, setSheets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const hasSetInitialSheet = useRef(false);
  const { trackClick } = useAnalytics({ autoTrack: false });

  useEffect(() => {
    const fetchSheets = async () => {
      if (!currentFile) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_PATH}/api/files/${currentFile}`);
        const result = await response.json();
        if (result.success) {
          setSheets(result.data.sheets);
          // Only set initial sheet if we haven't done so for this file
          if (result.data.sheets.length > 0 && !hasSetInitialSheet.current) {
            setCurrentSheet(result.data.sheets[0]);
            hasSetInitialSheet.current = true;
          }
        }
      } catch (error) {
        console.error('Error fetching sheets:', error);
      } finally {
        setLoading(false);
      }
    };

    // Reset the flag when file changes
    hasSetInitialSheet.current = false;
    fetchSheets();
  }, [currentFile, setCurrentSheet]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Spin size="small" />
      </div>
    );
  }

  if (sheets.length === 0) {
    return null;
  }

  const handleTabChange = (activeKey: string) => {
    trackClick(`${currentFile}-tab-${activeKey}`);
    setCurrentSheet(activeKey);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {currentFile}
        </h3>
        <Tabs
          activeKey={currentSheet || undefined}
          onChange={handleTabChange}
          type="card"
          size="large"
          className="sheet-tabs"
          data-tracked="true"
          items={sheets.map(sheet => ({
            key: sheet,
            label: sheet,
            children: null
          }))}
        />
      </div>
    </div>
  );
}; 