import * as React from 'react';
import { Box, Container, Divider, Grid, Heading, Icon, Link, Text } from '@chakra-ui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import Card from '@/components/card';
import GridLayout from '@/layouts/grid';
import {
    FaServer,
} from 'react-icons/fa';
  
import { useAuth } from '@/shared/services/auth';

type HomeActions = {
    title: string;
    url: string;
    icon: React.ComponentType;
    roles: string[];
    description: string;
  };

  const actions: HomeActions[] = [
    {
        title: 'Gateway Services',
        url: '/manager/services',
        icon: FaServer,
        roles: [],
        description: "View your current gateway configuration, metrics and traffic patterns"
    },
    {
      title: 'Products',
      url: '/manager/products',
      icon: FaServer,
      roles: [],
      description: "Publish your API and make it discoverable"
    },
    {
        title: 'Consumers',
        url: '/manager/consumers',
        icon: FaServer,
        roles: [],
        description: "Manage your prospective and existing clients - add controls, approve access, view usage"
    }
    ];

    const secondaryActions: HomeActions[] = [
        {
            title: 'Authorization Profiles',
            url: '/manager/poc/credential-issuers',
            icon: FaServer,
            roles: [],
            description: "Manage authorization servers used to protect your APIs"
        },
        {
            title: 'Service Accounts',
            url: '/manager/poc/service-accounts',
            icon: FaServer,
            roles: [],
            description: "Manage service accounts for performing functions on the namespace"
        },
        {
            title: 'Activity',
            url: '/manager/poc/activity',
            icon: FaServer,
            roles: [],
            description: "View all the activity within your namepace."
        },
    ];
    
const Navigation = () => {
    const { user } = useAuth()

    return (
    <Container maxW="6xl">
        <Box
            display="grid"
            gridGap={4}
            gridTemplateColumns="repeat(12, 1fr)"
        >
            <Box gridColumn="span 10">
                <GridLayout>
                {actions
                    .filter(
                    (action) =>
                        user?.roles.some((r: string) => action.roles.includes(r)) ||
                        action.roles.length === 0
                    )
                    .map((action) => (
                    <Card key={action.url}>
                        <Heading size="md" mb={2}>
                            <NextLink passHref href={action.url}>
                                <Link color="bc-link" display="flex" alignItems="center">
                                    <Icon as={action.icon} color="bc-yellow" mr={2} />
                                    {action.title}
                                </Link>
                            </NextLink>
                        </Heading>
                        <p>
                        {action.description}
                        </p>
                    </Card>
                    ))}
                </GridLayout>
            </Box>

            <Box gridColumn="span 2">
                <Text>Other Actions:</Text>

                <Grid gap={0}>
                {secondaryActions
                    .filter(
                    (action) =>
                        user?.roles.some((r: string) => action.roles.includes(r)) ||
                        action.roles.length === 0
                    )
                    .map((action) => (
                    <Box key={action.url}>
                        <Heading size="sm" mb={2}>
                            <NextLink passHref href={action.url}>
                                <Link color="bc-link" display="flex" alignItems="center">
                                    <Icon as={action.icon} color="bc-blue" mr={2} />
                                    {action.title}
                                </Link>
                            </NextLink>
                        </Heading>
                    </Box>
                    ))}
                </Grid>
            </Box>

        </Box>
    </Container>
    )
}

export default Navigation;


