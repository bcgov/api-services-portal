const { distDir } = require('../config');

module.exports = {
  distDir: `../${distDir}/www`,
  env: {
    USER_HAS_PORTFOLIO: !!process.env.IFRAMELY_API_KEY,
  },
  publicRuntimeConfig: {
    appVersionTest: process.env.NEXT_PUBLIC_APP_VERSION,
  },
};
