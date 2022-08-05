import * as React from 'react';
import { useAuth } from '@/shared/services/auth';
import {
  Avatar,
  Box,
  Container,
  Editable,
  EditableInput,
  EditableTextarea,
  EditablePreview,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  ButtonGroup,
  Button,
  useEditableControls,
  Icon,
} from '@chakra-ui/react';
import Head from 'next/head';
import { FaPen } from 'react-icons/fa';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  function Figure({
    children,
    label,
  }: {
    children: React.ReactNode;
    label: string;
  }) {
    return (
      <GridItem>
        <Text color="bc-component" opacity={0.6}>
          {label}
        </Text>
        <Text>{children}</Text>
      </GridItem>
    );
  }
  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup justifyContent="center" size="sm" ml={2}>
        <Button {...getCancelButtonProps()} variant="secondary">
          Cancel
        </Button>
        <Button {...getSubmitButtonProps()}>Done</Button>
      </ButtonGroup>
    ) : (
      <Box d="inline-flex" justifyContent="center" ml={2}>
        <Button
          leftIcon={<Icon as={FaPen} />}
          size="sm"
          variant="ghost"
          {...getEditButtonProps()}
        >
          Edit
        </Button>
      </Box>
    );
  }

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
            <Figure label="Name">{user.name}</Figure>
            <Figure label="Email">
              <Editable defaultValue={user.email}>
                <EditablePreview />
                <EditableInput width="auto" />
                <EditableControls />
              </Editable>
            </Figure>
            <Figure label="Username">{user.username}</Figure>
            <Figure label="Authentication">BC Services Card</Figure>
          </Grid>
        </Flex>
      </Container>
    </>
  );
};

export default ProfilePage;
