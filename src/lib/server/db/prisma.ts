import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
	throw new Error('TURSO_DATABASE_URL is not defined in environment variables.');
}

if (!authToken) {
	throw new Error('TURSO_AUTH_TOKEN is not defined in environment variables.');
}

const libsqlConfig = {
	url: databaseUrl,
	authToken: authToken
};

const libsql = createClient(libsqlConfig);

const adapter = new PrismaLibSQL(libsqlConfig);
const prisma = new PrismaClient({ adapter });
export const db = prisma;
