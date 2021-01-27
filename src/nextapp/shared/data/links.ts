interface NavLink {
  name: string;
  url: string;
  access: string[];
}

const links: NavLink[] = [
  { name: 'Home', url: '/', access: [] },
  { name: 'Services', url: '/poc/services', access: ['api-owner'] },
  { name: 'Consumers', url: '/poc/consumers', access: ['api-owner'] },
  {
    name: 'Access Requests',
    url: '/poc/requests',
    access: ['api-owner', 'api-manager', 'credential-admin'],
  },
  { name: 'Packaging', url: '/poc/packaging', access: ['api-owner'] },
  {
    name: 'Credential Issuers',
    url: '/poc/credential-issuers',
    access: ['credential-admin'],
  },
  {
    name: 'Service Accounts',
    url: '/poc/service-accounts',
    access: ['api-owner'],
  },
  { name: 'API Discovery', url: '/poc/api-discovery', access: ['developer'] },
  { name: 'Applications', url: '/poc/applications', access: ['developer'] },
  { name: 'My Credentials', url: '/poc/my-credentials', access: ['developer'] },
  { name: 'Documentation', url: '/docs', access: [] },
  { name: 'APS Admin', url: '/admin', access: ['aps-admin'] },
  {
    name: 'My Profile',
    url: '/poc/my-profile',
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
