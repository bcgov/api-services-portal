const shell = require('shelljs');

shell.cp('-R', ['dist2'], 'dist/');
shell.cp('-R', ['dist2/'], 'dist/');
shell.cp('-R', ['dist2/*'], 'dist/');
shell.rm('-rf', 'dist2');
