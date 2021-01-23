const { import_orgs, update_orgs } = require('./load/organization')
const { import_org_units } = require('./load/organizationUnit')
const { import_datasets } = require('./load/dataset')

const { import_service_routes } = require('./load/serviceRoute')
const { import_plugins } = require('./load/plugins')
const { import_consumers } = require('./load/consumer')
const { update_plugin_links } = require('./load/pluginLink')

const { extract_kong_all } = require('./sources/kong')


// import_org_units()
// import_orgs()
//update_orgs()
//import_datasets()

//extract_kong_all()
//import_plugins()
//import_service_routes()
//import_consumers()
update_plugin_links()
