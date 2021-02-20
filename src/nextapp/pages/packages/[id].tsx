import * as React from 'react';
import {
  Button,
  Box,
  Container,
  Heading,
  Icon,
  Select,
  Badge,
  Text,
} from '@chakra-ui/react';
// import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import ServicesManager from '@/components/services-manager';

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
        <ServicesManager />
      </Box>
    </Container>
  );
};

export default EnvironmentPage;
