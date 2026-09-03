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
  { action: 'published', type: 'SubsystemKey' },
  { action: 'removed', type: 'SubsystemKey' },
  { action: 'published', type: 'RuntimeGroupKey' },
  { action: 'added', type: 'RuntimeGroupKey' },
  { action: 'rotated', type: 'RuntimeGroupKey' },
  { action: 'replaced', type: 'RuntimeGroupKey' },
  { action: 'removed', type: 'RuntimeGroupKey' },
  { action: 'created', type: 'Subsystem' },
  { action: 'updated', type: 'Subsystem' },
  { action: 'deleted', type: 'Subsystem' },
  { action: 'published', type: 'Service' },
  { action: 'removed', type: 'Service' },
];
