import * as React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/shared/services/auth';

const NoGatewayRedirect = () => {
  const router = useRouter();
  const { user } = useAuth();
  const hasNamespace = !!user?.namespace;

  React.useEffect(() => {
    if (!hasNamespace) {
      router.push('/manager/gateways/list');
    }
  }, [hasNamespace]);
  return null
};

export default NoGatewayRedirect;
