import * as React from 'react';
import {
  Button,
  ButtonGroup,
  Collapse,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Icon,
  Input,
  Select,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FaPlusCircle } from 'react-icons/fa';
import { gql } from 'graphql-request';
import { useApi, useApiMutation } from '@/shared/services/api';
import { uid } from 'react-uid';
import { Mutation } from '@/types/query.types';
import { useQueryClient } from 'react-query';
import { delay } from '@/shared/services/utils';

const ApplicationSelect: React.FC = () => {
  const queryKey = 'myApplications';
  const client = useQueryClient();
  const nameInput = React.useRef<HTMLInputElement>(null);
  const descriptionInput = React.useRef<HTMLInputElement>(null);
  const [showError, setShowError] = React.useState<boolean>(false);
  const [showSuccess, setShowSuccess] = React.useState<boolean>(false);
  const [application, setApplication] = React.useState<string>('');
  const { isOpen, onToggle } = useDisclosure();
  const { data, isLoading } = useApi(
    queryKey,
    {
      query,
    },
    { suspense: false }
  );
  const mutate = useApiMutation(mutation);

  // Events
  const handleOpenForm = async () => {
    onToggle();
    await delay(200);
    nameInput.current?.focus();
  };
  const handleSelectApplication = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setApplication(event.currentTarget.value);
  };
  const resetForm = () => {
    if (nameInput.current) {
      nameInput.current.value = '';
    }
    if (descriptionInput.current) {
      descriptionInput.current.value = '';
    }
  };
  const handleCancel = () => {
    onToggle();
    setShowSuccess(false);
    setShowError(false);
    resetForm();
  };
  const handleCreate = async () => {
    setShowError(false);
    try {
      const name = nameInput.current?.value;
      const description = descriptionInput.current?.value;

      if (nameInput.current?.checkValidity()) {
        await mutate.mutateAsync(
          { name, description },
          {
            onSuccess(data: Mutation) {
              setApplication(data.createApplication.id);
            },
          }
        );
        client.invalidateQueries(queryKey);

        setShowSuccess(true);
        resetForm();
        await delay(2000);
        handleCancel();
      } else {
        nameInput.current?.reportValidity();
      }
    } catch {
      setShowError(true);
    }
  };

  return (
    <>
      <Grid templateColumns="1fr 1fr" gap={4}>
        <GridItem>
          <FormControl>
            <FormLabel>Applications</FormLabel>
            <FormHelperText>
              Select an application to consume the API
            </FormHelperText>
            <Select
              isRequired
              isDisabled={isLoading ?? data?.myApplications?.length === 0}
              name="applicationId"
              onChange={handleSelectApplication}
              value={application}
              data-testid="access-application-select"
            >
              <option value="">
                {data?.myApplications?.length === 0
                  ? 'You have no applications'
                  : 'No Application Selected'}
              </option>
              {data?.myApplications?.map((a) => (
                <option key={uid(a)} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </GridItem>
        <GridItem d="flex" alignItems="flex-end">
          <Button
            leftIcon={<Icon as={FaPlusCircle} />}
            px={2}
            onClick={handleOpenForm}
            variant="flat"
            data-testid="access-application-create-app-button"
          >
            Create Application
          </Button>
        </GridItem>
      </Grid>
      <Collapse animateOpacity in={isOpen}>
        <Grid
          templateColumns="1fr 1fr"
          gap={4}
          templateRows="repeat(1fr, 3)"
          mt={8}
        >
          <GridItem>
            <FormControl isRequired={isOpen}>
              <FormLabel>Application Name</FormLabel>
              <Input
                ref={nameInput}
                isDisabled={mutate.isLoading}
                data-testid="access-application-name-input"
              />
            </FormControl>
          </GridItem>
          <GridItem>
            <FormControl>
              <FormLabel>Description (optional)</FormLabel>
              <Input
                ref={descriptionInput}
                isDisabled={mutate.isLoading}
                data-testid="access-application-description-input"
              />
            </FormControl>
          </GridItem>
          <GridItem d="flex" alignItems="center" colSpan={2}>
            <ButtonGroup isDisabled={mutate.isLoading}>
              <Button
                variant="secondary"
                onClick={handleCancel}
                data-testid="access-application-cancel-button"
              >
                Cancel
              </Button>
              <Button
                isLoading={mutate.isLoading}
                onClick={handleCreate}
                data-testid="access-application-create-button"
              >
                Create
              </Button>
            </ButtonGroup>
            {showError && (
              <Text color="bc-error" ml={4}>
                Error
              </Text>
            )}
            {showSuccess && (
              <Text color="bc-success" ml={4}>
                Application created!
              </Text>
            )}
          </GridItem>
        </Grid>
      </Collapse>
    </>
  );
};

export default ApplicationSelect;

const query = gql`
  query ApplicationSelectApplications {
    myApplications {
      id
      appId
      name
      owner {
        name
      }
    }
  }
`;

const mutation = gql`
  mutation Add($name: String!, $description: String) {
    createApplication(data: { name: $name, description: $description }) {
      id
      appId
      name
    }
  }
`;
