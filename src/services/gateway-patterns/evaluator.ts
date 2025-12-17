import { SimpleServicePattern } from './patterns/simple-service';

const PATTERNS = {
  [SimpleServicePattern.id]: SimpleServicePattern,
};

export interface GatewayPatternConfig {
  pattern: string;
  delete?: boolean;
  parameters: Record<string, string>;
}

export async function GetConfigUsingPattern(
  ctx: any,
  inputs: GatewayPatternConfig
): Promise<any> {
  if (PATTERNS[inputs.pattern]) {
    const pattern = PATTERNS[inputs.pattern];
    expectRequiredParams(inputs.parameters, pattern.requiredParams);
    return pattern.eval(inputs.parameters);
  } else {
    throw new Error(
      `GetConfigUsingPattern: unsupported pattern ${inputs.pattern}`
    );
  }
}

function expectRequiredParams(
  provided: Record<string, string>,
  required: string[]
) {
  for (const param of required) {
    if (!provided[param]) {
      throw new Error(`missing required parameter: ${param}`);
    }
  }
}
