import YAML from 'yaml';
import { gql } from 'graphql-request';
import { Environment } from '../keystone/types';
import { NamespaceService } from '../org-groups';
import { OrgNamespace } from '../org-groups/types';
import { getGwaProductEnvironment } from '../workflow';
import { dynamicallySetEnvironmentDetails } from '../keystone';
import { LookupMemberOrganization } from './member-id';
import { LookupEdgeServer } from './edge-servers';

export interface CatalogEntry {
  id: string;
  locator: string;
  product: {
    name: string;
    type: string;
    namespace: string;
  };
  organization: {
    name: string;
    orgUnit?: string;
  };
  gateway: {
    name: string;
    permissions: {
      dataPlane: string[];
      domains: string[];
    };
  };
  edgeServer: {
    host: string;
    dn: string;
  };
  hasSpec: boolean;
}

export async function GetCatalog(ctx: any): Promise<CatalogEntry[]> {
  const result = await ctx.executeGraphQL({
    context: ctx,
    query: list,
  });
  const envs = result.data.allEnvironments.filter(
    (e: Environment) => e.product.organization != null
  );

  const output = envs.map((env: any) => {
    //const spec = env.spec?.blob ? parseSpec(env.spec?.blob) : undefined;
    const spec: any = undefined;

    if (env.credentialIssuer != null) {
      const envDetails = JSON.parse(
        dynamicallySetEnvironmentDetails(env.credentialIssuer)
      );
      const credEnv = envDetails.find((e: any) => e.environment === env.name);

      env.credentialIssuer = {
        issuerUrl: credEnv?.issuerUrl,
        clientId: credEnv?.clientId,
      };
    }

    const catalogEntry = {
      id: env.appId,
      environment: env.name,
      product: {
        name: env.product.name,
      },
      organization: {
        name: env.product.organization.name,
        orgUnit: env.product.organization.orgUnit || undefined,
      },
      gateway: {
        name: env.product.namespace,
      },
      hasSpec: env.spec?.id ? true : false,
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
      const member = await LookupMemberOrganization(env.organization.name);
      env.locator = [
        `${env.environment.toUpperCase()}`,
        `${member.member_class}`,
        `${member.member_id}`,
        `${env.product.name}`,
      ]
        .join('.')
        .toUpperCase();

      const nsAttributes = await getNamespaceAttributes(svc, env.gateway.name);
      env.gateway.permissions = {
        dataPlane: nsAttributes.permDataPlane,
        domains: nsAttributes.permDomains,
      };

      const edgeServer = await LookupEdgeServer(
        env.gateway.permissions.domains[0]
      );
      env.edgeServer = {
        host: edgeServer.host,
        dn: edgeServer.dn,
      };
    });
  await Promise.all(promises);
  return output;
}

async function parseSpec(specBlob: string) {
  const spec = YAML.parse(specBlob);

  const operations =
    spec?.paths &&
    Object.keys(spec.paths).map((path) => {
      return Object.keys(spec.paths[path]).map((method) => {
        const op = spec.paths[path][method];
        return {
          operationId: op.operationId,
          method: method.toUpperCase(),
          path,
          summary: op.summary || '',
          scopes:
            op.security && op.security[0] && op.security[0]['bearer_auth']
              ? op.security[0]['bearer_auth']
              : [],
        };
      });
    });

  const flattenedOperations = [];
  if (operations) {
    for (const opList of operations) {
      for (const op of opList) {
        flattenedOperations.push(op);
      }
    }
  }
}

async function getNamespaceAttributes(
  svc: NamespaceService,
  ns: string
): Promise<OrgNamespace> {
  return await svc.getNamespaceOrganizationDetails(ns);
}

const list = gql`
  query OrgProductCatalog {
    allEnvironments {
      appId
      name
      spec {
        id
        blob
      }
      credentialIssuer {
        name
        clientId
        inheritFrom {
          environmentDetails
        }
      }
      product {
        name
        type
        namespace
        organization {
          name
        }
      }
    }
  }
`;

/*
    return {
      appId: env.appId,
      name: env.name,
      spec: {
        title: spec.info?.title || '',
        version: spec.info?.version || '',
        summary: spec.info?.summary || '',
        description: spec.info?.description || '',
        operations: flattenedOperations,
      },
      credentialIssuer: env.credentialIssuer,
      product: {
        name: env.product.name,
        type: env.product.type,
        namespace: env.product.namespace,
        organization: {
          name: env.product.organization.name,
        },
      },
    };
*/
