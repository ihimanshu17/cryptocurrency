from pydantic import BaseModel
from typing import List, Tuple

class MarketData(BaseModel):
    symbol: str
    bids: List[Tuple[str, str]] = []
    asks: List[Tuple[str, str]] = []
