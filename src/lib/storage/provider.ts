import fs from "fs/promises";
import path from "path";
import os from "os";

export interface StorageProvider {
  /**
   * Uploads a file buffer. Returns a unique file key/path string.
   */
  uploadFile(file: Buffer, fileKey: string, mimeType: string): Promise<string>;

  /**
   * Deletes a file matching the given file key.
   */
  deleteFile(fileKey: string): Promise<void>;

  /**
   * Retrieves the raw file buffer matching the given file key.
   */
  getFileBuffer(fileKey: string): Promise<Buffer>;
}

/**
 * Local Disk storage provider for secure local development.
 * Stores files outside of the public directory (in private_uploads/) to prevent public exposure.
 * Uses writable os.tmpdir() when running on Vercel / serverless runtimes.
 */
export class DiskStorageProvider implements StorageProvider {
  private uploadDir =
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      ? path.join(os.tmpdir(), "private_uploads")
      : path.join(process.cwd(), "private_uploads");

  private async ensureDir() {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async uploadFile(file: Buffer, fileKey: string, _mimeType: string): Promise<string> {
    await this.ensureDir();
    const filePath = path.join(this.uploadDir, fileKey);
    await fs.writeFile(filePath, file);
    return fileKey; // Key is saved as storagePath in db
  }

  async deleteFile(fileKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileKey);
    try {
      await fs.unlink(filePath);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code !== "ENOENT") {
        throw err;
      }
    }
  }

  async getFileBuffer(fileKey: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, fileKey);
    return await fs.readFile(filePath);
  }
}

/**
 * Placeholder S3 storage provider.
 * Wired up if environment variables are present.
 */
export class S3StorageProvider implements StorageProvider {
  constructor(
    private bucket: string,
    private region: string
  ) {}

  async uploadFile(_file: Buffer, fileKey: string, _mimeType: string): Promise<string> {
    console.log(`[S3] Uploading file to bucket ${this.bucket} with key: ${fileKey}`);
    // In production, instantiate S3Client and PutObjectCommand from @aws-sdk/client-s3 here
    return fileKey;
  }

  async deleteFile(fileKey: string): Promise<void> {
    console.log(`[S3] Deleting file from bucket ${this.bucket} with key: ${fileKey}`);
  }

  async getFileBuffer(_fileKey: string): Promise<Buffer> {
    console.log(`[S3] Reading file buffer`);
    throw new Error("S3 read not implemented in mock.");
  }
}

// Storage provider factory
function getStorageProvider(): StorageProvider {
  const bucket = process.env.STORAGE_S3_BUCKET;
  const region = process.env.STORAGE_S3_REGION;

  if (bucket && region) {
    return new S3StorageProvider(bucket, region);
  }

  return new DiskStorageProvider();
}

export const storage = getStorageProvider();
export default storage;
