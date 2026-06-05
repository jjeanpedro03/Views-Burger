import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './types.js';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool })
});