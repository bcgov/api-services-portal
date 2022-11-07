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
  TableProps,
  Skeleton,
} from '@chakra-ui/react';
import { TiArrowSortedDown, TiArrowSortedUp } from 'react-icons/ti';
import sortBy from 'lodash/sortBy';
import { uid } from 'react-uid';
import { times } from 'lodash';

interface Column extends TableColumnHeaderProps {
  name: React.ReactNode;
  key?: string;
  sortable?: boolean;
}

interface ApsTableProps extends TableProps {
  children: (d: unknown, index: number) => React.ReactElement;
  columns: Column[];
  data: unknown[];
  emptyView?: React.ReactNode;
  isUpdating?: boolean;
  sortable?: boolean;
}

const ApsTable: React.FC<ApsTableProps> = ({
  children,
  columns,
  data,
  emptyView,
  isUpdating,
  sortable,
  ...props
}) => {
  const [sortKey, setSortKey] = React.useState<string>(() => {
    if (sortable) {
      return columns[0]?.key;
    }
    return '';
  });
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const sorted = React.useMemo(() => {
    if (!sortKey) {
      return data;
    }
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
    <Table {...props}>
      <Thead>
        <Tr>
          {columns.map(({ key, name, ...rest }) => (
            <Th
              key={uid(name)}
              {...rest}
              aria-label={
                name ? `${name} column header` : 'none sortable table header'
              }
              onClick={
                rest.sortable !== false && key ? handleSort(key) : undefined
              }
              _hover={{
                color: 'black',
                cursor:
                  rest.sortable !== false && sortable && name
                    ? 'pointer'
                    : undefined,
                userSelect: 'none',
                bgColor:
                  rest.sortable !== false && sortable && name
                    ? 'gray.50'
                    : undefined,
              }}
            >
              <Box pos="relative" d="inline">
                {name}
                {rest.sortable !== false && sortable && name && (
                  <Box h="20px" pos="absolute" right={0} top="2px">
                    <Icon
                      as={TiArrowSortedUp}
                      aria-label="sort label up icon"
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
                      aria-label="sort label down icon"
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
        {isUpdating &&
          (() => {
            const elements = [];
            times(5, (n) => {
              elements.push(
                <Tr key={`tr-${n}`}>
                  {(() => {
                    const elements = [];
                    times(columns.length, (col) => {
                      elements.push(
                        <Td key={`td-${col}`} textAlign="center">
                          <Skeleton height="20px" width="100%" />
                        </Td>
                      );
                    });
                    return elements;
                  })()}
                </Tr>
              );
            });
            return elements;
          })()}
        {!data?.length && !isUpdating && (
          <Tr>
            <Td colSpan={columns.length} textAlign="center">
              {emptyView}
            </Td>
          </Tr>
        )}
        {!isUpdating &&
          sorted.map((d, index) =>
            React.cloneElement(children(d, index), {
              key: uid(d),
            })
          )}
      </Tbody>
    </Table>
  );
};

export default ApsTable;
