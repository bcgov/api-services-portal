import { useAuth } from '@/shared/services/auth';

type Breadcrumb = {
  href?: string;
  text: string;
};

const useNamespaceBreadcrumbs = (
  appendedBreadcrumbs: Breadcrumb[] = []
): Breadcrumb[] => {
  const { user } = useAuth();

  if (user) {
    return [
      { href: '/manager/namespaces', text: `Namespaces (${user.namespace})` },
      ...appendedBreadcrumbs,
    ];
  }

  return appendedBreadcrumbs;
};

export default useNamespaceBreadcrumbs;
