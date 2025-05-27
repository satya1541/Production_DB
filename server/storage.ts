import { User, InsertUser } from "@shared/schema";
import { pool, query, getConnection } from "./database";
import crypto from 'crypto';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveVault(userId: number, encryptedData: string, salt: string, iv: string): Promise<void>;
  getVault(userId: number): Promise<{ encryptedData: string; salt: string; iv: string } | undefined>;
}

export class MySQLStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const rows = await query(
        'SELECT id, username, pin_hash as pinHash, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?',
        [id]
      ) as any[];

      if (rows.length === 0) return undefined;

      const row = rows[0];
      return {
        id: row.id,
        username: row.username,
        pinHash: row.pinHash,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      };
    } catch (error) {
      console.error('Error getting user by id:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const rows = await query(
        'SELECT id, username, pin_hash as pinHash, created_at as createdAt, updated_at as updatedAt FROM users WHERE username = ?',
        [username]
      ) as any[];

      if (rows.length === 0) return undefined;

      const row = rows[0];
      return {
        id: row.id,
        username: row.username,
        pinHash: row.pinHash,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await query(
        'INSERT INTO users (username, pin_hash) VALUES (?, ?)',
        [insertUser.username, insertUser.pinHash]
      ) as any;

      const userId = result.insertId;
      const user = await this.getUser(userId);

      if (!user) {
        throw new Error('Failed to retrieve created user');
      }

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async saveVault(userId: number, encryptedData: string, salt: string, iv: string): Promise<void> {
    try {
      // Check if vault exists for user
      const existingRows = await query(
        'SELECT id FROM vaults WHERE user_id = ?',
        [userId]
      ) as any[];

      if (existingRows.length > 0) {
        // Update existing vault
        await query(
          'UPDATE vaults SET encrypted_data = ?, salt = ?, iv = ? WHERE user_id = ?',
          [encryptedData, salt, iv, userId]
        );
      } else {
        // Create new vault
        await query(
          'INSERT INTO vaults (user_id, encrypted_data, salt, iv) VALUES (?, ?, ?, ?)',
          [userId, encryptedData, salt, iv]
        );
      }
    } catch (error) {
      console.error('Error saving vault:', error);
      throw error;
    }
  }

  async getVault(userId: number): Promise<{ encryptedData: string; salt: string; iv: string } | undefined> {
    try {
      const rows = await query(
        'SELECT encrypted_data as encryptedData, salt, iv FROM vaults WHERE user_id = ?',
        [userId]
      ) as any[];

      if (rows.length === 0) return undefined;

      const row = rows[0];
      return {
        encryptedData: row.encryptedData,
        salt: row.salt,
        iv: row.iv,
      };
    } catch (error) {
      console.error('Error getting vault:', error);
      return undefined;
    }
  }

  async updateUserPin(userId: number, pinHash: string): Promise<void> {
    try {
      await query(
        'UPDATE users SET pin_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [pinHash, userId]
      );
    } catch (error) {
      console.error('Error updating user PIN:', error);
      throw error;
    }
  }

  async createSharedPassword(passwordData: any, expiresAt: string): Promise<string> {
    const shareId = crypto.randomUUID();

    try {
      // Convert ISO string to MySQL datetime format
      const expiresAtDate = new Date(expiresAt);
      const mysqlDateTime = expiresAtDate.toISOString().slice(0, 19).replace('T', ' ');
      
      await query(
        'INSERT INTO shared_passwords (share_id, password_data, expires_at) VALUES (?, ?, ?)',
        [shareId, JSON.stringify(passwordData), mysqlDateTime]
      );

      return shareId;
    } catch (error) {
      console.error('Error creating shared password:', error);
      throw error;
    }
  }

  async getSharedPassword(shareId: string): Promise<any | null> {
    try {
      const rows = await query(
        'SELECT share_id, password_data, expires_at, created_at FROM shared_passwords WHERE share_id = ?',
        [shareId]
      ) as any[];

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        shareId: row.share_id,
        passwordData: JSON.parse(row.password_data),
        expiresAt: new Date(row.expires_at).toISOString(),
        createdAt: new Date(row.created_at).toISOString()
      };
    } catch (error) {
      console.error('Error getting shared password:', error);
      return null;
    }
  }

  async deleteSharedPassword(shareId: string): Promise<void> {
    try {
      await query(
        'DELETE FROM shared_passwords WHERE share_id = ?',
        [shareId]
      );
    } catch (error) {
      console.error('Error deleting shared password:', error);
      throw error;
    }
  }
}

export const storage = new MySQLStorage();