import * as React from 'react';
import { Box, FormControl, FormLabel, Heading, Input } from '@chakra-ui/react';
import ProfileCard from '@/components/profile-card';
import { CredentialIssuer } from '@/shared/types/query.types';

import Section from '../section';
import FormGroup from './form-group';
import { useAuth } from '@/shared/services/auth';

interface AuthorizationProfileSection {
  issuer?: CredentialIssuer;
}

const AuthorizationProfileSection: React.FC<AuthorizationProfileSection> = ({
  issuer,
}) => {
  const { user } = useAuth();
  const administrator = issuer?.owner ?? user;

  return (
    <Section title="Profile">
      <FormGroup
        infoBoxes={
          administrator && (
            <Box>
              <Heading size="sm" mb={2}>
                Administrator
              </Heading>
              <ProfileCard data={administrator} />
            </Box>
          )
        }
      >
        <FormControl isRequired mb={4} isDisabled={false}>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Name"
            name="name"
            variant="bc-input"
            defaultValue={issuer?.name}
            data-testid="ap-profile-name"
          />
        </FormControl>
      </FormGroup>
    </Section>
  );
};

export default AuthorizationProfileSection;
