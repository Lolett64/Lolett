import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin-login', '/api/', '/test/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
