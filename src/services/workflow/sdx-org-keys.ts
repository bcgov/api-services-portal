import { Logger } from '../../logger';
import { ProvisionerService } from '../provisioner';

const logger = Logger('workflow.sdx-org-keys');

export const CreateNewKey = async (
  context: any,
  orgName: string,
  runtimeGroupName: string,
  environment: string
) => {
  const service = new ProvisionerService(process.env.PROVISIONER_URL!);

  const result = await service.postCSR(orgName, runtimeGroupName, environment, {
    requester_name: context.authedItem?.name || 'unknown',
    requester_email: context.authedItem?.email || 'unknown',
  });

  logger.debug(
    '[CreateNewKey] %s, %s, %s - result: %j',
    orgName,
    runtimeGroupName,
    environment,
    result
  );
  return result;
};
