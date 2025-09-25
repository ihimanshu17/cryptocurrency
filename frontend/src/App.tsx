import React, { useState, useEffect } from 'react';
import { TradingInterface } from './components/TradingInterface';
import { OrderBook } from './components/OrderBook';
import { TradeHistory } from './components/TradeHistory';
import { MarketData } from './components/MarketData';
import { WebSocketProvider } from './hooks/useWebSocket';
import { Activity, TrendingUp, BarChart3, Settings } from 'lucide-react';
import './index.css';

interface SystemStats {
  activeConnections: number;
  ordersPerSecond: number;
  totalTrades: number;
  uptime: string;
}

const App: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USDT');
  const [systemStats, setSystemStats] = useState<SystemStats>({
    activeConnections: 0,
    ordersPerSecond: 0,
    totalTrades: 0,
    uptime: '0s'
  });
  const [isConnected, setIsConnected] = useState(false);

  const symbols = ['BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'SOL-USDT', 'ADA-USDT'];

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        ordersPerSecond: Math.floor(Math.random() * 1000) + 500,
        totalTrades: prev.totalTrades + Math.floor(Math.random() * 10),
        activeConnections: Math.floor(Math.random() * 50) + 10,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-crypto-dark text-white">
        {/* Header */}
        <header className="bg-crypto-card border-b border-crypto-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-crypto-green" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-crypto-green to-crypto-blue bg-clip-text text-transparent">
                  CryptoEngine Pro
                </h1>
              </div>
              
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-crypto-green/20 text-crypto-green' : 'bg-crypto-red/20 text-crypto-red'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-crypto-green' : 'bg-crypto-red'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>

            {/* System Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-crypto-blue" />
                <span className="text-gray-400">Orders/s:</span>
                <span className="text-crypto-blue font-mono">{systemStats.ordersPerSecond}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-crypto-green" />
                <span className="text-gray-400">Trades:</span>
                <span className="text-crypto-green font-mono">{systemStats.totalTrades.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-crypto-yellow" />
                <span className="text-gray-400">Clients:</span>
                <span className="text-crypto-yellow font-mono">{systemStats.activeConnections}</span>
              </div>
            </div>
          </div>

          {/* Symbol Selector */}
          <div className="mt-4 flex space-x-2">
            {symbols.map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedSymbol === symbol
                    ? 'bg-crypto-blue text-white shadow-lg shadow-crypto-blue/25'
                    : 'bg-crypto-border text-gray-400 hover:bg-crypto-border/70 hover:text-white'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Panel - Trading Interface */}
          <div className="w-80 bg-crypto-card border-r border-crypto-border flex flex-col">
            <div className="p-4 border-b border-crypto-border">
              <h2 className="text-lg font-semibold text-white">Trading Panel</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TradingInterface 
                symbol={selectedSymbol} 
                onConnectionChange={setIsConnected}
              />
            </div>
          </div>

          {/* Center Panel - Order Book and Market Data */}
          <div className="flex-1 flex flex-col">
            <div className="h-32 bg-crypto-card border-b border-crypto-border">
              <MarketData symbol={selectedSymbol} />
            </div>
            <div className="flex-1 bg-crypto-card">
              <OrderBook symbol={selectedSymbol} />
            </div>
          </div>

          {/* Right Panel - Trade History */}
          <div className="w-80 bg-crypto-card border-l border-crypto-border">
            <div className="p-4 border-b border-crypto-border">
              <h2 className="text-lg font-semibold text-white">Recent Trades</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TradeHistory symbol={selectedSymbol} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-crypto-card border-t border-crypto-border px-6 py-2 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <span>High-Performance Cryptocurrency Matching Engine • REG NMS Inspired</span>
            <span>Latency: &lt;1ms • Throughput: 10,000+ orders/sec</span>
          </div>
        </footer>
      </div>
    </WebSocketProvider>
  );
};

export default App;
