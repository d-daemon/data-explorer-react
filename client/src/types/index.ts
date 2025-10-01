export interface FilterConfig {
  id: string;
  column: string;
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'not_contains' | 'in_list';
  value: string;
  enabled: boolean;
}

export interface DataRow {
  [key: string]: any;
}

export interface ExcelFile {
  filename: string;
  sheets: string[];
  lastModified: Date;
  size: number;
}

export interface ColumnInfo {
  key: string;
  name: string;
  type: string;
  selected: boolean;
  width?: number;
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SystemMetadata {
  [key: string]: {
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
  };
}