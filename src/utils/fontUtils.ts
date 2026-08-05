export async function loadCanvasFont(fontFamily: string, text: string): Promise<void> {
    if (typeof document === "undefined" || !document.fonts) {
        return;
    }

    const fontDescriptor = `16px ${JSON.stringify(fontFamily)}`;
    await document.fonts.load(fontDescriptor, text);
}
