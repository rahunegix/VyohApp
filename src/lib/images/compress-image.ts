/** Max edge length after crop/compress (profile photos). */
export const PROFILE_PHOTO_MAX_EDGE = 1600;
export const PROFILE_PHOTO_JPEG_QUALITY = 0.85;

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

/** Resize + compress a blob for upload (web). */
export async function compressImageBlob(
  blob: Blob,
  maxEdge = PROFILE_PHOTO_MAX_EDGE,
  quality = PROFILE_PHOTO_JPEG_QUALITY
): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const image = await createImage(dataUrl);
  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (out) => (out ? resolve(out) : reject(new Error("Compression failed"))),
      "image/jpeg",
      quality
    );
  });
}
