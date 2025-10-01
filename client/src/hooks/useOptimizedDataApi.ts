import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { dataApi } from '../services/api';
import { useDataStore } from '../stores/dataStore';
import { useDebounce } from './useDebounce';
import { DataRow, ColumnInfo, FilterConfig } from '../types';

interface CachedSheetData {
  data: DataRow[];
  columns: ColumnInfo[];
  total: number;
}

// Client-side search and filter functions
const applyGlobalSearch = (data: DataRow[], columns: string[], searchTerm: string): DataRow[] => {
  if (!searchTerm || !searchTerm.trim()) return data;
  
  const searchLower = searchTerm.toLowerCase().trim();
  const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
  
  if (searchWords.length === 0) return data;
  
  return data.filter(row => {
    return columns.some(col => {
      const cellValue = String(row[col] || '').toLowerCase();
      
      if (searchWords.length === 1) {
        return cellValue.includes(searchWords[0]);
      }
      
      return searchWords.every(word => cellValue.includes(word));
    });
  });
};

const applyFilters = (data: DataRow[], filters: FilterConfig[]): DataRow[] => {
  const enabledFilters = filters.filter(f => f.enabled && f.value.trim() !== '');
  
  if (enabledFilters.length === 0) return data;

  return data.filter(row => {
    return enabledFilters.every(filter => {
      const cellValue = String(row[filter.column] || '').toLowerCase();
      const filterValue = filter.value.toLowerCase().trim();

      switch (filter.operator) {
        case 'contains':
          return cellValue.includes(filterValue);
        case 'equals':
          return cellValue === filterValue;
        case 'starts_with':
          return cellValue.startsWith(filterValue);
        case 'ends_with':
          return cellValue.endsWith(filterValue);
        case 'not_contains':
          return !cellValue.includes(filterValue);
        case 'in_list':
          const listValues = filter.value.split(',').map(v => v.trim().toLowerCase());
          return listValues.some(v => cellValue.includes(v));
        default:
          return true;
      }
    });
  });
};

export const useOptimizedDataApi = () => {
  const queryClient = useQueryClient();
  const { 
    currentFile, 
    currentSheet, 
    filters, 
    searchTerm,
    setColumns
  } = useDataStore();

  // Local state for column selection
  const [columnSelection, setColumnSelection] = useState<Record<string, boolean>>({});

  // Debounce search term for better UX
  const debouncedSearchTerm = useDebounce(searchTerm, 100);

  // Fetch files list
  const filesQuery = useQuery({
    queryKey: ['files'],
    queryFn: dataApi.getFiles,
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false
  });

  // Fetch raw sheet data (without filters/search) - cached for the session
  const rawSheetDataQuery = useQuery({
    queryKey: ['rawSheetData', currentFile, currentSheet],
    queryFn: () => dataApi.getSheetData(
      currentFile!,
      currentSheet!,
      [], // No filters
      '', // No search
      1,  // First page
      1000000 // Large limit to get all data
    ),
    enabled: !!(currentFile && currentSheet),
    staleTime: Infinity, // Keep cached for the entire session
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000
  });

  // Initialize column selection when new data is loaded
  useEffect(() => {
    if (rawSheetDataQuery.data?.columns) {
      const newColumns = rawSheetDataQuery.data.columns;
      setColumns(newColumns);
      const newSelection: Record<string, boolean> = {};
      
      newColumns.forEach((col: ColumnInfo) => {
        newSelection[col.key] = columnSelection[col.key] !== undefined 
          ? columnSelection[col.key] 
          : true;
      });
      
      setColumnSelection(newSelection);
    }
  }, [rawSheetDataQuery.data?.columns]);

  // Toggle column selection function
  const toggleColumnSelection = (columnKey: string) => {
    setColumnSelection(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Client-side processed data with search and filters
  const processedData = useMemo(() => {
    if (!rawSheetDataQuery.data?.data) {
      return {
        data: [],
        columns: [],
        total: 0
      };
    }

    const rawData = rawSheetDataQuery.data.data;
    const columns = rawSheetDataQuery.data.columns.map((col: ColumnInfo) => col.key);
    
    // Apply search first
    let filteredData = applyGlobalSearch(rawData, columns, debouncedSearchTerm);
    
    // Then apply filters
    filteredData = applyFilters(filteredData, filters);

    // Process columns with selection state
    const processedColumns = rawSheetDataQuery.data.columns.map((col: ColumnInfo) => ({
      ...col,
      selected: columnSelection[col.key] !== undefined ? columnSelection[col.key] : true
    }));

    return {
      data: filteredData,
      columns: processedColumns,
      total: filteredData.length
    };
  }, [
    rawSheetDataQuery.data,
    debouncedSearchTerm,
    filters,
    columnSelection
  ]);

  // Export mutation - exports entire file with all sheets
  const exportMutation = useMutation({
    mutationFn: (params: { format: 'xlsx' | 'csv' }) =>
      dataApi.exportFullFile(currentFile!, params.format), // Export entire file with all sheets
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentFile}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  });

  return {
    files: filesQuery.data || [],
    filesLoading: filesQuery.isLoading,
    sheetData: processedData,
    sheetDataLoading: rawSheetDataQuery.isLoading,
    exportData: exportMutation.mutate,
    exportLoading: exportMutation.isPending,
    toggleColumnSelection,
    refetchFiles: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
    refetchSheetData: () => queryClient.invalidateQueries({ 
      queryKey: ['rawSheetData', currentFile, currentSheet] 
    })
  };
}; 