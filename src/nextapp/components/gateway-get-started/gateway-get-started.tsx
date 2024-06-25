import Card from '@/components/card';
import CliCommand from '@/components/cli-command';
import {
  Box,
  Code,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Link, 
  Text,
  VStack
} from '@chakra-ui/react';
import React from 'react';
import {
  FaChartLine,
  FaLock,
  FaSearch
} from 'react-icons/fa';
import { useGlobal } from '@/shared/services/global';

function SmoothScrollLink({ href, children }) {
  const handleClick = (event) => {
    event.preventDefault();
    const targetId = href.substring(1); // Remove the # from href to get the target id
    const target = document.getElementById(targetId);
    if (target) {
      const yOffset = -120; // You may adjust this value to offset the scroll position if needed
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <Link 
      href={href}
      color="bc-link"
      textDecor="underline"
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}

const GatewayGetStarted: React.FC = () => {
  const global = useGlobal();
  const GlossaryUrl = global?.helpLinks.helpSupportUrl + 'reference/glossary'
  const QuickStartUrl = global?.helpLinks.helpSupportUrl + 'tutorials/quick-start'
  const GwaInstallUrl = global?.helpLinks.helpSupportUrl + 'how-to/gwa-install'
  const GwaCommandsUrl = global?.helpLinks.helpSupportUrl + 'resources/gwa-commands'

  return (
    <>
      <Card mb={8} px={12} py={8}>
        <VStack align="center" justifyContent="center" gridGap={2} pb={6}>
          <img
            src="/images/empty_folder.png"
            width={85}
            height={85}
            title="Empty folder"
            alt="Empty folder"
          />
          <Heading size="md">No gateways created yet</Heading>
        </VStack>
        <Heading size="lg">What is a gateway?</Heading>
        <Text pt={6} pb={8}>
          A gateway acts as a central entry point for multiple APIs. Its main purpose is to facilitate communication and control the data flow between your APIs and those who consume them.
        </Text>            
        <Text pt={0} pb={8}>
          After your first gateway is created, in this section you can do things like:
        </Text>
        <Grid templateColumns="repeat(3, 1fr)" gap={7}>
          <Box>
            <Flex alignItems="center">
              <Icon as={FaSearch} width={5} height={5} />
              <Heading size="sm" ml={2.5}>
                Make your products discoverable
              </Heading>
            </Flex>
            <Text pt={4}>
              Allow citizens to find your APIs on the BC Government API Directory.
            </Text>
          </Box>
          <Box>
            <Flex alignItems="center">
              <Icon as={FaLock} width={5} height={5} />
              <Heading size="sm" ml={2.5}>
                Control access to your products
              </Heading>
            </Flex>
            <Text pt={4}>
              Decide who can use the data and how they access it.
            </Text>
          </Box>
          <Box>
            <Flex alignItems="center">
              <Icon as={FaChartLine} width={5} height={5} />
              <Heading size="sm" ml={2.5}>
                View usage metrics
              </Heading>
            </Flex>
            <Text pt={4}>
              Get a fast overview of how much and how often the services you've set up are being used.
            </Text>
          </Box>
        </Grid>
      </Card>
      <Card mb={8} px={12} py={8}>
        <Box>
          <Heading size="lg">Steps to create and configure your first gateway</Heading>
          <Text pt={6} pb={10}>
            Follow these steps to create and configure your first gateway. For more details on how to set up an API, consult our API provider{' '}
            <Link
                href={QuickStartUrl}
                target="_blank"
                color="bc-link"
                textDecor="underline"
              >Quick Start tutorial</Link>
            .
          </Text>
        </Box>
        <Grid templateColumns="repeat(3, 1fr)" gap={7}>
          <Box>
            <VStack alignItems="flex-start">
              <Box
                bg="purple.50"
                borderRadius="full"
                width={100}
                height={100}
                position="relative"
              >
                <Box
                  bg="purple.100"
                  borderRadius="full"
                  width={85}
                  height={85}
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                >
                  <img
                    src="/images/download.png"
                    alt="Download"
                    title="Download"
                    width="100%"
                    height="auto"
                  />
                </Box>
              </Box>
            <Heading size="sm" pt={4}>
                Download our Command Line Interface (CLI)
            </Heading>
            <Text pt={2}>
              Our CLI is a convenient way to configure your gateways.{' '}                   
              <Link
                href={GwaInstallUrl}
                target="_blank"
                color="bc-link"
                textDecor="underline"
              >Download it here.</Link>
            </Text>
            </VStack>
          </Box>
          <Box>
            <VStack alignItems="flex-start">
              <Box
                bg="orange.50"
                borderRadius="full"
                width={100}
                height={100}
                position="relative"
              >
                <Box
                  bg="orange.100"
                  borderRadius="full"
                  width={85}
                  height={85}
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                >
                  <img
                    src="/images/config.png"
                    alt="Configuration"
                    title="Configuration"
                    width="100%"
                    height="auto"
                  />
                </Box>
              </Box>
            <Heading size="sm" pt={4}>
              Prepare your configuration
            </Heading>
            <Text pt={2}>
              <SmoothScrollLink
                href={"#create-gateway"}
                >Create a gateway</SmoothScrollLink> 
              {' '} and use our{' '} 
              <SmoothScrollLink
                href={"#generate-config"}
                >template</SmoothScrollLink>
              {' '}to set up its configuration: services, routes and plugins.
            </Text>
            </VStack>
          </Box>
          <Box>
            <VStack alignItems="flex-start">
              <Box
                bg="blue.50"
                borderRadius="full"
                width={100}
                height={100}
                position="relative"
              >
                <Box
                  bg="blue.100"
                  borderRadius="full"
                  width={85}
                  height={85}
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                >
                  <img
                    src="/images/api_apply.png"
                    alt="Apply configuration"
                    title="Apply configuration"
                    width="100%"
                    height="auto"
                  />
                </Box>
              </Box>
            <Heading size="sm" pt={4}>
              Apply configuration to your gateway
            </Heading>
            <Text pt={2}>
              Run the{' '}
              <SmoothScrollLink
                href={"#apply-config"}
                >apply command</SmoothScrollLink>
              {' '}in the CLI to apply your configuration to your gateway.
            </Text>
            </VStack>
          </Box>
        </Grid>
        <HStack alignItems="center" justifyContent="center" mt={10} bg="#f4fbff" p={2}>
          <img
            src="/images/glossary_search.png"
            width={38}
            height={38}
            title="Glossary search"
            alt="Glossary search"
          />
          <Heading size="sm" ml={2.5}>
            New terminology? 
          </Heading>
          <Text>
            <Link
              href={GlossaryUrl}
              target="_blank"
              color="bc-link"
              textDecor="underline"
            >
              Explore our glossary
            </Link>
            {' '}for easy-to-understand definitions
          </Text>
        </HStack>
        <Box pt={20}>
          <Heading size="md">GWA CLI commands</Heading>
          <Text pt={6}>
            These useful commands help you manage your gateway resources. For more details visit our {' '}
            <Link
                href={GwaCommandsUrl}
                target="_blank"
                color="bc-link"
                textDecor="underline"
              >GWA CLI commands</Link>
            {' '}documentation.
          </Text>
        </Box>
        <Box>
          <Heading size="md" fontSize="18px" pt={10} pb={6}>Prepare your configuration</Heading>
          <CliCommand 
            title='Use the test environment'
            description='Configure the CLI to run against a test environment while you are getting familiarized with the API Services Portal.'
            command='gwa config set host api-gov-bc-ca.test.api.gov.bc.ca' 
          />
          <CliCommand 
            title='Log in'
            description='Log in via device with your IDIR.'
            command='gwa login' 
          />
          <CliCommand 
            id='create-gateway'
            title='Create gateway'
            description='Generate a new gateway with this command. The new gateway will be automatically assigned an ID
              and you can set a display name to easily identify this gateway.'
            command='gwa gateway create' 
          />
          <CliCommand 
            id='generate-config'
            title='Generate gateway configuration file'
            description='Run this command to generate a basic gateway configuration YAML file.'
            command='gwa generate-config --template quick-start' 
          />

          <Heading size="md" fontSize="18px" pt={10} pb={6}>Apply configuration to your gateway</Heading>
          <CliCommand 
            id='apply-config'
            title='Apply your configuration'
            description='With this command you can apply your configuration to your recently created gateway. 
              If you need to make updates or republish, simply run this command again.'
            command='gwa apply --input gw-config.yaml' 
          />
          <CliCommand 
            title='Test your gateway'
            description={
              <>
                Visit the{' '}             
                <Link
                href={QuickStartUrl}
                target="_blank"
                color="bc-link"
                textDecor="underline"
                >Your Products page</Link> to request credentials.
                Then, get the URL for your newly published gateway service <Code>...api.gov.bc.ca</Code> using this command.
                Pass the client ID and secret in a POST request to this URL to get a JWT token to access your API.  
              </>
            }
            command='gwa status -hosts' 
          />

          <Heading size="md" fontSize="18px" pt={10} pb={6}>Help</Heading>
          <CliCommand 
            title='Help'
            description={
              <>
                If you are not sure about how to use a specific command, you can type <Code>--help</Code> after the
                command's name to learn more about its usage and syntax.
              </>
            }
            command='gwa <command> --help' 
          />
        </Box>
      </Card>
    </>
  );
};

export default GatewayGetStarted;
