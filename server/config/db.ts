import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_NAME = 'itid_france',
  DB_USER = 'root',
  DB_PASSWORD = '',
} = process.env;

let pool: mysql.Pool | null = null;
let isConnected = false;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: parseInt(DB_PORT, 10),
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}

export async function testDbConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const p = getDbPool();
    const connection = await p.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    return {
      success: true,
      message: `Connexion MySQL réussie sur ${DB_HOST}:${DB_PORT} (base: ${DB_NAME})`,
    };
  } catch (error: any) {
    isConnected = false;
    return {
      success: false,
      message: `Échec de connexion MySQL : ${error.message} (Vérifier DB_HOST, DB_NAME, DB_USER, DB_PASSWORD dans .env)`,
    };
  }
}

export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T> {
  const p = getDbPool();
  const [rows] = await p.execute(sql, params);
  return rows as T;
}

export { isConnected };
