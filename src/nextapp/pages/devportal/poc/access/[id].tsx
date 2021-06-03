import * as React from 'react';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertIcon,
  Button,
  Box,
  Container,
  Divider,
  Heading,
  Icon,
  Stack,
  VStack,
  Skeleton,
  CloseButton,
} from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

import { useDisclosure } from '@chakra-ui/react';

import { GET_LIST, GET_REQUEST, GEN_CREDENTIAL } from './queries';

import { FaPlusCircle, FaFolder, FaFolderOpen } from 'react-icons/fa';

import { useAppContext } from '@/pages/context';

const { useEffect, useState } = React;

import { styles } from '@/shared/styles/devportal.css';

import ReactMarkdownWithHtml from 'react-markdown/with-html';
import gfm from 'remark-gfm';

import graphql from '@/shared/services/graphql';

import tmpstyles from '../../../docs/docs.module.css';

import List from './list';

import EnvironmentBadge from '@/components/environment-badge';

import ViewSecret from '@/components/view-secret';

const customStyles = {
  content: {
    top: '30%',
    left: '20%',
    right: '20%',
    bottom: 'auto',
    transformx: 'translate(-50%, -50%)',
  },
  overlay: {},
};

const MyApplicationsPage = () => {
  const context = useAppContext();

  const [request, setRequest] = useState(null);

  const [{ state, data }, setState] = useState({
    state: 'loading',
    data: null,
  });

  const fetch = () => {
    const {
      router: {
        pathname,
        query: { id },
      },
    } = context;

    if (context['router'] != null && id) {
      generateCredential(id)
        .then(() => {
          graphql(GET_LIST, {}).then(({ data }) => {
            setState({ state: 'loaded', data });
            setRequest(data.allAccessRequests.filter((r) => r.id == id)[0]);
          });
        })
        .catch((err) => {
          setState({ state: 'error', data: null });
        });
    }
    // if (context['router'] != null && id) {

    //     graphql(GET_REQUEST, { id: id }).then(data => {
    //         setRequestDetails(data)
    //     });
    // }
  };

  const [{ cred, reqId }, setCred] = useState({ cred: null, reqId: null });

  const onSecretClose = () => {
    window.location.href = `/devportal/access`;
  };

  const generateCredential = (reqId) => {
    return graphql(GEN_CREDENTIAL, { id: reqId }).then((data) => {
      if (data.data.updateAccessRequest.credential != 'NEW') {
        setCred({
          cred: JSON.parse(data.data.updateAccessRequest.credential),
          reqId: reqId,
        });
      }
    });
  };

  useEffect(fetch, [context]);

  const cancelRequest = (id) => {};

  const { isOpen, onOpen, onClose } = useDisclosure();

  const actions = [];
  return (
    <>
      <Head>
        <title>API Program Services | API Access</title>
      </Head>
      <Container maxW="6xl">
        <Stack spacing={10} className="m-5">
          <Alert status="info">
            <AlertIcon />
            List of the BC Government Service APIs that you have access to.
          </Alert>
        </Stack>

        <PageHeader title="API Access" actions={actions}></PageHeader>

        <Box mt={5}>
          {request != null && cred != null && (
            <Box bgColor="white" mb={4}>
              <Box display="flex" alignItems="center" p={2}>
                <Icon
                  as={FaFolderOpen}
                  color={'bc-blue-alt'}
                  mr={4}
                  boxSize="1.5rem"
                />
                <Heading as="h4" size="md">
                  {request.productEnvironment?.product.name}
                </Heading>
              </Box>
              <Divider />

              <Box p={4}>
                <article className={tmpstyles.markdownBody}>
                  <ViewSecret credentials={cred} />
                </article>
              </Box>
            </Box>
          )}

          {/* <List data={data} state={state} refetch={fetch} cancelRequest={cancelRequest}/> */}
        </Box>
      </Container>
    </>
  );
};

export default MyApplicationsPage;
