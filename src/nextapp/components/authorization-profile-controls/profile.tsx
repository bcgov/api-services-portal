import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Text,
  ButtonGroup,
  Flex,
  Divider,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Grid,
  AlertIcon,
} from '@chakra-ui/react';
import { CredentialIssuer } from '@/shared/types/query.types';
import Section from '../section';
import FormGroup from './form-group';

interface AuthorizationProfileSection {
  issuer?: CredentialIssuer;
}

const AuthorizationProfileSection: React.FC<AuthorizationProfileSection> = ({
  issuer,
}) => {
  return (
    <Section title="Profile">
      <FormGroup
        infoBoxes={
          <Alert variant="left-accent">
            <AlertIcon />
            <Grid
              as="dl"
              fontSize="sm"
              gap={2}
              templateColumns="45% 1fr"
              lineHeight="shorter"
              sx={{
                dt: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Text as="dt">Administrator Name</Text>
              <Text as="dd">{issuer.owner.name}</Text>
              <Text as="dt" fontWeight="normal">
                Username
              </Text>
              <Text as="dd">{issuer.owner.username}</Text>
              <Text as="dt" fontWeight="normal">
                Email
              </Text>
              <Text as="dd">{issuer.owner.email}</Text>
            </Grid>
          </Alert>
        }
      >
        <FormControl isRequired mb={4} isDisabled={false}>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Name"
            name="name"
            variant="bc-input"
            defaultValue={issuer?.name}
          />
        </FormControl>
      </FormGroup>
    </Section>
  );
};

export default AuthorizationProfileSection;
