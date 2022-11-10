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
    images: {
      disableStaticImages: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    distDir: 'out',
  }
);
