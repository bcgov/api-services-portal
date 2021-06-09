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

const products = [
  'BC Data Catalogue',
  'Geocoder Service API',
  'eRx API',
  'Wildfire Data',
];

module.exports = {
  namespaces,
  owners,
  permissionTypes,
  requesters,
  envs,
  products,
};
