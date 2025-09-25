from fastapi import FastAPI
from app.routes import orders
from app.ws import market_ws, trades_ws
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Crypto Matching Engine")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(market_ws.router, prefix="/ws/market-data", tags=["MarketData"])
app.include_router(trades_ws.router, prefix="/ws/trades", tags=["Trades"])
