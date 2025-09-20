import 'client-only';

export function parseCookies() {
  return Object.fromEntries(
    document.cookie.split(';').map((item) => item.trim().split('='))
  ) as Record<string, string | undefined>;
}

export function openPopup(
  url: string,
  name: string,
  { width, height }: { width?: number; height?: number }
) {
  return window.open(
    url,
    name,
    `width=${width},height=${height},left=${
      innerWidth / 2 - (width ?? 0) / 2
    },top=${innerHeight / 2 - (height ?? 0) / 2}`
  );
}

export function generateRandomHexColor() {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0');
  return `#${hex}`;
}

type GenerateRandomColorImageBlobOptions = {
  width?: number;
  height?: number;
};

export async function generateRandomColorImageFile({
  width = 100,
  height = 100,
}: GenerateRandomColorImageBlobOptions = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('missing canvas context');

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = generateRandomHexColor();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((res) => {
    canvas.toBlob((blob) => res(blob));
  });

  if (!blob) throw new Error('no blob');

  return new File([blob], 'random-color.png', { type: blob.type });
}
