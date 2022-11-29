import * as React from 'react';
import ActionsMenu from '@/components/actions-menu';
import {
  Alert,
  AlertIcon,
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
import { CredentialIssuer, SharedIssuer } from '@/shared/types/query.types';
import SharedIdP from './shared-idp';

interface ClientManagementProps {
  data?: string;
  hidden: boolean;
  inheritFrom?: CredentialIssuer;
  profileName: string;
  id?: string;
  onCancel: () => void;
  onComplete: (newInheritFrom: string, environments: EnvironmentItem[]) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({
  data = '',
  hidden,
  inheritFrom,
  profileName,
  id,
  onCancel,
  onComplete,
}) => {
  const [idp, setIdp] = React.useState<string>(
    inheritFrom ? 'shared' : 'custom'
  );

  const [newInheritFrom, setNewInheritFrom] = React.useState<string>(undefined);

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
      { name: 'IdP Issuer URL', key: 'issuerUrl' },
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
    onComplete(newInheritFrom, environments);
  }, [environments, onComplete]);

  return (
    <>
      <ModalBody hidden={hidden}>
        {!id && (
          <SharedIdP
            idp={idp}
            profileName={profileName}
            onChange={(idp: string, sharedIssuer: SharedIssuer) => {
              setIdp(idp);

              if (sharedIssuer) {
                setNewInheritFrom(sharedIssuer.id);
                setEnvironments(JSON.parse(sharedIssuer.environmentDetails));
              }
            }}
          />
        )}
        {inheritFrom?.name && (
          <Box>
            <Box pl={0} pr={0}>
              <Alert status="info" variant="subtle">
                <AlertIcon />
                Using Shared Identity Provider "{inheritFrom.name}"
              </Alert>
            </Box>
          </Box>
        )}
        {idp === 'custom' && (
          <Box as="header" mb={4}>
            <EnvironmentForm onSubmit={handleNewEnvironment} />
          </Box>
        )}
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
                {idp === 'custom' && (
                  <ActionsMenu placement="bottom-end">
                    <MenuItem onClick={handleDelete(index)} color="bc-error">
                      Delete
                    </MenuItem>
                  </ActionsMenu>
                )}
              </Td>
            </Tr>
          )}
        </Table>
      </ModalBody>
      <ModalFooter hidden={hidden}>
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
