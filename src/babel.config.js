module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'commonjs', // Ensure ESM is transformed to CommonJS
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  // plugins: ['transform-class-properties', 'istanbul'],
};
