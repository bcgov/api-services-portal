export interface NavLink {
  name: string;
  url: string;
  sites: string[];
  access: string[];
}

const links: NavLink[] = [
  { name: 'Home', url: '/home', access: [], sites: ['manager','devportal'] },
  {
    name: 'API Discovery',
    url: '/poc/api-discovery',
    access: ['developer', 'api-owner'], sites: ['devportal'] 
  },
  {
    name: 'Applications',
    url: '/poc/applications',
    access: ['developer', 'api-owner'], sites: ['devportal'] 
  },
  { name: 'Products', url: '/products', access: ['api-owner'], sites: ['manager'] }, 
  { name: 'Services', url: '/poc/services', access: ['api-owner'], sites: ['manager']  },
  { name: 'Consumers', url: '/poc/consumers', access: ['api-owner'], sites: ['manager']  },
  {
    name: 'Access Requests',
    url: '/poc/requests',
    access: ['api-owner', 'api-manager', 'credential-admin'], sites: ['manager'] 
  },
  {
    name: 'Service Accounts',
    url: '/poc/service-accounts',
    access: ['api-owner'], sites: ['manager'] 
  },
  {
    name: 'Credential Issuers',
    url: '/poc/credential-issuers',
    access: ['credential-admin'], sites: ['manager'] 
  },
  { name: 'Activity', url: '/poc/activity', access: ['api-owner'], sites: ['manager']  },
  { name: 'Documentation', url: '/docs', access: [], sites: ['devportal', 'manager']  },
  { name: 'APS Admin', url: '/admin', access: ['aps-admin'], sites: ['manager']  },
  { name: 'POC Products', url: '/poc/packagingv1', access: ['aps-admin'], sites: ['manager']  },
];

export default links;
