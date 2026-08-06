import { forwardRef, useEffect } from "react";
import Konva from "konva";
import { Image, Layer, Stage, Text } from "react-konva";
import useImage from "use-image";
import { BatchDraft } from "../../utils/batchUtils";
import { CONFIGS } from "../../utils/createSticker";
import ResponsiveStage from "../main/ResponsiveStage";

export type BatchPreviewStatus = "loading" | "ready" | "error";

interface BatchStickerPreviewProps {
    draft: BatchDraft;
    fontReady: boolean;
    onStatusChange: (draftId: string, status: BatchPreviewStatus) => void;
}

const BatchStickerPreview = forwardRef<Konva.Stage, BatchStickerPreviewProps>(
    ({ draft, fontReady, onStatusChange }, ref) => {
        const imageLayer = draft.layers.find((layer) => layer.format === "image");
        const textLayer = draft.layers.find((layer) => layer.format === "text");
        const [image, imageStatus] = useImage(imageLayer?.content ?? "", "anonymous");

        useEffect(() => {
            const status: BatchPreviewStatus =
                imageStatus === "failed"
                    ? "error"
                    : imageStatus === "loaded" && fontReady
                      ? "ready"
                      : "loading";
            onStatusChange(draft.id, status);
        }, [draft.id, fontReady, imageStatus, onStatusChange]);

        return (
            <ResponsiveStage width={CONFIGS.stageWidth} height={CONFIGS.stageHeight}>
                <Stage
                    ref={ref}
                    width={CONFIGS.stageWidth}
                    height={CONFIGS.stageHeight}
                    style={{
                        border: "2px solid var(--mantine-color-blue-light)",
                        borderRadius: 8,
                        boxSizing: "border-box",
                    }}
                >
                    <Layer>
                        {imageLayer && image && (
                            <Image
                                image={image}
                                x={imageLayer.x}
                                y={imageLayer.y}
                                width={imageLayer.width}
                                height={imageLayer.height}
                                opacity={imageLayer.opacity ?? 1}
                            />
                        )}
                        {textLayer && fontReady && (
                            <Text
                                text={textLayer.content}
                                x={textLayer.x}
                                y={textLayer.y}
                                width={textLayer.width}
                                height={textLayer.height}
                                rotation={textLayer.rotation}
                                fill={textLayer.fill}
                                stroke={textLayer.stroke}
                                strokeWidth={textLayer.strokeWidth}
                                fontFamily={textLayer.fontFamily}
                                fontSize={textLayer.fontSize}
                                letterSpacing={textLayer.letterSpacing}
                                align={textLayer.align}
                                lineHeight={textLayer.lineHeight}
                                opacity={textLayer.opacity ?? 1}
                                fillAfterStrokeEnabled
                                wrap="none"
                            />
                        )}
                    </Layer>
                </Stage>
            </ResponsiveStage>
        );
    },
);

BatchStickerPreview.displayName = "BatchStickerPreview";

export default BatchStickerPreview;
