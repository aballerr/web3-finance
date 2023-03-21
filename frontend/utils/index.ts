// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.substring(0, chars + 2)}...${address.substring(
    42 - chars
  )}`;
};

export const pluralize = (text: string, length: number) => {
  if (length === 1) return text;
  return `${text}s`;
};

export const formatToDollar = (number: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
  }).format(number);

export const formatNumber = (number: number) =>
  new Intl.NumberFormat("en-US", {}).format(number);

export const formatPercentage = (number: number) =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
  }).format(number);
