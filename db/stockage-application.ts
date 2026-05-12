/**
 * Stockage local pour Android et les plateformes natives.
 *
 * Le projet sauvegarde un seul gros objet JSON dans une table clé-valeur.
 * SQLite garde les données après la fermeture de l'application, ce qui est
 * nécessaire pour l'APK.
 */
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

export async function lireValeurStockee(cle: string) {
  const ligne = obtenirBaseSqlite().getFirstSync<{ value: string }>(
    'SELECT value FROM kv WHERE key = ?',
    cle,
  );

  return ligne?.value ?? null;
}

export async function ecrireValeurStockee(cle: string, valeur: string) {
  obtenirBaseSqlite().runSync(
    'INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)',
    cle,
    valeur,
  );
}
