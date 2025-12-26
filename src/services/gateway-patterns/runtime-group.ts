import { getRecords } from '../../batch/feed-worker';
import { RuntimeGroup } from '../keystone/types';
import { NamespaceService } from '../org-groups';
import { getGwaProductEnvironment } from '../workflow';
import { IServiceCatalogEntry } from './catalog';
import { LookupMember } from './member-id';

export async function BackfillSubsystemDetails(
  ctx: any,
  entry: IServiceCatalogEntry
): Promise<IServiceCatalogEntry> {
  const prodEnv = await getGwaProductEnvironment(ctx, false);
  const envConfig = prodEnv.issuerEnvConfig;

  const svc = new NamespaceService(envConfig.issuerUrl);
  await svc.login(envConfig.clientId, envConfig.clientSecret);

  const member = await LookupMember(entry.subsystem.organization.name);
  const locator = [
    `LAB`,
    `${member.member_class}`,
    `${member.member_id}`,
    `${entry.subsystem.name}`,
  ]
    .join('.')
    .toUpperCase();
  entry.locators = [locator, `${locator}.${entry.title}`];
  entry.subsystem.organization.trustJwksEndpoint = member.trust_jwks_endpoint;

  const nsAttributes = await svc.getNamespaceOrganizationDetails(
    entry.subsystem.gateway.id
  );
  if (nsAttributes) {
    entry.subsystem.gateway.permissions = {
      dataPlane: nsAttributes.permDataPlane
        ? nsAttributes.permDataPlane[0]
        : undefined,
      domains: nsAttributes.permDomains,
    };
  }

  if (entry.subsystem.gateway.permissions?.domains[0]) {
    const rg = await LookupRuntimeGroup(
      ctx,
      entry.subsystem.gateway.permissions?.domains[0]
    );
    if (rg) {
      entry.subsystem.runtimeGroup = {
        name: rg.name,
        host: rg.host,
        publicEndpoint: rg.publicEndpoint,
        privateEndpoint: rg.privateEndpoint,
      };
    }
  }

  return entry;
}

async function LookupRuntimeGroup(
  ctx: any,
  name: string
): Promise<RuntimeGroup> {
  const batchClause = {
    query: '$name: String',
    clause: '{ name: $name }',
    variables: { name },
  };
  const records: RuntimeGroup[] = await getRecords(
    ctx,
    'RuntimeGroup',
    'allRuntimeGroups',
    [],
    batchClause
  );

  return records[0];
}
