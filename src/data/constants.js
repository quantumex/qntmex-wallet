export const TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', balance: 4.2081, value: 14203, change: 2.3, color: '#627EEA' },
  { symbol: 'USDT', name: 'Tether', balance: 3200, value: 3200, change: 0.0, color: '#26A17B' },
  { symbol: 'QNTM', name: 'QuantumEX', balance: 50000, value: 8750, change: 5.1, color: '#C9A84C' },
  { symbol: 'LINK', name: 'Chainlink', balance: 142.5, value: 2108, change: -1.2, color: '#2A5ADA' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', balance: 0.085, value: 5610, change: 1.8, color: '#F7931A' },
];

export const TRANSACTIONS = [
  { id: '1', type: 'receive', amount: +1.5, token: 'ETH', time: '2h ago', address: '0xABCD...78EF' },
  { id: '2', type: 'send', amount: -500, token: 'USDT', time: '4h ago', address: '0x1234...5678' },
  { id: '3', type: 'swap', amount: -0.1, token: 'ETH', time: '1d ago', address: 'QTM -> ETH' },
  { id: '4', type: 'receive', amount: +10000, token: 'QNTM', time: '2d ago', address: '0x9A8B...CD12' },
];

export const RECENT_ADDRESSES = [
  { label: 'Vault A', address: '0x1A2B3C4D5E6F7890' },
  { label: 'Trading Desk', address: '0xABCDEF0123456789' },
  { label: 'Cold Storage', address: '0xDEFABC137024682' },
];

export const WALLET_ADDRESS = '0x1A9f3C4D5E6F7890ABCDEF0123456789';

export const RATES = {
  ETH: 3375.25,
  USDT: 1.00,
  QNTM: 0.175,
  LINK: 14.79,
  WBTC: 66000,
};
