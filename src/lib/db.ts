import { Pool } from "pg";

/**
 * Ein Pool pro Prozess. In der Next.js-Dev-Umgebung wird das Modul bei
 * Hot-Reload neu geladen, deshalb der Cache auf globalThis.
 *
 * SSL steuert allein die DATABASE_URL: lokal (Docker) ohne Parameter, gehostet
 * mit `sslmode=require`, das pg mit voller Zertifikatsprüfung behandelt.
 */
const globalForPg = globalThis as unknown as { __pgPool?: Pool };

export function getPool(): Pool {
  if (!globalForPg.__pgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL ist nicht gesetzt");
    globalForPg.__pgPool = new Pool({ connectionString, max: 5 });
  }
  return globalForPg.__pgPool;
}
