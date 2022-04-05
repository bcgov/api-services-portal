export const PredefinedRolePermissions = {
  'data-custodian': {
    label: 'Data Custodian',
    permissions: [
      {
        resourceType: 'organization',
        scopes: ['GroupAccess.Manage', 'Namespace.Assign', 'Dataset.Manage'],
      },
      {
        resourceType: 'namespace',
        scopes: ['Namespace.View'],
      },
    ],
  },
} as {
  [key: string]: {
    label: string;
    permissions: { resourceType: string; scopes: string[] }[];
  };
};
