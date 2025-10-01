import * as XLSX from 'xlsx';
import path from 'path';
import { FilterConfig, DataRow } from '../types';
import _ from 'lodash';
import fs from 'fs';

// Cache for workbook data with size limits
const workbookCache = new Map<string, { workbook: XLSX.WorkBook; lastModified: Date; size: number }>();
const processedDataCache = new Map<string, { data: DataRow[]; lastModified: Date; size: number }>();

// Cache configuration
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_CACHE_ENTRIES = 10;

export class ExcelService {
  private static cleanupCache() {
    // Clean up workbook cache if too large
    if (workbookCache.size > MAX_CACHE_ENTRIES) {
      const entries = Array.from(workbookCache.entries());
      entries.sort((a, b) => a[1].lastModified.getTime() - b[1].lastModified.getTime());
      const toDelete = entries.slice(0, Math.floor(entries.length / 2));
      toDelete.forEach(([key]) => workbookCache.delete(key));
    }

    // Clean up processed data cache if too large
    if (processedDataCache.size > MAX_CACHE_ENTRIES) {
      const entries = Array.from(processedDataCache.entries());
      entries.sort((a, b) => a[1].lastModified.getTime() - b[1].lastModified.getTime());
      const toDelete = entries.slice(0, Math.floor(entries.length / 2));
      toDelete.forEach(([key]) => processedDataCache.delete(key));
    }
  }

  static async getFileInfo(filePath: string) {
    try {
      const workbook = await this.getWorkbook(filePath);
      const stats = fs.statSync(filePath);
      
      return {
        filename: path.basename(filePath),
        sheets: workbook.SheetNames,
        lastModified: stats.mtime,
        size: stats.size
      };
    } catch (error: any) {
      throw new Error(`Failed to read Excel file: ${error.message}`);
    }
  }

  private static async getWorkbook(filePath: string): Promise<XLSX.WorkBook> {
    const stats = fs.statSync(filePath);
    
    // Check if we have a cached version that's still valid
    const cached = workbookCache.get(filePath);
    if (cached && cached.lastModified.getTime() === stats.mtime.getTime()) {
      return cached.workbook;
    }
    
    // Read and cache the workbook
    const workbook = XLSX.readFile(filePath);
    workbookCache.set(filePath, { 
      workbook, 
      lastModified: stats.mtime,
      size: stats.size
    });
    
    // Cleanup if needed
    this.cleanupCache();
    
    return workbook;
  }

  private static async getProcessedData(filePath: string, sheetName: string): Promise<DataRow[]> {
    const stats = fs.statSync(filePath);
    const cacheKey = `${filePath}:${sheetName}`;
    
    // Check if we have cached processed data
    const cached = processedDataCache.get(cacheKey);
    if (cached && cached.lastModified.getTime() === stats.mtime.getTime()) {
      return cached.data;
    }
    
    // Process and cache the data
    const workbook = await this.getWorkbook(filePath);
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    // Convert to JSON with proper options
    let data = XLSX.utils.sheet_to_json(worksheet, { 
      defval: '',
      blankrows: false,
      raw: false
    }) as DataRow[];

    // Clean up data - replace null/undefined with empty strings
    data = data.map(row => {
      const cleanRow: DataRow = {};
      Object.keys(row).forEach(key => {
        cleanRow[key] = row[key] === null || row[key] === undefined ? '' : String(row[key]);
      });
      return cleanRow;
    });
    
    // Cache the processed data
    processedDataCache.set(cacheKey, { 
      data, 
      lastModified: stats.mtime,
      size: JSON.stringify(data).length
    });
    
    // Cleanup if needed
    this.cleanupCache();
    
    return data;
  }

  private static applyFilters(data: DataRow[], filters: FilterConfig[]): DataRow[] {
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
  }

  private static applyGlobalSearch(data: DataRow[], columns: string[], searchTerm: string): DataRow[] {
    if (!searchTerm || !searchTerm.trim()) return data;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
    
    // If no search words, return all data
    if (searchWords.length === 0) return data;
    
    return data.filter(row => {
      // Check if any column contains any of the search words
      return columns.some(col => {
        const cellValue = String(row[col] || '').toLowerCase();
        
        // For single word search, use simple includes
        if (searchWords.length === 1) {
          return cellValue.includes(searchWords[0]);
        }
        
        // For multi-word search, check if all words are present
        return searchWords.every(word => cellValue.includes(word));
      });
    });
  }

  static async getSheetData(
    filePath: string,
    sheetName: string,
    filters: FilterConfig[] = [],
    searchTerm: string = '',
    page: number = 1,
    limit: number = 1000
  ) {
    try {
      // Get cached processed data
      let data = await this.getProcessedData(filePath, sheetName);
      
      // Get column names
      const columns = data.length > 0 ? Object.keys(data[0]) : [];

      // Apply global search with optimized algorithm
      data = this.applyGlobalSearch(data, columns, searchTerm);

      // Apply filters
      data = this.applyFilters(data, filters);

      // Calculate pagination
      const total = data.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = data.slice(startIndex, startIndex + limit);

      return {
        data: paginatedData,
        pagination: {
          current: page,
          pageSize: limit,
          total,
          totalPages
        },
        columns: columns.map(col => ({
          key: col,
          name: col,
          type: this.inferColumnType(data, col),
          selected: true
        }))
      };
    } catch (error: any) {
      throw new Error(`Failed to process sheet data: ${error.message}`);
    }
  }

  private static inferColumnType(data: DataRow[], column: string): string {
    const sample = data.slice(0, 100).map(row => row[column]).filter(val => val != null && val !== '');
    
    if (sample.length === 0) return 'string';
    
    const numberCount = sample.filter(val => !isNaN(Number(val))).length;
    const dateCount = sample.filter(val => !isNaN(Date.parse(String(val)))).length;
    
    if (numberCount / sample.length > 0.8) return 'number';
    if (dateCount / sample.length > 0.8) return 'date';
    return 'string';
  }

  static async exportData(
    filePath: string,
    sheetName: string,
    filters: FilterConfig[] = [],
    format: 'xlsx' | 'csv' = 'xlsx'
  ): Promise<Buffer> {
    const { data } = await this.getSheetData(filePath, sheetName, filters, '', 1, 999999);
    
    if (format === 'csv') {
      const csv = this.convertToCSV(data);
      return Buffer.from(csv, 'utf8');
    } else {
      const newWorkbook = XLSX.utils.book_new();
      const newWorksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
      return XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
    }
  }

  private static convertToCSV(data: DataRow[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        const stringValue = String(value || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  static async exportFullFile(
    filePath: string,
    format: 'xlsx' | 'csv' = 'xlsx'
  ): Promise<Buffer> {
    // For xlsx format, return the original file
    if (format === 'xlsx') {
      return fs.readFileSync(filePath);
    }
    
    // For CSV format, we need to convert all sheets
    const workbook = await this.getWorkbook(filePath);
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length === 1) {
      // Single sheet - convert to CSV
      const worksheet = workbook.Sheets[sheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '',
        blankrows: false,
        raw: false
      }) as DataRow[];
      
      const csv = this.convertToCSV(data);
      return Buffer.from(csv, 'utf8');
    } else {
      // Multiple sheets - create a combined CSV or return original xlsx
      // For now, we'll return the original xlsx file for multi-sheet files
      // since CSV doesn't support multiple sheets
      return fs.readFileSync(filePath);
    }
  }
}