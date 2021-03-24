import { Box, Center, Icon, Text } from '@chakra-ui/react';
import * as React from 'react';
import { FaPlusCircle } from 'react-icons/fa';

interface AddControlButtonProps {
  children: string;
  icon: React.ElementType<any>;
  onClick: (event: React.MouseEvent) => void;
}
const AddControlButton: React.FC<AddControlButtonProps> = ({
  children,
  icon,
  onClick,
}) => {
  return (
    <Box
      bgColor="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius={6}
      boxShadow="sm"
      role="button"
      onClick={onClick}
      _hover={{
        cursor: 'pointer',
        borderColor: 'blue.400',
      }}
      sx={{
        '&:hover .box-text': {
          borderColor: 'blue.400',
        },
      }}
    >
      <Center m={2}>
        <Icon as={icon} color="bc-blue-alt" boxSize="3rem" />
      </Center>
      <Box
        borderTop="1px solid"
        borderColor="gray.200"
        p={2}
        px={3}
        className="box-text"
      >
        <Text fontSize="sm">
          <Icon as={FaPlusCircle} color="green.500" mr={2} />
          {children}
        </Text>
      </Box>
    </Box>
  );
};

export default AddControlButton;
