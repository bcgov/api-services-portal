import * as React from 'react';
import {
  Box,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface StatusBannerProps {
  status?: 'pending' | 'rejected' | 'approved';
  children: Text;
}

const StatusBanner: React.FC<StatusBannerProps> = ({ status, children }) => {
  function getIcon() {
    let icon, color;
    switch (status) {
      case 'pending':
        icon = FaClock;
        color = 'bc-yellow';
        break;
      case 'rejected':
        icon = FaTimesCircle;
        color = 'bc-error';
        break;
      case 'approved':
        icon = FaCheckCircle;
        color = 'bc-success';
        break;
      default:
        icon = FaClock;
        color = 'bc-yellow';
        break;
    }
    return <Icon as={icon} color={color} w={25} h={25} />;
  }

  return (
    <HStack bgColor="bc-gray" spacing="12px" p={3} w="100%" rounded="lg">
      {getIcon()}
      <Box>
        {children}
      </Box>
    </HStack>
  );
};

export default StatusBanner;
