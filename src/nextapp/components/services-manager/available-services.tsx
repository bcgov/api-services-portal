import * as React from 'react';
import {
  Box,
  Heading,
  Select,
  Wrap,
  WrapItem,
  Text,
  Tag,
  TagLabel,
  TagLeftIcon,
} from '@chakra-ui/react';
import { FaPlusCircle, FaDatabase } from 'react-icons/fa';
import { useApi } from '@/shared/services/api';
import { GET_SERVICES } from '@/shared/queries/products-queries';
import { GatewayService } from '@/shared/types/query.types';

interface AvailableServicesProps {
  activeIds: string[];
  dragDataType: string;
  onAddService: (payload: { id: string }[]) => void;
  namespace: string;
  search: string;
}

const AvailableServices: React.FC<AvailableServicesProps> = ({
  activeIds = [],
  dragDataType,
  onAddService,
  namespace,
  search,
}) => {
  const [sortBy, setSortBy] = React.useState<string>('name');
  const { data } = useApi('services', {
    query: GET_SERVICES,
    variables: { ns: namespace },
  });
  const handleAddService = React.useCallback(
    (id: string) => {
      const currentIds = activeIds.map((id) => ({ id }));
      onAddService([...currentIds, { id }]);
    },
    [activeIds, onAddService]
  );
  const onClick = React.useCallback(
    (id: string) => () => {
      handleAddService(id);
    },
    [handleAddService]
  );
  const onDragStart = React.useCallback(
    (d) => (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData(dragDataType, JSON.stringify(d));
      event.dataTransfer.effectAllowed = 'move';
    },
    [dragDataType]
  );
  const onDragEnd = React.useCallback(
    (event) => {
      if (event.dataTransfer.dropEffect === 'move') {
        const { id }: GatewayService = JSON.parse(
          event.dataTransfer.getData(dragDataType)
        );
        handleAddService(id);
      }
    },
    [dragDataType, handleAddService]
  );
  const onSortChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSortBy(event.target.value);
    },
    [setSortBy]
  );

  return (
    <Box flex={1}>
      <Box
        borderBottom="1px solid"
        borderColor="gray.100"
        as="header"
        height="50px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={4}
        py={2}
      >
        <Heading size="sm">Available Services</Heading>
        <Box display="flex" alignItems="center">
          <Text mr={2} fontSize="sm">
            Sort By
          </Text>
          <Select size="sm" width="auto" onChange={onSortChange} value={sortBy}>
            <option value="name">Name</option>
            <option value="updatedAt">Date Modified</option>
          </Select>
        </Box>
      </Box>
      <Wrap p={4}>
        {data.allGatewayServices.length > 0 &&
          data.allGatewayServices
            .filter((d) => !activeIds.includes(d.id))
            .filter(
              (d) => d.name.toLowerCase().search(search.toLowerCase()) >= 0
            )
            .sort((a, b) => {
              if (a[sortBy] > b[sortBy]) {
                return 1;
              } else if (a[sortBy] < b[sortBy]) {
                return -1;
              } else {
                return 0;
              }
            })
            .map((d) => (
              <WrapItem key={d.id} data-testid={d.name}>
                <Tag
                  draggable
                  colorScheme="gray"
                  color="gray.500"
                  cursor="move"
                  onClick={onClick(d.id)}
                  onDragEnd={onDragEnd}
                  onDragStart={onDragStart(d)}
                  _hover={{
                    boxShadow: 'outline',
                    '& .icon-db': {
                      display: 'none',
                    },
                    '& .icon-add': {
                      display: 'inline-block',
                    },
                  }}
                >
                  <TagLeftIcon as={FaDatabase} className="icon-db" />
                  <TagLeftIcon
                    as={FaPlusCircle}
                    className="icon-add"
                    display="none"
                    color="green"
                  />
                  <TagLabel>{d.name}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
      </Wrap>
    </Box>
  );
};

export default AvailableServices;
