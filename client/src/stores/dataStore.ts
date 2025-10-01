import { create } from 'zustand';
import { FilterConfig, DataRow, ExcelFile, ColumnInfo, PaginationConfig } from '../types';

interface DataStore {
  // State
  files: ExcelFile[];
  currentFile: string | null;
  currentSheet: string | null;
  data: DataRow[];
  columns: ColumnInfo[];
  filters: FilterConfig[];
  searchTerm: string;
  loading: boolean;
  pagination: PaginationConfig;
  viewMode: 'standard' | 'advanced';
  
  // Actions
  setFiles: (files: ExcelFile[]) => void;
  setCurrentFile: (filename: string | null) => void;
  setCurrentSheet: (sheetname: string | null) => void;
  setData: (data: DataRow[]) => void;
  setColumns: (columns: ColumnInfo[]) => void;
  addFilter: () => void;
  updateFilter: (id: string, updates: Partial<FilterConfig>) => void;
  removeFilter: (id: string) => void;
  toggleFilter: (id: string) => void;
  setSearchTerm: (term: string) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: PaginationConfig) => void;
  setViewMode: (mode: 'standard' | 'advanced') => void;
  toggleColumnSelection: (columnKey: string) => void;
}

export const useDataStore = create<DataStore>((set, get) => ({
  // Initial state
  files: [],
  currentFile: null,
  currentSheet: null,
  data: [],
  columns: [],
  filters: [],
  searchTerm: '',
  loading: false,
  pagination: {
    current: 1,
    pageSize: 100,
    total: 0,
    totalPages: 0
  },
  viewMode: 'standard',

  // Actions
  setFiles: (files) => set({ files }),
  setCurrentFile: (filename) => set({ 
    currentFile: filename, 
    currentSheet: null, 
    data: [], 
    columns: [],
    filters: [],
    searchTerm: '' 
  }),
  setCurrentSheet: (sheetname) => set({ currentSheet: sheetname }),
  setData: (data) => set({ data }),
  setColumns: (columns) => set({ columns }),
  
  addFilter: () => {
    const { columns } = get();
    if (columns.length === 0) return;
    
    const newFilter: FilterConfig = {
      id: Date.now().toString(),
      column: columns[0].key,
      operator: 'contains',
      value: '',
      enabled: true
    };
    
    set(state => ({ filters: [...state.filters, newFilter] }));
  },

  updateFilter: (id, updates) => set(state => ({
    filters: state.filters.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    )
  })),

  removeFilter: (id) => set(state => ({
    filters: state.filters.filter(filter => filter.id !== id)
  })),

  toggleFilter: (id) => set(state => ({
    filters: state.filters.map(filter =>
      filter.id === id ? { ...filter, enabled: !filter.enabled } : filter
    )
  })),

  setSearchTerm: (term) => set({ searchTerm: term }),
  setLoading: (loading) => set({ loading }),
  setPagination: (pagination) => set({ pagination }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  toggleColumnSelection: (columnKey) => set(state => ({
    columns: state.columns.map(col =>
      col.key === columnKey ? { ...col, selected: !col.selected } : col
    )
  }))
}));