

module.exports = withPlugins(
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
