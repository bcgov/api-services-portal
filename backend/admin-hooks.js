

const HelloPage = require.resolve('./pages/hello')
const Placeholder = require.resolve('./pages/placeholder')

module.exports = {
    pages: [
        // Custom pages
        {
            label: 'A new dashboard',
            path: '',
            component: Placeholder,
        },
        {
            label: 'Workflow',
            children: ['AccessRequest', 'DatasetGroup', 'CredentialIssuer'],
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
            children: ['Plugin', 'Gateway', 'ServiceRoute', 'Consumer'],
        },
        {
            label: 'BCDC',
            children: ['Organization', 'OrganizationUnit', 'Dataset'],
        },
        {
            label: 'A Hello Page',
            path: 'hello',
            component: HelloPage,
        }
    ]
}
