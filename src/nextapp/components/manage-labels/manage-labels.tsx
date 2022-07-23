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
  Input,
  Text,
} from '@chakra-ui/react';
import { FaPen } from 'react-icons/fa';
import TagInput from '../tag-input';
import { uid } from 'react-uid';
import { ConsumerLabel } from '@/shared/types/query.types';
import zip from 'lodash/zip';
import { useApi, useApiMutation } from '@/shared/services/api';
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
  const newLabelInput = React.useRef(null);
  const saveLabelsMutation = useApiMutation(mutation);
  const [isAddingNewLabel, setIsAddingNewLabel] = React.useState(false);
  const labelsData = useApi(
    'GetAllConsumerLabels',
    { query },
    { suspense: false }
  );
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [labels, setLabels] = React.useState<ConsumerLabel[]>(() => {
    if (data.length > 0) {
      return data;
    }
    return [];
  });

  const handleLabelGroupChange = (event) => {
    if (event.target.value !== '+') {
      setLabels((state) => [
        ...state,
        {
          labelGroup: event.target.value,
          values: [],
        },
      ]);
    } else {
      setIsAddingNewLabel(true);
      newLabelInput.current?.focus();
    }
  };
  const handleCancelAddLabel = () => {
    setIsAddingNewLabel(false);
  };
  const handleAddNewLabelGroup = (event) => {
    const formData = new FormData(form.current);
    const labelGroup = formData.get('newLabelGroup') as string;
    if (!labelGroup.trim()) {
      newLabelInput.current?.reportValidity();
      return;
    }
    setLabels((state) => [
      ...state,
      {
        labelGroup,
        values: [],
      },
    ]);
    setIsAddingNewLabel(false);
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
              {labels.length === 0 && (
                <GridItem d="grid" placeItems="center" colSpan={2} pb={7}>
                  <Text>You have no labels assigned to this consumer yet.</Text>
                  <Text>Select one below or create a new one.</Text>
                </GridItem>
              )}
              {labels.map((l, index) => (
                <React.Fragment key={uid(l, index)}>
                  <GridItem d="flex" alignItems="center">
                    <Input readOnly name="labelGroup" value={l.labelGroup} />
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
              <GridItem
                d="flex"
                alignItems="center"
                gridGap={2}
                colSpan={isAddingNewLabel ? 2 : undefined}
              >
                {!isAddingNewLabel && (
                  <Select
                    placeholder="Select group"
                    name="labelGroup"
                    isDisabled={labelsData.isLoading}
                    data-testid="labels-group-select"
                    onChange={handleLabelGroupChange}
                  >
                    <optgroup label="Available Labels">
                      {labelsData.data?.allConsumerGroupLabels
                        ?.filter(
                          (l) => !labels.map((l) => l.labelGroup).includes(l)
                        )
                        .map((l) => (
                          <option key={uid(l)} value={l}>
                            {l}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="-----------">
                      <option value="+">[+] Add New Label Group...</option>
                    </optgroup>
                  </Select>
                )}
                {isAddingNewLabel && (
                  <>
                    <Input
                      isRequired
                      name="newLabelGroup"
                      placeholder="Add new Label Group"
                      ref={newLabelInput}
                    />
                    <Button
                      isRequired
                      variant="secondary"
                      onClick={handleCancelAddLabel}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddNewLabelGroup}>Add</Button>
                  </>
                )}
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button isDisabled={isAddingNewLabel} onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ManageLabels;

const query = gql`
  query GetAllConsumerGroupLabels {
    allConsumerGroupLabels
  }
`;

const mutation = gql`
  mutation SaveConsumerLabels($consumerId: ID!, $labels: [JSON]) {
    saveConsumerLabels(consumerId: $consumerId, labels: $labels)
  }
`;
