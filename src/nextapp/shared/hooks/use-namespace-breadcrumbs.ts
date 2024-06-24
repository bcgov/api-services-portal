import useCurrentNamespace from '@/shared/hooks/use-current-namespace';

type Breadcrumb = {
  href?: string;
  text: string;
};

const useNamespaceBreadcrumbs = (
  appendedBreadcrumbs: Breadcrumb[] = []
): Breadcrumb[] => {
  const namespace = useCurrentNamespace();

  if (appendedBreadcrumbs) {
    if (namespace.isSuccess && !namespace.isFetching) {
      return [
        { href: '/manager/gateways', text: 'My Gateways' },
        {
          href: '/manager/namespaces',
          text: `${namespace.data?.currentNamespace?.displayName}`,
        },
        ...appendedBreadcrumbs,
      ];
    } else {
      return appendedBreadcrumbs;
    }
  } else {
    if (namespace.isSuccess && !namespace.isFetching) {
      return [
        { href: '/manager/gateways', text: 'My Gateways' },
        { text: `${namespace.data?.currentNamespace?.displayName}` },
      ];
    } else {
      return [{ href: '/manager/gateways', text: 'My Gateways' }];
    }
  }
};

export default useNamespaceBreadcrumbs;
