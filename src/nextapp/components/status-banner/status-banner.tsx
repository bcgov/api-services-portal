import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertStatus,
  AlertTitle,
  AlertProps,
  Box,
  CloseButton,
} from '@chakra-ui/react';

// Alert GitHub repo:
// https://github.com/chakra-ui/chakra-ui/blob/main/packages/theme/src/components/alert.ts

interface StatusBannerProps extends AlertProps {
  children: React.ReactNode;
  dismissable: boolean;
  status?: AlertStatus;
  title?: string;
}
const StatusBanner: React.FC<StatusBannerProps> = ({
  children,
  dismissable,
  title,
  ...props
}) => {
  return (
    <Alert borderRadius="md" {...props} >
      <AlertIcon />
      <Box flex="1">
        {title && (
          <AlertTitle mr={2} fontWeight="normal">
            {title}
          </AlertTitle>
        )}
        <AlertDescription>{children}</AlertDescription>
      </Box>
      {dismissable && <CloseButton position="absolute" right="8px" top="8px" />}
    </Alert>
  );
};
export default StatusBanner;
