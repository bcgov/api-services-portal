import * as React from 'react';
import {
  Button,
  Grid,
  GridItem,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Select,
  useToast,
} from '@chakra-ui/react';
import { FaPen } from 'react-icons/fa';
import TagInput from '../tag-input';
import { uid } from 'react-uid';
import { ConsumerLabel } from '@/shared/types/query.types';
import zip from 'lodash/zip';
import { useApiMutation } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { QueryKey, useQueryClient } from 'react-query';

const defaultLabelGroup: ConsumerLabel = {
  labelGroup: '',
  values: [],
};

interface ManageLabelsProps {
  data: ConsumerLabel[];
  id: string;
  queryKey: QueryKey;
}

const ManageLabels: React.FC<ManageLabelsProps> = ({ data, id, queryKey }) => {
  const client = useQueryClient();
  const form = React.useRef(null);
  const saveLabelsMutation = useApiMutation(mutation);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [labels, setLabels] = React.useState<ConsumerLabel[]>(() => {
    if (data.length > 0) {
      return data;
    }
    return [defaultLabelGroup];
  });

  const handleAddLabelSet = () => {
    setLabels((state) => [...state, defaultLabelGroup]);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = new FormData(event.target);
      const labelGroups = data.getAll('labelGroup');
      const values = data.getAll('values');
      const combined = zip(labelGroups, values);
      const labels = combined.reduce((memo, d) => {
        memo.push({
          labelGroup: d[0],
          values: JSON.parse((d[1] as string) ?? '[]'),
        });
        return memo;
      }, []);

      await saveLabelsMutation.mutateAsync({
        consumerId: id,
        labels,
      });
      toast({
        title: 'Labels Updated',
        status: 'success',
      });
      client.invalidateQueries(queryKey);
    } catch (err) {
      toast({
        title: 'Labels Update Failed',
        description: err.message,
        status: 'error',
      });
    }
  };
  const handleSave = () => {
    form.current?.requestSubmit();
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPen} />}
        onClick={onOpen}
        size="sm"
        variant="link"
        color="bc-blue"
      >
        Manage Labels
      </Button>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
        size="3xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Labels</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid
              templateColumns="215px 1fr"
              rowGap={3}
              columnGap={2}
              mb={7}
              sx={{
                '& dt:after': {
                  content: '":"',
                },
              }}
              data-testid="ar-request-details"
            >
              <GridItem as="dt">Instructions from the API Provider</GridItem>
              <GridItem as="dd">-</GridItem>
              <GridItem as="dt">Requester Comments</GridItem>
              <GridItem as="dd">-</GridItem>
            </Grid>
            <Grid
              as="form"
              ref={form}
              templateColumns="215px 1fr"
              rowGap={3}
              columnGap={2}
              onSubmit={handleSubmit}
              sx={{
                '& dt:after': {
                  content: '":"',
                },
              }}
              data-testid="ar-request-details"
            >
              <GridItem colSpan={2}>Labels</GridItem>
              {labels.map((l, index) => (
                <React.Fragment key={uid(l, index)}>
                  <GridItem>
                    <Select
                      placeholder="Select group"
                      defaultValue={l.labelGroup}
                      name="labelGroup"
                      data-testid={`labels-group-${index}-select`}
                    >
                      <option value="Facility">Facility</option>
                      <option value="Contact Person">Contact Person</option>
                      <option value="Phone Number">Phone Number</option>
                    </Select>
                  </GridItem>
                  <GridItem>
                    <TagInput
                      value={l.values}
                      name="values"
                      data-testid={`labels-values-${index}`}
                    />
                  </GridItem>
                </React.Fragment>
              ))}
              <GridItem>
                <Button w="100%" onClick={handleAddLabelSet}>
                  Add more labels
                </Button>
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ManageLabels;

const mutation = gql`
  mutation SaveConsumerLabels($consumerId: ID!, $labels: [JSON]) {
    saveConsumerLabels(consumerId: $consumerId, labels: $labels)
  }
`;
