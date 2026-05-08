export const APEConfig = {
  // used by the webhook for sending messages to the RS via SDX
  pubsub_dispatch_url: 'http://sdx-edge-share0',

  // SDX exchange
  pubsub_forward_url: 'http://share0.servers.sdx',
  pubsub_dispatch_ip: '142.34.229.4',

  // publish destination
  events_publisher_url: 'http://pubsub-kafka',

  // These are for administration, not for runtime routes/plugins

  webhook_admin_url: 'http://pubsub-webhook',

  opal_policy_url: 'https://opal-policies-api-gov-bc-ca.dev.api.gov.bc.ca',

  opal_pip_catalog_url:
    'https://opal-pip-catalog-api-gov-bc-ca.dev.api.gov.bc.ca',

  opal_client_url: 'https://opal-client-api-gov-bc-ca.dev.api.gov.bc.ca',
};
