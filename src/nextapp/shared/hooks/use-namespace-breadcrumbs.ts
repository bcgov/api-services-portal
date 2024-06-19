import useCurrentNamespace from '@/shared/hooks/use-current-namespace';

type Breadcrumb = {
  href?: string;
  text: string;
};

const useNamespaceBreadcrumbs = (
  appendedBreadcrumbs: Breadcrumb[] = []
): Breadcrumb[] => {
  const namespace = useCurrentNamespace();

  if (namespace.isSuccess && !namespace.isFetching) {
    if (namespace.data?.currentNamespace?.displayName) {
      return [
        { href: '/manager/gateways', text: 'My Gateways' },
        {
          href: '/manager/namespaces',
          text: `${namespace.data?.currentNamespace?.displayName}`,
        },
        ...appendedBreadcrumbs,
      ];
    } else {
      return [
        { href: '/manager/gateways', text: 'My Gateways' },
        {
          href: '/manager/namespaces',
          text: `${namespace.data?.currentNamespace?.name}`,
        },
        ...appendedBreadcrumbs,
      ];
    }
  }

  return appendedBreadcrumbs;
};

export default useNamespaceBreadcrumbs;
