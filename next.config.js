const images = require('next-images')
const withPlugins = require('next-compose-plugins')

// optional next.js configuration
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/object/:tokenId',
        destination: '/object/0x486ca491C9A0a9ACE266AA100976bfefC57A0Dd4/:tokenId',
        permanent: true,
      },
    ]
  },
}

module.exports = withPlugins([images], nextConfig)
