const nomBaseIndexedDb = 'evidex_app_database';
const versionBaseIndexedDb = 1;
const nomMagasin = 'kv';

let baseIndexedDb: Promise<IDBDatabase> | null = null;
const stockageMemoireServeur = new Map<string, string>();

function indexedDbDisponible() {
  return typeof globalThis.indexedDB !== 'undefined';
}

function obtenirBaseIndexedDb() {
  if (!baseIndexedDb) {
    baseIndexedDb = new Promise((resoudre, rejeter) => {
      const requete = globalThis.indexedDB.open(nomBaseIndexedDb, versionBaseIndexedDb);

      requete.onupgradeneeded = () => {
        const base = requete.result;

        if (!base.objectStoreNames.contains(nomMagasin)) {
          base.createObjectStore(nomMagasin);
        }
      };

      requete.onsuccess = () => resoudre(requete.result);
      requete.onerror = () => rejeter(requete.error);
    });
  }

  return baseIndexedDb;
}

async function transactionIndexedDb<T>(
  mode: IDBTransactionMode,
  operation: (magasin: IDBObjectStore) => IDBRequest<T>,
) {
  const base = await obtenirBaseIndexedDb();

  return new Promise<T>((resoudre, rejeter) => {
    const transaction = base.transaction(nomMagasin, mode);
    const magasin = transaction.objectStore(nomMagasin);
    const requete = operation(magasin);

    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error);
    transaction.onerror = () => rejeter(transaction.error);
  });
}

export async function lireValeurStockee(cle: string) {
  if (!indexedDbDisponible()) {
    return stockageMemoireServeur.get(cle) ?? null;
  }

  const valeur = await transactionIndexedDb<unknown>('readonly', (magasin) => magasin.get(cle));
  return typeof valeur === 'string' ? valeur : null;
}

export async function ecrireValeurStockee(cle: string, valeur: string) {
  if (!indexedDbDisponible()) {
    stockageMemoireServeur.set(cle, valeur);
    return;
  }

  await transactionIndexedDb<IDBValidKey>('readwrite', (magasin) => magasin.put(valeur, cle));
}
