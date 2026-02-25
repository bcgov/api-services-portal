export interface SimpleServicePatternConfig extends Record<string, string> {
  gateway_id: string;
  service_name: string;
  service_url: string;
}

export const SimpleServicePattern = {
  id: 'simple-service.r1',
  requiredParams: ['gateway_id', 'service_name', 'service_url'],
  eval: (inputs: Record<string, string>) => {
    const nm = `sdx.${inputs.service_name}`;
    const nsQualifier = inputs.service_name;
    return [
      {
        kind: 'GatewayService',
        name: nm,
        tags: [`ns.${inputs.gateway_id}.${nsQualifier}`],
        url: inputs.service_url,
        routes: [
          {
            name: nm,
            tags: [`ns.${inputs.gateway_id}.${nsQualifier}`],
            hosts: [`${inputs.service_name}.dev.api.gov.bc.ca`],
          },
        ],
      },
    ];
  },
};
