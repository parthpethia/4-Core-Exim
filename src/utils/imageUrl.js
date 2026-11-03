/**
 * Image URL helpers — resize/compress remote images for faster catalog loads.
 * Supports Unsplash query params and Supabase Storage image transforms.
 */

const DEFAULT_PLACEHOLDER =
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=70';

function isHttpUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

/**
 * @param {string|null|undefined} url
 * @param {{ width?: number, height?: number, quality?: number, fit?: string }} [opts]
 * @returns {string}
 */
export function optimizeImageUrl(url, opts = {}) {
  const {
    width = 400,
    height = null,
    quality = 70,
    fit = 'crop'
  } = opts;

  if (!url || !isHttpUrl(url)) return DEFAULT_PLACEHOLDER;

  try {
    const u = new URL(url);

    // Unsplash / images.unsplash.com
    if (u.hostname.includes('unsplash.com') || u.hostname.includes('unsplash')) {
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', fit);
      u.searchParams.set('w', String(width));
      if (height) u.searchParams.set('h', String(height));
      u.searchParams.set('q', String(quality));
      return u.toString();
    }

    // IndiaMART CDN — request a modest size when possible
    if (u.hostname.includes('imimg.com')) {
      // Many imimg URLs already embed size; leave as-is but still return
      return url;
    }

    // Supabase Storage public object → image transformation endpoint
    // /storage/v1/object/public/<bucket>/<path>
    // → /storage/v1/render/image/public/<bucket>/<path>?width=&quality=
    const objectMatch = u.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (objectMatch) {
      const bucket = objectMatch[1];
      const path = objectMatch[2];
      u.pathname = `/storage/v1/render/image/public/${bucket}/${path}`;
      u.search = '';
      u.searchParams.set('width', String(width));
      u.searchParams.set('quality', String(quality));
      u.searchParams.set('resize', 'contain');
      return u.toString();
    }

    return url;
  } catch {
    return url || DEFAULT_PLACEHOLDER;
  }
}

/**
 * Build srcSet for responsive product thumbs.
 * @param {string} url
 * @param {number[]} widths
 */
export function buildSrcSet(url, widths = [240, 400, 640]) {
  if (!url) return undefined;
  return widths
    .map((w) => `${optimizeImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
}

export function getPlaceholderImage() {
  return DEFAULT_PLACEHOLDER;
}

/**
 * Prefer denormalized thumbnail; else first of images[].
 */
export function resolveProductThumbnail(product) {
  if (!product) return DEFAULT_PLACEHOLDER;
  if (product.thumbnailUrl) return product.thumbnailUrl;
  if (product.thumbnail_url) return product.thumbnail_url;
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];
  return DEFAULT_PLACEHOLDER;
}
