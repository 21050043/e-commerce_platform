import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'shop',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '21050043',
  dialect: 'mysql' as const,
  logging: process.env.NODE_ENV === 'development' ? (sql: string) => logger.db.query(sql) : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

const testConnection = async (): Promise<void> => {
  try {
    logger.db.connecting();
    await sequelize.authenticate();
    logger.db.connected();
  } catch (error) {
    logger.db.error(error);
  }
};

export { sequelize, testConnection };