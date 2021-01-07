/** @jsx jsx */
import { jsx } from '@emotion/core';

import { gridSize } from '@arch-ui/theme';

export const HeaderInset = props => (
    <div css={{ paddingLeft: gridSize * 2, paddingRight: gridSize * 2 }} {...props} />
);

