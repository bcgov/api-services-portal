import { FieldErrors, ValidateError } from 'tsoa';
import { SimpleServicePattern } from './patterns/simple-service';
import { SDXRuntimeGroupPattern } from './patterns/sdx-runtime-group';
import { SDXP2PConsumerPattern } from './patterns/sdx-p2p-consumer';
import { SDXP2PProviderPattern } from './patterns/sdx-p2p-provider';

interface PatternProcessor {
  id: string;
  requiredParams: string[];
  eval: (inputs: Record<string, string>, data?: any) => any[];
  inject?: (ctx: any, inputs: Record<string, string>) => Promise<any>;
}

const PATTERNS: Record<string, PatternProcessor> = {
  [SimpleServicePattern.id]: SimpleServicePattern,
  [SDXRuntimeGroupPattern.id]: SDXRuntimeGroupPattern,
  [SDXP2PConsumerPattern.id]: SDXP2PConsumerPattern,
  [SDXP2PProviderPattern.id]: SDXP2PProviderPattern,
};

export interface GatewayPatternConfig {
  pattern: string;
  delete?: boolean;
  parameters: Record<string, string>;
}

export function assertAndRaiseValidateError(
  condition: boolean,
  reason: string,
  field: string,
  message: string
) {
  if (!condition) {
    raiseValidateError(reason, field, message);
  }
}

export function raiseValidateError(
  reason: string,
  field: string,
  message: string
) {
  throw new ValidateError(
    {
      [field]: {
        message,
      },
    },
    reason
  );
}

export async function GetConfigUsingPattern(
  ctx: any,
  inputs: GatewayPatternConfig
): Promise<any> {
  if (PATTERNS[inputs.pattern]) {
    const pattern = PATTERNS[inputs.pattern];
    expectRequiredParams(inputs.parameters, pattern.requiredParams);
    if (pattern.inject) {
      const data = await pattern.inject(ctx, inputs.parameters);
      return { documents: pattern.eval(inputs.parameters, data) };
    } else {
      return { documents: pattern.eval(inputs.parameters) };
    }
  } else {
    raiseValidateError(
      'Invalid input',
      'inputs.pattern',
      'unsupported pattern'
    );
  }
}

function expectRequiredParams(
  provided: Record<string, string>,
  required: string[]
) {
  const errors: FieldErrors = {};

  for (const param of required) {
    if (!provided[param]) {
      errors[param] = {
        message: 'missing required parameter',
      };
    }
  }
  if (Object.keys(errors).length > 0) {
    throw new ValidateError(errors, 'Invalid input');
  }
}
