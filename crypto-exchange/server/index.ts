import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock data for top 5 cryptocurrencies
const mockPrices: { [key: string]: number } = {
  BTC: 43250.50,
  ETH: 2280.75,
  BNB: 315.20,
  SOL: 98.45,
  XRP: 0.62
};

// Mock user portfolio
let portfolio: {
  balance: number;
  holdings: { [key: string]: number };
} = {
  balance: 10000, // USD
  holdings: {
    BTC: 0.5,
    ETH: 2,
    BNB: 10,
    SOL: 50,
    XRP: 1000
  }
};

// Get current prices
app.get('/api/prices', (req, res) => {
  // Simulate small price fluctuations
  const prices = Object.keys(mockPrices).reduce((acc, symbol) => {
    const basePrice = mockPrices[symbol];
    const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% random fluctuation
    acc[symbol] = basePrice * (1 + fluctuation);
    return acc;
  }, {} as { [key: string]: number });

  res.json(prices);
});

// Get portfolio
app.get('/api/portfolio', (req, res) => {
  res.json(portfolio);
});

// Place trade order
app.post('/api/trade', (req, res) => {
  const { symbol, amount, type } = req.body; // type: 'buy' or 'sell'

  if (!symbol || !amount || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const currentPrice = mockPrices[symbol];
  if (!currentPrice) {
    return res.status(400).json({ error: 'Invalid symbol' });
  }

  const totalCost = currentPrice * amount;

  if (type === 'buy') {
    if (portfolio.balance < totalCost) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    portfolio.balance -= totalCost;
    portfolio.holdings[symbol] = (portfolio.holdings[symbol] || 0) + amount;
  } else if (type === 'sell') {
    if ((portfolio.holdings[symbol] || 0) < amount) {
      return res.status(400).json({ error: 'Insufficient holdings' });
    }
    portfolio.balance += totalCost;
    portfolio.holdings[symbol] -= amount;
  } else {
    return res.status(400).json({ error: 'Invalid trade type' });
  }

  res.json({
    success: true,
    portfolio,
    message: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${symbol}`
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});