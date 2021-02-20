import * as React from 'react';
import casual from 'casual-browserify';
import {
  Box,
  Heading,
  Icon,
  Select,
  Wrap,
  WrapItem,
  Text,
  Tag,
  Center,
  TagLabel,
  TagLeftIcon,
  TagCloseButton,
} from '@chakra-ui/react';
import { FaRegFolderOpen, FaDatabase, FaArrowRight } from 'react-icons/fa';

const AvailableServices: React.FC = () => {
  const [total, setTotal] = React.useState<number>(8);
  const onDragEnd = React.useCallback(
    (event) => {
      console.log(event.dataTransfer.dropEffect);
      if (event.dataTransfer.dropEffect === 'move') {
        setTotal((state) => state - 1);
      }
    },
    [setTotal]
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
        {total > 0 &&
          casual.array_of_words(total).map((d, i) => (
            <WrapItem key={i}>
              <Tag
                colorScheme="gray"
                color="gray.500"
                cursor="move"
                draggable
                onDragEnd={onDragEnd}
                onDragStart={(ev) => {
                  ev.dataTransfer.setData('application/aps-service', d);
                  ev.dataTransfer.effectAllowed = 'move';
                }}
                _hover={{
                  boxShadow: 'outline',
                }}
              >
                <TagLeftIcon as={FaDatabase} />
                <TagLabel>{casual.words(4).replace(/\s/g, '-')}</TagLabel>
              </Tag>
            </WrapItem>
          ))}
      </Wrap>
    </Box>
  );
};

export default AvailableServices;
