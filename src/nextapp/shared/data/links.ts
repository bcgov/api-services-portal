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
    url: '/devportal/poc/api-discovery',
    access: ['developer', 'api-owner'], sites: ['devportal'] 
  },
  {
    name: 'Applications',
    url: '/devportal/poc/applications',
    access: ['developer', 'api-owner'], sites: ['devportal'] 
  },
  { name: 'Products', url: '/manager/products', access: ['api-owner'], sites: ['manager'] }, 
  { name: 'Services', url: '/manager/services', access: ['api-owner'], sites: ['manager']  },
  { name: 'Consumers', url: '/manager/poc/consumers', access: ['api-owner'], sites: ['manager']  },
  {
    name: 'Access Requests',
    url: '/manager/poc/requests',
    access: ['api-owner', 'api-manager', 'credential-admin'], sites: ['manager'] 
  },
  {
    name: 'Service Accounts',
    url: '/manager/poc/service-accounts',
    access: ['api-owner'], sites: ['manager'] 
  },
  {
    name: 'Credential Issuers',
    url: '/manager/poc/credential-issuers',
    access: ['credential-admin'], sites: ['manager'] 
  },
  { name: 'Activity', url: '/manager/poc/activity', access: ['api-owner'], sites: ['manager']  },
  { name: 'Documentation', url: '/devportal/docs', access: [], sites: ['devportal']  },
  { name: 'APS Admin', url: '/admin', access: ['aps-admin'], sites: ['manager']  }
];

export default links;
