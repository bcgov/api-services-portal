import * as React from 'react';

import GenerateCredential from './generate-credential';

export default {
  title: 'APS/GenerateCredential',
};

export const SuccessResponse = () => <GenerateCredential id="123" />;
export const FailedResponse = () => <GenerateCredential />;
