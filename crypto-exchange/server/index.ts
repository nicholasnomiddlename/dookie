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

// Staking info for each crypto
const stakingInfo: { [key: string]: { apy: number; unstakeDays: number } } = {
  BTC: { apy: 4.5, unstakeDays: 7 },
  ETH: { apy: 5.2, unstakeDays: 3 },
  BNB: { apy: 8.3, unstakeDays: 2 },
  SOL: { apy: 6.8, unstakeDays: 1 },
  XRP: { apy: 3.9, unstakeDays: 1 }
};

// Mock user portfolio
let portfolio: {
  balance: number;
  holdings: { [key: string]: number };
  staked: { [key: string]: { amount: number; stakedAt: number } };
  unstaking: { [key: string]: { amount: number; unstakeCompleteAt: number } };
} = {
  balance: 10000, // USD
  holdings: {
    BTC: 0.5,
    ETH: 2,
    BNB: 10,
    SOL: 50,
    XRP: 1000
  },
  staked: {},
  unstaking: {}
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
  // Check unstaking timers and move completed ones back to holdings
  const now = Date.now();
  Object.keys(portfolio.unstaking).forEach(symbol => {
    const unstakeData = portfolio.unstaking[symbol];
    if (now >= unstakeData.unstakeCompleteAt) {
      portfolio.holdings[symbol] = (portfolio.holdings[symbol] || 0) + unstakeData.amount;
      delete portfolio.unstaking[symbol];
    }
  });

  res.json(portfolio);
});

// Get staking info
app.get('/api/staking-info', (req, res) => {
  res.json(stakingInfo);
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

// Stake crypto
app.post('/api/stake', (req, res) => {
  const { symbol, amount } = req.body;

  if (!symbol || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!stakingInfo[symbol]) {
    return res.status(400).json({ error: 'Invalid symbol' });
  }

  if ((portfolio.holdings[symbol] || 0) < amount) {
    return res.status(400).json({ error: 'Insufficient holdings' });
  }

  // Move from holdings to staked
  portfolio.holdings[symbol] -= amount;
  portfolio.staked[symbol] = {
    amount: (portfolio.staked[symbol]?.amount || 0) + amount,
    stakedAt: Date.now()
  };

  res.json({
    success: true,
    portfolio,
    message: `Successfully staked ${amount} ${symbol}`
  });
});

// Unstake crypto
app.post('/api/unstake', (req, res) => {
  const { symbol } = req.body;

  if (!symbol) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!portfolio.staked[symbol] || portfolio.staked[symbol].amount === 0) {
    return res.status(400).json({ error: 'No staked holdings' });
  }

  const stakedAmount = portfolio.staked[symbol].amount;
  const unstakeDays = stakingInfo[symbol].unstakeDays;
  const unstakeCompleteAt = Date.now() + (unstakeDays * 24 * 60 * 60 * 1000);

  // Move from staked to unstaking
  portfolio.unstaking[symbol] = {
    amount: stakedAmount,
    unstakeCompleteAt
  };
  delete portfolio.staked[symbol];

  res.json({
    success: true,
    portfolio,
    unstakeCompleteAt,
    message: `Unstaking ${stakedAmount} ${symbol}. Will be available in ${unstakeDays} day(s)`
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});