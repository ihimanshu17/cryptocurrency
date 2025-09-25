import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface TradeHistoryProps {
  symbol: string;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ symbol }) => {
  const { trades } = useWebSocket();
  const filteredTrades = trades.filter(t => t.symbol === symbol).slice(0, 50);

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold">Trade History</h3>
      </div>
      <div className="flex-1 overflow-y-auto text-sm font-mono">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-gray-400">Price</div>
          <div className="text-gray-400">Qty</div>
          <div className="text-gray-400">Time</div>
        </div>
        {filteredTrades.map(t => (
          <div key={t.trade_id} className="grid grid-cols-3 gap-2">
            <span className={t.aggressor_side === 'buy' ? 'text-crypto-green' : 'text-crypto-red'}>
              {parseFloat(t.price).toLocaleString()}
            </span>
            <span>{parseFloat(t.quantity).toFixed(6)}</span>
            <span className="text-gray-400 text-xs">{new Date(t.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
