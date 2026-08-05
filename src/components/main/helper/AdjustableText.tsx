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
                    onDragEnd={(e) => {
                        onChange({
                            ...shapeProps,
                            x: e.target.x(),
                            y: e.target.y(),
                        });
                    }}
                    onTransformEnd={(_) => {
                        const node = textRef.current;

                        const scaleX = node!.scaleX();
                        const scaleY = node!.scaleY();

                        node!.scaleX(1);
                        node!.scaleY(1);
                        onChange({
                            ...shapeProps,
                            x: node!.x(),
                            y: node!.y(),
                            rotation: node!.rotation(),
                            // fontSize: shapeProps.fontSize * scaleX,
                            fontSize: shapeProps.fontSize
                                ? shapeProps.fontSize * scaleY
                                : 18 * scaleY,

                            width: Math.max(5, node!.width() * scaleX),
                            height: Math.max(node!.height() * scaleY),
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
