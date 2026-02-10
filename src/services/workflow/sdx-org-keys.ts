import { RuntimeGroupService } from '../batch/runtime-group';
import { parseOrganizationMemberDetails } from '../keystone/organization';
import assert from '../user-assert';
import https from 'https';
import fs from 'fs';
import { Logger } from '../../logger';

const logger = Logger('workflow.sdx-org-keys');

export const CreateNewKey = async (
  context: any,
  org: string,
  runtimeGroupName: string
) => {
  const service = new RuntimeGroupService();

  // Verify the runtime group belongs to the specified organization
  const rg = await service.findRuntimeGroupByUniqueName(
    context,
    runtimeGroupName
  );
  assert.strictEqual(
    rg.hostedOrganizations?.filter((o) => o.name === org).length == 1,
    true,
    'Not permitted to host on this runtime group'
  );

  const member = parseOrganizationMemberDetails(rg.organization.tags);

  const san = `LAB-${member.memberClass}-${member.memberId}-edge-${rg.name}.sdx.gov.bc.ca`.toLocaleLowerCase();

  const body = {
    country: 'CA',
    org_name: rg.organization.title,
    serial_number: `LAB/${member.memberClass}/${rg.name.toUpperCase()}`,
    common_name: member.memberId,
    san: san,
    requester_name: context.req?.user?.name || 'unknown',
    requester_email: context.req?.user?.email || 'unknown',
  };

  logger.debug('Requesting new key with body: %j', body);

  // call the Edge Server endpoint for generating a new key pair
  const result = await fetch(`https://sdx.gov.bc.ca/edge/${rg.name}/kms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());

  return result;
};
