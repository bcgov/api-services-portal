import { RuntimeGroupService } from '../batch/runtime-group';
import {
  getOrganization,
  parseOrganizationMemberDetails,
} from '../keystone/organization';
import assert from '../user-assert';
import https from 'https';
import fs from 'fs';
import { Logger } from '../../logger';
import { check } from 'prettier';
import { checkStatus } from '../checkStatus';

const logger = Logger('workflow.sdx-org-keys');

export const CreateNewKey = async (
  context: any,
  orgName: string,
  runtimeGroupName: string
) => {
  const service = new RuntimeGroupService();

  // Verify the runtime group belongs to the specified organization
  const rg = await service.findRuntimeGroupByUniqueName(
    context,
    runtimeGroupName
  );
  assert.strictEqual(
    rg.hostedOrganizations?.filter((o) => o.name === orgName).length == 1,
    true,
    'Not permitted to use this runtime group'
  );

  const org = await getOrganization(context, orgName);

  const member = parseOrganizationMemberDetails(org.tags);

  const san =
    `LAB-${member.memberClass}-${member.memberId}.${rg.name}.servers.sdx`.toLocaleLowerCase();

  const body = {
    country: 'CA',
    org_name: org.title,
    serial_number: `LAB/${member.memberClass}/${rg.name.toUpperCase()}`,
    common_name: member.memberId,
    san: san,
    requester_name: context.req?.user?.name || 'unknown',
    requester_email: context.req?.user?.email || 'unknown',
  };

  const routeUrl = `${process.env.SDX_OPERATOR_EDGE_URL}/edge/${rg.name}/csr`;

  logger.debug('Requesting new key with body: %j', body);
  logger.debug('To: %s', routeUrl);

  // call the Edge Server endpoint for generating a new key pair
  const result = await fetch(routeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then(checkStatus)
    .then((res) => res.json());

  return result;
};
