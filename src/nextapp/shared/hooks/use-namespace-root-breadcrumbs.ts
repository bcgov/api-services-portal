import { useAuth } from '@/shared/services/auth';

type Breadcrumb = {
  href?: string;
  text: string;
};

const useNamespaceRootBreadcrumbs = (): Breadcrumb[] => {
  const { user } = useAuth();

  if (user && user.namespace) {
    return [
      { href: '/manager/gateways', text: 'My Gateways' },
      { text: `Gateway (${user.namespace})` },
    ];
  }

  return [
    { href: '/manager/gateways', text: 'My Gateways' },
    { text: 'Gateway' },
  ];
};

export default useNamespaceRootBreadcrumbs;
