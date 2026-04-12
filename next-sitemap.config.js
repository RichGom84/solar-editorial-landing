/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://solarv.netlify.app',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 1.0,
  sitemapSize: 5000,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
}
