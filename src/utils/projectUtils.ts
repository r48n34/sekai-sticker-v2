import { CONFIGS, normalizeStickerList, StickerObject } from "./createSticker";
import { getAsset, saveAssetWithId } from "./assetStorage";

export const CURRENT_PROJECT_VERSION = 1;

export interface ProjectDocument {
    version: number;
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    canvas: {
        width: number;
        height: number;
        background: string | null;
    };
    layers: StickerObject[];
    assets?: Record<string, string>;
}

export interface ExportOptions {
    bounds: "canvas" | "content";
    background: string | null;
    pixelRatio: 1 | 2 | 3;
    filename: string;
}

export function createProjectDocument(
    name: string,
    layers: StickerObject[],
    existing?: ProjectDocument,
): ProjectDocument {
    const now = new Date().toISOString();
    return {
        version: CURRENT_PROJECT_VERSION,
        id: existing?.id ?? crypto.randomUUID(),
        name: name.trim() || "Untitled sticker",
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        canvas: existing?.canvas ?? {
            width: CONFIGS.stageWidth,
            height: CONFIGS.stageHeight,
            background: null,
        },
        layers: normalizeStickerList(layers),
    };
}

export function parseProjectDocument(input: string): ProjectDocument {
    const parsed: unknown = JSON.parse(input);

    if (!parsed || typeof parsed !== "object") throw new Error("Invalid project file");
    const project = parsed as Partial<ProjectDocument>;
    if (!Array.isArray(project.layers) || typeof project.name !== "string") {
        throw new Error("Invalid project file");
    }

    return {
        version: CURRENT_PROJECT_VERSION,
        id: typeof project.id === "string" ? project.id : crypto.randomUUID(),
        name: project.name,
        createdAt: project.createdAt ?? new Date().toISOString(),
        updatedAt: project.updatedAt ?? new Date().toISOString(),
        canvas: {
            width: project.canvas?.width ?? CONFIGS.stageWidth,
            height: project.canvas?.height ?? CONFIGS.stageHeight,
            background: project.canvas?.background ?? null,
        },
        layers: normalizeStickerList(project.layers),
        assets:
            project.assets && typeof project.assets === "object"
                ? (project.assets as Record<string, string>)
                : undefined,
    };
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

export async function embedProjectAssets(project: ProjectDocument): Promise<ProjectDocument> {
    const assets: Record<string, string> = {};
    const assetIds = [...new Set(project.layers.flatMap((layer) => layer.assetId ?? []))];

    await Promise.all(
        assetIds.map(async (id) => {
            const blob = await getAsset(id);
            if (blob) assets[id] = await blobToDataUrl(blob);
        }),
    );
    return Object.keys(assets).length > 0 ? { ...project, assets } : project;
}

export async function importProjectAssets(project: ProjectDocument): Promise<void> {
    if (!project.assets) return;
    await Promise.all(
        Object.entries(project.assets).map(async ([id, dataUrl]) => {
            const blob = await (await fetch(dataUrl)).blob();
            await saveAssetWithId(id, blob);
        }),
    );
}

export async function downloadProject(project: ProjectDocument) {
    const portableProject = await embedProjectAssets(project);
    const blob = new Blob([JSON.stringify(portableProject, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${project.name.replace(/[^a-z0-9-_]+/gi, "-") || "sticker"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
}
