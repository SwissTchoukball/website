import { parse } from 'date-fns';

export const isDigits = (val: string) => /^\d+$/.test(val);

export const isDigitsString = (val: any) => typeof val === 'string' && isDigits(val);

/**
 * Format bytes as human-readable text.
 */
export const humanFileSize = (bytes: number, dp = 1, locale = 'en') => {
  const thresh = 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  // These need to be units from https://tc39.es/proposal-unified-intl-numberformat/section6/locales-currencies-tz_proposed_out.html#sec-issanctionedsimpleunitidentifier
  const units = ['kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return new Intl.NumberFormat(locale, { style: 'unit', unit: units[u], maximumFractionDigits: dp }).format(bytes);
};

/**
 * Parses a date provided by Leverade
 *
 * Leverade provides dates in UTC, even though it is not specified in the given string.
 *
 * This makes sure the timezone information is properly added to the Date.
 */
export const parseLeveradeDate = (leveradeDate: string): Date | undefined => {
  // We manually and explicitely set that the provided date is UTC (Z)
  const parsedDate = parse(`${leveradeDate} Z`, 'yyyy-MM-dd HH:mm:ss X', new Date());
  return parsedDate || undefined;
};

export const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const toISOLocal = (d: Date) => {
  const z = (n: number) => ('0' + n).slice(-2);
  const zz = (n: number) => ('00' + n).slice(-3);
  let off = d.getTimezoneOffset();
  const sign = off > 0 ? '-' : '+';
  off = Math.abs(off);

  return (
    d.getFullYear() +
    '-' +
    z(d.getMonth() + 1) +
    '-' +
    z(d.getDate()) +
    'T' +
    z(d.getHours()) +
    ':' +
    z(d.getMinutes()) +
    ':' +
    z(d.getSeconds()) +
    '.' +
    zz(d.getMilliseconds()) +
    sign +
    z((off / 60) | 0) +
    ':' +
    z(off % 60)
  );
};
