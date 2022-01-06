import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { Modal, Button } from '@chakra-ui/react';
import noop from 'lodash/noop';

import AuthorizationProfileDialog from './authorization-profile-dialog';
import AuthorizationProfilesForm from './authorization-profile-form';
import AuthenticationForm from './authentication-form';
import AuthorizationForm from './authorization-form';
import EnvironmentForm from './environment-form';
import ClientManagement from './client-management';
import NewProfile from './new-profile';
import ProfileNameControl from './profile-name-control';

export default {
  title: 'APS/AuthorizationProfilesForm',
};

export const DefaultDialog = () => (
  <AuthorizationProfileDialog open onClose={noop} />
);

export const EditDialog = () => (
  <AuthorizationProfileDialog
    open
    data={{ name: 'test', id: '1231231', environments: [] }}
    onClose={noop}
    id="1231231231"
  />
);

export const ProfilesForm = () => (
  <AuthorizationProfilesForm
    data={{ name: 'test', id: '1231231', environments: [] }}
    id="1231231231"
  >
    <Button>Open Form</Button>
  </AuthorizationProfilesForm>
);

export const AuthenticationFormView = () => (
  <Modal isOpen onClose={noop}>
    <AuthenticationForm
      onChange={noop}
      onComplete={noop}
      onCancel={noop}
      value="test"
    />
  </Modal>
);

export const AuthorizationFormView = () => (
  <Modal isOpen onClose={noop}>
    <AuthorizationForm />
  </Modal>
);

export const ClientManagementEmptyView = () => (
  <Modal isOpen onClose={noop}>
    <ClientManagement />
  </Modal>
);

export const ClientManagementView = () => (
  <Modal isOpen onClose={noop}>
    <ClientManagement
      data={JSON.stringify([
        {
          environment: 'dev',
          issuerUrl: 'https://abc.def.ghi.jkl.hostname.xyz/auth',
          clientRegistration: 'anonymous',
        },
        {
          environment: 'dev',
          issuerUrl: 'https://dev.oidc.gov.bc.ca/auth/realms/xtmke7ky',
          clientRegistration: 'anonymous',
          clientId: '230ufsfjew0j',
        },
      ])}
    />
  </Modal>
);

export const NewProfileForm = () => (
  <Modal isOpen onClose={noop}>
    <NewProfile onCancel={noop} onComplete={noop} />
  </Modal>
);

export const NameControl = () => (
  <ProfileNameControl id="123" name="Demo Name" />
);

export const EnvironmentFormView = () => (
  <EnvironmentForm open onSubmit={action('environment-submitted')} />
);
