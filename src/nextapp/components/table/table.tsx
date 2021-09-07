import * as React from 'react';
import {
  Table,
  Td,
  Th,
  Tr,
  Tbody,
  Thead,
  Icon,
  TableColumnHeaderProps,
  Box,
} from '@chakra-ui/react';
import { TiArrowSortedDown, TiArrowSortedUp } from 'react-icons/ti';
import sortBy from 'lodash/sortBy';
import { uid } from 'react-uid';

interface Column extends TableColumnHeaderProps {
  name: string;
  key: string;
}

interface ApsTableProps {
  children: (d: unknown, index: number) => React.ReactNode;
  columns: Column[];
  data: unknown[];
  emptyView?: React.ReactNode;
  sortable?: boolean;
}

const ApsTable: React.FC<ApsTableProps> = ({
  children,
  columns,
  data,
  emptyView,
  sortable,
}) => {
  const [sortKey, setSortKey] = React.useState<string>(columns[0]?.key ?? '');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const sorted = React.useMemo(() => {
    const sortedAsc = sortBy(data, sortKey);

    if (sortDir === 'desc') {
      return sortedAsc.reverse();
    }

    return sortedAsc;
  }, [data, sortDir, sortKey]);
  const handleSort = React.useCallback(
    (key: string) => () => {
      if (key === sortKey) {
        setSortDir((state) => (state === 'asc' ? 'desc' : 'asc'));
      }
      setSortKey(key);
    },
    [setSortDir, setSortKey, sortKey]
  );

  return (
    <Table>
      <Thead>
        <Tr>
          {columns.map(({ key, name, ...rest }) => (
            <Th
              key={uid(name)}
              {...rest}
              onClick={handleSort(key)}
              _hover={{
                color: 'black',
                cursor: sortable ? 'pointer' : undefined,
                userSelect: 'none',
              }}
            >
              <Box pos="relative" d="inline">
                {name}
                {sortable && (
                  <Box h="20px" pos="absolute" right={0} top="2px">
                    <Icon
                      as={TiArrowSortedUp}
                      boxSize="3"
                      ml={2}
                      pos="absolute"
                      top={0}
                      color={
                        sortKey === key && sortDir === 'desc'
                          ? 'gray.700'
                          : 'gray.200'
                      }
                    />
                    <Icon
                      as={TiArrowSortedDown}
                      boxSize="3"
                      ml={2}
                      pos="absolute"
                      bottom={0}
                      color={
                        sortKey === key && sortDir === 'asc'
                          ? 'gray.700'
                          : 'gray.200'
                      }
                    />
                  </Box>
                )}
              </Box>
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {!data.length && (
          <Tr>
            <Td colSpan={columns.length}>{emptyView}</Td>
          </Tr>
        )}
        {sorted.map((d, index) => children(d, index))}
      </Tbody>
    </Table>
  );
};

export default ApsTable;
