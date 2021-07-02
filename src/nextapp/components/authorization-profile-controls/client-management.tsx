import * as React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { uid } from 'react-uid';
import { CredentialIssuer } from '@/shared/types/query.types';

import ClientDelete from './client-delete';
import Section from '../section';
import NewClient from './new-client';

interface EnvironmentItem {
  environment: string;
  issuerUrl: string;
  clientRegistration: string;
  clientId: string;
}

interface ClientManagmentProps {
  issuer: CredentialIssuer;
}

const ClientManagment: React.FC<ClientManagmentProps> = ({ issuer }) => {
  const environments: EnvironmentItem[] = React.useMemo(() => {
    try {
      return JSON.parse(issuer.environmentDetails);
    } catch {
      return [];
    }
  }, [issuer]);

  const handleCreate = React.useCallback((payload) => {
    console.log('create', payload);
  }, []);

  return (
    <Section
      actions={<NewClient mode={issuer?.mode} onCreate={handleCreate} />}
      title="Client Management"
    >
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Environment</Th>
            <Th>Issuer</Th>
            <Th>Registration</Th>
            <Th>Client ID</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {environments.map((e) => (
            <Tr key={uid(e)}>
              <Td>{e.environment}</Td>
              <Td>{e.issuerUrl}</Td>
              <Td>{e.clientRegistration}</Td>
              <Td>{e.clientId}</Td>
              <Td>
                <ClientDelete />
              </Td>
            </Tr>
          ))}
          {!environments.length && (
            <Tr>
              <Td colSpan={5}>none created</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Section>
  );
};

export default ClientManagment;
