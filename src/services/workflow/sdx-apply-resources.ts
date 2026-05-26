import { Logger } from '../../logger';
import YAML from 'js-yaml';
import getSubjectToken from '../../auth/auth-token';
import { GWAService } from '../gwaapi';
import { syncRecordsThrowErrors } from '../../batch/feed-worker';

const logger = Logger('sdx-apply-resources');

/**
 *
 * @param context
 * @param action
 * @param dryRun
 * @param config
 * @returns
 */
export const ApplyResources = async (
  context: any,
  request: any,
  action: 'preview' | 'apply' | 'remove',
  dryRun: boolean,
  config: any
) => {
  const gwaService = new GWAService(process.env.GWA_API_URL);

  let result = null;
  let gatewayResources = false;
  const payload: any = {
    services: [],
    keys: [],
    key_sets: [],
  };

  config.documents.forEach((doc: any) => {
    if (doc.kind === 'GatewayService') {
      delete doc.kind;
      payload.services.push(doc);
      gatewayResources = true;
    } else if (doc.kind === 'GatewayKey') {
      delete doc.kind;
      payload.keys.push(doc);
      gatewayResources = true;
    } else if (doc.kind === 'GatewayKeySet') {
      delete doc.kind;
      payload.key_sets.push(doc);
      gatewayResources = true;
    }
  });
  //gatewayResources = false;

  logger.debug('Artifacts %j', payload);

  if (action === 'preview') {
    return payload;
  }

  // Validate the generated config to ensure it only contains allowed configurations for the organization
  if (gatewayResources) {
    const artifact = YAML.dump(payload, { noRefs: true });

    result = await gwaService.publishGatewayConfiguration(
      action === 'remove' ? 'DELETE' : 'PUT',
      getSubjectToken(request),
      config._gateway_id,
      dryRun,
      artifact
    );
  }

  const otherResults = await applyOtherKinds(context, config.documents);

  return [
    ...(result ? [{ resource: 'GatewayResources', response: result }] : []),
    ,
    ...otherResults,
  ];
};

const applyOtherKinds = async (
  context: any,
  documents: any
): Promise<any[]> => {
  const results: any[] = [];
  const tasks = documents
    .filter((doc: any) => doc.kind)
    .map(async (doc: any) => {
      switch (doc.kind) {
        case 'Application':
          logger.debug('Applying Application: %j', doc);
          // call application service to apply application configuration
          const responseA = await syncRecordsThrowErrors(
            context,
            'Application',
            undefined,
            doc
          );

          results.push({
            resource: 'Application',
            result: responseA.result,
            response: responseA,
          });
          break;
        case 'Product':
          logger.debug('Applying Product: %s', doc.name);
          // call product service to apply product configuration
          const responseP = await syncRecordsThrowErrors(
            context,
            'Product',
            undefined,
            doc
          );

          results.push({
            resource: 'Product',
            result: responseP.result,
            response: responseP,
          });
          break;

        default:
          logger.warn('Unsupported kind: %s', doc.kind);
      }
    });

  await Promise.all(tasks);
  return results;
};
