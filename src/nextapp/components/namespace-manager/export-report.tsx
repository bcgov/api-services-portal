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
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { FaDownload, FaTimesCircle } from 'react-icons/fa';

interface ExportReportProps {
  isAllSelected: boolean;
  onComplete: () => void;
  onSubmit: () => boolean;
  selected: string[];
}

const ExportReport: React.FC<ExportReportProps> = ({
  isAllSelected,
  onComplete,
  onSubmit,
  selected,
}) => {
  const [isError, setError] = React.useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => setError(false),
  });
  const search = React.useMemo(() => {
    if (!isAllSelected) {
      const params = new URLSearchParams({
        ids: JSON.stringify(selected),
      });
      return params.toString();
    }
    return '';
  }, [isAllSelected, selected]);

  const handleDownload = async () => {
    try {
      const req = await fetch(`/int/api/namespaces/report?${search}`);
      const blob = await req.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('download', 'namespace-report.xlsx');
      link.setAttribute('href', href);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      onComplete();
    } catch {
      setError(true);
    }
  };
  const handleSubmit = () => {
    const isValid = onSubmit();
    if (isValid) {
      onOpen();
      handleDownload();
    }
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaDownload} />}
        onClick={handleSubmit}
        data-testid="export-report-export-btn"
      >
        Export to Excel
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exporting Reports</ModalHeader>
          <ModalBody pt={8}>
            {isError && (
              <Alert
                status="error"
                mt={5}
                variant="outline"
                borderRadius="md"
                data-testid="export-report-error-message"
              >
                <AlertIcon as={FaTimesCircle} />
                <AlertDescription>Unable to generate keys</AlertDescription>
              </Alert>
            )}

            {!isError && <Progress isIndeterminate color="bc-blue" size="md" />}
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              onClick={onClose}
              variant="secondary"
              data-testid="export-report-cancel-btn"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ExportReport;
