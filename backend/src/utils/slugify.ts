/**
 * Simple slugify utility
 * Converts text like "Berita Terbaru Madura" to "berita-terbaru-madura"
 */
export default function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
