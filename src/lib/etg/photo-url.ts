// ETG image templates contain {size} placeholder
// e.g. "https://cdn.worldota.net/t/{size}/content/..."
export function resolvePhotoUrl(
  template: string,
  size: '240x240' | '640x400' | '1024x768' = '640x400'
): string {
  return template.replace('{size}', size);
}
