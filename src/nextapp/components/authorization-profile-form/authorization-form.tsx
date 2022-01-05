import * as React from 'react';
import {
  Box,
  Heading,
  ModalBody,
  Radio,
  RadioGroup,
  Text,
} from '@chakra-ui/react';

const AuthorizationForm: React.FC = () => {
  function Legend({ children }: { children: React.ReactNode }) {
    return (
      <Heading as="legend" size="sm" fontWeight="normal">
        {children}
      </Heading>
    );
  }

  return (
    <ModalBody sx={{ '& fieldset': { mb: 8 } }}>
      <fieldset>
        <Legend>Mode</Legend>
      </fieldset>
      <fieldset>
        <Legend>Scopes (optional)</Legend>
        <Text fontSize="sm" color="bc-component">
          If your APIs are protected by Scope, then provide the full list of
          Scopes setup in the idP.
        </Text>
      </fieldset>
      <fieldset>
        <Legend>Scopes (optional)</Legend>
        <Text fontSize="sm" color="bc-component">
          If your APIs are protected by Scope, then provide the full list of
          Scopes setup in the idP.
        </Text>
      </fieldset>
      <fieldset>
        <Legend>Client Roles (optional)</Legend>
        <Text fontSize="sm" color="bc-component">
          If your APIs are protected by Roles, provide the full list of Client
          Roles that will be used to manage access to the APIs that are
          protected with this Authorization configuration.
        </Text>
      </fieldset>
      <fieldset>
        <Legend>Client Mappers (optional)</Legend>
      </fieldset>
      <fieldset>
        <Legend>UMA2 Resource Type (optional)</Legend>
      </fieldset>
      <fieldset>
        <Legend>Resource Scopes (optional)</Legend>
        <Text fontSize="sm" color="bc-component">
          If your APIs are using UMA2 Resource Scopes, then provide the full
          list of Scopes setup in the idP.
        </Text>
      </fieldset>
      <fieldset>
        <Legend>Resource Access Scope (optional)</Legend>
        <Text fontSize="sm" color="bc-component">
          The Resource Access Scope identifies a Resource Scope that, when
          granted to a user, allows them to administer permissions for the
          particular resource. This can be used when the Resource Server is the
          owner of the resource.
        </Text>
      </fieldset>
    </ModalBody>
  );
};

export default AuthorizationForm;
