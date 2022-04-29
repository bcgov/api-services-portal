import * as React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  Icon,
  useDisclosure,
  Progress,
} from '@chakra-ui/react';
import { FaDownload } from 'react-icons/fa';

// TODO: Investigate this api https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/download
interface ExportReportProps {
  onSubmit: () => boolean;
  selected: string[];
}

const ExportReport: React.FC<ExportReportProps> = ({ onSubmit, selected }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const search = React.useMemo(() => {
    const params = new URLSearchParams({
      ids: JSON.stringify(selected),
    });
    return params.toString();
  }, [selected]);

  const handleSubmit = () => {
    const isValid = onSubmit();
    if (isValid) {
      onOpen();
    }
  };

  return (
    <>
      <Button
        download
        href={`/int/api/namespaces/report?${search}`}
        leftIcon={<Icon as={FaDownload} />}
        onClick={handleSubmit}
      >
        Export to Excel
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exporting Reports</ModalHeader>
          <ModalBody pt={8}>
            <Progress isIndeterminate color="bc-blue" size="md" />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="secondary">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ExportReport;
