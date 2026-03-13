const path = require('path');
const fs = require('fs');
const { distDir } = require('../config');

// Force CJS build of htmlparser2 (used by html-to-react) so webpack doesn't load ESM
function getHtmlparser2CjsPath() {
  try {
    const htmlToReactDir = path.dirname(require.resolve('html-to-react/package.json'));
    const cjsPath = path.join(htmlToReactDir, 'node_modules', 'htmlparser2', 'lib', 'index.js');
    if (fs.existsSync(cjsPath)) return cjsPath;
  } catch (_) {}
  return null;
}

const htmlparser2Alias = getHtmlparser2CjsPath();

module.exports = {
  distDir: `../${distDir}/www`,
  env: {
    USER_HAS_PORTFOLIO: !!process.env.IFRAMELY_API_KEY,
  },
  publicRuntimeConfig: {},
  webpack: (config) => {
    if (htmlparser2Alias) {
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['htmlparser2'] = htmlparser2Alias;
    }
    return config;
  },
};
