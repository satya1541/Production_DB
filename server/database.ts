import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: '98.130.73.141',
  database: 'aps_db',
  user: 'satya',
  password: 'satya123',
  port: 3306,
  charset: 'utf8mb4',
  connectTimeout: 10000,
  
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        pin_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create vaults table for encrypted password data
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS vaults (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        encrypted_data LONGTEXT NOT NULL,
        salt VARCHAR(255) NOT NULL,
        iv VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create share_links table for password sharing
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS share_links (
        id VARCHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        password_data LONGTEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create shared_passwords table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS shared_passwords (
        id INT AUTO_INCREMENT PRIMARY KEY,
        share_id VARCHAR(255) UNIQUE NOT NULL,
        password_data TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_share_id (share_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error);
    return false;
  }
}

// Helper function to execute queries
export async function query(sql: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}