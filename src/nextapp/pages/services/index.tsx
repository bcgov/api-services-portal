import * as React from 'react';
import { Box, Container, Divider, Heading } from '@chakra-ui/react';

import PageHeader from '../../components/page-header';
import { GET_LIST } from './queries';
import graphql from '../../shared/services/graphql';
import List from './list';

const ServicesPage = () => {
  let [{ state, data }, setState] = React.useState({
    state: 'loading',
    data: null,
  });
  let fetch = () => {
    graphql(GET_LIST)
      .then(({ data }) => {
        setState({ state: 'loaded', data });
      })
      .catch((err) => {
        setState({ state: 'error', data: null });
      });
  };

  React.useEffect(fetch, []);

  return (
    <Container maxW="6xl">
      <PageHeader title="Services">
        <p>
          List of services from the API Owner perspective. This should pull in
          details from Prometheus and gwa-api Status.
        </p>
      </PageHeader>
      <Divider my={4} />
      <Box d="flex">
        <Heading as="h3" size="base">
          Gateway Services
        </Heading>
        <List data={data} state={state} refetch={fetch} />
      </Box>
    </Container>
  );
};

export default ServicesPage;
