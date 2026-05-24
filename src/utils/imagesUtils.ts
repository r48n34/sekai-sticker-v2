export async function getImagesWidthAndHeight(imgSrc: string): Promise<{ w: number; h: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const isCrossOriginCandidate = /^https?:\/\//i.test(imgSrc) || imgSrc.startsWith("//");

        if (isCrossOriginCandidate) {
            img.crossOrigin = "anonymous";
        }

        // the following handler will fire after a successful loading of the image
        img.onload = () => {
            const { naturalWidth: w, naturalHeight: h } = img;
            resolve({ w, h });
        };

        // and this handler will fire if there was an error with the image (like if it's not really an image or a corrupted one)
        img.onerror = () => {
            reject("There was some problem with the image.");
        };

        img.src = imgSrc;
        // img.src = URL.createObjectURL(imgSrc)
    });
}
