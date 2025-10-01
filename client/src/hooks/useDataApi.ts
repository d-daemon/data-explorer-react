import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataApi } from '../services/api';
import { useDataStore } from '../stores/dataStore';
import { useDebounce } from './useDebounce';

export const useDataApi = () => {
  const queryClient = useQueryClient();
  const { 
    currentFile, 
    currentSheet, 
    filters, 
    searchTerm, 
    pagination,
    setPagination
  } = useDataStore();

  // Optimized debouncing - shorter delays for better responsiveness
  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  const debouncedFilters = useDebounce(filters, 300);

  // Fetch files list with longer cache time
  const filesQuery = useQuery({
    queryKey: ['files'],
    queryFn: dataApi.getFiles,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes (replaces cacheTime in v4+)
    refetchOnWindowFocus: false
  });

  // Fetch sheet data with optimized configuration
  const sheetDataQuery = useQuery({
    queryKey: [
      'sheetData', 
      currentFile, 
      currentSheet, 
      debouncedFilters, 
      debouncedSearchTerm,
      pagination.current,
      pagination.pageSize
    ],
    queryFn: () => dataApi.getSheetData(
      currentFile!,
      currentSheet!,
      debouncedFilters,
      debouncedSearchTerm,
      pagination.current,
      pagination.pageSize
    ),
    enabled: !!(currentFile && currentSheet),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes (replaces cacheTime in v4+)
    refetchOnWindowFocus: false,
    retry: 1, // Reduce retries for faster failure
    retryDelay: 1000
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (params: { format: 'xlsx' | 'csv' }) =>
      dataApi.exportData(currentFile!, currentSheet!, filters, params.format),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentFile}_filtered.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  });

  return {
    files: filesQuery.data || [],
    filesLoading: filesQuery.isLoading,
    sheetData: sheetDataQuery.data,
    sheetDataLoading: sheetDataQuery.isLoading,
    exportData: exportMutation.mutate,
    exportLoading: exportMutation.isPending,
    refetchFiles: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
    refetchSheetData: () => queryClient.invalidateQueries({ 
      queryKey: ['sheetData', currentFile, currentSheet] 
    })
  };
};
