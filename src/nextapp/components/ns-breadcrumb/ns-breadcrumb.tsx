import * as React from 'react';

import { useAuth } from '@/shared/services/auth';

const Breadcrumb = (crumbs = []) => {
  const { user } = useAuth();

  return user
    ? [
        { href: '/manager/namespaces', text: `Namespaces (${user.namespace})` },
      ].concat(crumbs)
    : [];
};

export default Breadcrumb;
