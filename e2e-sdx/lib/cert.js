'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

/**
 * Generates a throwaway self-signed EC certificate/key pair inside runDir.
 * This is only used to have *something* to hand to the `sdx-keys.r1`
 * pattern so that API call can be exercised end-to-end; it is not backed
 * by any real deployed edge and is not suitable for anything but testing
 * the registration API call itself.
 */
function generateSelfSignedCert(runDir, commonName) {
  const keyPath = path.join(runDir, 'rg.key');
  const crtPath = path.join(runDir, 'rg.crt');
  execFileSync(
    'openssl',
    [
      'req',
      '-x509',
      '-newkey',
      'ec',
      '-pkeyopt',
      'ec_paramgen_curve:prime256v1',
      '-keyout',
      keyPath,
      '-out',
      crtPath,
      '-days',
      '365',
      '-nodes',
      '-subj',
      `/CN=${commonName}`,
    ],
    { stdio: 'pipe' }
  );
  return { keyPath, crtPath };
}

module.exports = { generateSelfSignedCert };
