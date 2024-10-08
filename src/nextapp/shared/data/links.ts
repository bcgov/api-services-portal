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

export const gatewayPages = [
  '/manager/gateways/detail',
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
  '/manager/admin-access',
  '/manager/service-accounts',
  '/manager/activity',
  '/devportal/api-directory/your-products',
];

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
    access: ['idir-user'],
    altUrls: [
      '/manager/gateways/get-started',
      '/manager/gateways/list',
      ...gatewayPages.filter(page => !page.startsWith('/devportal')),
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
    name: 'Authorization Settings',
    url: '/manager/authorization-profiles',
    access: ['credential-admin'],
    sites: ['manager'],
  },
  {
    name: 'APS Admin',
    url: '/admin',
    access: ['aps-admin'],
    sites: ['manager'],
  },
];

export default links;
