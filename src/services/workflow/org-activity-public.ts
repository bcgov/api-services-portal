export const PUBLIC_ORG_ACTIVITY: ReadonlyArray<{
  action: string;
  type: string;
}> = [
  { action: 'register', type: 'Organization' },
  { action: 'update', type: 'OrganizationProfile' },
  { action: 'grant', type: 'OrganizationAccess' },
  { action: 'revoke', type: 'OrganizationAccess' },
  { action: 'request', type: 'OrganizationCertificate' },
  { action: 'add', type: 'OrganizationKey' },
  { action: 'rotate', type: 'OrganizationKey' },
  { action: 'delete', type: 'OrganizationKey' },
];

export function getPublicOrgActivityWhereClause(): Array<{
  action: string;
  type: string;
}> {
  return PUBLIC_ORG_ACTIVITY.map(({ action, type }) => ({ action, type }));
}
