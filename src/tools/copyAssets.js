const shell = require('shelljs');

shell.cp(
  '-R',
  ['auth/', 'authz/', 'batch/', 'components/', 'lists/', 'pages/', 'services/'],
  'dist/'
);
shell.cp('*.js', 'dist/');
