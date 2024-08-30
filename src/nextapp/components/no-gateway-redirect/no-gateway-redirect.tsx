import * as React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/shared/services/auth';

const NoGatewayRedirect = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const checkNamespaceAndRedirect = async () => {
      // Wait for a short period to ensure user data is loaded
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsChecking(false);

      if (!user?.namespace) {        
        try {
          // Set localStorage item to show toast
          await new Promise<void>((resolve, reject) => {
            try {
              localStorage.setItem('showNoGatewayToast', 'true');
              resolve();
            } catch (error) {
              reject(error);
            }
          });
          await router.push('/manager/gateways/list');
        } catch (error) {
          console.error('Error during redirect process:', error);
        }
      }
    };

    checkNamespaceAndRedirect();
  }, [user, router]);

  if (isChecking) {
    return null; // could return a loading indicator
  }

  return null;
};

export default NoGatewayRedirect;