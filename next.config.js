const { devIndicatorServerState } = require('next/dist/server/dev/dev-indicator-server-state')

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig

// next.config.js
module.exports = {
  devIndicators: {
    buildActivity: false,
  },
}
