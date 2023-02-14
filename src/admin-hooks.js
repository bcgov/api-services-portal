module.exports = {
  pages: [
    {
      label: 'Workflow',
      children: ['AccessRequest', 'Application', 'ServiceAccess', 'Activity'],
    },
    {
      label: 'Products',
      children: [
        'Product',
        'Environment',
        'CredentialIssuer',
        'Content',
        'Legal',
      ],
    },
    {
      label: 'Monitoring',
      children: ['Alert', 'Metric'],
    },
    {
      label: 'Session',
      children: ['TemporaryIdentity'],
    },
    {
      label: 'Keycloak',
      children: ['User'],
    },
    {
      label: 'Kong',
      children: [
        'GatewayService',
        'GatewayRoute',
        'GatewayConsumer',
        'GatewayGroup',
        'GatewayPlugin',
      ],
    },
    {
      label: 'BCDC',
      children: ['Organization', 'OrganizationUnit', 'Dataset'],
    },
  ],
};
