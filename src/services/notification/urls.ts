export function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}
