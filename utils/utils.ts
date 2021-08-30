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
