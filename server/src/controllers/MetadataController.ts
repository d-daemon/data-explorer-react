import { Request, Response } from 'express';
import { MetadataService } from '../services/MetadataService';

export class MetadataController {
  static async getMetadata(req: Request, res: Response) {
    try {
      const metadata = await MetadataService.getAllMetadata();
      res.json({ success: true, data: metadata });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get metadata',
        details: error.message 
      });
    }
  }

  static async getSystemMetadata(req: Request, res: Response) {
    try {
      const { system } = req.params;
      const metadata = await MetadataService.getSystemMetadata(system);
      
      if (!metadata) {
        return res.status(404).json({ 
          success: false, 
          error: 'System metadata not found' 
        });
      }

      res.json({ success: true, data: metadata });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get system metadata',
        details: error.message 
      });
    }
  }
}