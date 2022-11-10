const withPlugins = require('next-compose-plugins');
const withImages = require('next-images');
const withSvgr = require('next-svgr');

module.exports = withPlugins(
  [
    [
      withImages,
      {
        fileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'ico', 'webp', 'jp2', 'avif'],
      },
    ],
    [withSvgr],
  ],
  {
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
      images: {
      disableStaticImages: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    distDir: 'out',
  }
);
