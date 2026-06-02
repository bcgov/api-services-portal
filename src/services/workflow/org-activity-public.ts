export const PUBLIC_ORG_ACTIVITY: ReadonlyArray<{
  action: string;
  type: string;
}> = [
  { action: 'register', type: 'Organization' },
  { action: 'update', type: 'OrganizationProfile' },
  { action: 'updated', type: 'OrganizationAccess' },
  { action: 'request', type: 'OrganizationCertificate' },
  { action: 'added', type: 'OrganizationKey' },
  { action: 'rotated', type: 'OrganizationKey' },
  { action: 'deleted', type: 'OrganizationKey' },
  { action: 'created', type: 'Subsystem' },
  { action: 'updated', type: 'Subsystem' },
  { action: 'deleted', type: 'Subsystem' },
  { action: 'published', type: 'Service' },
  { action: 'removed', type: 'Service' },
];

export function getPublicOrgActivityWhereClause(): Array<{
  action: string;
  type: string;
}> {
  return PUBLIC_ORG_ACTIVITY.map(({ action, type }) => ({ action, type }));
}
