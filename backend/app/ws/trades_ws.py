from fastapi import APIRouter, WebSocket
from app.models.orders import TradeExecution
import asyncio
import json
from datetime import datetime
import random

router = APIRouter()

trades_history = []
trade_counter = 1

@router.websocket("")
async def trades_ws(websocket: WebSocket):
    global trade_counter
    await websocket.accept()
    try:
        while True:
            # Generate a new trade each cycle
            new_trade = TradeExecution(
                timestamp=datetime.utcnow().isoformat(),
                symbol="BTC-USDT",
                trade_id=str(trade_counter),
                price=str(random.randint(29900, 30100)),  # random price near 30k
                quantity=str(round(random.uniform(0.01, 0.5), 4)),  # random qty
                aggressor_side=random.choice(["buy", "sell"]),
                maker_order_id=str(trade_counter),
                taker_order_id=str(trade_counter + 1),
            )
            trade_counter += 1
            trades_history.append(new_trade)

            # Send latest trade to frontend
            await websocket.send_text(json.dumps({"type": "trade", "data": new_trade.dict()}))

            await asyncio.sleep(2)  # simulate trade interval
    except Exception as e:
        print("Trades WS disconnected:", e)