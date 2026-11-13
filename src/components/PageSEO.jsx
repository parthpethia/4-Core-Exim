import { Helmet } from 'react-helmet-async';

const SITE_NAME = '4Core Exim';
const BASE_URL = 'https://www.4coreexim.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

/**
 * PageSEO — Drop-in component for per-page <title>, <meta>, canonical, OG, and Twitter tags.
 *
 * @param {string} title       – Page title (appended with " | 4Core Exim" automatically)
 * @param {string} description – Meta description (max ~155 chars for SERP display)
 * @param {string} path        – Route path, e.g. "/catalog" (used for canonical & og:url)
 * @param {string} [ogImage]   – Optional Open Graph image URL override
 * @param {string} [ogType]    – Optional OG type override (default "website")
 * @param {object} [jsonLd]    – Optional extra JSON-LD structured data object for this page
 */
export default function PageSEO({
  title,
  description,
  path = '/',
  ogImage,
  ogType = 'website',
  jsonLd,
}) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Page-level structured data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

