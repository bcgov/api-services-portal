const casual = require('casual-browserify');

const envs = ['prod', 'staging', 'dev', 'sandbox'];

const namespaces = [
  'jh-etk-prod',
  'dss-map',
  'dss-aps',
  'dss-loc',
  'citz-gdx',
  'dss-dds',
];
const devs = [
  'Joshua Jones',
  'Ashwin Lunkad',
  'Johnathan Brammall',
  'Greg Lawrance',
];
const owners = ['Craig Rigdon', 'Aidan Cope'];
const permissionTypes = ['View', 'Publish', 'Manage', 'Delete', 'Create'];
const requesters = devs.map((d) => ({
  requesterName: d,
  requester: casual.uuid,
}));
const datasets = [
  'BC Address Geocoder Web Service',
  'API Gateway Services',
  'Address List Editor',
  'Document Generation',
  'BC Route Planner',
  'Service BC Office Locations',
  'Welcome BC Settlement Service Providers - Interactive Web Map Data',
  'Laboratory Services in BC',
  'Immunization Services in BC',
  'BC Health Care Facilities (Hospital)',
  'BC Gov News API Service',
  'WorkBC Job Postings - API Web Service',
  'BC Roads Map Service - Web Mercator',
  'British Columbia Geographical Names Web Service - BCGNWS',
  'Open511-DriveBC API',
  'Historic City of Vancouver Fire Insurance Map',
  'BC Laws API',
  'BC Web Map Library',
];

const products = [
  'BC Data Catalogue',
  'Geocoder Service API',
  'eRx API',
  'Wildfire Data',
];

const organizations = [
  'Ministry of Advanced Education and Skills Training',
  'Ministry of Agriculture, Food and Fisheries',
  'Ministry of Attorney General',
  'Ministry of Citizens Services',
  'Ministry of Education',
  'Ministry of Health',
  'Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
  'Ministry of Indigenous Relations and Reconciliation',
];
const organizationUnits = ['DataBC', 'Information Innovation and Technology'];

module.exports = {
  datasets,
  namespaces,
  organizations,
  organizationUnits,
  owners,
  permissionTypes,
  requesters,
  envs,
  products,
};
