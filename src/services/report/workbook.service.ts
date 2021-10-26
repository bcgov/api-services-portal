import { Keystone } from '@keystonejs/keystone';
import ExcelJS from 'exceljs';
import { getGwaProductEnvironment } from '../workflow/get-namespaces';
import { generateExcelWorkbook } from './output/xls-generator';
import { getNamespaces } from './data/namespaces';
import { getNamespaceAccess } from './data/ns-access';
import {
  getGatewayMetrics,
  ReportOfGatewayMetrics,
} from './data/gateway-metrics';
import { getGatewayControls } from './data/gateway-controls';
import { getConsumerAccess } from './data/consumer-access';
import { getReportOfConsumerMetrics } from './data/consumer-metrics';
import { getConsumerControls } from './data/consumer-controls';

export class WorkbookService {
  keystone: Keystone;
  namespaces: string[];

  constructor(keystone: Keystone, namespaces: string[]) {
    this.keystone = keystone;
    this.namespaces = namespaces;
  }

  public async buildWorkbook(): Promise<ExcelJS.Workbook> {
    const envCtx = await getGwaProductEnvironment(this.keystone);

    const namespaces = await getNamespaces(envCtx);
    const ns_access = await getNamespaceAccess(envCtx, namespaces);
    const gateway_metrics = await getGatewayMetrics(this.keystone, namespaces);
    const serviceLookup: Map<string, ReportOfGatewayMetrics> = gatewayToMap(
      gateway_metrics
    );

    const gateway_controls = await getGatewayControls(
      this.keystone,
      namespaces,
      serviceLookup
    );
    const consumer_access = await getConsumerAccess(
      envCtx,
      this.keystone,
      namespaces,
      serviceLookup
    );
    const consumer_metrics = await getReportOfConsumerMetrics(
      this.keystone,
      namespaces,
      serviceLookup,
      consumer_access
    );
    const consumer_controls = await getConsumerControls(
      this.keystone,
      namespaces,
      serviceLookup
    );

    const data = {
      namespaces,
      ns_access,
      gateway_metrics,
      gateway_controls,
      consumer_access,
      consumer_metrics,
      consumer_controls,
    };

    return generateExcelWorkbook(data);
  }
}

function gatewayToMap(services: ReportOfGatewayMetrics[]) {
  const map: Map<string, ReportOfGatewayMetrics> = new Map();
  services.forEach((svc) => {
    map.set(svc.service_name, svc);
  });
  return map;
}
