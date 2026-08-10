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
  'subsystem-owner': {
    label: 'Subsystem Owner',
    permissions: [
      {
        resourceType: 'namespace',
        scopes: ['Namespace.Manage', 'Namespace.View', 'Subsystem.Manage', 'GatewayPattern.Publish'],
      },
    ],
  },
  'tech-lead': {
    label: 'System Technical Lead',
    permissions: [
      {
        resourceType: 'namespace',
        scopes: ['Namespace.View', 'Subsystem.Manage', 'GatewayPattern.Publish'],
      },
    ],
  },
  'access-manager': {
    label: 'Access Manager',
    permissions: [
      {
        resourceType: 'namespace',
        scopes: ['Namespace.View', 'Connection.Manage'],
      },
    ],
  },
} as {
  [key: string]: {
    label: string;
    permissions: { resourceType: string; scopes: string[] }[];
  };
};
