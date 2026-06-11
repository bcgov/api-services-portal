export const PUBLIC_ORG_ACTIVITY: ReadonlyArray<{
  action: string;
  type: string;
}> = [
  { action: 'registered', type: 'Organization' },
  { action: 'registered', type: 'OrganizationUnit' },
  { action: 'updated', type: 'OrganizationProfile' },
  { action: 'updated', type: 'OrganizationAccess' },
  { action: 'requested', type: 'OrganizationCertificate' },
  { action: 'published', type: 'OrganizationKey' },
  { action: 'removed', type: 'OrganizationKey' },
];
