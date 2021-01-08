

const HelloPage = require.resolve('./pages/hello')
const Placeholder = require.resolve('./pages/placeholder')

module.exports = {
    pages: [
        // Custom pages
        // {
        //     label: 'A new dashboard',
        //     path: '',
        //     component: Placeholder,
        // },
        // Ordering existing list pages
        {
            label: 'Discovery',
            children: [
                { listKey: 'DatasetGroup', label: 'Dataset Groups' },
                { listKey: 'Dataset', label: 'Datasets' },
            ],
        },
        {
            label: 'Gateway',
            children: [
                { listKey: 'Gateway', label: 'Namespaces' },
                { listKey: 'ServiceRoute', label: 'Services' },
            ],
        },
        {
            label: 'Consumers',
            children: [
                { listKey: 'Consumer', label: 'Consumers' },
                { listKey: 'AccessRequest', label: 'Access Requests' },
            ],
        },
        {
            label: 'Documentation',
            component: Placeholder,
            path: 'docs',
        },
        {
            label: 'Administration',
            children: ['TemporaryIdentity', 'User', 'Organization', 'Plugin', 'Group', 'CredentialIssuer'],
        },
        {
            label: 'A Hello Page',
            path: 'hello',
            component: HelloPage,
        }
    ]
}
  