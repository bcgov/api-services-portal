const shell = require('shelljs');

shell.rm('-rf', 'dist');
shell.mkdir('dist')
shell.cp( "-R", ["auth/", "authz/", "batch/", "components/", "lists/", "pages/", "services/"], "dist/" )
shell.cp( "*.js", "dist/")
