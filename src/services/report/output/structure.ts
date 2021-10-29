export const reportOrder = [
  'namespaces',
  'ns_access',
  'gateway_metrics',
  'gateway_controls',
  'consumer_requests',
  'service_access',
  'consumer_access',
  'consumer_metrics',
  'consumer_controls',
];

export const reportStructure: any = {
  namespaces: {
    label: 'Namespaces',
    fields: [
      {
        header: 'Name',
        key: 'name',
        width: 32,
      },
      {
        header: 'Privileged',
        key: 'perm_protected_ns',
        width: 25,
      },
      {
        header: 'Permitted Hosts',
        key: 'perm_domains',
        width: 60,
      },
      {
        header: 'Data Plane',
        key: 'perm_data_plane',
        width: 25,
      },
    ],
  },
  ns_access: {
    label: 'Namespace Access',
    fields: [
      {
        header: 'Namespace',
        key: 'namespace',
        width: 20,
      },
      {
        header: 'Subject',
        key: 'subject',
        width: 40,
      },
      {
        header: 'Scope',
        key: 'scope',
        width: 25,
      },
    ],
  },
  gateway_metrics: {
    label: 'Gateway Metrics',
    fields: [
      {
        header: 'Namespace',
        key: 'namespace',
        width: 20,
      },
      {
        header: 'Product',
        key: 'prod_name',
        width: 32,
      },
      {
        header: 'Environment',
        key: 'prod_env_name',
        width: 15,
      },
      {
        header: 'Service',
        key: 'service_name',
        width: 40,
      },
      { header: '30 Day Total', key: 'day_30_total', width: 20 },
    ],
  },
  gateway_controls: {
    label: 'Gateway Controls',
    fields: [
      {
        header: 'Namespace',
        key: 'namespace',
        width: 20,
      },
      {
        header: 'Product',
        key: 'prod_name',
        width: 32,
      },
      {
        header: 'Environment',
        key: 'prod_env_name',
        width: 15,
      },
      {
        header: 'Service',
        key: 'service_name',
        width: 40,
      },
      { header: 'Route', key: 'route_name', width: 40 },
      { header: 'Plugin', key: 'plugin_name', width: 30 },
      { header: 'Plugin Details', key: 'plugin_info', width: 50 },
    ],
  },
  consumer_requests: {
    label: 'Consumer Requests',
    fields: [
      {
        header: 'Namespace',
        key: 'namespace',
        width: 20,
      },
      { header: 'Product', key: 'prod_name', width: 32 },
      { header: 'Environment', key: 'prod_env_name', width: 15 },
      { header: 'App ID', key: 'prod_env_app_id', width: 20 },
      { header: 'Flow', key: 'prod_env_flow', width: 20 },
      { header: 'Application', key: 'app_name', width: 30 },
      { header: 'App ID', key: 'app_id', width: 25 },
      { header: 'App Owner', key: 'app_owner', width: 25 },
      { header: 'Created', key: 'req_created', width: 30 },
      { header: 'Reviewer', key: 'req_reviewer', width: 30 },
      { header: 'Result', key: 'req_result', width: 30 },
    ],
  },
  service_access: {
    label: 'Service Access',
    fields: [
      {
        header: 'Namespace',
        key: 'namespace',
        width: 20,
      },
      { header: 'Service', key: 'service_name', width: 40 },
      { header: 'Routes', key: 'routes', width: 60 },
      {
        header: 'Plugin (acl,jwt-keycloak)',
        key: 'plugin',
        width: 40,
      },
      { header: 'Consumer', key: 'consumer_username', width: 40 },
      { header: 'Perm [ACL]', key: 'perm_acl', width: 20 },
      { header: 'Perm [Scope]', key: 'perm_scope', width: 20 },
      { header: 'Perm [Role]', key: 'perm_role', width: 20 },
    ],
  },
  consumer_access: {
    label: 'Consumer Access',
    fields: [
      {
        header: 'Namespace',
        key: 'namespace',
        width: 20,
      },
      { header: 'Consumer', key: 'consumer_username', width: 55 },
      { header: 'Issuer', key: 'prod_env_issuer', width: 25 },
      { header: 'Perm [ACL]', key: 'perm_acl', width: 15 },
      { header: 'Perm [Scope]', key: 'perm_scope', width: 150 },
      { header: 'Perm [Role]', key: 'perm_role', width: 150 },
      { header: 'Product', key: 'prod_name', width: 32 },
      { header: 'Environment', key: 'prod_env_name', width: 15 },
      { header: 'App ID', key: 'prod_env_app_id', width: 20 },
      { header: 'Flow', key: 'prod_env_flow', width: 20 },
      {
        header: 'Last Update',
        key: 'consumer_updated',
        style: {
          font: { size: 11, name: 'Arial' },
          numFmt: 'dd/mm/yyyy',
        },
        width: 30,
      },
      { header: 'IdP Client', key: 'idp_client_id', width: 50 },
      { header: 'Application', key: 'app_name', width: 30 },
      { header: 'Application ID', key: 'app_id', width: 25 },
      { header: 'Application Owner', key: 'app_owner', width: 25 },
    ],
  },
  consumer_metrics: {
    label: 'Consumer Metrics',
    fields: [
      {
        header: 'Namespace',
        key: 'namespace',
        width: 20,
      },
      {
        header: 'Consumer',
        key: 'consumer_username',
        width: 40,
      },
      {
        header: 'Product',
        key: 'prod_name',
        width: 32,
      },
      {
        header: 'Environment',
        key: 'prod_env_name',
        width: 15,
      },
      {
        header: 'Service',
        key: 'service_name',
        width: 40,
      },
      { header: '30 Day Total', key: 'day_30_total', width: 20 },
    ],
  },
  consumer_controls: {
    label: 'Consumer Controls',
    fields: [
      {
        header: 'Namespace',
        key: 'namespace',
        width: 20,
      },
      {
        header: 'Consumer',
        key: 'consumer_username',
        width: 40,
      },
      {
        header: 'Product',
        key: 'prod_name',
        width: 32,
      },
      {
        header: 'Environment',
        key: 'prod_env_name',
        width: 15,
      },
      {
        header: 'Service',
        key: 'service_name',
        width: 40,
      },
      { header: 'Route', key: 'route_name', width: 40 },
      { header: 'Plugin', key: 'plugin_name', width: 15 },
      { header: 'Plugin Details', key: 'plugin_info', width: 50 },
    ],
  },
};
