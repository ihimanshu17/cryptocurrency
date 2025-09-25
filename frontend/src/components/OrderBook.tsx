import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface OrderBookProps {
  symbol: string;
}

export const OrderBook: React.FC<OrderBookProps> = ({ symbol }) => {
  const { marketData } = useWebSocket();
  const data = marketData[symbol];

  const bids = data?.bids?.slice(0, 10) || [];
  const asks = data?.asks?.slice(0, 10) || [];

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-white font-semibold mb-2">Order Book</h3>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 text-sm">
          <div className="text-crypto-green">
            <div className="font-mono text-xs">Bids</div>
            {bids.map(([price, qty], idx) => (
              <div key={idx} className="flex justify-between">
                <span>{parseFloat(price).toLocaleString()}</span>
                <span>{parseFloat(qty).toFixed(6)}</span>
              </div>
            ))}
          </div>
          <div className="text-crypto-red">
            <div className="font-mono text-xs">Asks</div>
            {asks.map(([price, qty], idx) => (
              <div key={idx} className="flex justify-between">
                <span>{parseFloat(price).toLocaleString()}</span>
                <span>{parseFloat(qty).toFixed(6)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
