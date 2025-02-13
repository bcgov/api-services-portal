import format from 'date-fns/format';
import subDays from 'date-fns/subDays';
import times from 'lodash/times';
import fetch from 'node-fetch';
import { strict as assert } from 'assert';

export function dateRange(days = 5): string[] {
  const result = [] as string[];
  const today = new Date();

  times(days, (n) => {
    const nextDate = subDays(today, n);
    const formatedDate = format(nextDate, 'yyyy-MM-dd');
    result.push(formatedDate);
  });

  return result;
}

export function transformSingleValueAttributes(
  object: any,
  keys: string[]
): void {
  keys.forEach((k) => {
    const data = object[k];
    if (data && data.length > 0) {
      object[k] = data[0];
    } else {
      delete object[k];
    }
  });
}

function camelize(str: string) {
  return str
    .replace(/-/g, ' ')
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word: string, index: number) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

export function camelCaseAttributes(object: any, keys: string[]): void {
  keys.forEach((k) => {
    if (k in object) {
      const newKey = camelize(k);
      if (newKey != k) {
        object[newKey] = object[k];
        delete object[k];
      }
    }
  });
}

export function regExprValidation(
  rule: string,
  value: string,
  errorMessage: string
) {
  const re = new RegExp(rule);
  assert.ok(re.test(value), errorMessage);
}

export async function fetchWithTimeout(resource: string, options: any = {}) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

export function alphanumericNoSpaces(str: string) {
  return str.replace(/[^A-Za-z0-9 :-]/gim, '').replace(/[ :]/gim, '-');
}

export function dedup(ls: string[]) {
  return [...new Set(ls)];
}
