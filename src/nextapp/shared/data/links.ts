import * as React from 'react';
import AccessRequestsBadge from '@/components/access-requests-badge';

export interface NavLink {
  BadgeElement?: React.FC;
  name: string;
  url: string;
  altUrls?: string[];
  sites: string[];
  access: string[];
}

const links: NavLink[] = [
  //   { name: 'Home', url: '/manager', access: [], sites: ['manager'] },
  //   { name: 'Home', url: '/devportal', access: [], sites: ['devportal'] },
  {
    name: 'Directory',
    url: '/devportal/api-discovery',
    access: [],
    sites: ['devportal'],
  },
  {
    name: 'API Access',
    url: '/devportal/access',
    access: ['developer', 'api-owner'],
    altUrls: [
      '/devportal/access/[id]',
      '/devportal/resources/[id]',
      '/devportal/requests/new/[id]',
    ],
    sites: ['devportal'],
  },
  {
    name: 'Applications',
    url: '/devportal/applications',
    access: ['developer', 'api-owner'],
    sites: ['devportal'],
  },
  {
    name: 'Namespaces',
    url: '/manager/namespaces',
    altUrls: [
      '/manager/services',
      '/manager/services/[id]',
      '/manager/products',
      '/manager/products/[id]',
      '/manager/consumers',
      '/manager/consumers/[id]',
      '/manager/requests/[id]',
      '/manager/poc/credential-issuers',
      '/manager/poc/credential-issuers/[id]',
      '/manager/poc/service-accounts',
      '/manager/poc/activity',
    ],
    access: ['api-owner'],
    sites: ['devportal'],
  },
  {
    name: 'Products',
    url: '/manager/products',
    access: ['api-owner'],
    sites: ['manager'],
  },
  {
    name: 'Services',
    url: '/manager/services',
    access: ['api-owner'],
    sites: ['manager'],
  },
  {
    name: 'Consumers',
    url: '/manager/consumers',
    access: ['api-owner'],
    sites: ['manager'],
    BadgeElement: AccessRequestsBadge,
  },
  {
    name: 'Access Requests',
    url: '/manager/poc/requests',
    access: ['api-owner', 'api-manager', 'credential-admin'],
    sites: ['manager'],
  },
  //   {
  //     name: 'Service Accounts',
  //     url: '/manager/poc/service-accounts',
  //     access: ['api-owner'], sites: ['manager']
  //   },
  {
    name: 'Authorization Settings',
    url: '/manager/poc/credential-issuers',
    access: ['credential-admin'],
    sites: ['manager'],
  },
  {
    name: 'Activity',
    url: '/manager/poc/activity',
    access: ['api-owner'],
    sites: ['manager'],
  },
  {
    name: 'Documentation',
    url: '/devportal/docs',
    altUrls: [
        '/devportal/docs/[slug]'
    ],
    access: [],
    sites: ['devportal'],
  },
  {
    name: 'APS Admin',
    url: '/admin',
    access: ['aps-admin'],
    sites: ['manager'],
  },
  {
    name: 'Applications',
    url: '/platform/poc/applications',
    access: ['aps-admin'],
    sites: ['platform', 'devportal'],
  },
];

export default links;
