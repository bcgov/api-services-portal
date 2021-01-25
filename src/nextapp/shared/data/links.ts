interface NavLink {
  name: string;
  url: string;
  access: string[];
}

const links: NavLink[] = [
  { name: 'Home', url: '/', access: [] },
  { name: 'Services', url: '/services', access: ['api-owner'] },
  { name: 'Consumers', url: '/consumers', access: ['api-owner'] },
  {
    name: 'Access Requests',
    url: '/requests',
    access: ['api-manager', 'credential-admin'],
  },
  { name: 'Datasets', url: '/datasets', access: ['api-owner'] },
  {
    name: 'Credential Issuers',
    url: '/credential-issuers',
    access: ['credential-admin'],
  },
  {
    name: 'Service Accounts',
    url: '/service-accounts',
    access: ['api-owner'],
  },
  { name: 'API Discovery', url: '/a/api-discovery', access: ['developer'] },
  { name: 'My Credentials', url: '/a/my-credentials', access: ['developer'] },
  { name: 'Documentation', url: '/docs', access: [] },
  { name: 'APS Admin', url: '/admin', access: ['aps-admin'] },
  {
    name: 'My Profile',
    url: '/my-profile',
    access: [
      'developer',
      'api-owner',
      'api-manager',
      'credential-admin',
      'aps-admin',
    ],
  },
];

export default links;
