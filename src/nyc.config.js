'use strict';
const { parserPlugins } = require('@istanbuljs/schema').defaults.nyc;
module.exports = {
  extends: '@istanbuljs/nyc-config-typescript',
  parserPlugins: parserPlugins.concat('typescript', 'jsx'),
};
