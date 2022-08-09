import * as React from 'react';
import { render, screen } from '@testing-library/react';

import NavBar from '../nav-bar';

describe('components/nav-bar', () => {
  it('should work', () => {
    const links = [{ name: 'Home', url: '/', access: [], sites: ['any'] }];
    const { getByText } = render(
      <NavBar site="any" links={links} pathname="/" />
    );
    expect(getByText('Home')).toBeTruthy();
  });
});
