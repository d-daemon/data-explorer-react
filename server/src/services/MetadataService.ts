import fs from 'fs';
import path from 'path';
import { SystemMetadata } from '../types';

export class MetadataService {
  private static readonly METADATA_FILE = path.join(__dirname, '../../docs/metadata.json');

  static async getAllMetadata(): Promise<SystemMetadata> {
    try {
      if (!fs.existsSync(this.METADATA_FILE)) {
        // Create default metadata file if it doesn't exist
        const defaultMetadata = {};
        fs.writeFileSync(this.METADATA_FILE, JSON.stringify(defaultMetadata, null, 2));
        return defaultMetadata;
      }

      const data = fs.readFileSync(this.METADATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading metadata:', error);
      return {};
    }
  }

  static async getSystemMetadata(systemKey: string): Promise<any> {
    const allMetadata = await this.getAllMetadata();
    return allMetadata[systemKey] || null;
  }

  static async updateMetadata(systemKey: string, metadata: any): Promise<void> {
    const allMetadata = await this.getAllMetadata();
    allMetadata[systemKey] = metadata;
    
    fs.writeFileSync(this.METADATA_FILE, JSON.stringify(allMetadata, null, 2));
  }
}