import * as React from 'react';
import ActionsMenu from '@/components/actions-menu';
import { Box, MenuItem, ModalBody, Td, Tr } from '@chakra-ui/react';
import Table from '@/components/table';
import EmptyPane from '../empty-pane';
import EnvironmentForm from './environment-form';

import { EnvironmentItem } from './types';

interface ClientManagementProps {
  data?: string;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ data = '' }) => {
  const [environments, setEnvironments] = React.useState<EnvironmentItem[]>(
    () => {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
  );
  const columns = React.useMemo(
    () => [
      { name: 'Environment', key: 'environment' },
      { name: 'idP Issuer URL', key: 'issuerUrl' },
      { name: 'Registration', key: 'registration' },
      { name: 'Client ID', key: 'clientId' },
      { name: '', key: 'id' },
    ],
    []
  );

  // Events
  const handleNewEnvironment = React.useCallback((payload: FormData) => {
    const environment: unknown = Object.fromEntries(payload);
    setEnvironments((state) => [...state, environment as EnvironmentItem]);
  }, []);
  const handleDelete = React.useCallback(
    (index: number) => () => {
      setEnvironments((state) => state.filter((_, i) => i !== index));
    },
    []
  );

  return (
    <ModalBody>
      <Box as="header" mb={4}>
        <EnvironmentForm onSubmit={handleNewEnvironment} />
      </Box>
      <Table
        columns={columns}
        data={environments}
        emptyView={
          <EmptyPane
            title="No environments added yet"
            message="Once you add environments, they will be listed here"
          />
        }
      >
        {(d: EnvironmentItem, index) => (
          <Tr key={index}>
            <Td textTransform="capitalize">{d.environment}</Td>
            <Td>{d.issuerUrl}</Td>
            <Td textTransform="capitalize">{d.clientRegistration}</Td>
            <Td>{d.clientId}</Td>
            <Td>
              <ActionsMenu>
                <MenuItem onClick={handleDelete(index)}>Delete</MenuItem>
              </ActionsMenu>
            </Td>
          </Tr>
        )}
      </Table>
    </ModalBody>
  );
};

export default ClientManagement;
