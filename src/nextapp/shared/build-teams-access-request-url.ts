const DEFAULT_SUMMARY =
  'Microsoft Teams channel access (API Program Services)';

const DEFAULT_DESCRIPTION = [
  'Please grant access to the API Program Services Microsoft Teams channels.',
  '',
  'Include:',
  '• Organization or ministry name',
  '• Email address(es) to add to Teams',
  '• Channels: API-ProgramServices-operations (support), API-ProgramServices-alerts (incidents and notices), or both',
  '',
  'Additional context (optional):',
].join('\n');

/** Appends JSM portal query params so the request form opens with a preset summary and description. */
export function buildTeamsAccessRequestUrl(
  baseUrl: string | undefined | null
): string | undefined {
  if (!baseUrl) return undefined;
  try {
    const u = new URL(baseUrl);
    u.searchParams.set('summary', DEFAULT_SUMMARY);
    u.searchParams.set('description', DEFAULT_DESCRIPTION);
    return u.toString();
  } catch {
    return baseUrl;
  }
}
