export interface StorageProvider {
  uploadFile(file: Buffer, filename: string): Promise<string>;
  deleteFile(fileKey: string): Promise<void>;
  getFileUrl(fileKey: string): Promise<string>;
}

export class LocalStorageProvider implements StorageProvider {
  async uploadFile(_file: Buffer, filename: string): Promise<string> {
    return `/uploads/${filename}`;
  }

  async deleteFile(_fileKey: string): Promise<void> {
    // Stub for file deletion
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return fileKey;
  }
}

export const storage = new LocalStorageProvider();
