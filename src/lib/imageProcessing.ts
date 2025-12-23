export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  invert: number;
}

export const defaultFilters: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  invert: 0,
};

export const applyFiltersToCanvas = (
  sourceImage: HTMLImageElement,
  filters: FilterSettings
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = sourceImage.naturalWidth;
  canvas.height = sourceImage.naturalHeight;

  // Build CSS filter string
  const filterString = [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    `blur(${filters.blur}px)`,
    `grayscale(${filters.grayscale}%)`,
    `sepia(${filters.sepia}%)`,
    `hue-rotate(${filters.hueRotate}deg)`,
    `invert(${filters.invert}%)`,
  ].join(" ");

  ctx.filter = filterString;
  ctx.drawImage(sourceImage, 0, 0);

  return canvas;
};

export const canvasToBlob = (canvas: HTMLCanvasElement, format: string = "image/png", quality: number = 0.92): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      format,
      quality
    );
  });
};

export const downloadCanvas = async (canvas: HTMLCanvasElement, filename: string = "edited-image.png") => {
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const resizeImage = (
  sourceImage: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  maintainAspect: boolean = true
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  let finalWidth = targetWidth;
  let finalHeight = targetHeight;

  if (maintainAspect) {
    const aspectRatio = sourceImage.naturalWidth / sourceImage.naturalHeight;
    if (targetWidth / targetHeight > aspectRatio) {
      finalWidth = targetHeight * aspectRatio;
    } else {
      finalHeight = targetWidth / aspectRatio;
    }
  }

  canvas.width = finalWidth;
  canvas.height = finalHeight;
  ctx.drawImage(sourceImage, 0, 0, finalWidth, finalHeight);

  return canvas;
};

export const cropImage = (
  sourceImage: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(sourceImage, x, y, width, height, 0, 0, width, height);

  return canvas;
};

export const convertImageFormat = async (
  sourceImage: HTMLImageElement,
  format: "image/png" | "image/jpeg" | "image/webp",
  quality: number = 0.92
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = sourceImage.naturalWidth;
  canvas.height = sourceImage.naturalHeight;
  ctx.drawImage(sourceImage, 0, 0);

  return canvasToBlob(canvas, format, quality);
};
