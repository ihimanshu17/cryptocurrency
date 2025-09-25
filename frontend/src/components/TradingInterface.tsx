import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface TradingInterfaceProps {
  symbol: string;
  onConnectionChange: (connected: boolean) => void;
}

interface OrderForm { orderType: 'market'|'limit'|'ioc'|'fok'; side: 'buy'|'sell'; quantity: string; price: string; }
interface OrderStatus { id: string; status: 'pending'|'success'|'error'; message: string; timestamp: Date; }

export const TradingInterface: React.FC<TradingInterfaceProps> = ({ symbol, onConnectionChange }) => {
  const { submitOrder, isConnected, marketData } = useWebSocket();
  const [orderForm, setOrderForm] = useState<OrderForm>({ orderType:'limit', side:'buy', quantity:'', price:'' });
  const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key:string]:string }>({});

  const currentMarketData = marketData[symbol];
  const bestBid = currentMarketData?.bids?.[0]?.[0];
  const bestAsk = currentMarketData?.asks?.[0]?.[0];

  useEffect(()=>{ onConnectionChange(isConnected); }, [isConnected]);

  useEffect(()=>{
    if(orderForm.orderType==='limit' && !orderForm.price){
      if(orderForm.side==='buy' && bestBid) setOrderForm(prev=>({...prev, price:bestBid}));
      if(orderForm.side==='sell' && bestAsk) setOrderForm(prev=>({...prev, price:bestAsk}));
    }
  }, [orderForm.orderType, orderForm.side, bestBid, bestAsk]);

  const validateForm = () => {
    const errs: {[key:string]:string}={};
    if(!orderForm.quantity || parseFloat(orderForm.quantity)<=0) errs.quantity='Quantity must be positive';
    if(['limit','ioc','fok'].includes(orderForm.orderType)){
      if(!orderForm.price || parseFloat(orderForm.price)<=0) errs.price='Price must be positive';
    }
    setErrors(errs);
    return Object.keys(errs).length===0;
  };

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    if(!validateForm() || isSubmitting) return;
    setIsSubmitting(true);
    const statusId = `order-${Date.now()}`;
    setOrderStatus(prev=>[...prev,{id:statusId,status:'pending',message:`Submitting ${orderForm.orderType} ${orderForm.side}...`,timestamp:new Date()}]);
    try{
      const orderRequest = {
        symbol,
        order_type: orderForm.orderType,
        side: orderForm.side,
        quantity: parseFloat(orderForm.quantity),
        price:['limit','ioc','fok'].includes(orderForm.orderType)?parseFloat(orderForm.price):undefined
      };
      const response = await submitOrder(orderRequest);
      setOrderStatus(prev=>prev.map(s=>s.id===statusId?{...s,status:'success',message:`Order ${response.status}: ${response.filled_quantity} filled @ avg ${response.average_price || 'N/A'}`}:s));
      if(response.status==='filled') setOrderForm(prev=>({...prev,quantity:'',price:''}));
    }catch(err){
      setOrderStatus(prev=>prev.map(s=>s.id===statusId?{...s,status:'error',message:`Error: ${err instanceof Error?err.message:'Unknown'}`}:s));
    }finally{ setIsSubmitting(false); }
  };

  const handleQuickFill = (percentage:number) => {
    if(orderForm.side==='buy' && bestAsk){
      const q=(1000*percentage/100)/parseFloat(bestAsk);
      setOrderForm(prev=>({...prev, quantity:q.toFixed(6)}));
    }else if(orderForm.side==='sell'){
      const q=(1*percentage/100);
      setOrderForm(prev=>({...prev, quantity:q.toFixed(6)}));
    }
  };

  const getStatusIcon = (status:'pending'|'success'|'error')=>{
    switch(status){
      case 'pending': return <Clock className="h-4 w-4 text-crypto-yellow animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-crypto-green" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-crypto-red" />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Market Info */}
      <div className="bg-crypto-border/30 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-400">Best Bid</span><div className="text-crypto-green font-mono text-lg">{bestBid?parseFloat(bestBid).toLocaleString():'--'}</div></div>
          <div><span className="text-gray-400">Best Ask</span><div className="text-crypto-red font-mono text-lg">{bestAsk?parseFloat(bestAsk).toLocaleString():'--'}</div></div>
        </div>
        {bestBid && bestAsk && <div className="mt-2 text-xs text-gray-400">Spread: {(parseFloat(bestAsk)-parseFloat(bestBid)).toFixed(2)} ({(((parseFloat(bestAsk)-parseFloat(bestBid))/parseFloat(bestAsk))*100).toFixed(3)}%)</div>}
      </div>

      {/* Order Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Order Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['market','limit','ioc','fok'] as const).map(type=>(
              <button key={type} type="button" onClick={()=>setOrderForm(prev=>({...prev,orderType:type}))}
                className={`p-2 text-xs rounded-lg transition-all ${orderForm.orderType===type?'bg-crypto-blue text-white':'bg-crypto-border text-gray-400 hover:bg-crypto-border/70'}`}>{type.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {/* Buy/Sell */}
        <div className="flex rounded-lg overflow-hidden">
          <button type="button" onClick={()=>setOrderForm(prev=>({...prev,side:'buy'}))}
            className={`flex-1 py-3 flex items-center justify-center space-x-2 font-medium transition-all ${orderForm.side==='buy'?'bg-crypto-green text-white':'bg-crypto-border text-gray-400 hover:bg-crypto-border/70'}`}><TrendingUp className="h-4 w-4" /><span>BUY</span></button>
          <button type="button" onClick={()=>setOrderForm(prev=>({...prev,side:'sell'}))}
            className={`flex-1 py-3 flex items-center justify-center space-x-2 font-medium transition-all ${orderForm.side==='sell'?'bg-crypto-red text-white':'bg-crypto-border text-gray-400 hover:bg-crypto-border/70'}`}><TrendingDown className="h-4 w-4" /><span>SELL</span></button>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">Quantity</label>
          <input type="number" step="any" value={orderForm.quantity} onChange={e=>setOrderForm(prev=>({...prev,quantity:e.target.value}))} 
            className="w-full px-3 py-2 bg-crypto-border border border-crypto-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crypto-blue focus:border-transparent"
            placeholder="0.00000000" />
          {errors.quantity && <p className="mt-1 text-xs text-crypto-red">{errors.quantity}</p>}

          {/* Quick Fill */}
          <div className="flex space-x-2 mt-2">{[25,50,75,100].map(p=>(
            <button key={p} type="button" onClick={()=>handleQuickFill(p)}
              className="flex-1 py-1 text-xs bg-crypto-border/50 text-gray-400 rounded hover:bg-crypto-border transition-colors">{p}%</button>
          ))}</div>
        </div>

        {/* Price */}
        {['limit','ioc','fok'].includes(orderForm.orderType) &&
        <div><label className="block text-sm text-gray-300 mb-2">Price</label>
        <input type="number" step="any" value={orderForm.price} onChange={e=>setOrderForm(prev=>({...prev,price:e.target.value}))}
          className="w-full px-3 py-2 bg-crypto-border border border-crypto-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crypto-blue focus:border-transparent" /></div>}

        <button type="submit" className="w-full py-2 bg-crypto-blue rounded-lg text-white font-medium disabled:opacity-50" disabled={isSubmitting}>Place Order</button>
      </form>

      {/* Order Status */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {orderStatus.map(s=>(
          <div key={s.id} className="flex items-center space-x-2 text-sm">
            {getStatusIcon(s.status)}<span>{s.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
