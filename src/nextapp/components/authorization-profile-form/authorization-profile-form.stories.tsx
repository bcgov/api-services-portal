import * as React from 'react';
import noop from 'lodash/noop';

import AuthorizationProfileDialog from './authorization-profile-dialog';
import AuthorizationProfilesForm from './authorization-profile-form';
import AuthenticationForm from './authentication-form';
import NewProfile from './new-profile';
import ProfileNameControl from './profile-name-control';
import { Button } from '@chakra-ui/button';

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

export const AuthForm = () => (
  <AuthenticationForm
    onChange={noop}
    onComplete={noop}
    onCancel={noop}
    value="test"
  />
);

export const NewProfileForm = () => (
  <NewProfile onCancel={noop} onComplete={noop} />
);

export const NameControl = () => (
  <ProfileNameControl id="123" name="Demo Name" />
);
