import * as React from 'react';
import {
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  Heading,
  Input,
  ModalBody,
  ModalFooter,
  Text,
} from '@chakra-ui/react';
import TagInput from '../tag-input';

interface AuthorizationFormProps {
  onCancel: () => void;
  onComplete: (payload: FormData) => void;
}

const AuthorizationForm: React.FC<AuthorizationFormProps> = ({
  onCancel,
  onComplete,
}) => {
  const formRef = React.useRef<HTMLFormElement>(null);

  // Events
  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (formRef?.current.checkValidity()) {
        const formData = new FormData(formRef.current);
        onComplete(formData);
      }
    },
    [onComplete]
  );
  const handleCreate = React.useCallback(() => {
    formRef?.current.requestSubmit();
  }, []);

  function Legend({ children }: { children: React.ReactNode }) {
    return (
      <Heading as="legend" size="sm" fontWeight="normal">
        {children}
      </Heading>
    );
  }

  return (
    <>
      <ModalBody
        sx={{
          '& fieldset': { mb: 8 },
          '& fieldset legend': { mb: 1 },
          '& fieldset legend + div': { mt: 1 },
          '& fieldset p': {
            mb: 3,
          },
        }}
      >
        <form ref={formRef} onSubmit={handleSubmit}>
          <fieldset>
            <Legend>Mode</Legend>
          </fieldset>
          <fieldset>
            <Legend>Scopes (optional)</Legend>
            <Text fontSize="sm" color="bc-component">
              If your APIs are protected by Scope, then provide the full list of
              Scopes setup in the idP.
            </Text>
            <TagInput
              isRequired
              placeholder="Enter Scopes"
              name="availableScopes"
            />
          </fieldset>
          <fieldset>
            <Legend>Client Roles (optional)</Legend>
            <Text fontSize="sm" color="bc-component">
              If your APIs are protected by Roles, provide the full list of
              Client Roles that will be used to manage access to the APIs that
              are protected with this Authorization configuration.
            </Text>
            <TagInput placeholder="Enter Client Roles" name="clientRoles" />
          </fieldset>
          <fieldset>
            <Legend>Client Mappers (optional)</Legend>
            <Grid templateColumns="210px 1fr" gap={4}>
              <GridItem bgColor="bc-gray" d="flex" alignItems="center" px={4}>
                Audience
              </GridItem>
              <GridItem>
                <TagInput
                  placeholder="Enter Client Mappers"
                  name="clientMappers"
                />
              </GridItem>
            </Grid>
          </fieldset>
          <fieldset>
            <Legend>UMA2 Resource Type (optional)</Legend>
            <TagInput
              placeholder="Enter UMA2 Resource Type"
              name="resourceType"
            />
          </fieldset>
          <fieldset>
            <Legend>Resource Scopes (optional)</Legend>
            <Text fontSize="sm" color="bc-component">
              If your APIs are using UMA2 Resource Scopes, then provide the full
              list of Scopes setup in the idP.
            </Text>
            <TagInput
              placeholder="Enter Resource Scopes"
              name="resourceScopes"
            />
          </fieldset>
          <fieldset>
            <Legend>Resource Access Scope (optional)</Legend>
            <Text fontSize="sm" color="bc-component">
              The Resource Access Scope identifies a Resource Scope that, when
              granted to a user, allows them to administer permissions for the
              particular resource. This can be used when the Resource Server is
              the owner of the resource.
            </Text>
            <Input
              placeholder="Enter Resource Access Scope"
              name="resourceScopes"
            />
          </fieldset>
        </form>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreate}>Continue</Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default AuthorizationForm;
