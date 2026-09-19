import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/products';

export function formatPrice(amountInUSD: number, currency: Currency): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = amountInUSD * info.rate;
  
  if (currency === 'JPY') {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${info.symbol}${converted.toFixed(0)}`;
}
