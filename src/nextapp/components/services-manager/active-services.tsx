import * as React from 'react';
import casual from 'casual-browserify';
import {
  Box,
  Heading,
  Icon,
  Wrap,
  WrapItem,
  Text,
  Tag,
  Center,
  TagLabel,
  TagLeftIcon,
  TagCloseButton,
  Badge,
} from '@chakra-ui/react';
import {
  FaRegFolderOpen,
  FaDatabase,
  FaArrowRight,
  FaArrowCircleDown,
} from 'react-icons/fa';

type ActiveItem = {
  id: string;
  name: string;
};

const ActiveServices: React.FC = () => {
  const [data, setData] = React.useState<ActiveItem[]>([]);
  const [hasDragTarget, setDragTarget] = React.useState<boolean>(false);

  return (
    <Box flex={1} display="flex" flexDir="column">
      <Box
        borderBottom="1px solid"
        borderColor="gray.100"
        as="header"
        height="50px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        position="relative"
        px={4}
        py={2}
      >
        <Heading size="sm" color="green.600">
          Active Services <Badge colorScheme="green">{data.length}</Badge>
        </Heading>
        {hasDragTarget && (
          <Box
            position="absolute"
            bottom={-2}
            bg="bc-blue-alt"
            borderRadius={4}
            px={2}
            color="white"
            left="50%"
            marginLeft="-75px"
            display="flex"
            alignItems="center"
            width="150px"
            zIndex={9}
          >
            <Icon as={FaArrowCircleDown} mr={2} boxSize="0.75rem" />
            <Text fontSize="xs">Drop Service Here</Text>
          </Box>
        )}
      </Box>
      <Box
        flex={1}
        display="flex"
        position="relative"
        color="blue.500"
        boxShadow={hasDragTarget ? 'inner' : ''}
        onDrop={(event) => {
          const id: string = event.dataTransfer.getData(
            'application/aps-service'
          );
          setData((state: ActiveItem[]) => [
            ...state,
            { id, name: casual.name },
          ]);
          setDragTarget(false);
        }}
        onDragOver={(ev) => {
          ev.preventDefault();
          ev.dataTransfer.dropEffect = 'move';
          setDragTarget(true);
        }}
        onDragExit={(ev) => {
          ev.preventDefault();
          setDragTarget(false);
        }}
      >
        {data.length === 0 && (
          <Center height="100%">
            <Box maxWidth="50%" textAlign="center" my={4} position="relative">
              <Icon
                as={FaArrowRight}
                position="absolute"
                right={-20}
                top="50%"
                color="blue.500"
                boxSize="2rem"
              />
              <Icon as={FaRegFolderOpen} color="blue.200" boxSize="2rem" />
              <Heading size="sm" mb={2}>
                Empty Environment
              </Heading>
              <Text fontSize="sm" color="gray.500">
                You have no active services yet. Drag them over from the right
                to active them
              </Text>
            </Box>
          </Center>
        )}
        <Wrap p={4}>
          {data.map((d, i) => (
            <WrapItem key={i}>
              <Tag colorScheme="green" color="green.800">
                <TagLeftIcon as={FaDatabase} />
                <TagLabel>{casual.words(4).replace(/\s/g, '-')}</TagLabel>
                <TagCloseButton
                  onClick={() =>
                    setData((state) => state.filter((d, idx) => idx !== i))
                  }
                />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </Box>
    </Box>
  );
};

export default ActiveServices;
