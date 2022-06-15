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
import Head from 'next/head';
import { uid } from 'react-uid';

const fields = [
  { name: 'Name', key: 'name' },
  { name: 'Email', key: 'email' },
  { name: 'Username', key: 'providerUsername' },
  { name: 'Provider', key: 'provider' },
  { name: 'User ID', key: 'username' },
  { name: 'Business Name', key: 'businessName' },
];

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>API Program Services | Profile</title>
      </Head>
      <Container maxW="6xl">
        <Box as="header" mt={12} mb={6}>
          <Heading>Your Profile</Heading>
        </Box>
        <Flex as="article" bgColor="white" p={12} align="center">
          <Avatar name={user.name} size="xl" mr={12} />
          <Grid
            flex={1}
            templateColumns="max(280px, 25%) 1fr"
            gridRowGap={8}
            gap={8}
          >
            {fields.map((f) => (
              <GridItem key={uid(f)}>
                <Text color="bc-component" opacity={0.6}>
                  {f.name}
                </Text>
                <Text>{user[f.key] ?? '-'}</Text>
              </GridItem>
            ))}
          </Grid>
        </Flex>
      </Container>
    </>
  );
};

export default ProfilePage;
