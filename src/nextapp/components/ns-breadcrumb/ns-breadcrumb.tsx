import * as React from 'react';

import { useAuth } from '@/shared/services/auth';

const Breadcrumb = (crumbs = []) => {
    const { user } = useAuth();
    
    return user ? [
        { href: '/devportal/poc/namespaces', text: 'Namespaces' },
        { href: '/devportal/poc/namespaces', text: user.namespace },
    ].concat(crumbs) : []
}

export default Breadcrumb;
