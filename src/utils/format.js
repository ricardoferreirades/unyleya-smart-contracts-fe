import { parseUnits, formatUnits } from 'ethers';

/**
 * Convert a decimal string to Wei (18 decimals)
 * @param {string} amount - Decimal string (e.g., "100")
 * @returns {bigint} Amount in Wei
 */
export const parseUnits18 = (amount) => {
  return parseUnits(amount, 18);
};

/**
 * Convert Wei to a decimal string (18 decimals)
 * @param {bigint|string} amount - Amount in Wei
 * @returns {string} Decimal string
 */
export const formatUnits18 = (amount) => {
  return formatUnits(amount, 18);
};

