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

export const parseLeveradeDate = (leveradeDate: string): Date | null => {
  // The date and time given by Leverade is given without timezone information and the documentation
  // doesn't specify what's the behaviour for the given time.
  // Observations:
  // - In December 2021 (winter time), when retrieving a match from September that is scheduled at 20:40 UTC+2, the time given by the API is 18:40
  // - In December 2021 (winter time), when retrieving a match from January that is scheduled at 20:30 UTC+1, the time given by the API is 19:30
  // It would appear that the time is given in UTC.
  // TODO: Check what's the behaviour when we'll be in summer time and adapt the implementation accordingly, if needed.

  // We manually and explicitely set that the provided date is UTC (Z)
  const parsedDate = parse(`${leveradeDate} Z`, 'yyyy-MM-dd HH:mm:ss X', new Date());
  return parsedDate || null;
};
