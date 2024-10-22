import { uuid } from "../uuids"

export interface StickerObject {
    x: number
    y: number
    fill?: string
    fontSize?: number
    width?: number
    height?: number
    format: "text" | "image"
    id: string
    content: string
}

export function createText(text: string = "Hello world"): StickerObject{
    return {
        x: 10,
        y: 10,
        fontSize: 48,
        fill: 'red',
        format: "text",
        id: uuid(),
        content: text
    }
}

export function createImages(src: string = 'https://konvajs.github.io/assets/yoda.jpg'): StickerObject{
    return {
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        fill: 'green',
        format: "image",
        content: src,
        id: uuid(),
    }
}