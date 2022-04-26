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
    (GatewayPlugin | GatewayPluginCreateInput)[],
    React.Dispatch<
      React.SetStateAction<(GatewayPlugin | GatewayPluginCreateInput)[]>
    >
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
      const entries = Object.fromEntries(formData);
      const payload: GatewayPluginCreateInput = {
        name: 'rate-limiting',
        config: JSON.stringify(entries),
        tags: "['consumer']",
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
      setRateLimits((state) => [...state, payload]);
      event.currentTarget.reset();
    }
  };
  const handleRemove = (index: number) => (event) => {
    event.stopPropagation();
    event.preventDefault();
    setRateLimits((state) => state.filter((_, i) => i !== index));
  };
  const handleUpdate = (index: number) => (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const config = Object.fromEntries(form);
    setRateLimits((state) =>
      state.map((r, i) => {
        if (i === index) {
          return {
            ...r,
            config: JSON.stringify(config),
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
            testId="rate-limiting"
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
                config: JSON.parse(r.config) as RateLimitingConfig,
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
                    >
                      <Box flex="1" textAlign="left">
                        {getControlName(r)}
                        <IconButton
                          aria-label="delete restriction"
                          icon={<Icon as={FaTrash} />}
                          variant="ghost"
                          size="sm"
                          onClick={handleRemove(index)}
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
  );
};

export default RateLimiting;
