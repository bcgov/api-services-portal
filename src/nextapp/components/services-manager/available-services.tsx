import * as React from 'react';
import api from '@/shared/services/api';
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
import { useQuery, useQueryClient } from 'react-query';
import type { Query } from '@/types/query.types';
import { GET_SERVICES } from '@/shared/queries/products-queries';

const AvailableServices: React.FC = () => {
  const client = useQueryClient();
  const { data } = useQuery<Query>(
    'services',
    async () => await api(GET_SERVICES, { ns: '123' }),
    {
      suspense: true,
    }
  );
  const onClick = React.useCallback(() => {
    console.log('click');
  }, []);
  const onDragStart = React.useCallback(
    (d) => (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData('application/aps-service', JSON.stringify(d));
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );
  const onDragEnd = React.useCallback(
    (event) => {
      if (event.dataTransfer.dropEffect === 'move') {
        client.invalidateQueries('services');
      }
    },
    [client]
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
          <Select size="sm" width="auto">
            <option>Name</option>
            <option>Date Modified</option>
          </Select>
        </Box>
      </Box>
      <Wrap p={4}>
        {data.allGatewayServices.length > 0 &&
          data.allGatewayServices.map((d, i) => (
            <WrapItem key={i}>
              <Tag
                draggable
                colorScheme="gray"
                color="gray.500"
                cursor="move"
                onClick={onClick}
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
