import * as React from 'react';
import { Button, Icon } from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';

interface InternalLinkProps {
  children: React.ReactNode;
  href: string;
}

const InternalLink: React.FC<InternalLinkProps> = ({ children, href }) => {
  if (href.startsWith('http')) {
    return (
      <>
        <Button
          as="a"
          href={href}
          target="_blank"
          rightIcon={<Icon as={FaExternalLinkAlt} boxSize={3} />}
          variant="link"
        >
          {children}
        </Button>
      </>
    );
  } else {
    return (
      <>
        <Button as="a" href={href} variant="link">
          {children}
        </Button>
      </>
    );
  }
};

export default InternalLink;
