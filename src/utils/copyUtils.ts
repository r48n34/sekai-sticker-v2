export function copyImages(blobImage: Blob, format: string = "image/png") {
  navigator.clipboard.write([
    new ClipboardItem({
      [format]: blobImage,
    }),
  ]);
}
