import Konva from "konva";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { Image, Layer, Stage, Text } from "react-konva";
import useImage from "use-image";
import { restoreAssetUrls } from "../../utils/assetStorage";
import { CONFIGS, StickerObject } from "../../utils/createSticker";
import { loadCanvasFont } from "../../utils/fontUtils";
import ResponsiveStage from "../main/ResponsiveStage";

export type StickerPreviewStatus = "loading" | "ready" | "error";

interface PreviewLayerProps {
    layer: StickerObject;
    onStatusChange: (id: string, status: StickerPreviewStatus) => void;
}

function PreviewImageLayer({ layer, onStatusChange }: PreviewLayerProps) {
    const [image, imageStatus] = useImage(layer.content, "anonymous");
    const width = layer.width ?? image?.width ?? 0;
    const height = layer.height ?? image?.height ?? 0;

    useEffect(() => {
        onStatusChange(
            layer.id,
            imageStatus === "failed" ? "error" : imageStatus === "loaded" ? "ready" : "loading",
        );
    }, [imageStatus, layer.id, onStatusChange]);

    if (!image) return null;
    return (
        <Image
            image={image}
            x={layer.x + (layer.flipX ? width : 0)}
            y={layer.y + (layer.flipY ? height : 0)}
            width={width}
            height={height}
            rotation={layer.rotation}
            opacity={layer.opacity ?? 1}
            scaleX={layer.flipX ? -1 : 1}
            scaleY={layer.flipY ? -1 : 1}
        />
    );
}

function PreviewTextLayer({ layer, onStatusChange }: PreviewLayerProps) {
    const [ready, setReady] = useState(false);
    const fontFamily = layer.fontFamily ?? "YurukaStd";
    const width = layer.width ?? Math.max(5, (layer.fontSize ?? 42) * layer.content.length * 0.55);
    const height = layer.height ?? (layer.fontSize ?? 42) * (layer.lineHeight ?? 1) * 1.2;

    useEffect(() => {
        let active = true;
        setReady(false);
        onStatusChange(layer.id, "loading");
        void loadCanvasFont(fontFamily, layer.content)
            .then(() => {
                if (active) {
                    setReady(true);
                    onStatusChange(layer.id, "ready");
                }
            })
            .catch(() => {
                if (active) onStatusChange(layer.id, "error");
            });
        return () => {
            active = false;
        };
    }, [fontFamily, layer.content, layer.id, onStatusChange]);

    if (!ready) return null;
    return (
        <Text
            text={layer.content}
            x={layer.x + (layer.flipX ? width : 0)}
            y={layer.y + (layer.flipY ? height : 0)}
            width={layer.width}
            height={layer.height}
            rotation={layer.rotation}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth}
            fontFamily={fontFamily}
            fontSize={layer.fontSize}
            letterSpacing={layer.letterSpacing}
            align={layer.align}
            lineHeight={layer.lineHeight}
            opacity={layer.opacity ?? 1}
            scaleX={layer.flipX ? -1 : 1}
            scaleY={layer.flipY ? -1 : 1}
            fillAfterStrokeEnabled
            wrap="none"
        />
    );
}

interface StickerPackPreviewProps {
    itemId: string;
    layers: StickerObject[];
    onStatusChange: (itemId: string, status: StickerPreviewStatus) => void;
}

const StickerPackPreview = forwardRef<Konva.Stage, StickerPackPreviewProps>(
    ({ itemId, layers, onStatusChange }, ref) => {
        const [hydratedLayers, setHydratedLayers] = useState<StickerObject[] | null>(null);
        const [layerStatuses, setLayerStatuses] = useState<Record<string, StickerPreviewStatus>>(
            {},
        );
        const visibleLayers = useMemo(
            () => hydratedLayers?.filter((layer) => layer.visible !== false) ?? [],
            [hydratedLayers],
        );

        useEffect(() => {
            let active = true;
            setHydratedLayers(null);
            setLayerStatuses({});
            onStatusChange(itemId, "loading");
            void restoreAssetUrls(layers)
                .then((nextLayers) => {
                    if (active) setHydratedLayers(nextLayers);
                })
                .catch(() => {
                    if (active) onStatusChange(itemId, "error");
                });

            return () => {
                active = false;
            };
        }, [itemId, layers, onStatusChange]);

        useEffect(() => {
            if (!hydratedLayers) return;
            if (visibleLayers.length === 0) {
                onStatusChange(itemId, "error");
                return;
            }
            const statuses = visibleLayers.map((layer) => layerStatuses[layer.id] ?? "loading");
            onStatusChange(
                itemId,
                statuses.includes("error")
                    ? "error"
                    : statuses.every((status) => status === "ready")
                      ? "ready"
                      : "loading",
            );
        }, [hydratedLayers, itemId, layerStatuses, onStatusChange, visibleLayers]);

        const updateLayerStatus = useCallback((id: string, status: StickerPreviewStatus) => {
            setLayerStatuses((current) =>
                current[id] === status ? current : { ...current, [id]: status },
            );
        }, []);

        return (
            <ResponsiveStage width={CONFIGS.stageWidth} height={CONFIGS.stageHeight}>
                <Stage
                    ref={ref}
                    width={CONFIGS.stageWidth}
                    height={CONFIGS.stageHeight}
                    style={{
                        border: "1px solid var(--mantine-color-gray-4)",
                        borderRadius: 8,
                        boxSizing: "border-box",
                    }}
                >
                    <Layer>
                        {visibleLayers.map((layer) =>
                            layer.format === "text" ? (
                                <PreviewTextLayer
                                    key={layer.id}
                                    layer={layer}
                                    onStatusChange={updateLayerStatus}
                                />
                            ) : (
                                <PreviewImageLayer
                                    key={layer.id}
                                    layer={layer}
                                    onStatusChange={updateLayerStatus}
                                />
                            ),
                        )}
                    </Layer>
                </Stage>
            </ResponsiveStage>
        );
    },
);

StickerPackPreview.displayName = "StickerPackPreview";

export default StickerPackPreview;
