import * as React from 'react';
import { useAuth } from '@/shared/services/auth';
import {
  Avatar,
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
} from '@chakra-ui/react';
import { uid } from 'react-uid';

const fields = [
  { name: 'Name', key: 'name' },
  { name: 'Email', key: 'email' },
  { name: 'Username', key: 'username' },
];

const MyProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxW="6xl">
      <Box as="header" mt={12} mb={6}>
        <Heading>Your Profile</Heading>
      </Box>
      <Flex as="article" bgColor="white" p={12} align="center">
        <Avatar name={user.name} size="xl" mr={12} />
        <Grid flex={1} templateColumns="224px 1fr" gridRowGap={8}>
          {fields.map((f) => (
            <GridItem key={uid(f)}>
              <Text color="bc-component" opacity={0.6}>
                {f.name}
              </Text>
              <Text>{user[f.key]}</Text>
            </GridItem>
          ))}
        </Grid>
      </Flex>
    </Container>
  );
};

export default MyProfilePage;
