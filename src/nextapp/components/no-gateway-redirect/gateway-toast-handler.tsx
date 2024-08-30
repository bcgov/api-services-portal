import * as React from 'react';
import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const GatewayToastHandler = () => {
  const toast = useToast();
  const router = useRouter();

  React.useEffect(() => {
    const handleRouteChange = () => {
      const showToast = localStorage.getItem('showNoGatewayToast');
      if (showToast === 'true') {
        toast.closeAll();
        toast({
          title: `First select a Gateway to view that page`,
          status: 'error',
          isClosable: true,
          duration: 5000,
        });
        localStorage.removeItem('showNoGatewayToast');
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [toast, router]);

  return null;
};

export default GatewayToastHandler;