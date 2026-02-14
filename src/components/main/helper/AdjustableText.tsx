import { useRef, useEffect } from 'react';
import { Text, Transformer } from 'react-konva';
import Konva from "konva";
import { StickerObject } from '../../../utils/createSticker';

type AdjustableTextProps = {
    content: string;

    shapeProps: StickerObject
    isSelected: boolean
    onSelect: Function
    onChange: Function

    draggable?: boolean
}

function AdjustableText({ 
    shapeProps,
    isSelected,
    onSelect,
    onChange,
    content = "Some text on canvas",
    draggable = true
}: AdjustableTextProps) {

    const textRef = useRef<Konva.Text>(null);
    const transformRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            transformRef.current!.nodes([textRef.current!]);
            transformRef.current!.getLayer()!.batchDraw();
        }
    }, [isSelected]);

    return (
        <>
            <Text
                fillStyle="black"
                text={content}
                wrap={"none"}
                
                // fontFamily="NotoSansTCBold"
                // fontFamily="SSFangTangTi"
                
                // General
                fontFamily={shapeProps.fontFamily || "YurukaStd"}

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
                        // fontSize: shapeProps.fontSize * scaleX,
                        fontSize: shapeProps.fontSize ? shapeProps.fontSize * scaleY : 18 * scaleY,

                        width: Math.max(5, node!.width() * scaleX),
                        height: Math.max(node!.height() * scaleY),
                    });
                }}
            />

            {isSelected && (
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
    )
}

export default AdjustableText
