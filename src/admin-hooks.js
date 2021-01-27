

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
            label: 'Packaging',
            children: ['Package', 'Environment', 'CredentialIssuer', 'Content'],
        },
        {
            label: 'Session',
            children: ['TemporaryIdentity', 'User'],
        },
        {
            label: 'Keycloak',
            children: ['Gateway', 'Group'],
        },
        {
            label: 'Kong',
            children: ['ServiceRoute', 'Consumer', 'Plugin'],
        },
        {
            label: 'BCDC',
            children: ['Organization', 'OrganizationUnit', 'Dataset'],
        }
    ]
}
