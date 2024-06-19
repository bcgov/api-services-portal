import useCurrentNamespace from '@/shared/hooks/use-current-namespace';

type Breadcrumb = {
  href?: string;
  text: string;
};

const useNamespaceRootBreadcrumbs = (): Breadcrumb[] => {
  const namespace = useCurrentNamespace();

  if (namespace.isSuccess && !namespace.isFetching) {
    if (namespace.data?.currentNamespace?.displayName) {
      return [
        { href: '/manager/gateways', text: 'My Gateways' },
        { text: `${namespace.data?.currentNamespace?.displayName}` },
      ];
    } else {
      return [
        { href: '/manager/gateways', text: 'My Gateways' },
        { text: `${namespace.data?.currentNamespace?.name}` },
      ];
    }
  }

  return [{ href: '/manager/gateways', text: 'My Gateways' }];
};

export default useNamespaceRootBreadcrumbs;
