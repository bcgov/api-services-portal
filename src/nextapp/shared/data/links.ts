import * as React from 'react';
import AccessRequestsBadge from '@/components/access-requests-badge';

export interface NavLink {
  BadgeElement?: React.FC;
  name: string;
  url?: string;
  altUrls?: string[];
  sites: string[];
  access: string[];
}

const links: NavLink[] = [
  //   { name: 'Home', url: '/manager', access: [], sites: ['manager'] },
  //   { name: 'Home', url: '/devportal', access: [], sites: ['devportal'] },
  {
    name: 'API Directory',
    url: '/devportal/api-directory',
    access: [],
    altUrls: [
      '/devportal/api-directory/[id]',
      '/devportal/api-directory/your-products',
    ],
    sites: ['devportal'],
  },
  {
    name: 'My Access',
    url: '/devportal/access',
    access: ['portal-user'],
    altUrls: [
      '/devportal/access/[id]',
      '/devportal/resources/[id]',
      '/devportal/requests/new/[id]',
      '/devportal/requests/new/tokens',
    ],
    sites: ['devportal'],
  },
  {
    name: 'Applications',
    url: '/devportal/applications',
    access: ['portal-user'],
    sites: ['devportal'],
  },
  {
    name: 'Profile',
    url: '/profile',
    access: ['portal-user'],
    sites: ['platform'],
  },
  {
    name: 'Gateways',
    url: '/manager/gateways',
    access: ['portal-user'],
    sites: ['devportal'],
  },
  {
    name: 'Gateways Get Started',
    url: '/manager/gateways/get-started',
    access: ['portal-user'],
    sites: ['devportal'],
  },
  {
    name: 'Gateways',
    altUrls: [
      '/manager/services',
      '/manager/services/[id]',
      '/manager/products',
      '/manager/products/[id]',
      '/manager/consumers',
      '/manager/consumers/[id]',
      '/manager/requests/[id]',
      '/manager/authorization-profiles',
      '/manager/authorization-profiles/new',
      '/manager/authorization-profiles/[id]',
      '/manager/namespace-access',
      '/manager/service-accounts',
      '/manager/poc/activity',
    ],
    access: [
      'api-owner',
      'provider-user',
      'credential-admin',
      'access-manager',
    ],
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
    url: '/manager/authorization-profiles',
    access: ['credential-admin'],
    sites: ['manager'],
  },
  {
    name: 'Activity',
    url: '/manager/poc/activity',
    access: ['api-owner'],
    sites: ['manager'],
  },
  // {
  //   name: 'Documentation',
  //   url: '/docs',
  //   altUrls: ['/docs/[slug]'],
  //   access: [],
  //   sites: ['devportal'],
  // },
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
