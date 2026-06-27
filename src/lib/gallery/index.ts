import type { GalleryAlbum } from '@lib/config/types';
import galleryData from '@/assets/gallery.json';

/**
 * Get all albums from the gallery JSON data file.
 * @returns Array of albums (empty if data file is missing)
 */
export function getAlbums(): GalleryAlbum[] {
  return galleryData.albums ?? [];
}

/**
 * Extract unique tags from all albums, preserving first-seen order.
 * @param albums - Array of gallery albums
 * @returns Sorted? No — preserves first-seen order for stable UI
 */
export function getAlbumTags(albums: GalleryAlbum[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const album of albums) {
    for (const tag of album.tags ?? []) {
      if (!seen.has(tag)) {
        seen.add(tag);
        tags.push(tag);
      }
    }
  }
  return tags;
}

/**
 * Filter albums by a selected tag.
 * @param albums - Array of gallery albums
 * @param tag - Tag to filter by, or null/undefined for all
 * @returns Filtered albums
 */
export function filterAlbumsByTag(albums: GalleryAlbum[], tag?: string | null): GalleryAlbum[] {
  if (!tag) return albums;
  return albums.filter((album) => album.tags?.includes(tag));
}

/**
 * Find an album by its URL slug.
 * @param albums - Array of gallery albums
 * @param slug - Album slug
 * @returns Matching album or undefined
 */
export function findAlbumBySlug(albums: GalleryAlbum[], slug: string): GalleryAlbum | undefined {
  return albums.find((album) => album.slug === slug);
}

/**
 * Build the URL path for a gallery album detail page.
 * @param slug - Album slug
 * @returns Path like /gallery/:slug
 */
export function buildAlbumPath(slug: string): string {
  return `/gallery/${slug}`;
}
