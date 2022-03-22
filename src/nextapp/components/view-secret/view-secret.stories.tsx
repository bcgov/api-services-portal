import { Textarea } from '@chakra-ui/textarea';
import * as React from 'react';

import ViewSecret from './view-secret';

export default {
  title: 'APS/ViewSecret',
};

const Template = (props) => (
  <>
    <ViewSecret {...props} />
    <Textarea placeholder="Try pasting here" />
  </>
);

export const All = Template.bind({});
All.args = {
  credentials: {
    clientId: 'dkf39393p',
    clientSecret: '2fjoifj438r39hgreuigh293hfg9',
    clientPrivateKey: '23jkd976dcyvbmeke9d3ht',
    clientPublicKey: '024ijfoerifosefjsfj',
    issuer: 'oidc-issuer',
    tokenEndpoint: 'http://endpoint.com',
  },
};
