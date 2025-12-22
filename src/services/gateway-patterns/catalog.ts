import { gql } from 'graphql-request';
import { Environment } from '../keystone/types';
import { NamespaceService } from '../org-groups';
import { getGwaProductEnvironment } from '../workflow';
import { LookupMember } from './member-id';
import { logger } from '../../logger';

export interface CatalogEntry {
  id: string;
  locator: string;
  product: {
    name: string;
    //type: string;
    namespace: string;
  };
  organization: {
    name: string;
    orgUnit?: string;
    trustJwksEndpoint?: string;
  };
  gateway: {
    name: string;
    permissions: {
      dataPlane: string[];
      domains: string[];
    };
  };
}

export async function GetCatalog(ctx: any): Promise<CatalogEntry[]> {
  const result = await ctx.executeGraphQL({
    context: ctx,
    query: list,
  });
  const envs = result.data.allEnvironments.filter(
    (e: Environment) => true // e.product.organization != null
  );

  const output: CatalogEntry[] = envs.map((env: any) => {
    const catalogEntry = {
      id: env.appId,
      locator: '',
      environment: env.name,
      product: {
        name: env.product.name,
      },
      gateway: {
        name: env.product.namespace,
      },
      organization: {},
      //hasSpec: env.spec?.id ? true : false,
    };
    return catalogEntry;
  });

  const prodEnv = await getGwaProductEnvironment(ctx, false);
  const envConfig = prodEnv.issuerEnvConfig;

  const svc = new NamespaceService(envConfig.issuerUrl);
  await svc.login(envConfig.clientId, envConfig.clientSecret);

  const promises = output
    .filter((env: any) => env.gateway.name)
    .map(async (env: any) => {
      const nsAttributes = await svc.getNamespaceOrganizationDetails(
        env.gateway.name
      );

      if (!nsAttributes?.name) {
        logger.warn(
          'Namespace %s not assigned to organization',
          env.gateway.name
        );
        return;
      }
      env.organization.name = nsAttributes.name;
      env.organization.orgUnit = nsAttributes.orgUnit;
      env.gateway.permissions = {
        dataPlane: nsAttributes.permDataPlane,
        domains: nsAttributes.permDomains,
      };

      const member = await LookupMember(nsAttributes.name);
      if (!member) {
        logger.warn('Lookup member for org %s not found.', nsAttributes.name);
        return;
      }

      env.organization.trustJwksEndpoint = member.trust_jwks_endpoint;

      env.locator = [
        `${env.environment.toUpperCase()}`,
        `${member.member_class}`,
        `${member.member_id}`,
        `${env.product.name}`,
      ]
        .join('.')
        .toUpperCase();
      return env;
    });
  const out: CatalogEntry[] = await Promise.all(promises);
  return out.filter((e) => e);
}

const list = gql`
  query OrgProductCatalog {
    allEnvironments {
      appId
      name
      # spec {
      #   id
      #   blob
      # }
      product {
        name
        type
        namespace
        # organization {
        #   name
        # }
      }
    }
  }
`;
