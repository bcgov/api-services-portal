import * as React from 'react';
import { useAuth } from '@/shared/services/auth';
import {
  Avatar,
  Box,
  Container,
  Editable,
  EditableInput,
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
  Input,
  useToast,
} from '@chakra-ui/react';
import Head from 'next/head';
import { FaPen } from 'react-icons/fa';
import { useApiMutation } from '@/shared/services/api';
import { gql } from 'graphql-request';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const mutate = useApiMutation(mutation);
  const toast = useToast();
  const inputRef = React.useRef(null);
  const [isInvalid, setIsInvalid] = React.useState<boolean>(false);

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

  async function handleSubmit(value: string) {
    const email = value.trim();
    if (email && inputRef.current?.checkValidity()) {
      try {
        setIsInvalid(false);
        await mutate.mutateAsync({ email });
        toast({
          status: 'success',
          title: 'Email updated',
          isClosable: true,
        });
        return false;
      } catch (err) {
        toast({
          status: 'error',
          title: 'Unable to update email',
          description: err,
          isClosable: true,
        });
      }
    }
    setIsInvalid(true);
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
              <Editable
                isRequired
                submitOnBlur={false}
                defaultValue={user?.email}
                onSubmit={handleSubmit}
              >
                <EditablePreview />
                <Input
                  isRequired
                  ref={inputRef}
                  as={EditableInput}
                  width="auto"
                  type="email"
                />
                <EditableControls />
              </Editable>
              {isInvalid && <Text color="bc-error">Invalid Email</Text>}
            </Figure>
            <Figure label="Username">{user.username}</Figure>
            <Figure label="Authentication">BC Services Card</Figure>
          </Grid>
        </Flex>
      </Container>
    </>
  );
};

const mutation = gql`
  mutation UpdateUserEmail($email: String!) {
    updateEmail(email: $email) {
      email
    }
  }
`;

export default ProfilePage;
