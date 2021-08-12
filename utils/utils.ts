export const isDigits = (val: string) => /^\d+$/.test(val);

export const isDigitsString = (val: any) => typeof val === 'string' && isDigits(val);
