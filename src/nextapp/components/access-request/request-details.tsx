import * as React from 'react';
import {
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  Input,
  Select,
  Text,
} from '@chakra-ui/react';
import { AccessRequest } from '@/shared/types/query.types';
import BusinessDetails from './business-details';
import { ErrorBoundary } from 'react-error-boundary';
import EnvironmentTag from '@/components/environment-tag';
import format from 'date-fns/format';
import { uid } from 'react-uid';

import TagInput from '../tag-input';

interface RequestDetailsProps {
  data: AccessRequest;
  labels: string[];
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ data, labels }) => {
  const form = React.useRef(null);
  const newLabelInput = React.useRef<HTMLInputElement>(null);
  const selectRef = React.useRef<HTMLSelectElement>(null);
  const [isAddingNewGroup, setIsAddingNewGroup] = React.useState<number>(-1);
  const [allLabels, setLabels] = React.useState<string[]>(['']);

  const handleCancel = () => {
    setIsAddingNewGroup(-1);
  };
  const handleAddNewRow = () => {
    if (form.current?.checkValidity()) {
      setLabels((state) => [...state, '']);
    }
  };
  const handleAddLabelGroup = (event) => {
    const value = newLabelInput.current?.value;
    if (value) {
      setLabels((state: string[]) => {
        if (state.includes('')) {
          return state.map((label) => {
            if (label === '') {
              return value;
            }
            return label;
          });
        }
        return [...state, value];
      });
      setIsAddingNewGroup(-1);
    } else {
      newLabelInput.current?.reportValidity();
    }
  };
  const handleLabelGroupChange = (index: number) => (event) => {
    const { value } = event.target;
    if (value === '+') {
      setIsAddingNewGroup(index);
    } else {
      setLabels((state) =>
        state.map((s) => {
          if (s === '') {
            return event.target.value;
          }
          return s;
        })
      );
    }
  };

  return (
    <>
      <Grid
        templateColumns="205px 1fr"
        rowGap={3}
        columnGap={2}
        sx={{
          '& dt:after': {
            content: '":"',
          },
        }}
        data-testid="ar-request-details"
      >
        <GridItem as="dt">Environment</GridItem>
        <GridItem as="dd">
          <EnvironmentTag name={data.productEnvironment?.name} />
        </GridItem>
        <GridItem as="dt">Application</GridItem>
        <GridItem as="dd">{data.application.name}</GridItem>
        <GridItem as="dt">Request Date</GridItem>
        <GridItem as="dd">
          <time>{format(new Date(data.createdAt), 'MMM do, yyyy')}</time>
        </GridItem>
        <GridItem as="dt">Business Profile</GridItem>
        <GridItem as="dd">
          <ErrorBoundary
            fallback={
              <Text as="em" color="bc-component" role="alert">
                Unable to load business profile
              </Text>
            }
          >
            <React.Suspense fallback="Loading...">
              <BusinessDetails id={data.serviceAccess?.consumer?.id} />
            </React.Suspense>
          </ErrorBoundary>
        </GridItem>
        <GridItem as="dt">Instructions from the API Provider</GridItem>
        <GridItem as="dd">
          {data.productEnvironment?.additionalDetailsToRequest}
        </GridItem>
        <GridItem as="dt">Requester Comments</GridItem>
        <GridItem as="dd">{data.additionalDetails}</GridItem>
      </Grid>
      <Grid
        ref={form}
        as="form"
        name="labelsForm"
        templateColumns="205px 1fr"
        rowGap={3}
        columnGap={2}
        data-testid="ar-request-details"
      >
        <GridItem colSpan={2}>Labels</GridItem>
        {allLabels.map((l, index) => (
          <React.Fragment key={uid(index)}>
            {isAddingNewGroup !== index && (
              <>
                <GridItem d="flex" alignItems="center">
                  {!l && (
                    <Select
                      isRequired
                      ref={selectRef}
                      placeholder="Select group"
                      name="labelGroup"
                      data-testid="labels-group-select"
                      onChange={handleLabelGroupChange(index)}
                    >
                      <optgroup label="Available Labels">
                        {labels
                          .filter((d) => !allLabels.includes(d))
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
                  {l && <Input readOnly name="labelGroup" value={l} />}
                </GridItem>
                <GridItem>
                  <TagInput
                    isDisabled={!l}
                    name="values"
                    data-testid={`labels-values-${index}`}
                  />
                </GridItem>
              </>
            )}
            {isAddingNewGroup === index && (
              <>
                <GridItem>
                  <Input
                    isRequired
                    name="newLabelGroup"
                    placeholder="Add new Label Group"
                    ref={newLabelInput}
                  />
                </GridItem>
                <GridItem>
                  <ButtonGroup>
                    <Button
                      isRequired
                      variant="secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddLabelGroup}>Add</Button>
                  </ButtonGroup>
                </GridItem>
              </>
            )}
          </React.Fragment>
        ))}
        <GridItem>
          <Button onClick={handleAddNewRow}>Add more labels</Button>
        </GridItem>
      </Grid>
    </>
  );
};

export default RequestDetails;
