import { ConfigService } from '../config.service';

import { Logger } from '../../logger';

const logger = Logger('gateway-patterns.member-id');

const CONFIG = new ConfigService().getConfig();

export interface Member {
  id: string;
  member_class: string;
  member_id: string;
  trust_jwks_endpoint: string;
}

export async function LookupMember(id: string): Promise<Member> {
  const member = await fetch(CONFIG.referenceDataBaseUri + '/members', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const memberData = await member.json();

  return memberData.filter((member: any) => member.id === id).pop();
}
