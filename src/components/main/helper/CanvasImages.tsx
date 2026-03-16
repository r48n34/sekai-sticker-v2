import { forwardRef } from "react";
import { Image } from "react-konva";
import useImage from "use-image";

type CanvasImagesProps = {
  url: string;
  [val: string]: any;
};

function CanvasImages(props: any, ref: any) {
  const { url, ...otherProps }: CanvasImagesProps = props;
  const [image] = useImage(url);

  return <Image image={image} ref={ref} {...otherProps} />;
}

export default forwardRef(CanvasImages);
