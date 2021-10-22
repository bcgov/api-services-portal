import { Keystone } from '@keystonejs/keystone';
import ExcelJS from 'exceljs';

import { lookupEnvironmentAndIssuerUsingWhereClause } from '../../services/keystone';

import { getEnvironmentContext } from '../../lists/extensions/Common';
import { KeycloakGroupService } from '../keycloak';
import { Logger } from '../../logger';
import { EnvironmentWhereInput } from '../keystone/types';
import { mergeWhereClause } from '@keystonejs/utils';
import {
  checkIssuerEnvironmentConfig,
  IssuerEnvironmentConfig,
} from '../workflow/types';
import {
  getGwaProductEnvironment,
  getMyNamespaces,
} from '../workflow/get-namespaces';

const logger = Logger('report.workbook');

export class WorkbookService {
  keystone: Keystone;
  namespaces: string[];

  constructor(keystone: Keystone, namespaces: string[]) {
    this.keystone = keystone;
    this.namespaces = namespaces;
  }

  public async buildWorkbook(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet('Namespaces', {});

    sheet.columns = [
      {
        header: 'Name',
        key: 'name',
        width: 32,
        style: { font: { bold: false, size: 12, name: 'Arial' } },
      },
      {
        header: 'perm-protected-ns',
        key: 'perm-protected-ns',
        width: 25,
        style: { font: { bold: false, size: 12, name: 'Arial' } },
      },
      {
        header: 'perm-domains',
        key: 'perm-domains',
        width: 25,
        style: { font: { bold: false, size: 12, name: 'Arial' } },
      },
      {
        header: 'perm-data-plane',
        key: 'perm-data-plane',
        width: 25,
        style: { font: { bold: false, size: 12, name: 'Arial' } },
      },
      {
        header: 'Created',
        key: 'created',
        width: 15,
        outlineLevel: 1,
        style: {
          font: { size: 12, name: 'Arial' },
          numFmt: 'dd/mm/yyyy',
        },
      },
    ];
    sheet.getRow(1).font = { bold: true, size: 15, name: 'Arial' };

    const data = await this.enrichData(this.namespaces);

    data.forEach((ns) => {
      sheet.addRow([
        ns.name,
        ns.attributes['perm-protected-fs'],
        ns.attributes['perm-domains'],
        ns.attributes['perm-data-plane'],
      ]);
    });

    const envCtx = await getGwaProductEnvironment(this.keystone);

    const nsList = await getMyNamespaces(envCtx);

    logger.debug('MyNamespaces %j', nsList);

    return workbook;
  }

  /*
  - namespace permissions (from kc group)
  - namespace user access
  - namespace consumer access
  */
  async enrichData(namespaces: string[]) {
    const prodEnv = await lookupEnvironmentAndIssuerUsingWhereClause(
      this.keystone,
      mergeWhereClause(
        {
          where: { appId: process.env.GWA_PROD_ENV_SLUG },
        } as EnvironmentWhereInput,
        {}
      ).where
    );
    const issuerEnvConfig: IssuerEnvironmentConfig = checkIssuerEnvironmentConfig(
      prodEnv.credentialIssuer,
      prodEnv.name
    );

    const kcGroupService = new KeycloakGroupService(issuerEnvConfig.issuerUrl);
    await kcGroupService.login(
      issuerEnvConfig.clientId,
      issuerEnvConfig.clientSecret
    );

    const dataPromises = namespaces.map(async (ns) => {
      const group = await kcGroupService.getGroup('ns', ns);
      return {
        name: ns,
        attributes: group == null ? {} : group.attributes,
      };
    });
    const data = await Promise.all(dataPromises);

    logger.debug('Namespaces %j', data);
    return data;
  }
}
