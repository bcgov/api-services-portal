import * as React from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Icon,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { ExpandableCard } from '@/components/card';
import { FaDoorClosed, FaTrash } from 'react-icons/fa';
import { uid } from 'react-uid';
import {
  GatewayPlugin,
  GatewayPluginCreateInput,
  GatewayRoute,
  GatewayService,
} from '@/shared/types/query.types';

import ScopeControl from './scope-control';
import TagInput from '../tag-input';
import type { IpRestrictionItem, IpRestrictionConfig } from './types';

interface IpRestrictionsProps {
  getControlName: (plugin: unknown) => string;
  routeOptions: GatewayRoute[];
  serviceOptions: GatewayService[];
  state: [
    (GatewayPlugin | GatewayPluginCreateInput)[],
    React.Dispatch<
      React.SetStateAction<(GatewayPlugin | GatewayPluginCreateInput)[]>
    >
  ];
}

const IpRestrictions: React.FC<IpRestrictionsProps> = ({
  getControlName,
  routeOptions,
  serviceOptions,
  state,
}) => {
  const [isError, setError] = React.useState(false);
  const [restrictions, setRestrictions] = state;

  // Events
  const handleRemove = (index: number) => (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setRestrictions(restrictions.filter((_, i) => i !== index));
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(false);

    if (event.currentTarget.checkValidity() && formData.get('allow') !== '[]') {
      const entries = Object.fromEntries(formData);
      const payload: GatewayPluginCreateInput = {
        name: 'ip-restriction',
        config: JSON.stringify({
          allow: entries.allow,
        }),
        tags: '["consumer"]',
      };
      if (entries.scope === 'route') {
        payload.route = {
          connect: {
            id: entries.route as string,
          },
        };
      } else {
        payload.service = {
          connect: {
            id: entries.service as string,
          },
        };
      }
      setRestrictions([...restrictions, payload]);
      event.currentTarget.reset();
    } else {
      setError(true);
    }
  };
  const handleUpdate = (index: number) => (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const allow = form.get('allow');
    setRestrictions(
      restrictions.map((r, i) => {
        if (i === index) {
          return {
            ...r,
            config: JSON.stringify({ allow }),
          };
        }
        return r;
      })
    );
  };

  return (
    <ExpandableCard
      heading="IP Restrictions"
      icon={FaDoorClosed}
      data-testid="ip-restrictions-card"
    >
      <Grid templateColumns="1fr 1fr" gap={9}>
        <form onSubmit={handleSubmit} name="ipRestrictionsForm">
          <ScopeControl
            routeOptions={routeOptions}
            serviceOptions={serviceOptions}
            testId="ip-restriction"
          >
            <FormControl isRequired isInvalid={isError}>
              <FormLabel htmlFor="allow">Allowed IPs</FormLabel>
              <FormHelperText>
                Comma-separated list, i.e. 1.1.1.1, 0.0.0.0
              </FormHelperText>
              <TagInput
                isRequired
                isInvalid={isError}
                name="allow"
                data-testid="allow-ip-restriction-input"
              />
              <FormErrorMessage>IP addresses are required</FormErrorMessage>
            </FormControl>
          </ScopeControl>
          <ButtonGroup mt={9}>
            <Button
              type="reset"
              variant="secondary"
              data-testid="ip-restriction-clear-btn"
            >
              Clear
            </Button>
            <Button type="submit" data-testid="ip-restriction-submit-btn">
              Apply
            </Button>
          </ButtonGroup>
        </form>
        <GridItem>
          <Heading size="sm" fontWeight="normal" mb={3} pl={3}>
            Applied Controls
          </Heading>
          {restrictions.length === 0 && (
            <Text fontStyle="italic" color="bc-component" pl={3}>
              There are no controls applied yet
            </Text>
          )}
          <Accordion reduceMotion data-testid="ip-restrictions-list">
            {restrictions
              .map((r) => ({
                ...r,
                config: JSON.parse(r.config) as IpRestrictionConfig,
              }))
              .map((r: IpRestrictionItem, index: number) => (
                <AccordionItem key={uid(r, index)} border="none" p2={3}>
                  <h2>
                    <AccordionButton
                      px={3}
                      borderLeft="2px solid"
                      borderLeftColor="bc-gray"
                      sx={{
                        _expanded: {
                          borderLeftColor: 'bc-blue',
                        },
                      }}
                      data-testid={`ip-restriction-item-btn-${index}`}
                    >
                      <Box
                        flex="1"
                        textAlign="left"
                        data-testid={`ip-restriction-item-title-${index}`}
                      >
                        {getControlName(r)}
                        <IconButton
                          aria-label="delete restriction"
                          icon={<Icon as={FaTrash} />}
                          variant="ghost"
                          size="sm"
                          onClick={handleRemove(index)}
                          data-testid={`ip-restriction-item-delete-btn-${index}`}
                        />
                      </Box>
                    </AccordionButton>
                  </h2>
                  <AccordionPanel
                    as="form"
                    px={3}
                    pb={3}
                    borderLeft="2px solid"
                    borderLeftColor="bc-gray"
                    onSubmit={handleUpdate(index)}
                    data-testid={`ip-restriction-item-form-${index}`}
                  >
                    <TagInput
                      isRequired
                      name="allow"
                      data-testid={`allow-ip-restriction-input-${index}`}
                      value={r.config.allow}
                    />
                    <Box mt={2}>
                      <Button
                        type="submit"
                        size="sm"
                        data-testid={`ip-restriction-item-save-btn-${index}`}
                      >
                        Save
                      </Button>
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              ))}
          </Accordion>
        </GridItem>
      </Grid>
    </ExpandableCard>
  );
};

export default IpRestrictions;
