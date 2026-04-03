/**
 * Technical indicators calculation for high-frequency tick data.
 * Optimized for 1s synthetic markets.
 */

export type TOHLC = {
    open: number;
    high: number;
    low: number;
    close: number;
    time: number;
    is_up: boolean;
};

/**
 * Calculates the Commodity Channel Index (CCI) for a given data set.
 * @param prices Array of prices.
 * @param period Lookback period.
 * @returns CCI value.
 */
export const calculateCCI = (prices: number[], period: number = 20): number => {
    if (prices.length < period) return 0;
    const window = prices.slice(-period);
    const sma = window.reduce((a, b) => a + b, 0) / period;
    const meanDeviation = window.reduce((a, b) => a + Math.abs(b - sma), 0) / period;
    
    if (meanDeviation === 0) return 0;
    return (prices[prices.length - 1] - sma) / (0.015 * meanDeviation);
};

/**
 * Calculates the Exponential Moving Average (EMA).
 */
export const calculateEMA = (prices: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
        ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
};

/**
 * Calculates MACD (12, 26, 9).
 */
export const calculateMACD = (prices: number[]) => {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };
    
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    
    const macdLine = ema12.map((val, i) => val - ema26[i]);
    const signalLine = calculateEMA(macdLine.slice(-30), 9);
    
    const macd = macdLine[macdLine.length - 1];
    const signal = signalLine[signalLine.length - 1];
    
    return {
        macd,
        signal,
        histogram: macd - signal,
    };
};

/**
 * Calculates Donchian Channels.
 */
export const calculateDonchian = (prices: number[], period: number = 20) => {
    if (prices.length < period) return { upper: prices[0], middle: prices[0], lower: prices[0] };
    const window = prices.slice(-period);
    const upper = Math.max(...window);
    const lower = Math.min(...window);
    return {
        upper,
        lower,
        middle: (upper + lower) / 2
    };
};

/**
 * Converts ticks to behavioral candles.
 * @param prices Array of tick prices.
 * @param ticksPerCandle Group size.
 */
export const convertToCandles = (prices: number[], ticksPerCandle: number = 5): TOHLC[] => {
    const candles: TOHLC[] = [];
    for (let i = 0; i < prices.length; i += ticksPerCandle) {
        const chunk = prices.slice(i, i + ticksPerCandle);
        if (chunk.length === 0) continue;
        
        const open = chunk[0];
        const close = chunk[chunk.length - 1];
        const high = Math.max(...chunk);
        const low = Math.min(...chunk);
        
        candles.push({
            open,
            high,
            low,
            close,
            time: i,
            is_up: close >= open
        });
    }
    return candles;
};

/**
 * Detects candle patterns.
 */
export const detectPattern = (candles: TOHLC[]) => {
    if (candles.length < 2) return null;
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    
    const bodySize = Math.abs(last.close - last.open);
    const candleSize = last.high - last.low;
    
    // Marubozu: Strong body, minimal wick
    const isMarubozu = bodySize > candleSize * 0.9 && bodySize > 0;
    
    // Reversal: Small body, long wick opposite to trend
    const isReversal = bodySize < candleSize * 0.3 && (last.high - Math.max(last.open, last.close) > bodySize || Math.min(last.open, last.close) - last.low > bodySize);
    
    if (isMarubozu) return last.is_up ? 'BULLISH_MARUBOZU' : 'BEARISH_MARUBOZU';
    if (isReversal) return 'REVERSAL_SIGNAL';
    
    return null;
};
