export const PredefinedRolePermissions = {
  'organization-admin': {
    label: 'Organization Administrator',
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
