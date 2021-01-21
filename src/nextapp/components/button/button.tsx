import * as React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';

interface ButtonProps {
  color?: 'primary' | 'secondary';
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  color = 'primary',
  children,
  href,
  onClick,
}) => {
  const handleClick = React.useCallback(() => {
    if (href) {
      window.open(href, '_self');
    } else {
      onClick();
    }
  }, [href, onClick]);

  return (
    <ChakraButton variant={color} borderRadius={4} onClick={handleClick}>
      {children}
    </ChakraButton>
  );
};

export default Button;
