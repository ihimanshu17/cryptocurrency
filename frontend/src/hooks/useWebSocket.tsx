import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface MarketData {
  timestamp: string;
  symbol: string;
  bids: [string, string][];
  asks: [string, string][];
}

interface TradeExecution {
  timestamp: string;
  symbol: string;
  trade_id: string;
  price: string;
  quantity: string;
  aggressor_side: string;
  maker_order_id: string;
  taker_order_id: string;
}

interface OrderResponse {
  order_id: string;
  status: string;
  filled_quantity: number;
  remaining_quantity: number;
  average_price?: number;
  trades: TradeExecution[];
  timestamp: string;
}

interface WebSocketContextType {
  marketData: { [symbol: string]: MarketData };
  trades: TradeExecution[];
  isConnected: boolean;
  submitOrder: (order: any) => Promise<OrderResponse>;
  connectionStats: {
    marketDataConnected: boolean;
    tradesConnected: boolean;
    reconnectAttempts: number;
  };
}

const WebSocketContext = createContext<WebSocketContextType>({
  marketData: {},
  trades: [],
  isConnected: false,
  submitOrder: async () => ({ order_id: '', status: '', filled_quantity: 0, remaining_quantity: 0, trades: [], timestamp: '' }),
  connectionStats: {
    marketDataConnected: false,
    tradesConnected: false,
    reconnectAttempts: 0,
  }
});

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [marketData, setMarketData] = useState<{ [symbol: string]: MarketData }>({});
  const [trades, setTrades] = useState<TradeExecution[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStats, setConnectionStats] = useState({
    marketDataConnected: false,
    tradesConnected: false,
    reconnectAttempts: 0,
  });

  const marketDataWs = useRef<WebSocket | null>(null);
  const tradesWs = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const API_BASE = process.env.REACT_APP_API_BASE || 'localhost:8000';
  const WS_BASE = `ws://${API_BASE}`;

  // Submit order via REST API
  const submitOrder = async (order: any): Promise<OrderResponse> => {
    try {
      const response = await fetch(`http://${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  };

  // Connect to market data WebSocket
  const connectMarketData = () => {
    if (marketDataWs.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('Connecting to market data WebSocket...');
    marketDataWs.current = new WebSocket(`${WS_BASE}/ws/market-data`);

    marketDataWs.current.onopen = () => {
      console.log('Market data WebSocket connected');
      setConnectionStats(prev => ({ ...prev, marketDataConnected: true, reconnectAttempts: 0 }));
      updateConnectionStatus();
    };

    marketDataWs.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'market_data' && message.data) {
          setMarketData(prev => ({
            ...prev,
            [message.data.symbol]: message.data
          }));
        }
      } catch (error) {
        console.error('Error parsing market data message:', error);
      }
    };

    marketDataWs.current.onclose = () => {
      console.log('Market data WebSocket disconnected');
      setConnectionStats(prev => ({ ...prev, marketDataConnected: false }));
      updateConnectionStatus();
      scheduleReconnect('market-data');
    };

    marketDataWs.current.onerror = (error) => {
      console.error('Market data WebSocket error:', error);
    };
  };

  // Connect to trades WebSocket
  const connectTrades = () => {
    if (tradesWs.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('Connecting to trades WebSocket...');
    tradesWs.current = new WebSocket(`${WS_BASE}/ws/trades`);

    tradesWs.current.onopen = () => {
      console.log('Trades WebSocket connected');
      setConnectionStats(prev => ({ ...prev, tradesConnected: true }));
      updateConnectionStatus();
    };

    tradesWs.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'trade' && message.data) {
          setTrades(prev => [message.data, ...prev.slice(0, 99)]); // Keep last 100 trades
        }
      } catch (error) {
        console.error('Error parsing trade message:', error);
      }
    };

    tradesWs.current.onclose = () => {
      console.log('Trades WebSocket disconnected');
      setConnectionStats(prev => ({ ...prev, tradesConnected: false }));
      updateConnectionStatus();
      scheduleReconnect('trades');
    };

    tradesWs.current.onerror = (error) => {
      console.error('Trades WebSocket error:', error);
    };
  };

  // Update overall connection status
  const updateConnectionStatus = () => {
    setIsConnected(
      marketDataWs.current?.readyState === WebSocket.OPEN &&
      tradesWs.current?.readyState === WebSocket.OPEN
    );
  };

  // Schedule reconnection
  const scheduleReconnect = (type: string) => {
    setConnectionStats(prev => {
      if (prev.reconnectAttempts >= maxReconnectAttempts) {
        console.log(`Max reconnect attempts reached for ${type}`);
        return prev;
      }

      const newAttempts = prev.reconnectAttempts + 1;
      console.log(`Scheduling reconnect for ${type} (attempt ${newAttempts})`);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        if (type === 'market-data') {
          connectMarketData();
        } else if (type === 'trades') {
          connectTrades();
        }
      }, reconnectDelay * newAttempts); // Exponential backoff

      return { ...prev, reconnectAttempts: newAttempts };
    });
  };

  // Initialize connections
  useEffect(() => {
    connectMarketData();
    connectTrades();

    // Heartbeat to keep connections alive
    const heartbeatInterval = setInterval(() => {
      if (marketDataWs.current?.readyState === WebSocket.OPEN) {
        marketDataWs.current.send(JSON.stringify({ type: 'ping' }));
      }
      if (tradesWs.current?.readyState === WebSocket.OPEN) {
        tradesWs.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds

    return () => {
      clearInterval(heartbeatInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (marketDataWs.current) {
        marketDataWs.current.close();
      }
      if (tradesWs.current) {
        tradesWs.current.close();
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (marketDataWs.current) {
        marketDataWs.current.close();
      }
      if (tradesWs.current) {
        tradesWs.current.close();
      }
    };
  }, []);

  const value: WebSocketContextType = {
    marketData,
    trades,
    isConnected,
    submitOrder,
    connectionStats,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};