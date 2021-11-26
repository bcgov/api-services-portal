import * as React from 'react';
import {
  Button,
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  Icon,
  Box,
  Text,
  Link,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { FaDownload } from 'react-icons/fa';

interface ExportReportProps {}

const ExportReport: React.FC<ExportReportProps> = ({}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        leftIcon={<Icon as={FaDownload} />}
        variant="secondary"
        onClick={onOpen}
      >
        <Link href="/int/api/namespaces/report" download>
          Export Report
        </Link>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generating Report</ModalHeader>
          <ModalBody>
            <VStack>
              <Text>
                The report can take a minute or two to create. After the report
                is generated, it will be automatically downloaded.
              </Text>
              <Box>
                <CircularProgress isIndeterminate color="green.300" />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ExportReport;
