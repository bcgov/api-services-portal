import * as React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import AccessRequest from '../access-request';
import { harleyAccessRequest } from '../../../../mocks/resolvers/consumers';
import { renderWithPortal } from '../../../test/utils';

describe('access-request/access-request', () => {
  it('render correctly', async () => {
    renderWithPortal(
      <AccessRequest data={harleyAccessRequest} queryKey="accessRequest" />
    );
    expect(screen.getByTestId('access-request-banner-123')).toBeInTheDocument();
    expect(screen.getByTestId('ar-request-description')).toHaveTextContent(
      'Harley Jones has requested access to Easy Mart Store 1226 days ago'
    );
  });

  it('opens a dialog', async () => {
    renderWithPortal(
      <AccessRequest data={harleyAccessRequest} queryKey="accessRequest" />
    );

    fireEvent.click(screen.getByTestId('ar-review-btn'));
    expect(screen.getByTestId('ar-modal-header')).toHaveTextContent(
      'Easy Mart Store 122'
    );
  });
});
