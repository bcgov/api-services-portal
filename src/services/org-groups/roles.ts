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
  'system-admin': {
    label: 'System Administrator',
    permissions: [
      {
        resourceType: 'organization',
        scopes: ['System.Manage'],
      },
    ],
  },
  'system-owner': {
    label: 'System Owner',
    permissions: [],
  },
  'tech-lead': {
    label: 'System Technical Lead',
    permissions: [],
  },
  'access-manager': {
    label: 'Access Manager',
    permissions: [],
  },
} as {
  [key: string]: {
    label: string;
    permissions: { resourceType: string; scopes: string[] }[];
  };
};
