import { useAuth } from '@/shared/services/auth';

type Breadcrumb = {
  href: string;
  text: string;
};

const useNamespaceBreadcrumbs = (
  appendedBreadcrumbs: Breadcrumb[] = []
): Breadcrumb[] => {
  const { user } = useAuth();

  if (user) {
    return [
      { href: '/manager/namespaces', text: 'Namespaces' },
      { href: '/manager/namespaces', text: user.namespace },
      ...appendedBreadcrumbs,
    ];
  }

  return appendedBreadcrumbs;
};

export default useNamespaceBreadcrumbs;
