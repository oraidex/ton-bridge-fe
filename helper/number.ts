import { CW20_DECIMALS, validateNumber } from "@oraichain/oraidex-common";

// TODO: need to seperate format funcs to format module later.
export const formatDisplayUsdt = (
  amount: number | string,
  dp = 2,
  dpMin = 4
): string => {
  const validatedAmount = validateNumber(amount);
  if (validatedAmount < 1)
    return `$${toFixedIfNecessary(amount.toString(), dpMin).toString()}`;

  return `$${numberWithCommas(
    toFixedIfNecessary(amount.toString(), dp),
    undefined,
    { maximumFractionDigits: 6 }
  )}`;
  // return `$${numberWithCommas(toFixedIfNecessary(amount.toString(), dp))}`;
};

export const formatDisplayClaimable = (
  amount: number | string,
  dp = 2
): string => {
  const validatedAmount = validateNumber(amount);
  if (validatedAmount < 1) {
    const displayValue = toFixedIfNecessary(amount.toString(), 4);
    return !displayValue
      ? "0"
      : `+$${toFixedIfNecessary(amount.toString(), 4).toString()}`;
  }

  return `$${numberWithCommas(
    toFixedIfNecessary(amount.toString(), dp),
    undefined,
    { maximumFractionDigits: 6 }
  )}`;
  // return `+$${numberWithCommas(toFixedIfNecessary(amount.toString(), dp))}`;
};

export const toFixedIfNecessary = (value: string, dp: number): number => {
  return +parseFloat(value).toFixed(dp);
};

// add `,` when split thounsand value.
export const numberWithCommas = (
  x: number,
  locales: Intl.LocalesArgument = undefined,
  options: Intl.NumberFormatOptions = {}
) => {
  if (isNegative(x)) return "0";
  return x.toLocaleString(locales, options);
};

export const isNegative = (number) => number <= 0;

export const DECIMAL_TOKEN_FEE = 3;

export const formatDisplayNumber = (
  num: number,
  decimal: number = CW20_DECIMALS
) => {
  if (num <= 0.001) {
    return "~0.001";
  }

  return numberWithCommas(num, undefined, { maximumFractionDigits: decimal });
};
