import format from 'date-fns/format';
import subDays from 'date-fns/subDays';
import times from 'lodash/times';

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
