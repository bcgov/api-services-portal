import * as React from 'react';
import {
  Box,
  Center,
  Flex,
  Heading,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  TagRightIcon,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { FaGripVertical } from 'react-icons/fa';
import { Environment, GatewayService } from '@/shared/types/query.types';
import SearchInput from '../search-input';
import EmptyPane from '../empty-pane';

const dataTransferType = 'application/service';

interface ConfigureEnvironmentProps {
  data: GatewayService[];
  environment: Environment;
}

const ConfigureEnvironment: React.FC<ConfigureEnvironmentProps> = ({
  data,
  environment,
}) => {
  const dragRef = React.useRef<string>(null);
  const [hasDragTarget, setDragTarget] = React.useState<boolean>(false);
  const [activeServices, setActiveServices] = React.useState(() => {
    try {
      return environment.services;
    } catch {
      return [];
    }
  });
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState('name');
  const value = React.useMemo(() => {
    const result = activeServices.map((s) => s.id);
    return JSON.stringify(result);
  }, [activeServices]);

  const handleDragStart = (d: GatewayService) => (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    const data = JSON.stringify(d);
    dragRef.current = data;
    event.dataTransfer.setData(dataTransferType, data);
    event.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd = () => {
    setActiveServices((state) => [...state, JSON.parse(dragRef.current)]);
    setDragTarget(true);
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragTarget(true);
  };
  const handleDragExit = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragTarget(false);
  };
  const handleRemoveService = (id: string) => () => {
    setActiveServices((state) => state.filter((s) => s.id !== id));
  };
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.target.value);
  };

  return (
    <div>
      <Heading size="sm" mb={8} data-testid="edit-env-active-services-heading">
        {`Active Services (${activeServices.length ?? 0})`}
      </Heading>
      <Box
        border="1px dashed"
        borderColor={hasDragTarget ? 'bc-blue' : 'bc-component'}
        bgColor="bc-gray"
        borderRadius="4px"
        p={8}
        mb={8}
        minHeight="130px"
        onDragOver={handleDragOver}
        onDragExit={handleDragExit}
        data-testid="edit-env-active-services"
      >
        {activeServices.length <= 0 && (
          <Center height="calc(130px - 60px)">
            <Box textAlign="center">
              <Heading size="sm">Drag and Drop</Heading>
              <Text>available services here to activate them</Text>
            </Box>
          </Center>
        )}
        <input type="hidden" name="services" value={value} />
        {activeServices.length > 0 && (
          <Wrap>
            {activeServices.map((s) => (
              <WrapItem key={s.id}>
                <Tag variant="solid" colorScheme="green">
                  <TagLabel>{s.name}</TagLabel>
                  <TagCloseButton onClick={handleRemoveService(s.id)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        )}
      </Box>
      <Flex align="center" justify="space-between" mb={8}>
        <Heading size="sm" data-testid="edit-env-available-services-heading">
          {`Available Services (${data.length ?? 0})`}
        </Heading>
        <Flex gridGap={4}>
          <SearchInput
            onChange={handleSearchChange}
            value={search}
            data-testid="edit-env-services-search-input"
          />
          <Select
            onChange={handleSortChange}
            value={sort}
            data-testid="edit-env-services-sort-select"
          >
            <option value="name">Sort By: Name</option>
            <option value="date">Sort By: Date Modified</option>
          </Select>
        </Flex>
      </Flex>
      <Box>
        {data.length === 0 && (
          <EmptyPane
            minH="120px"
            sx={{
              '& > div': {
                py: 2,
              },
            }}
            title="No available services"
            message="All services assigned to Environments"
          />
        )}
        <Wrap data-testid="edit-env-available-services">
          {data
            .filter((s) => !activeServices.map((a) => a.id).includes(s.id))
            .filter((s) => {
              if (s.name.search(search) >= 0) {
                return true;
              }
              return false;
            })
            .sort((a, b) => {
              if (sort === 'name') {
                return a.name > b.name ? 1 : -1;
              }
              if (sort === 'date') {
                return a.updatedAt > b.updatedAt ? 1 : -1;
              }
            })
            .map((s) => (
              <WrapItem key={s.id}>
                <Tag
                  draggable
                  cursor="move"
                  onDragEnd={handleDragEnd}
                  onDragStart={handleDragStart(s)}
                  variant="drag"
                >
                  <TagLabel>{s.name}</TagLabel>
                  <TagRightIcon as={FaGripVertical} />
                </Tag>
              </WrapItem>
            ))}
        </Wrap>
      </Box>
    </div>
  );
};

export default ConfigureEnvironment;
