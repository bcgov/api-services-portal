// node dist/test/integrated/gateway-patterns/evaluator.js

import { GetConfigUsingPattern } from '../../../services/gateway-patterns/evaluator';
import { logger } from '../../../logger';
import YAML from 'js-yaml';

(async () => {
  logger.info('Running integrated test for GatewayPatternEvaluator');

  const patternConfig = {
    pattern: 'simple-service.r1',
    parameters: {
      gateway_id: 'gw-4a136',
      service_name: 'ajc-test-2',
      service_url: 'https://httpbun.com',
    },
  };

  const result = await GetConfigUsingPattern(undefined, patternConfig);
  const docs = result.documents.map((r: any) => YAML.dump(r)).join('---\n');
  console.log(docs);
})();
