import { useRef, useEffect } from "react";
import Konva from "konva";
import { Image, Transformer } from "react-konva";
import useImage from "use-image";
import { StickerObject } from "../../../utils/createSticker";

type CanvasTransImageProps = {
    url: string;
    shapeProps: StickerObject;
    isSelected: boolean;
    onSelect: Function;
    onChange: Function;

    draggable?: boolean;
};

function CanvasTransImage({
    url,
    shapeProps,
    isSelected,
    onSelect,
    onChange,
    draggable = true,
}: CanvasTransImageProps) {
    const [image] = useImage(url, "anonymous");

    const imageRef = useRef<Konva.Image>(null);
    const transformRef = useRef<Konva.Transformer>(null);
    const displayWidth = shapeProps.width ?? image?.width ?? 0;
    const displayHeight = shapeProps.height ?? image?.height ?? 0;

    useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            transformRef.current!.nodes([imageRef.current!]);
            transformRef.current!.getLayer()!.batchDraw();
        }
    }, [isSelected]);

    return (
        <>
            <Image
                image={image}
                draggable={draggable}
                onClick={onSelect as any}
                onTap={onSelect as any}
                ref={imageRef}
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
                    const node = imageRef.current;
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
                        width,
                        height,
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
    );
}

export default CanvasTransImage;
