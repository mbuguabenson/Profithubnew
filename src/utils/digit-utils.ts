/**
 * Returns the correct number of decimal places for a given symbol.
 * 1-second (1HZ) markets require 3 decimal places for correct digit extraction.
 * @param symbol The Deriv symbol (e.g., R_100, 1HZ10V).
 * @returns The number of decimal places (pip).
 */
export const getSymbolPips = (symbol: string): number => {
    if (!symbol) return 2;
    if (symbol.startsWith('1HZ')) return 3;
    return 2; // Default to 2 for most indices
};

/**
 * Robustly extracts the last digit of a price, ensuring trailing zeros are preserved.
 * @param price The price as a number or string.
 * @param pip The number of decimal places for the symbol.
 * @returns The last digit (0-9).
 */
export const getSafeLastDigit = (price: number | string, pip: number = 2): number => {
    const p = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(p)) return 0;
    
    // Use toFixed to ensure the number of decimal places is consistent with the market's pip.
    const fixed_price = p.toFixed(pip);
    const last_char = fixed_price[fixed_price.length - 1];
    const digit = parseInt(last_char);
    
    return isNaN(digit) ? 0 : digit;
};
