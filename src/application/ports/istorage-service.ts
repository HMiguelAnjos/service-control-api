export interface UploadInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface IStorageService {
  upload(input: UploadInput): Promise<void>;
  delete(keys: string[]): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
