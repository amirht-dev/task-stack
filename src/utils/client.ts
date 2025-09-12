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
