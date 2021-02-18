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
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import {
  FaBuilding,
  FaCheckCircle,
  FaMinusCircle,
  FaShieldAlt,
  FaSearch,
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
              <Heading size="sm" mb={2}>
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
                      Authentication Method
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
              <Button colorScheme="red" variant="outline" size="sm">
                Disable
              </Button>
            </Box>
          </Box>
        </>
      </PageHeader>
      <Box mt={5}>
        <Box bg="white" overflow="hidden">
          <Box
            m={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <ButtonGroup isAttached>
              <Button variant="primary">All</Button>
              <Button>Active (3)</Button>
            </ButtonGroup>
            <Text>Add/Remove services listed below</Text>
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
          <Box m={4}>
            <Wrap>
              {casual.array_of_words(8).map((d, i) => {
                const isActive = casual.coin_flip;

                return (
                  <WrapItem key={i}>
                    <Button
                      colorScheme={isActive ? 'green' : 'gray'}
                      color={isActive ? 'white' : 'gray.500'}
                      leftIcon={
                        <Icon as={isActive ? FaCheckCircle : FaMinusCircle} />
                      }
                    >
                      {casual.words(4).replace(/\s/g, '-')}
                    </Button>
                  </WrapItem>
                );
              })}
            </Wrap>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default EnvironmentPage;
