import * as React from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  ListItem,
  Radio,
  RadioGroup,
  Select,
  Text,
  UnorderedList,
  useToast,
} from '@chakra-ui/react';
import { ExpandableCards, ExpandableCard } from '@/components/card';
import { FaDoorClosed, FaTrash } from 'react-icons/fa';
import { HiChartBar } from 'react-icons/hi';
import startCase from 'lodash/startCase';
import { gql } from 'graphql-request';
import { uid } from 'react-uid';
import { useApi } from '@/shared/services/api';

import type {
  IpRestrictionPayload,
  RateLimitingConfig,
  RateLimitingForm,
  RateLimitingPayload,
} from './types';
import TagInput from '../tag-input';

interface ControlsProps {
  onUpdateRateLimits: (payload: RateLimitingPayload) => void;
  onUpdateRestrictions: (payload: IpRestrictionPayload, index?: number) => void;
  rateLimits: RateLimitingPayload[];
  restrictions: IpRestrictionPayload[];
}

const Controls: React.FC<ControlsProps> = ({
  rateLimits,
  restrictions,
  onUpdateRateLimits,
  onUpdateRestrictions,
}) => {
  const toast = useToast();
  const [restrictionType, setRestrictionType] = React.useState('service');
  const [rateLimitingType, setRateLimitingType] = React.useState('service');
  const { data, isLoading } = useApi(
    'consumerControls',
    { query },
    { suspense: false }
  );

  // Map the options for each of the route/service dropdowns
  const ipRestrictionOptions = React.useMemo(() => {
    if (data?.allGatewayServicesByNamespace) {
      if (restrictionType === 'route') {
        return data.allGatewayServicesByNamespace.map((s) => s.routes).flat();
      } else {
        return data.allGatewayServicesByNamespace;
      }
    }
    return [];
  }, [data, restrictionType]);
  const rateLimitingOptions = React.useMemo(() => {
    if (data?.allGatewayServicesByNamespace) {
      if (rateLimitingType === 'route') {
        return data.allGatewayServicesByNamespace.map((s) => s.routes).flat();
      } else {
        return data.allGatewayServicesByNamespace;
      }
    }
    return [];
  }, [data, rateLimitingType]);
  // Look up a service or route based on the control. Returns a name
  const getControlName = (control): string => {
    if (!data?.allGatewayServicesByNamespace) {
      return '';
    }
    if (control.name === 'rate-limiting') {
      if (control.config.service) {
        return data.allGatewayServicesByNamespace.find(
          (d) => d.extForeignKey === control.config.service
        )?.name;
      }
      return data.allGatewayServicesByNamespace
        .map((s) => s.routes)
        .flat()
        .find((d) => d.extForeignKey === control.config.route)?.name;
    } else {
      if (control.service) {
        console.log(data.allGatewayServicesByNamespace, control.service.id);
        return data.allGatewayServicesByNamespace.find(
          (d) => d.extForeignKey === control.service.id
        )?.name;
      } else {
        return data.allGatewayServicesByNamespace
          .map((s) => s.routes)
          .flat()
          .find((d) => d.extForeignKey === control.route.id)?.name;
      }
    }
  };

  // Events
  const handleRemoveRestriction = (config: IpRestrictionPayload) => (event) => {
    event.stopPropagation();
    event.preventDefault();
    onUpdateRestrictions(config);
  };
  const handleRemoveRateLimiting = (config: RateLimitingPayload) => (event) => {
    event.stopPropagation();
    event.preventDefault();
    onUpdateRateLimits(config);
  };
  const handleRateLimitingSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (event.currentTarget.checkValidity()) {
      const formData = new FormData(event.currentTarget);
      const entries = Object.fromEntries(formData) as any;
      const payload: RateLimitingPayload = {
        name: 'rate-limiting',
        protocols: ['http', 'https'],
        config: {
          second: entries.second,
          minute: entries.minute,
          hour: entries.hour,
          day: entries.day,
          policy: entries.policy,
          service: entries.service,
          route: entries.route,
        },
        tags: [],
      };
      if (entries.scope === 'route') {
        payload.route = {
          id: entries.route,
        };
      } else {
        payload.service = {
          id: entries.service,
        };
      }
      onUpdateRateLimits(payload);
      event.currentTarget.reset();
    }
  };
  const handleIpRestrictionSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (event.currentTarget.checkValidity() && formData.get('allow') !== '[]') {
      const entries = Object.fromEntries(formData);
      const payload: IpRestrictionPayload = {
        name: 'ip-restriction',
        config: {
          allow: entries.allow as string,
        },
        tags: ['consumer'],
      };
      if (entries.scope === 'route') {
        payload.route = {
          id: entries.route as string,
        };
      } else {
        payload.service = {
          id: entries.service as string,
        };
      }
      onUpdateRestrictions(payload);
      event.currentTarget.reset();
    } else {
      toast({
        status: 'error',
        title: 'Missing allowed IP address entries',
      });
    }
  };
  const handleRestrictionUpdate = React.useCallback(
    (config, index: number) => (event: React.FormEvent<HTMLDivElement>) => {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);
      const allow = formData.get('allow');
      const payload = {
        ...config,
        config: {
          allow,
        },
      };
      onUpdateRestrictions(payload, index);
    },
    [onUpdateRestrictions]
  );

  return (
    <Box>
      <ExpandableCards>
        <ExpandableCard
          heading="IP Restrictions"
          icon={FaDoorClosed}
          data-testid="ip-restrictions-card"
        >
          <Grid templateColumns="1fr 1fr" gap={9}>
            <form
              onSubmit={handleIpRestrictionSubmit}
              name="ipRestrictionsForm"
            >
              <FormControl mb={5}>
                <FormLabel>Scope</FormLabel>
                <RadioGroup
                  name="scope"
                  onChange={setRestrictionType}
                  value={restrictionType}
                >
                  <HStack spacing={4}>
                    <Radio
                      value="service"
                      data-testid="ip-restriction-service-radio"
                    >
                      Service
                    </Radio>
                    <Radio
                      value="route"
                      data-testid="ip-restriction-route-radio"
                    >
                      Route
                    </Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              <Box as="fieldset" borderLeft="1px solid" borderColor="ui" px={4}>
                <Select
                  isDisabled={isLoading}
                  mb={5}
                  name={restrictionType}
                  data-testid="ip-restriction-service-dropdown"
                >
                  {ipRestrictionOptions.map((s) => (
                    <option key={uid(s.id)} value={s.extForeignKey}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <FormControl isRequired>
                  <FormLabel>Allowed IPs</FormLabel>
                  <FormHelperText>
                    Comma-separated list, i.e. 1.1.1.1, 0.0.0.0
                  </FormHelperText>
                  <TagInput
                    isRequired
                    name="allow"
                    data-testid="allow-ip-restriction-input"
                  />
                </FormControl>
              </Box>
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
              <Accordion reduceMotion>
                {restrictions.map((r, index) => (
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
                      >
                        <Box flex="1" textAlign="left">
                          {getControlName(r)}
                          <IconButton
                            aria-label="delete restriction"
                            icon={<Icon as={FaTrash} />}
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveRateLimiting(r)}
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
                      onSubmit={handleRestrictionUpdate(r, index)}
                    >
                      <TagInput
                        isRequired
                        name="allow"
                        data-testid="allow-ip-restriction-input"
                        value={r.config.allow}
                      />
                      <Box mt={2}>
                        <Button type="submit" size="sm">
                          Apply
                        </Button>
                      </Box>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </GridItem>
          </Grid>
        </ExpandableCard>
        <ExpandableCard
          heading="Rate Limiting"
          icon={HiChartBar}
          data-testid="ratelimit-card"
        >
          <Grid templateColumns="1fr 1fr" gap={9}>
            <form onSubmit={handleRateLimitingSubmit} name="rateLimitingForm">
              <FormControl mb={5}>
                <FormLabel>Scope</FormLabel>
                <RadioGroup
                  name="scope"
                  onChange={setRateLimitingType}
                  value={rateLimitingType}
                >
                  <HStack spacing={4}>
                    <Radio
                      value="service"
                      data-testid="ratelimit-service-radio"
                    >
                      Service
                    </Radio>
                    <Radio value="route" data-testid="ratelimit-route-radio">
                      Route
                    </Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              <Box
                as="fieldset"
                borderLeft="1px solid"
                borderColor="ui.500"
                px={4}
              >
                <Select
                  isDisabled={isLoading}
                  mb={5}
                  name={rateLimitingType}
                  data-testid="ratelimit-service-dropdown"
                >
                  {rateLimitingOptions.map((s) => (
                    <option key={uid(s.id)} value={s.extForeignKey}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <HStack spacing={5} mb={5}>
                  {['second', 'minute', 'hour', 'day'].map((t) => (
                    <FormControl key={t}>
                      <FormLabel>{startCase(t)}</FormLabel>
                      <Input
                        placeholder="00"
                        type="number"
                        name={t}
                        data-testid={`ratelimit-${t}-input`}
                      />
                    </FormControl>
                  ))}
                </HStack>
                <FormControl>
                  <FormLabel>Policy</FormLabel>
                  <Select name="policy" data-testid="ratelimit-policy-dropdown">
                    <option value="local">Local</option>
                    <option value="redis">Redis</option>
                  </Select>
                </FormControl>
              </Box>
              <ButtonGroup mt={9}>
                <Button
                  type="reset"
                  variant="secondary"
                  data-testid="ratelimit-clear-btn"
                >
                  Clear
                </Button>
                <Button type="submit" data-testid="ratelimit-submit-btn">
                  Apply
                </Button>
              </ButtonGroup>
            </form>
            <GridItem>
              <Heading size="sm" fontWeight="normal" mb={3}>
                Controls
              </Heading>
              {rateLimits.length === 0 && (
                <Text fontStyle="italic" color="bc-component">
                  There are no controls applied yet
                </Text>
              )}
              <Accordion reduceMotion>
                {rateLimits.map((r, index) => (
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
                      >
                        <Box flex="1" textAlign="left">
                          {getControlName(r)}
                          <IconButton
                            aria-label="delete restriction"
                            icon={<Icon as={FaTrash} />}
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveRestriction(r)}
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
                      onSubmit={handleRestrictionUpdate(r, index)}
                    >
                      <HStack spacing={5} mb={5}>
                        {['second', 'minute', 'hour', 'day'].map((t) => (
                          <FormControl key={t}>
                            <FormLabel>{startCase(t)}</FormLabel>
                            <Input
                              defaultValue={r.config[t]}
                              placeholder="00"
                              type="number"
                              name={t}
                              data-testid={`ratelimit-${t}-input`}
                            />
                          </FormControl>
                        ))}
                      </HStack>
                      <FormControl>
                        <FormLabel>Policy</FormLabel>
                        <Select
                          name="policy"
                          defaultValue={r.config.policy as string}
                          data-testid="ratelimit-policy-dropdown"
                        >
                          <option value="local">Local</option>
                          <option value="redis">Redis</option>
                        </Select>
                      </FormControl>
                      <Box mt={2}>
                        <Button type="submit" size="sm">
                          Apply
                        </Button>
                      </Box>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </GridItem>
          </Grid>
        </ExpandableCard>
      </ExpandableCards>
    </Box>
  );
};

export default Controls;

const query = gql`
  query GetControlContent {
    allGatewayServicesByNamespace {
      id
      name
      extForeignKey
      routes {
        id
        name
        extForeignKey
      }
    }
  }
`;
