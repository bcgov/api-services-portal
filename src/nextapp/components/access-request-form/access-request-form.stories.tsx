import * as React from 'react';

import AccessRequestForm from './access-request-dialog';
import ApplicationSelect from './application-select';

export default {
  title: 'APS/AccessRequestForm',
};

const Template = (props) => <AccessRequestForm {...props} id="1231231231231" />;

export const Dialog = Template.bind({});
Dialog.args = {
  open: true,
};

export const GenerateSecretsTab = Template.bind({});
GenerateSecretsTab.args = {
  open: true,
  defaultTab: 1,
};

export const ApplicationForm = () => <ApplicationSelect />;
