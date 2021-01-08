

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
            label: 'Datasets',
            children: [
                { listKey: 'DataSetGroup', label: 'API Families' },
                { listKey: 'DataSet', label: 'Datasets' },
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
            label: 'Documentation',
            component: Placeholder,
            path: 'docs',
        },
        {
            label: 'Consumers',
            children: [
                { listKey: 'Consumer', label: 'Consumers' },
                { listKey: 'AccessRequest', label: 'Access Requests' },
            ],
        },
        {
            label: 'Administration',
            children: ['User', 'Organization', 'Plugin', 'Group', 'CredentialIssuer'],
        },
        {
            label: 'A Hello Page',
            path: 'hello',
            component: HelloPage,
        }
    ]
}
  