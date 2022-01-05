import * as React from 'react';
import { Box, ModalBody, Td, Tr } from '@chakra-ui/react';
import Table from '@/components/table';
import EmptyPane from '../empty-pane';
import EnvironmentForm from './environment-form';

import { EnvironmentItem } from './types';

const ClientManagement: React.FC = () => {
  const columns = React.useMemo(
    () => [
      { name: 'Environment', key: 'environment' },
      { name: 'idP Issuer URL', key: 'idpIssuerUrl' },
      { name: 'Registration', key: 'registration' },
      { name: 'Client ID', key: 'clientId' },
      { name: '', key: 'id' },
    ],
    []
  );
  const handleNewEnvironment = React.useCallback(() => {
    console.log('hi');
  }, []);

  return (
    <ModalBody>
      <Box as="header">
        <EnvironmentForm onSubmit={handleNewEnvironment} />
      </Box>
      <Table
        columns={columns}
        data={[]}
        emptyView={
          <EmptyPane
            title="No environments added yet"
            message="Once you add environments, they will be listed here"
          />
        }
      >
        {(d: EnvironmentItem, index) => (
          <Tr key={index}>
            <Td>{d.environment}</Td>
            <Td>{d.issuerUrl}</Td>
            <Td>{d.clientRegistration}</Td>
            <Td>{d.clientId}</Td>
            <Td>Menu</Td>
          </Tr>
        )}
      </Table>
    </ModalBody>
  );
};

export default ClientManagement;
