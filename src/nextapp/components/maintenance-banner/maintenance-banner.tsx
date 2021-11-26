import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
} from '@chakra-ui/react';
import { IoWarning } from 'react-icons/io5';
import { useAuth } from '@/shared/services/auth';

const MaintenanceBanner: React.FC = () => {
  const { maintenance } = useAuth();

  if (!maintenance) {
    return null;
  }

  return (
    <Box
      sx={{
        '& + header': {
          top: '120px',
          '@media(min-width: 30em)': {
            top: '100px',
          },
          '& + nav': {
            top: '185px',
            '@media(min-width: 30em)': {
              top: '165px',
            },
            '& + main': {
              mt: '185px',
              '@media(min-width: 30em)': {
                mt: '210px',
              },
            },
          },
        },
      }}
    >
      <Alert
        status="warning"
        height={{ base: '120px', sm: '100px' }}
        bgColor="#F9F1C6"
        d="flex"
        pos="fixed"
        top={0}
        left={0}
        w="100%"
        zIndex="1000"
        border="none"
        color="#6C4A00"
        px={{ base: 4, sm: 16 }}
      >
        <AlertIcon as={IoWarning} color="inherit" boxSize={8} />
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
