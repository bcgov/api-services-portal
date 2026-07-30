'use strict';

const { spawn } = require('child_process');

/**
 * Runs `restish <alias> <args...>`, streaming stdout/stderr live while also
 * buffering them so the caller can parse JSON and persist a full transcript.
 *
 * @param {string} alias - restish API alias, e.g. "aps" or "sdx"
 * @param {string[]} args - operation name + positional/flag args
 * @param {object} [opts]
 * @param {string} [opts.cwd] - working directory (relative @file refs resolve here)
 * @param {string} [opts.input] - content to write to stdin (e.g. an OAS YAML doc)
 * @param {string} [opts.profile] - restish auth profile override
 * @returns {Promise<{code:number, stdout:string, stderr:string, json:any, command:string}>}
 */
function runRestish(alias, args, opts = {}) {
  const fullArgs = [alias, ...args];
  if (opts.profile) fullArgs.push('--rsh-profile', opts.profile);
  const command = `restish ${fullArgs.join(' ')}`;

  return new Promise((resolve, reject) => {
    const child = spawn('restish', fullArgs, {
      cwd: opts.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
      stderr += chunk;
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn restish: ${err.message}`));
    });

    if (opts.input != null) {
      child.stdin.write(opts.input);
    }
    child.stdin.end();

    child.on('close', (code) => {
      let json = null;
      try {
        json = JSON.parse(stdout);
      } catch {
        // Non-JSON or empty response body (e.g. 204 No Content) is fine.
      }
      resolve({ code, stdout, stderr, json, command });
    });
  });
}

/**
 * Extracts a human-readable error message from a restish result whose exit
 * code was non-zero.
 */
function describeFailure(result) {
  if (result.json && typeof result.json === 'object') {
    if (result.json.message) return result.json.message;
    if (result.json.fields) return `Validation failed: ${JSON.stringify(result.json.fields)}`;
  }
  const stderrLine = result.stderr.trim().split('\n').filter(Boolean).pop();
  if (stderrLine) return stderrLine;
  const stdoutLine = result.stdout.trim().split('\n').filter(Boolean).pop();
  if (stdoutLine) return stdoutLine;
  return `restish exited with code ${result.code}`;
}

module.exports = { runRestish, describeFailure };
