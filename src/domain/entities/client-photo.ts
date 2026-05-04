export const PHOTO_TAGS = ['before', 'after', 'reference', 'progress', 'other'] as const;
export type PhotoTag = (typeof PHOTO_TAGS)[number];

export function isPhotoTag(value: unknown): value is PhotoTag {
  return typeof value === 'string' && (PHOTO_TAGS as readonly string[]).includes(value);
}

export interface ClientPhotoData {
  id?: number;
  userId: number;
  clientId: number;
  bucketKey?: string | null;
  thumbKey?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  width?: number | null;
  height?: number | null;
  tag?: string | null;
  notes?: string | null;
  takenAt: Date;
  createdAt?: Date;
  deletedAt?: Date | null;
}

export class ClientPhoto {
  public readonly id?: number;
  public readonly userId: number;
  public readonly clientId: number;
  public readonly bucketKey: string | null;
  public readonly thumbKey: string | null;
  public readonly filename: string | null;
  public readonly mimeType: string | null;
  public readonly sizeBytes: number | null;
  public readonly width: number | null;
  public readonly height: number | null;
  public readonly tag: string | null;
  public readonly notes: string | null;
  public readonly takenAt: Date;
  public readonly createdAt?: Date;
  public readonly deletedAt: Date | null;

  constructor(data: ClientPhotoData) {
    this.id = data.id;
    this.userId = data.userId;
    this.clientId = data.clientId;
    this.bucketKey = data.bucketKey ?? null;
    this.thumbKey = data.thumbKey ?? null;
    this.filename = data.filename ?? null;
    this.mimeType = data.mimeType ?? null;
    this.sizeBytes = data.sizeBytes ?? null;
    this.width = data.width ?? null;
    this.height = data.height ?? null;
    this.tag = data.tag ?? null;
    this.notes = data.notes ?? null;
    this.takenAt = data.takenAt;
    this.createdAt = data.createdAt;
    this.deletedAt = data.deletedAt ?? null;
  }
}
