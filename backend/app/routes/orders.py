from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.orders import Order, order_book
from typing import Optional

router = APIRouter()

class OrderRequest(BaseModel):
    symbol: str
    order_type: str
    side: str
    quantity: float
    price: Optional[float] = None

@router.post("")
async def submit_order(order: OrderRequest):
    try:
        new_order = Order(
            order_id=str(len(order_book) + 1),
            symbol=order.symbol,
            order_type=order.order_type,
            side=order.side,
            quantity=order.quantity,
            price=order.price
        )
        order_book.append(new_order)
        return {
            "order_id": new_order.order_id,
            "status": "filled",
            "filled_quantity": new_order.quantity,
            "remaining_quantity": 0,
            "average_price": new_order.price,
            "trades": [],
            "timestamp": new_order.timestamp.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
