import { uuid } from "./uuids";
import { StickerObject } from "./createSticker";

const DATABASE_NAME = "sekai-sticker-assets";
const STORE_NAME = "assets";

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, 1);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(STORE_NAME)) {
                request.result.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveAsset(blob: Blob): Promise<string> {
    const id = uuid();
    await saveAssetWithId(id, blob);
    return id;
}

export async function saveAssetWithId(id: string, blob: Blob): Promise<void> {
    const database = await openDatabase();

    await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).put(blob, id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
    database.close();
}

export async function getAsset(id: string): Promise<Blob | undefined> {
    const database = await openDatabase();
    const result = await new Promise<Blob | undefined>((resolve, reject) => {
        const request = database
            .transaction(STORE_NAME, "readonly")
            .objectStore(STORE_NAME)
            .get(id);
        request.onsuccess = () => resolve(request.result as Blob | undefined);
        request.onerror = () => reject(request.error);
    });
    database.close();
    return result;
}

export async function restoreAssetUrls(layers: StickerObject[]): Promise<StickerObject[]> {
    return Promise.all(
        layers.map(async (layer) => {
            if (!layer.assetId) return layer;

            try {
                const blob = await getAsset(layer.assetId);
                return blob ? { ...layer, content: URL.createObjectURL(blob) } : layer;
            } catch {
                return layer;
            }
        }),
    );
}
