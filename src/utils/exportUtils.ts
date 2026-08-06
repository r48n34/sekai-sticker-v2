import Konva from "konva";
import { CONFIGS, StickerObject } from "./createSticker";
import { ExportOptions } from "./projectUtils";

export interface ExportBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function calculateContentBounds(layers: StickerObject[]): ExportBounds {
    const visibleLayers = layers.filter((layer) => layer.visible !== false);
    if (visibleLayers.length === 0) {
        return { x: 0, y: 0, width: CONFIGS.stageWidth, height: CONFIGS.stageHeight };
    }

    const boxes = visibleLayers.map((layer) => {
        const width =
            layer.width ?? Math.max(5, (layer.fontSize ?? 42) * layer.content.length * 0.55);
        const height = layer.height ?? (layer.fontSize ?? 42) * (layer.lineHeight ?? 1) * 1.2;
        return { x: layer.x, y: layer.y, right: layer.x + width, bottom: layer.y + height };
    });
    const x = Math.floor(Math.min(...boxes.map((box) => box.x)));
    const y = Math.floor(Math.min(...boxes.map((box) => box.y)));
    const right = Math.ceil(Math.max(...boxes.map((box) => box.right)));
    const bottom = Math.ceil(Math.max(...boxes.map((box) => box.bottom)));

    return { x, y, width: Math.max(1, right - x), height: Math.max(1, bottom - y) };
}

export function calculateRenderedContentBounds(stage: Konva.Stage): ExportBounds | null {
    const contentNodes = stage.find<Konva.Node>((node: Konva.Node) => {
        const className = node.getClassName();
        return (
            (className === "Text" || className === "Image") &&
            node.isVisible() &&
            node.getAbsoluteOpacity() > 0
        );
    });

    if (contentNodes.length === 0) return null;

    const boxes = contentNodes.map((node) => node.getClientRect({ relativeTo: stage }));
    const x = Math.floor(Math.min(...boxes.map((box) => box.x)));
    const y = Math.floor(Math.min(...boxes.map((box) => box.y)));
    const right = Math.ceil(Math.max(...boxes.map((box) => box.x + box.width)));
    const bottom = Math.ceil(Math.max(...boxes.map((box) => box.y + box.height)));

    return { x, y, width: Math.max(1, right - x), height: Math.max(1, bottom - y) };
}

export function renderStickerExport(
    stage: Konva.Stage,
    layers: StickerObject[],
    options: ExportOptions,
): string {
    const bounds =
        options.bounds === "canvas"
            ? { x: 0, y: 0, width: CONFIGS.stageWidth, height: CONFIGS.stageHeight }
            : (calculateRenderedContentBounds(stage) ?? calculateContentBounds(layers));
    const scene = stage.toCanvas({ ...bounds, pixelRatio: options.pixelRatio });

    if (!options.background) return scene.toDataURL("image/png");

    const output = document.createElement("canvas");
    output.width = scene.width;
    output.height = scene.height;
    const context = output.getContext("2d");
    if (!context) return scene.toDataURL("image/png");
    context.fillStyle = options.background;
    context.fillRect(0, 0, output.width, output.height);
    context.drawImage(scene, 0, 0);
    return output.toDataURL("image/png");
}
