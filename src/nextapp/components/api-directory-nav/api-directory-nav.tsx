import * as React from 'react';
import NextLink from 'next/link';
import { Tab, Tabs, TabList } from '@chakra-ui/react';
import { useAuth } from '@/shared/services/auth';
import { useRouter } from 'next/router';

const ApiDirectoryNav: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const index = React.useMemo(() => {
    if (router?.pathname.includes('/your-products')) {
      return 1;
    }
    return 0;
  }, [router?.pathname]);

  if (!user) {
    return null;
  }

  return (
    <Tabs mt={10} index={index}>
      <TabList borderBottom="none">
        <NextLink passHref href="/devportal/api-directory">
          <Tab as="a">API Directory</Tab>
        </NextLink>
        <NextLink passHref href="/devportal/api-directory/your-products">
          <Tab as="a">Your Products</Tab>
        </NextLink>
      </TabList>
    </Tabs>
  );
};

export default ApiDirectoryNav;
