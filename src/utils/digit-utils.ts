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
    // This prevents "1.50" being treated as "1.5" (last digit 5 instead of 0).
    const fixed_price = p.toFixed(pip);
    const last_char = fixed_price[fixed_price.length - 1];
    const digit = parseInt(last_char);

    return isNaN(digit) ? 0 : digit;
};
