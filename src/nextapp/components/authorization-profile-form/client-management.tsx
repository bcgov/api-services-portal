import * as React from 'react';
import ActionsMenu from '@/components/actions-menu';
import {
  Box,
  Button,
  ButtonGroup,
  MenuItem,
  ModalBody,
  ModalFooter,
  Td,
  Tr,
} from '@chakra-ui/react';
import Table from '@/components/table';
import { uid } from 'react-uid';

import EmptyPane from '../empty-pane';
import EnvironmentForm from './environment-form';
import { EnvironmentItem } from './types';

interface ClientManagementProps {
  data?: string;
  id?: string;
  onCancel: () => void;
  onComplete: (environments: EnvironmentItem[]) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({
  data = '',
  id,
  onCancel,
  onComplete,
}) => {
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
  const submitButtonText = id ? 'Save' : 'Create';

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
  const handleCreate = React.useCallback(() => {
    onComplete(environments);
  }, [environments, onComplete]);

  return (
    <>
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
          sx={{
            'th:first-child': {
              pl: 3,
            },
          }}
        >
          {(d: EnvironmentItem, index) => (
            <Tr key={uid(d, index)}>
              <Td textTransform="capitalize" pl={3} width="10%">
                {d.environment}
              </Td>
              <Td width="40%" wordBreak="break-all">
                {d.issuerUrl}
              </Td>
              <Td textTransform="capitalize" width="10%">
                {d.clientRegistration}
              </Td>
              <Td width="20%">{d.clientId}</Td>
              <Td>
                <ActionsMenu placement="bottom-start">
                  <MenuItem onClick={handleDelete(index)}>Delete</MenuItem>
                </ActionsMenu>
              </Td>
            </Tr>
          )}
        </Table>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreate} data-testid="ap-create-btn">
            {submitButtonText}
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default ClientManagement;
