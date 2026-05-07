import * as SQLite from 'expo-sqlite';

const nomBase = 'evidex_app.db';

let baseSqlite: SQLite.SQLiteDatabase | null = null;

function obtenirBaseSqlite() {
  if (!baseSqlite) {
    baseSqlite = SQLite.openDatabaseSync(nomBase);
    baseSqlite.execSync(`
      CREATE TABLE IF NOT EXISTS kv (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  }

  return baseSqlite;
}

export async function lireValeurStockee(key: string) {
  const row = obtenirBaseSqlite().getFirstSync<{ value: string }>(
    'SELECT value FROM kv WHERE key = ?',
    key,
  );

  return row?.value ?? null;
}

export async function ecrireValeurStockee(key: string, value: string) {
  obtenirBaseSqlite().runSync(
    'INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)',
    key,
    value,
  );
}
