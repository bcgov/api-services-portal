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
import { FaGripVertical } from 'react-icons/fa';
import { Environment, GatewayService } from '@/shared/types/query.types';
import SearchInput from '../search-input';
import EmptyPane from '../empty-pane';

const dataTransferType = 'application/service';

interface ConfigureEnvironmentProps {
  data: GatewayService[];
  environment: Environment;
  hasError?: boolean;
}

const ConfigureEnvironment: React.FC<ConfigureEnvironmentProps> = ({
  data,
  environment,
  hasError,
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
  const availableServices = React.useMemo(() => {
    return data
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
      });
  }, [activeServices, data, search, sort]);

  // Events
  const handleServiceSelect = (service: GatewayService) => () => {
    setActiveServices((state) => [...state, service]);
  };
  const handleDragStart = (d: GatewayService) => (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    const data = JSON.stringify(d);
    dragRef.current = data;
    event.dataTransfer.setData(dataTransferType, data);
    event.dataTransfer.effectAllowed = 'move';
  };
  const handleDrop = () => {
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
        onDrop={handleDrop}
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
                <Tag
                  variant={hasError ? 'outline' : 'solid'}
                  colorScheme={hasError ? 'red' : 'green'}
                  userSelect="none"
                  data-testid={s.name}
                >
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
          {`Available Services (${availableServices.length ?? 0})`}
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
        {availableServices.length === 0 && (
          <EmptyPane
            minH="120px"
            sx={{
              '& > div': {
                py: 2,
              },
            }}
            title={
              search ? `No services match ${search}` : 'No available services'
            }
            message={
              search
                ? 'Try changing your search term'
                : 'All services assigned to Environments'
            }
          />
        )}
        <Wrap data-testid="edit-env-available-services">
          {availableServices.map((s) => (
            <WrapItem key={s.id}>
              <Tag
                draggable
                userSelect="none"
                onDragStart={handleDragStart(s)}
                onClick={handleServiceSelect(s)}
                variant="drag"
                data-testid={s.name}
              >
                <TagLabel
                  cursor="pointer"
                  sx={{ _hover: { textDecor: 'underline' } }}
                >
                  {s.name}
                </TagLabel>
                <TagRightIcon as={FaGripVertical} cursor="move" />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </Box>
    </div>
  );
};

export default ConfigureEnvironment;
