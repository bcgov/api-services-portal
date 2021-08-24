import * as React from 'react';
import { useAuth } from '@/shared/services/auth';
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
  const { user } = useAuth();
  const totalNamespaceRequests: number = React.useMemo(() => {
    let result = 0;

    if (user) {
      try {
        const { namespace } = user;

        if (data?.allMetrics) {
          data.allMetrics.forEach((m) => {
            const metric = JSON.parse(m.metric);

            if (metric.namespace === namespace) {
              const values = JSON.parse(m.values);
              const dayValues = values.reduce(
                (memo: number, v: number[] | [number, string]) => {
                  return memo + Number(v[1]);
                },
                0
              );
              result = result + dayValues;
            }
          });
        }
      } catch {
        return result;
      }
    }

    return result;
  }, [data, user]);

  return totalNamespaceRequests;
}
