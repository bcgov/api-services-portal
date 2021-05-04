import * as React from 'react';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

interface PageHeaderProps {
  actions?: React.ReactNode;
  breadcrumb?: { href?: string; text: string }[];
  children?: React.ReactNode;
  title: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  actions,
  breadcrumb,
  children,
  title,
}) => {
  const router = useRouter();

  return (
    <Box bg="bc-gray" py={4}>
      <Box as="header" display="flex" flexDirection="column" mb={4}>
        {breadcrumb && (
          <Box as="hgroup" mb={2}>
            <Breadcrumb fontSize="sm" color="gray.500">
              <BreadcrumbItem>
                <NextLink passHref href="/manager">
                  <BreadcrumbLink>API</BreadcrumbLink>
                </NextLink>
              </BreadcrumbItem>
              {breadcrumb.length > 0 &&
                breadcrumb.map((b) => (
                  <BreadcrumbItem key={b.text}>
                    <NextLink passHref href={b.href || router?.asPath || '#'}>
                      <BreadcrumbLink>{b.text}</BreadcrumbLink>
                    </NextLink>
                  </BreadcrumbItem>
                ))}
            </Breadcrumb>
          </Box>
        )}
        <Box
          as="hgroup"
          display="flex"
          flexDirection={{ base: 'column', sm: 'row' }}
          alignItems={{ base: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Heading as="h1" size="lg">
            {title}
          </Heading>
          {actions}
        </Box>
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default PageHeader;
