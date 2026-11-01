import type { Image } from "../../static-site-generator/blocks/common";
import type { PhotoSize, StockPhoto } from "./pexels";

export function isUsable(photo: StockPhoto): boolean {
  return photo.photographer.trim() !== "";
}

export function toImage(photo: StockPhoto, size: PhotoSize, alt: string): Image {
  return {
    src: photo.src[size],
    alt,
    credit: { name: photo.photographer.trim(), url: photo.url },
  };
}
