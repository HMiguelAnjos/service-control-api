import { User } from '../../domain/entities/user';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
  updateResetToken(id: number, token: string | null, expires: Date | null): Promise<void>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
}
