import * as React from 'react';
import { Flex, Icon, Text } from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaClock,
  FaQuestionCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import isUndefined from 'lodash/isUndefined';

interface AccessStatusProps {
  isApproved: boolean;
  isComplete: boolean;
  isIssued: boolean;
}

const AccessStatus: React.FC<AccessStatusProps> = ({
  isApproved,
  isComplete,
  isIssued,
}) => {
  const { color, icon, text } = React.useMemo(() => {
    let color = 'blue.500';
    let icon = FaQuestionCircle;
    let text = 'Queued';
    const isServiceAccess = [isApproved, isComplete, isIssued].every(
      isUndefined
    );

    if (isServiceAccess || isApproved) {
      color = 'bc-success';
      icon = FaCheckCircle;
      text = 'Approved';
    } else if (isIssued && !isComplete && !isApproved) {
      color = 'bc-error';
      icon = FaTimesCircle;
      text = 'Rejected';
    } else if (isIssued && isComplete && !isApproved) {
      color = 'bc-yellow';
      icon = FaClock;
      text = 'Pending Approval';
    }

    return {
      color,
      icon,
      text,
    };
  }, [isApproved, isComplete, isIssued]);

  return (
    <Flex align="center" className="access-status">
      <Icon
        as={icon}
        className="access-status-icon"
        mr={2}
        boxSize={6}
        color={color}
      />
      <Text className="access-status-text">{text}</Text>
    </Flex>
  );
};

export default AccessStatus;
