export const TOKENS = [
  { symbol: 'ETH',  name: 'Ethereum',    bal: '4.2081', usd: '14,203', color: '#627EEA', spark: [3,4,3.5,5,4.8,6,5.5,6.2], change: '+2.4%',  up: true  },
  { symbol: 'USDT', name: 'Tether',      bal: '3,200',  usd: '3,200',  color: '#26A17B', spark: [4,4,4.1,4,4,4.1,4,4],     change: '+0.01%', up: true  },
  { symbol: 'QNTM', name: 'QNTMEX',      bal: '50,000', usd: '8,750',  color: '#C9A84C', spark: [2,3,4,3.5,5,6,7,8],       change: '+12.3%', up: true  },
  { symbol: 'LINK', name: 'Chainlink',   bal: '142.5',  usd: '2,108',  color: '#2A5ADA', spark: [5,4,4.5,3.8,4.2,3.5,4,3.8],change: '-1.2%', up: false },
  { symbol: 'WBTC', name: 'Wrapped BTC', bal: '0.085',  usd: '5,610',  color: '#F7931A', spark: [4,5,4.5,6,5.5,7,6.5,8],   change: '+3.1%',  up: true  },
];
export const TRANSACTIONS = [
  { icon: '↓', label: 'Received ETH',  sub: '0x4f3a...b12c', amt: '+0.5 ETH',     time: '2h ago', up: true  },
  { icon: '↑', label: 'Sent USDT',     sub: '0x9d1e...44fa', amt: '-500 USDT',    time: '5h ago', up: false },
  { icon: '⇄', label: 'Swapped QNTM',  sub: 'ETH → QNTM',    amt: '+10,000 QNTM', time: '1d ago', up: true  },
  { icon: '↓', label: 'Received LINK', sub: '0x7c2b...991d', amt: '+25 LINK',     time: '2d ago', up: true  },
];
export const RECENT_ADDRESSES = ['0x4f3a...b12c', '0x9d1e...44fa', 'vitalik.eth'];
export const BALANCES = { ETH: '4.2081', USDT: '3,200', QNTM: '50,000', LINK: '142.5', WBTC: '0.085' };
export const RATES = { 'ETH-QNTM': 11905, 'ETH-USDT': 3375, 'ETH-LINK': 228, 'USDT-QNTM': 3.5, 'QNTM-USDT': 0.175 };
export const WALLET_ADDRESS = '0x3F5aCd91B4b12C6B9D3F2E8a7C4D0E9F2B1A5C8';
