import { PrismaClient } from "@prisma/client"
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
    var cachedPrisma:  PrismaClient
}

let prisma: PrismaClient

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);


if (process.env.NODE_ENV === 'production')
    prisma = new PrismaClient({adapter})
else {
    if (!global.cachedPrisma)
        global.cachedPrisma = new PrismaClient({adapter}) 
    prisma = global.cachedPrisma
}

export const db = prisma