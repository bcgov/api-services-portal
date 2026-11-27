// Jest transform for the tsoa controllers. They use TypeScript decorators
// (including parameter decorators and decorator metadata for tsyringe),
// which the Babel config cannot compile, so they are compiled with the
// TypeScript compiler instead, using the project's tsconfig settings.
const ts = require('typescript');
const path = require('path');

const configFile = path.join(__dirname, '..', 'tsconfig.json');
const { config } = ts.readConfigFile(configFile, ts.sys.readFile);
const { options } = ts.convertCompilerOptionsFromJson(
  config.compilerOptions,
  path.dirname(configFile)
);

module.exports = {
  process(sourceText, sourcePath) {
    const { outputText, sourceMapText } = ts.transpileModule(sourceText, {
      fileName: sourcePath,
      compilerOptions: { ...options, outDir: undefined, sourceMap: true },
    });
    return { code: outputText, map: sourceMapText };
  },
};
