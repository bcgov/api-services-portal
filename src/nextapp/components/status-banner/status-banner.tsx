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
// TODO: background color; reach out to Josh and see if on right path.

interface StatusBannerProps extends AlertProps {
  children: React.ReactNode;
  dismissable: boolean;
  status?: AlertStatus;
  title?: string;
}
const StatusBanner: React.FC<StatusBannerProps> = ({
  children,
  dismissable,
  // status = 'info',
  title,
  ...props
}) => {
  return (
    <Alert borderRadius="md" {...props}>
      <AlertIcon />
      <Box flex="1">
        {title && (
          <AlertTitle mr={2} fontWeight="normal" fontSize="2xl">
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



// import * as React from 'react';
// import {
//   Box,
//   HStack,
//   Icon
// } from '@chakra-ui/react';
// import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// interface StatusBannerProps {
//   status?: 'pending' | 'rejected' | 'approved';
//   children: Text;
// }

// const StatusBanner: React.FC<StatusBannerProps> = ({ status, children }) => {
//   function getIcon() {
//     let icon, color;
//     switch (status) {
//       case 'pending':
//         icon = FaClock;
//         color = 'bc-yellow';
//         break;
//       case 'rejected':
//         icon = FaTimesCircle;
//         color = 'bc-error';
//         break;
//       case 'approved':
//         icon = FaCheckCircle;
//         color = 'bc-success';
//         break;
//       default:
//         icon = FaClock;
//         color = 'bc-yellow';
//         break;
//     }
//     return <Icon as={icon} color={color} w={25} h={25} />;
//   }

//   return (
//     <HStack bgColor="bc-gray" spacing="12px" p={3} w="100%" rounded="lg">
//       {getIcon()}
//       <Box>
//         {children}
//       </Box>
//     </HStack>
//   );
// };

// export default StatusBanner;
