import * as React from 'react';
import {
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  useToast,
} from '@chakra-ui/react';
import { FaMinusCircle } from 'react-icons/fa';
import { gql } from 'graphql-request';
import InlinePermissionsList from '@/components/inline-permissions-list';
import { useApiMutation } from '@/shared/services/api';
import { QueryKey, useQueryClient } from 'react-query';
import { UmaPolicy } from '@/shared/types/query.types';

interface OrgGroupsListProps {
  data: UmaPolicy[];
  prodEnvId: string;
  resourceId: string;
  queryKey: QueryKey;
}

const OrgGroupsList: React.FC<OrgGroupsListProps> = ({
  data,
  prodEnvId,
  resourceId,
  queryKey,
}) => {
  const toast = useToast();
  const client = useQueryClient();
  const list = data?.sort((a, b) => a.name.localeCompare(b.name));

  function camelize(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word: string) {
        return word.toUpperCase();
      })
      .replace(/\s+/g, ' ');
  }

  const format = (s: string, i: number) =>
    camelize(s.split('/')[i + 1].replace(/-/g, ' '));

  return (
    <>
      <Table variant="simple">
        <TableCaption>-</TableCaption>
        <Thead>
          <Tr>
            <Th>Group</Th>
            <Th>Members</Th>
            <Th>Permission</Th>
          </Tr>
        </Thead>
        <Tbody>
          {list
            ?.filter((p) => p.groups)
            .map((item) => (
              <Tr key={item.id}>
                <Td>
                  {item.groups.map((g, i) => (
                    <span>
                      {i > 0 && ' > '} {format(g, i)}
                    </span>
                  ))}
                </Td>
                <Td>
                  <ul>
                    {item.users.map((g) => (
                      <li>{g}</li>
                    ))}
                  </ul>
                </Td>

                <Td>
                  <InlinePermissionsList
                    enableRevoke={false}
                    data={item.scopes.map((s) => ({ id: s, scopeName: s }))}
                    onRevoke={() => false}
                  />
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </>
  );
};

export default OrgGroupsList;
