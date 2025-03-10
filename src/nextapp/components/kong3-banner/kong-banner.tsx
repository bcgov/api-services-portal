import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  Link,
} from '@chakra-ui/react';
import { IoWarning } from 'react-icons/io5';

interface KongBannerProps {
  text?: React.ReactNode;
  title?: string;
}

const KongBanner: React.FC<KongBannerProps> = ({
  text = (
    <>
      APS is preparing to upgrade to Kong Gateway version 3. For more information, please consult the{' '}
      <Link href="https://developer.gov.bc.ca/docs/default/component/aps-infra-platform-docs/reference/kong3-upgrade/" color="blue.500" fontWeight="bold" isExternal>
        transition guide
      </Link>.
    </>
  ),
  title = 'Kong 3 Upgrade',
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <Box
      data-testid="kong-banner"
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
        pos="relative"
        w="100%"
        border="none"
        color="#6C4A00"
        px={{ base: 4, sm: 16 }}
      >
        <AlertIcon
          as={IoWarning}
          color="inherit"
          boxSize={8}
          aria-label="kong alert icon"
        />
        <Box flex="1">
          <AlertTitle data-testid="kong-banner-title">
            {title}
          </AlertTitle>
          <AlertDescription
            display="block"
            data-testid="kong-banner-description"
          >
            {text}
          </AlertDescription>
        </Box>
        <CloseButton
          position="absolute"
          right={4}
          top={4}
          onClick={() => setIsVisible(false)}
          aria-label="Close banner"
        />
      </Alert>
    </Box>
  );
};

export default KongBanner;
