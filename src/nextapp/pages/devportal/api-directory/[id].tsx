import * as React from 'react';
import ApiProductItem, { ApiDataset } from '@/components/api-product-item';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Icon,
  Link,
  Text,
} from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import Card from '@/components/card';
import { DocHeader, InternalLink } from '@/components/docs';
import get from 'lodash/get';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { restApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient, useQuery } from 'react-query';
import PreviewBanner from '@/components/preview-banner';
import { dehydrate } from 'react-query/hydration';
import { FaExternalLinkAlt } from 'react-icons/fa';
import ReactMarkdownWithHtml from 'react-markdown/with-html';
import gfm from 'remark-gfm';
import { uid } from 'react-uid';
import { useAuth } from '@/shared/services/auth';

const renderers = {
  link: InternalLink,
  heading: DocHeader,
};

type DetailItem = {
  title: string;
  key: string;
  isBool?: boolean;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const { preview } = context.query;
  const queryClient = new QueryClient();
  const queryKey = ['DiscoverableDataset', id];

  preview === 'false' &&
    (await queryClient.prefetchQuery(
      queryKey,
      async () => await restApi<ApiDataset>(`/ds/api/v2/directory/${id}`)
    ));

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient),
      queryKey,
      preview: preview === 'true' ? true : false,
    },
  };
};

const ApiPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, queryKey, preview }) => {
  const { user } = useAuth();
  const { data } = useQuery<ApiDataset>(queryKey, () =>
    restApi<ApiDataset>(
      preview
        ? `/ds/api/v2/namespaces/${user?.namespace}/directory/${id}`
        : `/ds/api/v2/directory/${id}`
    )
  );
  const breadcrumb = React.useMemo(() => {
    if (preview) {
      return [
        {
          text: 'Back to Your Products',
          href: '/devportal/api-directory/your-products',
        },
      ];
    }
    return [{ text: 'API Directory', href: '/devportal/api-directory' }];
  }, [preview]);
  const title = data?.title ?? 'Dataset';

  function DetailItem({ detail }: { detail: DetailItem }) {
    return (
      <Box mb={5}>
        <Heading fontWeight="normal" size="xs">
          {detail.title}
        </Heading>
        <Text fontSize="sm" color="gray.600">
          {!detail.isBool && get(data, detail.key, 'N/A')}
          {detail.isBool && (data[detail.key] ? 'Yes' : 'No')}
        </Text>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>API Services Portal | API Directory | {title}</title>
      </Head>
      <PreviewBanner />
      <Container maxW="6xl">
        <PageHeader
          breadcrumb={breadcrumb}
          title={
            data?.isInCatalog ? (
              <Link
                isExternal
                href={`https://catalogue.data.gov.bc.ca/dataset/${data.name}`}
                target="_blank"
                rel="noreferrer"
              >
                {title}
                <Icon
                  as={FaExternalLinkAlt}
                  boxSize="5"
                  mx={2}
                  color="gray.400"
                />
              </Link>
            ) : (
              title
            )
          }
        >
          <Box fontSize="sm" color="gray.600">
            <Text>
              Published by
              <br />
              {data?.organizationUnit && (
                <Link color="bc-link">{data.organizationUnit.title}</Link>
              )}
            </Text>
          </Box>
        </PageHeader>
        <Grid my={5} gap={4} templateColumns="repeat(12, 1fr)">
          <GridItem as="article" colSpan={9}>
            <Box as="header">
              <Heading size="sm">About This Dataset</Heading>
            </Box>
            <Box mt={5} mb={9} sx={{ p: { marginBottom: 4 } }}>
              <ReactMarkdownWithHtml renderers={renderers} plugins={[gfm]}>
                {data?.notes}
              </ReactMarkdownWithHtml>
            </Box>
            <Card heading="Products">
              <Box bg="gray.100">
                {data?.products?.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((p) => (
                  <ApiProductItem
                    key={uid(p)}
                    data={p}
                    id={p.id}
                    preview={preview}
                  />
                ))}
              </Box>
            </Card>
          </GridItem>
          <GridItem colSpan={1} />
          <GridItem as="aside" colSpan={2}>
            <Box as="header" mb={4}>
              <Heading size="xs">Details</Heading>
            </Box>
            {data &&
              detailItems.map((d) => <DetailItem key={uid(d)} detail={d} />)}
            {/* <Box as="header" my={4}>
              <Heading size="xs">Contact Info</Heading>
            </Box>
            {data && contactItems.map((d) => <DetailItem detail={d} />)} */}
          </GridItem>
        </Grid>
      </Container>
    </>
  );
};

export default ApiPage;

const detailItems: DetailItem[] = [
  {
    title: 'Licence',
    key: 'license_title',
  },
  {
    title: 'Published Date',
    key: 'record_publish_date',
  },
  {
    title: 'Security',
    key: 'security_class',
  },
  {
    title: 'In BC Data Catalogue',
    key: 'isInCatalog',
    isBool: true,
  },
  // {
  //   title: 'More Info',
  //   key: 'extSource',
  // },
];
// TODO: Not sure what the source of this data is for these contact items, should adjust
// const contactItems: DetailItem[] = [
//   {
//     title: 'Name',
//     key: 'name',
//   },
//   {
//     title: 'Email',
//     key: 'email',
//   },
//   {
//     title: 'Organization',
//     key: 'organization.name',
//   },
//   {
//     title: 'Role',
//     key: 'role',
//   },
// ];
