import axios from 'axios';
import { FilterConfig } from '../types';

declare global {
  interface ImportMetaEnv {
    readonly VITE_BASE_PATH: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_BASE = `${import.meta.env.VITE_BASE_PATH}/api`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const dataApi = {
  getFiles: async () => {
    const response = await api.get('files');
    return response.data.data;
  },

  getFileInfo: async (filename: string) => {
    const response = await api.get(`files/${filename}`);
    return response.data.data;
  },

  getSheetData: async (
    filename: string,
    sheetname: string,
    filters: FilterConfig[] = [],
    search: string = '',
    page: number = 1,
    limit: number = 100
  ) => {
    const response = await api.get(`files/${filename}/sheets/${sheetname}`, {
      params: {
        filters: JSON.stringify(filters),
        search,
        page,
        limit,
      },
    });
    return response.data.data;
  },

  exportData: async (
    filename: string,
    sheetname: string,
    filters: FilterConfig[],
    format: 'xlsx' | 'csv'
  ) => {
    const response = await api.post('files/export', {
      filename,
      sheetname,
      filters,
      format,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportFullFile: async (
    filename: string,
    format: 'xlsx' | 'csv'
  ) => {
    const response = await api.post('files/export-full', {
      filename,
      format,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },

  getMetadata: async () => {
    const response = await api.get('metadata');
    return response.data.data;
  },
};
