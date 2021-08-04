import * as React from 'react';
import format from 'date-fns/format';
import subDays from 'date-fns/subDays';
import times from 'lodash/times';
import { Query } from '@/shared/types/query.types';

export function dateRange(days = 5): string[] {
  const result = [];
  const today = new Date();

  times(days, (n) => {
    const nextDate = subDays(today, n);
    const formatedDate = format(nextDate, 'yyyy-MM-dd');
    result.push(formatedDate);
  });

  return result;
}

export function useTotalRequests(data: Query): number {
  const totalNamespaceRequests: number = React.useMemo(() => {
    let result = 0;
    try {
      if (data?.allMetrics) {
        data.allMetrics.forEach((m) => {
          const values = JSON.parse(m.values);
          const dayValues = values.reduce(
            (memo: number, v: number[] | [number, string]) => {
              return memo + Number(v[1]);
            },
            0
          );
          result = result + dayValues;
        });
      }
    } catch {
      return result;
    }

    return result;
  }, [data]);

  return totalNamespaceRequests;
}
