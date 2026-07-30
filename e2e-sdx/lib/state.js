'use strict';

const fs = require('fs');
const path = require('path');

function statePath(runDir) {
  return path.join(runDir, 'state.json');
}

function loadState(runDir) {
  const p = statePath(runDir);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveState(runDir, state) {
  fs.writeFileSync(statePath(runDir), JSON.stringify(state, null, 2));
}

function logStepOutput(runDir, stepId, result) {
  const logsDir = path.join(runDir, 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  const lines = [
    `$ ${result.command}`,
    '',
    `exit code: ${result.code}`,
    '',
    '--- stdout ---',
    result.stdout,
    '--- stderr ---',
    result.stderr,
  ];
  fs.writeFileSync(path.join(logsDir, `${stepId}.log`), lines.join('\n'));
}

const STATUS_ICON = {
  success: 'PASS',
  failed: 'FAIL',
  skipped: 'SKIP',
  running: 'RUNNING',
  pending: 'pending',
};

function writeResultsMarkdown(runDir, state, stepDefs) {
  const lines = [];
  lines.push(`# SDX TechDocs Test Run`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Run started: ${state.createdAt}`);
  lines.push('');
  lines.push('## Reference');
  lines.push('');
  lines.push(
    'Steps follow the how-to guides published under `aps-infra-platform/documentation/`, ' +
      'starting at `documentation/concepts/secure-data-exchange.md`: ' +
      '`sdx-org-onboarding.md`, `sdx-edge-servers.md`, `sdx-subsystems.md`, `sdx-services.md`, `sdx-connections.md`.'
  );
  lines.push('');
  lines.push('## Test data');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('| --- | --- |');
  lines.push(`| Organization name | \`${state.testData.orgName}\` |`);
  lines.push(`| Runtime group name | \`${state.testData.rgName}\` |`);
  lines.push(`| Subsystem name | \`${state.testData.subsystemName}\` |`);
  lines.push(`| Environment | \`${state.environment}\` |`);
  lines.push(`| Member email (RBAC) | \`${state.memberEmail}\` |`);
  lines.push(`| Provider upstream URL | \`${state.upstreamUrl}\` |`);
  lines.push(`| Org API alias | \`${state.orgAlias}\` |`);
  lines.push(`| SDX API alias | \`${state.sdxAlias}\` |`);
  lines.push(`| Fake API spec | \`api-spec.yaml\` |`);
  lines.push('');

  const captured = state.captured || {};
  const capturedKeys = Object.keys(captured);
  if (capturedKeys.length) {
    lines.push('## Captured IDs');
    lines.push('');
    lines.push('| Key | Value |');
    lines.push('| --- | --- |');
    for (const k of capturedKeys) {
      lines.push(`| ${k} | \`${captured[k]}\` |`);
    }
    lines.push('');
  }

  lines.push('## Steps');
  lines.push('');
  lines.push('| # | Step | Status | Started | Finished | Notes |');
  lines.push('| --- | --- | --- | --- | --- | --- |');

  const defs = stepDefs || [];
  defs.forEach((def, i) => {
    const s = (state.steps || {})[def.id] || { status: 'pending' };
    const notes = (s.error || '').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 200);
    lines.push(
      `| ${i + 1} | ${def.title} (\`${def.id}\`) | ${STATUS_ICON[s.status] || s.status} | ${
        s.startedAt || ''
      } | ${s.finishedAt || ''} | ${notes} |`
    );
  });
  lines.push('');

  const failed = defs.find((d) => (state.steps[d.id] || {}).status === 'failed');
  if (failed) {
    lines.push('## Resume');
    lines.push('');
    lines.push('The run stopped on a failed required step. Once fixed, resume with:');
    lines.push('');
    lines.push('```sh');
    lines.push(`node run.js --continue ${runDir}`);
    lines.push('```');
    lines.push('');
  } else if (defs.length && defs.every((d) => ['success', 'skipped'].includes((state.steps[d.id] || {}).status))) {
    lines.push('## Result');
    lines.push('');
    lines.push('All steps completed (required steps passed; some informational/best-effort steps may show SKIP).');
    lines.push('');
  }

  lines.push('## Notes');
  lines.push('');
  lines.push(
    '- Organization and runtime group deletion are not part of this run: `sdx-edge-servers.md` ' +
      'documents runtime group decommissioning as "to be documented", and organization deletion has no ' +
      'published how-to. `sdx-test-*` / `rg*` / `SDX-TEST-*` resources from failed or `--keep` runs will ' +
      'accumulate in the target environment and may need manual follow-up.'
  );
  lines.push(
    '- The runtime group public key registered in this run uses a locally generated, self-signed ' +
      'certificate purely to exercise the `sdx-keys.r1` pattern API call — it is not backed by a real deployed edge.'
  );
  lines.push(
    '- Per-step request/response transcripts are under `logs/<step-id>.log`.'
  );
  lines.push('');

  fs.writeFileSync(path.join(runDir, 'results.md'), lines.join('\n'));
}

module.exports = { loadState, saveState, logStepOutput, writeResultsMarkdown };
