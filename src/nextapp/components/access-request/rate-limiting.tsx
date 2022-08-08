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
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  Text,
} from '@chakra-ui/react';
import { ExpandableCard } from '@/components/card';
import { FaTrash } from 'react-icons/fa';
import { HiChartBar } from 'react-icons/hi';
import startCase from 'lodash/startCase';
import { uid } from 'react-uid';
import {
  ConsumerPlugin,
  GatewayPlugin,
  GatewayPluginCreateInput,
  GatewayRoute,
  GatewayService,
} from '@/shared/types/query.types';

import ScopeControl from './scope-control';
import type { RateLimitingConfig, RateLimitingItem } from './types';

interface RateLimitingProps {
  getControlName: (plugin: unknown) => string;
  routeOptions: GatewayRoute[];
  serviceOptions: GatewayService[];
  state: [
    ConsumerPlugin[],
    React.Dispatch<React.SetStateAction<ConsumerPlugin[]>>
  ];
}

const RateLimiting: React.FC<RateLimitingProps> = ({
  getControlName,
  routeOptions,
  serviceOptions,
  state,
}) => {
  const [rateLimits, setRateLimits] = state;
  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (event.currentTarget.checkValidity()) {
      const { route, service, scope, ...entries } = Object.fromEntries(
        formData
      );
      ['second', 'minute', 'hour', 'day'].forEach((k) => {
        entries[k] = entries[k] === '' ? null : (Number(entries[k]) as any);
      });
      const payload: ConsumerPlugin = {
        name: 'rate-limiting',
        config: entries,
      };
      if (scope === 'route') {
        payload.route = {
          id: route as string,
        };
      } else {
        payload.service = {
          id: service as string,
        };
      }
      setRateLimits([...rateLimits, payload]);
      event.currentTarget.reset();
    }
  };
  const handleRemove = (index: number) => (event) => {
    event.stopPropagation();
    event.preventDefault();
    setRateLimits(rateLimits.filter((_, i) => i !== index));
  };
  const handleUpdate = (index: number) => (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const config: any = Object.fromEntries(form);
    ['second', 'minute', 'hour', 'day'].forEach((k) => {
      config[k] = Number(config[k]) === 0 ? null : Number(config[k]);
    });

    setRateLimits(
      rateLimits.map((r, i) => {
        if (i === index) {
          return {
            ...r,
            config,
          };
        }
        return r;
      })
    );
  };

  return (
    <ExpandableCard
      heading="Rate Limiting"
      icon={HiChartBar}
      data-testid="ratelimit-card"
    >
      <Grid templateColumns="1fr 1fr" gap={9}>
        <form onSubmit={handleCreate} name="rateLimitingForm">
          <ScopeControl
            routeOptions={routeOptions}
            serviceOptions={serviceOptions}
            testId="ratelimit"
          >
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
          </ScopeControl>
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
            {rateLimits
              .map((r) => ({
                ...r,
                config: r.config as RateLimitingConfig,
              }))
              .map((r: RateLimitingItem, index) => (
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
                      data-testid={`ratelimit-item-btn-${index}`}
                    >
                      <Box
                        flex="1"
                        textAlign="left"
                        data-testid={`ratelimit-item-title-${index}`}
                      >
                        {getControlName(r)}
                        <IconButton
                          aria-label="delete restriction"
                          icon={<Icon as={FaTrash} />}
                          variant="ghost"
                          size="sm"
                          onClick={handleRemove(index)}
                          data-testid={`ratelimit-item-delete-btn-${index}`}
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
                    data-testid={`ratelimit-item-form-${index}`}
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
                            data-testid={`ratelimit-item-form-${t}-input-${index}`}
                          />
                        </FormControl>
                      ))}
                    </HStack>
                    <FormControl>
                      <FormLabel>Policy</FormLabel>
                      <Select
                        name="policy"
                        defaultValue={r.config.policy as string}
                        data-testid={`ratelimit-item-form-policy-dropdown-${index}`}
                      >
                        <option value="local">Local</option>
                        <option value="redis">Redis</option>
                      </Select>
                    </FormControl>
                    <Box mt={2}>
                      <Button
                        type="submit"
                        size="sm"
                        data-testid={`ratelimit-item-save-btn-${index}`}
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

export default RateLimiting;
