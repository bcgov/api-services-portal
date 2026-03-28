import { Keystone } from '@keystonejs/keystone';
import ExcelJS from 'exceljs';
import {
  getGwaProductEnvironment,
  injectResSvrAccessTokenToContext,
} from '../workflow/get-namespaces';
import { generateExcelWorkbook } from './output/xls-generator';
import {
  getConsumerControls,
  getReportOfConsumerMetrics,
  getServiceAccess,
  getConsumerRequests,
  getConsumerAccess,
  getGatewayControls,
  getNamespaces,
  getNamespaceAccess,
  getGatewayMetrics,
  ReportOfGatewayMetrics,
} from './data';
import { rollupFeatures } from './data/namespaces';
import { getProducts } from './data/products';

export class WorkbookService {
  keystone: Keystone;

  constructor(keystone: Keystone) {
    this.keystone = keystone;
  }

  public async buildWorkbook(ids: string[] = []): Promise<ExcelJS.Workbook> {
    const envCtx = await getGwaProductEnvironment(this.keystone, true);

    await injectResSvrAccessTokenToContext(envCtx);

    const namespaces = (await getNamespaces(envCtx)).filter(
      (ns) => ids.length === 0 || ids.includes(ns.resource_id)
    );
    const ns_access = await getNamespaceAccess(
      this.keystone,
      envCtx,
      namespaces
    );
    const gateway_metrics = await getGatewayMetrics(this.keystone, namespaces);
    const serviceLookup: Map<string, ReportOfGatewayMetrics> = gatewayToMap(
      gateway_metrics
    );

    const products = await getProducts(this.keystone, namespaces);

    rollupFeatures(namespaces, gateway_metrics, products);

    const gateway_controls = await getGatewayControls(
      this.keystone,
      namespaces,
      serviceLookup
    );
    const service_access = await getServiceAccess(
      envCtx,
      this.keystone,
      namespaces,
      serviceLookup
    );
    const consumer_requests = await getConsumerRequests(
      this.keystone,
      namespaces
    );
    const consumer_access = await getConsumerAccess(
      envCtx,
      this.keystone,
      namespaces,
      serviceLookup
    );
    // const consumer_metrics = await getReportOfConsumerMetrics(
    //   this.keystone,
    //   namespaces,
    //   serviceLookup,
    //   consumer_access
    // );
    const consumer_controls = await getConsumerControls(
      this.keystone,
      namespaces,
      serviceLookup
    );

    const data = {
      namespaces,
      ns_access,
      products,
      gateway_metrics,
      gateway_controls,
      service_access,
      consumer_requests,
      consumer_access,
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
