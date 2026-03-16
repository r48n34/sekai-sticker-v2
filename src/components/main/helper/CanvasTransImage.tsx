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
  const [image] = useImage(url);

  const imageRef = useRef<Konva.Image>(null);
  const transformRef = useRef<Konva.Transformer>(null);

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
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(_) => {
          const node = imageRef.current;
          const scaleX = node!.scaleX();
          const scaleY = node!.scaleY();

          node!.scaleX(1);
          node!.scaleY(1);
          onChange({
            ...shapeProps,
            x: node!.x(),
            y: node!.y(),
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
  );
}

export default CanvasTransImage;
