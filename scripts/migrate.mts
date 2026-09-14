/**
 * Führt alle SQL-Dateien in db/migrations in Namensreihenfolge aus und merkt sich
 * angewandte Migrationen in der Tabelle schema_migrations.
 * Aufruf: npm run db:migrate  (liest DATABASE_URL aus .env.local / Umgebung)
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL fehlt. Siehe .env.example");
  process.exit(1);
}

const dir = path.resolve(process.cwd(), "db/migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

const client = new Client({ connectionString: url });
await client.connect();
try {
  await client.query(`create table if not exists schema_migrations (
    name text primary key, applied_at timestamptz not null default now()
  )`);
  const { rows } = await client.query<{ name: string }>("select name from schema_migrations");
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(path.join(dir, file), "utf8");
    console.log(`→ ${file}`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    }
  }
  console.log("Migrationen aktuell.");
} finally {
  await client.end();
}
