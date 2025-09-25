from fastapi import APIRouter, WebSocket
from app.models.market import MarketData
import asyncio
import json

router = APIRouter()

# Simulated market state
market_state = {
    "BTC-USDT": MarketData(symbol="BTC-USDT", bids=[["30000", "1"]], asks=[["30050", "1"]])
}

@router.websocket("")
async def market_data_ws(websocket: WebSocket):
    # Accept connection from any origin
    await websocket.accept()
    try:
        while True:
            for symbol, data in market_state.items():
                message = {"type": "market_data", "data": data.dict()}
                await websocket.send_text(json.dumps(message))
            await asyncio.sleep(1)
    except Exception as e:
        print("Market WS disconnected:", e)
