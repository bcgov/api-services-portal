import { APIRequestContext } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { callAPI, setRequestBody, setHeaders } from './api-helpers';

export async function buildOrgGatewayDatasetAndProduct(request: APIRequestContext) {
  console.log('---Setting up test base data---')
  const datasetId = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 4);
  const orgId = datasetId; // just reference the dataset id for easier tracing

  // Login and get token
  const tokenRes = await loginByAuthAPI(request);
  setHeaders({ 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenRes.token}`
  });

  // Set up the organization data
  const org = {
    name: `ministry-of-kittens-${orgId}`,
    title: 'Some good title about kittens',
    description: 'Some good description about kittens',
    tags: [],
    orgUnits: [{
      name: `division-of-toys-${orgId}`,
      title: 'Division of fun toys to play',
      description: 'Some good description about how we manage our toys',
      tags: [],
      extForeignKey: `division-of-toys-${orgId}`,
      extSource: 'internal',
      extRecordHash: '',
    }],
    extSource: 'internal',
    extRecordHash: '',
  };

  // Create organization
  setRequestBody(org);
  const orgRes = await callAPI(request, 'organizations/ca.bc.gov', 'PUT');
  if (orgRes.apiRes.status !== 200) throw new Error('Failed to create organization');

  // Set org access
  const orgAccess = {
    name: org.name,
    parent: `/ca.bc.gov`,
    members: [{
      member: { email: 'janis@testmail.com' },
      roles: ['organization-admin'],
    }],
  };
  
  setRequestBody(orgAccess);
  const orgAccessRes = await callAPI(request, 'organizations/ca.bc.gov/access', 'PUT');
  if (orgAccessRes.apiRes.status !== 204) throw new Error('Failed to set org access');

  // Set org unit access
  const orgUnitAccess = {
    name: org.orgUnits[0].name,
    parent: `/ca.bc.gov/${org.name}`,
    members: [{
      member: { email: 'janis@testmail.com' },
      roles: ['organization-admin'],
    }],
  };

  setRequestBody(orgUnitAccess);
  const orgUnitAccessRes = await callAPI(request, 'organizations/ca.bc.gov/access', 'PUT');
  if (orgUnitAccessRes.apiRes.status !== 204) throw new Error('Failed to set org unit access');

  // Create dataset
  const dataset = {
    name: `org-dataset-${datasetId}`,
    license_title: 'Open Government Licence - British Columbia',
    security_class: 'PUBLIC',
    view_audience: 'Public',
    download_audience: 'Public',
    record_publish_date: '2017-09-05',
    notes: 'Some notes',
    title: 'A title about my dataset',
    tags: ['tag1', 'tag2'],
    organization: org.name,
    organizationUnit: org.orgUnits[0].name,
  };

  setRequestBody(dataset);
  const datasetRes = await callAPI(request, `organizations/${org.name}/datasets`, 'PUT');
  if (datasetRes.apiRes.status !== 200) throw new Error('Failed to create dataset');
  const newDatasetId = datasetRes.apiRes.body.id;

  // Create gateway
  setRequestBody({});
  const gatewayRes = await callAPI(request, 'gateways', 'POST');
  if (gatewayRes.apiRes.status !== 200) throw new Error('Failed to create gateway');

  // Assign gateway to org
  const assignRes = await callAPI(
    request,
    `organizations/${org.name}/${org.orgUnits[0].name}/gateways/${gatewayRes.apiRes.body.gatewayId}?enable=true`,
    'PUT'
  );
  if (assignRes.apiRes.status !== 200) throw new Error('Failed to assign gateway');

  // Create product
  const product = {
    name: `my-product-on-${gatewayRes.apiRes.body.gatewayId}`,
    dataset: dataset.name,
    environments: [{
      name: 'dev',
      active: true,
      approval: false,
      flow: 'public',
    }],
  };

  setRequestBody(product);
  const productRes = await callAPI(request, `gateways/${gatewayRes.apiRes.body.gatewayId}/products`, 'PUT');
  if (productRes.apiRes.status !== 200) throw new Error('Failed to create product');

  return {
    org,
    gateway: gatewayRes.apiRes.body,
    dataset,
    datasetId: newDatasetId, // Return the new dataset ID
    product,
  };
}

export async function loginByAuthAPI(request: APIRequestContext) {
  const response = await request.post(process.env.OIDC_ISSUER + '/protocol/openid-connect/token', {
    form: {
      grant_type: 'password',
      username: process.env.DEV_USERNAME,
      password: process.env.DEV_PASSWORD,
      scope: 'openid',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }
  });

  const body = await response.json();
  return {
    token: body.access_token,
    user: decodeJwt(body.id_token)
  };
}

function decodeJwt(token: string) {
  // Implement JWT decoding as needed
  return {};
}