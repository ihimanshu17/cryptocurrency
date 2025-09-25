# Crypto Matching Engine

## Overview
This project implements a simplified cryptocurrency exchange matching engine with REST and WebSocket APIs.  
The system handles order submissions, maintains an order book, and broadcasts live market/trade data.

---

## 📐 System Architecture

- **Frontend (React/Next.js)**  
  - UI for placing buy/sell orders.
  - Displays live market data (order book, trades).

- **Backend (FastAPI)**  
  - REST API (`/api/orders`) for order submission.
  - WebSocket APIs:
    - `/ws/market-data` → Streams live order book data.
    - `/ws/trades` → Streams trade history.
  - In-memory order book for storing & matching buy/sell orders.

---

## 📊 Data Structures

### Order Book
- Implemented as two **lists** (bids & asks).
- Each order is an instance of the `Order` model:
  ```python
  class Order(BaseModel):
      order_id: str
      symbol: str
      order_type: str
      side: str
      quantity: float
      price: float
      timestamp: datetime
  ```
  - **Rationale:**
    - Lists are simple for prototyping.
    - Future optimization: heaps/priority queues for O(log n) inserts.

### Matching Algorithm
- Price-Time Priority:
  - Orders are matched first by best price (highest bid, lowest ask).
  - If multiple orders have the same price → earliest timestamp wins.

- Trade Execution:
  - If buy price ≥ sell price → a trade is executed.
  - Update order quantities & generate trade records.

---

## 📡 API Specification

### 1. REST Endpoint – Submit Order
```bash
POST /api/orders
```

Request
```json
{
  "symbol": "BTC-USDT",
  "order_type": "limit",
  "side": "buy",
  "quantity": 1.0,
  "price": 30000
}
```

Response
```json
{
  "order_id": "1",
  "status": "filled",
  "filled_quantity": 1.0,
  "remaining_quantity": 0,
  "average_price": 30000,
  "trades": [],
  "timestamp": "2025-09-25T12:34:56Z"
}
```

### 2. WebSocket – Market Data
```bash
/ws/market-data
```

Streams order book updates:
```json
{
  "type": "market_data",
  "data": {
    "symbol": "BTC-USDT",
    "bids": [["30000", "1"]],
    "asks": [["30050", "1"]]
  }
}
```

### 3. WebSocket – Trades
```bash
/ws/trades
```

Streams trade executions:

```json
{
  "type": "trade",
  "trade_id": "101",
  "symbol": "BTC-USDT",
  "price": "30000",
  "quantity": "0.5",
  "timestamp": "2025-09-25T12:35:12Z"
}
```
---

## ⚖️ Trade-Offs & Design Choices

- **In-memory storage** – chosen for simplicity; not persistent.  
  - *Trade-off:* fast prototyping but not production-safe.  
  - *Future:* Redis/Postgres for persistence.  

- **Lists for order book** – simple but inefficient at scale.  
  - *Future:* heaps/trees for faster matching.  

- **CORS & WebSocket security** – restricted to `http://localhost:3000` for development.  
  - *Future:* auth tokens & rate limiting.  

- **REST + WebSockets** – chosen to combine reliability (orders via REST) with real-time streaming (market/trades).

---

## 🚀 Running the Project

### Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📌 Future Improvements

- Persist orders/trades in a database (e.g., PostgreSQL, Redis).
- Improve matching performance with advanced data structures (heaps, skip lists).
- Add user accounts & authentication for secure access.
- Support additional order types (Stop-Loss, Fill-or-Kill, Immediate-or-Cancel).
- Enable horizontal scaling using Kafka or Redis pub/sub for real-time event distribution.



