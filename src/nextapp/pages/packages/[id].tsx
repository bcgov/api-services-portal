import * as React from 'react';
import casual from 'casual-browserify';
import {
  Button,
  ButtonGroup,
  Box,
  Checkbox,
  Container,
  Divider,
  Heading,
  Icon,
  Input,
  Select,
  InputLeftElement,
  InputGroup,
  Badge,
  HStack,
  List,
  ListItem,
  ListIcon,
  Wrap,
  WrapItem,
  Switch,
  FormLabel,
  FormControl,
  Text,
  Tag,
  Center,
  TagLabel,
  TagLeftIcon,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import {
  FaBuilding,
  FaCheckCircle,
  FaMinusCircle,
  FaShieldAlt,
  FaSearch,
  FaTimes,
  FaWrench,
  FaRegFolderOpen,
  FaDatabase,
  FaArrowRight,
} from 'react-icons/fa';

const EnvironmentPage: React.FC = () => {
  return (
    <Container maxW="6xl">
      <PageHeader
        title={
          <>
            Edit Environment{' '}
            <Badge ml={1} fontSize="1rem" colorScheme="blue" variant="solid">
              Development
            </Badge>
          </>
        }
      >
        <>
          <Text>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Alias sunt
            facere aliquam harum dolorem error soluta, iusto ad vel nesciunt
            sequi et excepturi ex modi dignissimos, iste reprehenderit. Commodi,
            minus!
          </Text>
          <Box
            bgColor="white"
            mt={8}
            p={4}
            display="flex"
            border="2px solid"
            borderColor="green.500"
            borderRadius={4}
            overflow="hidden"
          >
            <Box display="flex">
              <Icon as={FaCheckCircle} color="green" mt={1} />
            </Box>
            <Box flex={1} ml={4} display="flex" flexDirection="column">
              <Heading size="sm" mb={2} color="green">
                Geocoder Development Environment is Running
              </Heading>
              <Box mr={8}>
                <Text mb={4}>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius
                  a facere velit ullam ea! Minima, nemo voluptatibus, expedita,
                  libero quae itaque eos qui sapiente commodi repudiandae
                  provident laboriosam odio voluptates.
                </Text>
                <Box>
                  <Box display="flex" alignItems="center">
                    <Text fontWeight="bold" mr={4}>
                      Authentication
                    </Text>
                    <Select size="sm" variant="filled" width="auto">
                      <option value="public">Public</option>
                      <option value="keys">API Keys</option>
                      <option value="private">Private</option>
                      <option value="jwt">JWT</option>
                    </Select>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box>
              <Button
                colorScheme="red"
                variant="outline"
                size="sm"
                leftIcon={<Icon as={FaTimes} />}
              >
                Disable
              </Button>
            </Box>
          </Box>
        </>
      </PageHeader>
      <Box my={5}>
        <Box bg="white" overflow="hidden">
          <Box
            m={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">
              <Icon as={FaWrench} mr={2} color="blue.500" />
              Configure Environment Services
            </Heading>
            <Box>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Filter Services"
                  type="search"
                  variant="bc-input"
                />
              </InputGroup>
            </Box>
          </Box>
          <Divider />
          <Box display="flex">
            <Box
              flex={1}
              borderRight="1px solid"
              borderColor="gray.100"
              display="flex"
              flexDir="column"
            >
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
                <Heading size="sm" color="green.600">
                  Active Services
                </Heading>
              </Box>
              <Box flex={1}>
                <Center height="100%" display="none">
                  <Box
                    maxWidth="50%"
                    textAlign="center"
                    my={4}
                    position="relative"
                  >
                    <Icon
                      as={FaArrowRight}
                      position="absolute"
                      right={-20}
                      top="50%"
                      color="blue.500"
                      boxSize="2rem"
                    />
                    <Icon
                      as={FaRegFolderOpen}
                      color="blue.200"
                      boxSize="2rem"
                    />
                    <Heading size="sm" mb={2}>
                      Empty Environment
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      You have no active services yet. Drag them over from the
                      right to active them
                    </Text>
                  </Box>
                </Center>
                <Wrap p={4}>
                  {casual.array_of_words(0).map((d, i) => (
                    <WrapItem key={i}>
                      <Tag colorScheme="green" color="green.800">
                        <TagLeftIcon as={FaDatabase} />
                        <TagLabel>
                          {casual.words(4).replace(/\s/g, '-')}
                        </TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            </Box>
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
                {casual.array_of_words(8).map((d, i) => (
                  <WrapItem key={i}>
                    <Tag colorScheme="gray" color="gray.500">
                      <TagLeftIcon as={FaDatabase} />
                      <TagLabel>{casual.words(4).replace(/\s/g, '-')}</TagLabel>
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default EnvironmentPage;
