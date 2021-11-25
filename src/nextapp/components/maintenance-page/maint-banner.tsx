import * as React from 'react';
import cx from 'classnames';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Heading,
  IconButton,
} from '@chakra-ui/react';
import Link from 'next/link';
import Router from 'next/router';

interface HeaderProps {}

const MaintenanceBanner: React.FC<HeaderProps> = ({}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const onNavClick = () => {
    setOpen((state) => !state);
  };

  return (
    <Box>
      <Alert
        status="warning"
        bg="rgb(254, 235, 200)"
        height="65px"
        d="flex"
        pos="fixed"
        top={0}
        w="100%"
        zIndex="1000"
        px={{ base: 4, sm: 16 }}
      >
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>
            The API Services Portal is currently down for maintenance.
          </AlertTitle>
          <AlertDescription display="block">
            We expect to be back shortly. Thank you for your patience.
          </AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
};

export default MaintenanceBanner;
