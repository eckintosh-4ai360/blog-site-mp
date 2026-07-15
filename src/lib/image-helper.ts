export function safeImageSrc(src: string | undefined | null): string {
  if (!src) return "/bg_sheik.jpg";
  const trimmed = src.trim();
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  return "/bg_sheik.jpg";
}

/**
 * Resizes and compresses an image file using Canvas.
 * Max dimension: 1200px. Quality: 70% JPEG.
 * Typically reduces file size from 3MB-10MB to 50KB-150KB.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fall back to original base64 if canvas context is unavailable
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG with 70% quality
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error("Failed to load image."));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("FileReader error."));
    };
    reader.readAsDataURL(file);
  });
}
