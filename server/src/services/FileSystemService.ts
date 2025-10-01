import fs from 'fs';
import path from 'path';
import { ExcelFile } from '../types';

export class FileSystemService {
  private static readonly DOCS_DIR = path.join(__dirname, '../../docs');

  static async getExcelFiles(): Promise<ExcelFile[]> {
    try {
      // Ensure docs directory exists
      if (!fs.existsSync(this.DOCS_DIR)) {
        fs.mkdirSync(this.DOCS_DIR, { recursive: true });
        return [];
      }

      const files = fs.readdirSync(this.DOCS_DIR);
      const excelFiles = files.filter(file => 
        file.match(/\.(xlsx|xls)$/i)
      );

      const fileDetails = excelFiles.map(filename => {
        const filePath = path.join(this.DOCS_DIR, filename);
        const stats = fs.statSync(filePath);
        
        return {
          filename,
          sheets: [], // Will be populated when file is opened
          lastModified: stats.mtime,
          size: stats.size
        };
      });

      return fileDetails;
    } catch (error) {
      console.error('Error reading Excel files:', error);
      return [];
    }
  }

  static getFilePath(filename: string): string {
    return path.join(this.DOCS_DIR, filename);
  }

  static fileExists(filename: string): boolean {
    const filePath = this.getFilePath(filename);
    return fs.existsSync(filePath);
  }
}