const nomBaseIndexedDb = 'evidex_app_database';
const versionBaseIndexedDb = 1;
const nomStore = 'kv';

let baseIndexedDb: Promise<IDBDatabase> | null = null;

function obtenirBaseIndexedDb() {
  if (!baseIndexedDb) {
    baseIndexedDb = new Promise((resolve, reject) => {
      const request = indexedDB.open(nomBaseIndexedDb, versionBaseIndexedDb);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(nomStore)) {
          db.createObjectStore(nomStore);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return baseIndexedDb;
}

async function transactionIndexedDb<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await obtenirBaseIndexedDb();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(nomStore, mode);
    const store = transaction.objectStore(nomStore);
    const request = action(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function lireValeurStockee(key: string) {
  const value = await transactionIndexedDb<unknown>('readonly', (store) => store.get(key));
  return typeof value === 'string' ? value : null;
}

export async function ecrireValeurStockee(key: string, value: string) {
  await transactionIndexedDb<IDBValidKey>('readwrite', (store) => store.put(value, key));
}
