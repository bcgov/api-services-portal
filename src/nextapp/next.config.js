const { distDir } = require('../config');

module.exports = {
  distDir: `../${distDir}/www`,
  env: {
    USER_HAS_PORTFOLIO: !!process.env.IFRAMELY_API_KEY,
    GHI: '123',
    JKL: process.env.JKL,
  },
  publicRuntimeConfig: {
    ABC: '123',
    DEF: process.env.DEF,
  },
};
