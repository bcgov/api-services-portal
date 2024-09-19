import * as React from 'react';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { uid } from 'react-uid';
import { BsChevronRight } from 'react-icons/bs';

interface PageHeaderProps {
  actions?: React.ReactNode;
  breadcrumb?: { href?: string; text: string }[];
  children?: React.ReactNode;
  title: React.ReactNode;
  apiDirectoryNav?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  actions,
  breadcrumb,
  children,
  title,
  apiDirectoryNav
}) => {
  return (
    <Box pt={!breadcrumb && !apiDirectoryNav ? 10 : 4} pb={4}>
      <Box as="header" display="flex" flexDirection="column" mb={4}>
        {breadcrumb && (
          <Box as="hgroup" mb={2}>
            <Breadcrumb
              fontSize="sm"
              color="bc-link"
              separator={<BsChevronRight color="bc-component" />}
            >
              {breadcrumb.length > 0 &&
                breadcrumb.map((b, index, arr) => (
                  <BreadcrumbItem key={uid(b)}>
                    {index < arr.length - 1 && (
                      <NextLink passHref href={b.href}>
                        <BreadcrumbLink textDecor="underline">
                          {b.text}
                        </BreadcrumbLink>
                      </NextLink>
                    )}
                    {index >= arr.length - 1 && b.href && (
                      <NextLink passHref href={b.href}>
                        <BreadcrumbLink color="text" textDecor="none">
                          {b.text}
                        </BreadcrumbLink>
                      </NextLink>
                    )}
                    {index >= arr.length - 1 && !b.href && (
                      <BreadcrumbLink color="text" textDecor="none">
                        {b.text}
                      </BreadcrumbLink>
                    )}
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
          <Heading as="h1" size="lg" mr={8}>
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
