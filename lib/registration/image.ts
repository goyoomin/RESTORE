export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_COMPRESSED_BYTES = 350 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export async function optimizeImage(file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("JPG, PNG 또는 WebP 사진을 선택해 주세요.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("사진은 10MB 이하로 선택해 주세요.");
  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("사진을 읽을 수 없습니다. 다른 사진을 선택해 주세요.")); image.src = url; });
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("사진 크기를 확인할 수 없습니다.");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("사진을 처리할 수 없습니다. 사진 없이 등록하거나 다른 사진을 선택해 주세요.");
    let scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    for (let attempt = 0; attempt < 5; attempt++) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.78));
      if (!blob) throw new Error("사진을 변환할 수 없습니다. 다른 사진을 선택해 주세요.");
      if (blob.size <= MAX_COMPRESSED_BYTES) return await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("사진을 읽을 수 없습니다.")); reader.onerror = () => reject(new Error("사진을 읽을 수 없습니다.")); reader.readAsDataURL(blob); });
      scale *= 0.7;
    }
    throw new Error("사진의 크기를 충분히 줄이지 못했습니다. 다른 사진을 선택해 주세요.");
  } finally { URL.revokeObjectURL(url); }
}
