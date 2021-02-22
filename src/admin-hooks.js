

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
            label: 'Product',
            children: ['Package', 'Environment', 'CredentialIssuer', 'Content'],
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
            children: ['ServiceRoute', 'Consumer', 'Plugin', 'GatewayService', 'GatewayRoute'],
        },
        {
            label: 'BCDC',
            children: ['Organization', 'OrganizationUnit', 'Dataset'],
        }
    ]
}
