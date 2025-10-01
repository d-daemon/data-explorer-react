import { Request, Response } from 'express';
import { ExcelService } from '../services/ExcelService';
import { FileSystemService } from '../services/FileSystemService';

// Performance monitoring
const performanceStats = {
  requests: 0,
  cacheHits: 0,
  averageResponseTime: 0,
  totalResponseTime: 0
};

export class FileController {
  static async listFiles(req: Request, res: Response) {
    try {
      const files = await FileSystemService.getExcelFiles();
      res.json({ success: true, data: files });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to list files',
        details: error.message 
      });
    }
  }

  static async getFileInfo(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { filename } = req.params;
      const filePath = FileSystemService.getFilePath(filename);
      const result = await ExcelService.getFileInfo(filePath);
      
      // Update performance stats
      const responseTime = Date.now() - startTime;
      performanceStats.requests++;
      performanceStats.totalResponseTime += responseTime;
      performanceStats.averageResponseTime = performanceStats.totalResponseTime / performanceStats.requests;
      
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get file info',
        details: error.message 
      });
    }
  }

  static async getSheetData(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { filename, sheetname } = req.params;
      const { 
        filters = [], 
        search = '', 
        page = 1, 
        limit = 1000 
      } = req.query;

      const filePath = FileSystemService.getFilePath(filename);
      const result = await ExcelService.getSheetData(
        filePath,
        sheetname,
        JSON.parse(filters as string || '[]'),
        search as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      // Update performance stats
      const responseTime = Date.now() - startTime;
      performanceStats.requests++;
      performanceStats.totalResponseTime += responseTime;
      performanceStats.averageResponseTime = performanceStats.totalResponseTime / performanceStats.requests;

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get sheet data',
        details: error.message 
      });
    }
  }

  static async exportData(req: Request, res: Response) {
    try {
      const { filename, sheetname, filters, format = 'xlsx' } = req.body;
      
      const filePath = FileSystemService.getFilePath(filename);
      const exportBuffer = await ExcelService.exportData(
        filePath,
        sheetname,
        filters,
        format
      );

      const exportFilename = `${filename.split('.')[0]}_filtered.${format}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${exportFilename}"`);
      res.setHeader('Content-Type', format === 'xlsx' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv'
      );
      
      res.send(exportBuffer);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to export data',
        details: error.message 
      });
    }
  }

  static async exportFullFile(req: Request, res: Response) {
    try {
      const { filename, format = 'xlsx' } = req.body;
      
      const filePath = FileSystemService.getFilePath(filename);
      const exportBuffer = await ExcelService.exportFullFile(
        filePath,
        format
      );

      const exportFilename = `${filename}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${exportFilename}"`);
      res.setHeader('Content-Type', format === 'xlsx' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv'
      );
      
      res.send(exportBuffer);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to export full file',
        details: error.message 
      });
    }
  }

  static async getPerformanceStats(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        ...performanceStats,
        cacheHitRate: performanceStats.requests > 0 ? 
          (performanceStats.cacheHits / performanceStats.requests * 100).toFixed(2) + '%' : '0%'
      }
    });
  }
}