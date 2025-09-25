from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class TradeExecution(BaseModel):
    timestamp: str
    symbol: str
    trade_id: str
    price: str
    quantity: str
    aggressor_side: str
    maker_order_id: str
    taker_order_id: str

class Order(BaseModel):
    order_id: str
    symbol: str
    order_type: str
    side: str
    quantity: float
    price: Optional[float]
    timestamp: datetime = datetime.utcnow()
    trades: List[TradeExecution] = []

order_book: List[Order] = []
