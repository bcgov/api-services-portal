import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
  Icon,
  Text,
  useEditableControls,
  useToast,
} from '@chakra-ui/react';
import { MdModeEditOutline } from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { CredentialIssuer, Mutation, Query } from '@/shared/types/query.types';

interface ProfileNameControlProps {
  id: string;
  name: string;
  onChange: (value: string) => void;
}

const ProfileNameControl: React.FC<ProfileNameControlProps> = ({
  id,
  name,
  onChange,
}) => {
  const client = useQueryClient();
  const toast = useToast();
  const { isLoading, mutateAsync } = useApiMutation(mutation, {
    onSuccess: (data: Mutation) => {
      client.setQueryData<Query>('authorizationProfiles', (cached) => {
        if (cached?.allCredentialIssuersByNamespace) {
          const updatedCredentialIssuers = cached.allCredentialIssuersByNamespace.map(
            (d) => {
              if (id === d.id) {
                return {
                  ...d,
                  name: data.updateCredentialIssuer.name,
                };
              }

              return d;
            }
          );

          return {
            allCredentialIssuersByNamespace: updatedCredentialIssuers,
          };
        }

        return { allCredentialIssuersByNamespace: [] };
      });
    },
  });
  const handleUpdate = React.useCallback(
    async (value: string) => {
      if (id) {
        try {
          await mutateAsync({
            id,
            data: {
              name: value,
            },
          });
          toast({
            title: 'Name updated',
            status: 'success',
          });
        } catch (e) {
          toast({
            title: 'Name update failed',
            status: 'error',
            description: Array.isArray(e) ? e[0].message : '',
          });
        }
      }
    },
    [mutateAsync, id, toast]
  );
  const handleSubmit = React.useCallback(
    (value: string) => {
      if (id) {
        handleUpdate(value);
      } else {
        onChange(value);
      }
    },
    [handleUpdate, id, onChange]
  );

  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return (
      <Box ml={2}>
        {isEditing && (
          <ButtonGroup>
            <Button variant="secondary" size="sm" {...getCancelButtonProps()}>
              Cancel
            </Button>
            <Button size="sm" {...getSubmitButtonProps()}>
              Done
            </Button>
          </ButtonGroup>
        )}
        {!isEditing && (
          <Button
            variant="flat"
            px={2}
            size="sm"
            leftIcon={<Icon as={MdModeEditOutline} />}
            {...getEditButtonProps()}
          >
            Edit name
          </Button>
        )}
      </Box>
    );
  }
  return (
    <Editable
      d="flex"
      alignItems="center"
      defaultValue={name}
      isPreviewFocusable={false}
      onSubmit={handleSubmit}
    >
      <EditablePreview />
      <EditableInput />
      {!isLoading && <EditableControls />}
      {isLoading && <Text>Saving...</Text>}
    </Editable>
  );
};

export default ProfileNameControl;

const mutation = gql`
  mutation UpdateAuthzProfile($id: ID!, $data: CredentialIssuerUpdateInput!) {
    updateCredentialIssuer(id: $id, data: $data) {
      id
      name
    }
  }
`;
