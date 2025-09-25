import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface MarketDataProps {
  symbol: string;
}

export const MarketData: React.FC<MarketDataProps> = ({ symbol }) => {
  const { marketData } = useWebSocket();
  const data = marketData[symbol];

  if (!data) return <div className="p-4 text-gray-400">No market data</div>;

  const bestBid = data.bids?.[0]?.[0];
  const bestAsk = data.asks?.[0]?.[0];

  return (
    <div className="p-4 h-full flex items-center justify-around text-sm text-white">
      <div className="flex flex-col items-center">
        <span className="text-gray-400 text-xs">Symbol</span>
        <span className="font-semibold">{symbol}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-gray-400 text-xs">Best Bid</span>
        <span className="text-crypto-green font-mono">{bestBid ? parseFloat(bestBid).toLocaleString() : '--'}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-gray-400 text-xs">Best Ask</span>
        <span className="text-crypto-red font-mono">{bestAsk ? parseFloat(bestAsk).toLocaleString() : '--'}</span>
      </div>
    </div>
  );
};
