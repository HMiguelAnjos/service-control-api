import { BlockedTime } from '../../domain/entities/blocked-time';

export interface IBlockedTimeRepository {
  create(input: BlockedTime): Promise<BlockedTime>;
  delete(id: number, userId: number): Promise<void>;
  list(userId: number, from?: Date, to?: Date): Promise<BlockedTime[]>;
  /** Returns blocked-time rows that overlap [start, end). */
  findOverlapping(userId: number, start: Date, end: Date): Promise<BlockedTime[]>;
}
