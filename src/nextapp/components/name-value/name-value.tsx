import * as React from 'react';

import cx from 'classnames';

import { Flex, Box } from "@chakra-ui/react"

interface NameValueProps {
  name: string;
  value: any;
  width: string;
}

const NameValue: React.FC<NameValueProps> = ({ name, value, width }) => {
  const style = {}
  style['width'] = width
  return (
    <Flex>
      <Box style={style}><b>{name}</b></Box>
      <Box >{value}</Box>
    </Flex>
  );
};

export default NameValue;