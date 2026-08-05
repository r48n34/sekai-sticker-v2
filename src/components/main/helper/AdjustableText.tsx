import { useEffect, useRef, useState } from "react";
import { Text, Transformer } from "react-konva";
import Konva from "konva";
import { StickerObject } from "../../../utils/createSticker";
import { loadCanvasFont } from "../../../utils/fontUtils";

type AdjustableTextProps = {
    content: string;

    shapeProps: StickerObject;
    isSelected: boolean;
    onSelect: Function;
    onChange: Function;

    draggable?: boolean;
};

function AdjustableText({
    shapeProps,
    isSelected,
    onSelect,
    onChange,
    content = "Some text on canvas",
    draggable = true,
}: AdjustableTextProps) {
    const textRef = useRef<Konva.Text>(null);
    const transformRef = useRef<Konva.Transformer>(null);
    const fontFamily = shapeProps.fontFamily || "YurukaStd";
    const [loadedFontFamily, setLoadedFontFamily] = useState<string | null>(null);
    const isFontReady = loadedFontFamily === fontFamily;
    const displayWidth = shapeProps.width ?? textRef.current?.width() ?? 0;
    const displayHeight = shapeProps.height ?? textRef.current?.height() ?? 0;

    useEffect(() => {
        let isActive = true;

        void loadCanvasFont(fontFamily, content)
            .catch(() => undefined)
            .then(() => {
                if (isActive) {
                    setLoadedFontFamily(fontFamily);
                }
            });

        return () => {
            isActive = false;
        };
    }, [content, fontFamily]);

    useEffect(() => {
        if (isSelected && isFontReady && textRef.current && transformRef.current) {
            // we need to attach transformer manually
            transformRef.current.nodes([textRef.current]);
            transformRef.current.getLayer()?.batchDraw();
        }
    }, [isFontReady, isSelected]);

    return (
        <>
            {isFontReady && (
                <Text
                    fillStyle="black"
                    text={content}
                    wrap={"none"}
                    // fontFamily="NotoSansTCBold"
                    // fontFamily="SSFangTangTi"

                    // General
                    fontFamily={fontFamily}
                    // fontFamily="YurukaStd"

                    // Chinese OK
                    // fontFamily="ChillRoundGothic_Bold"

                    fillAfterStrokeEnabled={true}
                    draggable={draggable}
                    onClick={onSelect as any}
                    onTap={onSelect as any}
                    ref={textRef}
                    // textDecoration={"line-through"}

                    {...shapeProps}
                    x={shapeProps.x + (shapeProps.flipX ? displayWidth : 0)}
                    y={shapeProps.y + (shapeProps.flipY ? displayHeight : 0)}
                    scaleX={shapeProps.flipX ? -1 : 1}
                    scaleY={shapeProps.flipY ? -1 : 1}
                    onDragEnd={(e) => {
                        onChange({
                            ...shapeProps,
                            x: e.target.x() - (shapeProps.flipX ? e.target.width() : 0),
                            y: e.target.y() - (shapeProps.flipY ? e.target.height() : 0),
                        });
                    }}
                    onTransformEnd={(_) => {
                        const node = textRef.current;

                        const scaleX = Math.abs(node!.scaleX());
                        const scaleY = Math.abs(node!.scaleY());
                        const width = Math.max(5, node!.width() * scaleX);
                        const height = Math.max(5, node!.height() * scaleY);

                        node!.scaleX(shapeProps.flipX ? -1 : 1);
                        node!.scaleY(shapeProps.flipY ? -1 : 1);
                        onChange({
                            ...shapeProps,
                            x: node!.x() - (shapeProps.flipX ? width : 0),
                            y: node!.y() - (shapeProps.flipY ? height : 0),
                            rotation: node!.rotation(),
                            // fontSize: shapeProps.fontSize * scaleX,
                            fontSize: shapeProps.fontSize
                                ? shapeProps.fontSize * scaleY
                                : 18 * scaleY,

                            width,
                            height,
                        });
                    }}
                />
            )}

            {isSelected && isFontReady && (
                <Transformer
                    ref={transformRef}
                    flipEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                            return oldBox;
                        }

                        return newBox;
                    }}
                />
            )}
        </>
    );
}

export default AdjustableText;
