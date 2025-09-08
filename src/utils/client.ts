import 'client-only';

export function parseCookies() {
  return Object.fromEntries(
    document.cookie.split(';').map((item) => item.trim().split('='))
  ) as Record<string, string | undefined>;
}
