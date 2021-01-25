import * as React from 'react';
import { render } from '../../../test/utils';

import NavBar from '../nav-bar';

describe('components/nav-bar', () => {
  it('should work', () => {
    const links = [{ name: 'Home', url: '/' }];
    const { getByText } = render(<NavBar links={links} pathname="/" />);
    expect(getByText('Home')).toBeTruthy();
  });
});
