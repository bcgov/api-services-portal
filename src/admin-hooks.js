

const HelloPage = require.resolve('./pages/hello')
const Placeholder = require.resolve('./pages/placeholder')

module.exports = {
    pages: [
        {
            label: 'Dashboard',
            path: '',
            component: Placeholder,
        },
        {
            label: 'Workflow',
            children: ['AccessRequest', 'Application', 'Activity'],
        },
        {
            label: 'Products',
            children: ['Product', 'Environment', 'CredentialIssuer', 'Content'],
        },
        {
            label: 'Monitoring',
            children: ['Alert', 'GatewayMetric'],
        },
        {
            label: 'Session',
            children: ['TemporaryIdentity', 'User'],
        },
        {
            label: 'Keycloak',
            children: ['Namespace', 'Group'],
        },
        {
            label: 'Kong',
            children: ['GatewayService', 'GatewayRoute', 'Consumer', 'GatewayGroup', 'Plugin'],
        },
        {
            label: 'BCDC',
            children: ['Organization', 'OrganizationUnit', 'Dataset'],
        }
    ]
}
