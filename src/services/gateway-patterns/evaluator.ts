import { FieldErrors, ValidateError } from 'tsoa';
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
    return { documents: pattern.eval(inputs.parameters) };
  } else {
    throw new ValidateError(
      {
        [inputs.pattern]: {
          message: 'unsupported pattern',
        },
      },
      'Invalid input'
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
