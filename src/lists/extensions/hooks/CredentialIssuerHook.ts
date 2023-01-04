import {
  lookupCredentialIssuerById,
  dynamicallySetEnvironmentDetails,
  maskEnvironmentDetails,
} from '../../../services/keystone';
import { CredentialIssuer } from '../../../services/keystone/types';

/**
 * Transform the environmentDetails by masking sensitive data
 * and backfilling environment details if 'inheritFrom' are provided
 */
export default async (context: any, issuers: CredentialIssuer[]) => {
  for (const data of issuers) {
    if (data.inheritFrom) {
      const inheritedFromIssuer = await lookupCredentialIssuerById(
        context.sudo(),
        `${data.inheritFrom}`
      );
      data.environmentDetails = dynamicallySetEnvironmentDetails({
        ...data,
        ...{ inheritFrom: inheritedFromIssuer },
      });
    } else {
      data.environmentDetails = maskEnvironmentDetails(data);
    }
    if (data.inheritFrom) {
      delete data.inheritFrom.environmentDetails;
    }
  }
  return issuers;
};
