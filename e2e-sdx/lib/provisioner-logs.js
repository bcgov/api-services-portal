'use strict';

const { execFileSync } = require('child_process');

/**
 * Best-effort read of the local docker-compose `provisioner` container's
 * recent logs. Several scenarios (ERR-023/024/025) activate a connection
 * whose only public-API-visible outcome is "the call returned 200" -
 * ERR-024 means provisionerStatus never reflects success/failure either,
 * so the Cedar policy result (pass/fail) is only observable here. Returns
 * '' if docker isn't available or the container isn't found - callers
 * should treat that as "couldn't check", not as a pass/fail signal.
 */
function recentProvisionerLogs(sinceSeconds = 30) {
  try {
    return execFileSync(
      'docker',
      ['logs', 'provisioner', '--since', `${sinceSeconds}s`],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
  } catch {
    return '';
  }
}

/**
 * Finds the most recent Cedar "Policy check passed/failed" line mentioning
 * the given clientId, if any. Returns { found, passed, reason } or
 * { found: false } if no matching line was seen.
 */
function findPolicyCheckResult(clientId, sinceSeconds = 30) {
  const logs = recentProvisionerLogs(sinceSeconds);
  const lines = logs
    .split('\n')
    .filter((l) => l.includes(clientId) && l.includes('Policy check'));
  const last = lines.pop();
  if (!last) return { found: false };

  const passed = /Policy check passed/.test(last);
  const reasonMatch = last.match(/"reason":\s*(\[[^\]]*\]|"[^"]*")/);
  return { found: true, passed, reason: reasonMatch ? reasonMatch[1] : last };
}

/**
 * Finds the most recent "Requesting CA token" debug line mentioning the
 * given host, if any. Emitted only by provisioner-api's `CaTokenApiClient`
 * (ERR-034's fix) - its absence means the token request never reached the
 * provisioner, i.e. apsportal called the CA token issuer directly instead.
 * Returns `{ found }`.
 */
function findCaTokenLog(host, sinceSeconds = 30) {
  const logs = recentProvisionerLogs(sinceSeconds);
  const found = logs
    .split('\n')
    .some((l) => l.includes('Requesting CA token') && l.includes(host));
  return { found };
}

module.exports = { recentProvisionerLogs, findPolicyCheckResult, findCaTokenLog };
