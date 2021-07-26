import * as React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';
import { uid } from 'react-uid';

import ClientDelete from './client-delete';
import Section from '../section';
import NewClient from './new-client';
import { EnvironmentItem } from './types';

interface ClientManagmentProps {
  data: EnvironmentItem[];
  mode?: string;
  onCreate: (payload: EnvironmentItem) => void;
  onDelete: (index: number) => void;
}

const ClientManagment: React.FC<ClientManagmentProps> = ({
  data,
  mode,
  onCreate,
  onDelete,
}) => {
  const handleDelete = React.useCallback(
    (index: number) => () => onDelete(index),
    [onDelete]
  );

  return (
    <Section
      actions={<NewClient mode={mode} onCreate={onCreate} />}
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
          {data.map((e, index) => (
            <Tr key={uid(e)}>
              <Td>{e.environment}</Td>
              <Td>{e.issuerUrl}</Td>
              <Td>{e.clientRegistration}</Td>
              <Td>{e.clientId}</Td>
              <Td>
                <ClientDelete onDelete={handleDelete(index)} />
              </Td>
            </Tr>
          ))}
          {!data.length && (
            <Tr>
              <Td colSpan={5}>
                <Text align="center">
                  You haven&apos;t created any environments yet
                </Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Section>
  );
};

export default ClientManagment;
