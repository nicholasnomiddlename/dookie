import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { initializeDatabase } from './db/init';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Demo user ID (for single-user MVP)
const DEMO_USER_ID = 1;
const DEMO_PORTFOLIO_ID = 1;

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

// Helper function to get portfolio from database
async function getPortfolio() {
  try {
    // Get balance
    const portfolioResult = await pool.query(
      'SELECT balance FROM portfolios WHERE id = $1',
      [DEMO_PORTFOLIO_ID]
    );
    const balance = parseFloat(portfolioResult.rows[0]?.balance || '0');

    // Get holdings
    const holdingsResult = await pool.query(
      'SELECT symbol, amount FROM holdings WHERE portfolio_id = $1',
      [DEMO_PORTFOLIO_ID]
    );
    const holdings: { [key: string]: number } = {};
    holdingsResult.rows.forEach(row => {
      holdings[row.symbol] = parseFloat(row.amount);
    });

    // Get staked holdings
    const stakedResult = await pool.query(
      'SELECT symbol, amount, staked_at FROM staked_holdings WHERE portfolio_id = $1',
      [DEMO_PORTFOLIO_ID]
    );
    const staked: { [key: string]: { amount: number; stakedAt: number } } = {};
    stakedResult.rows.forEach(row => {
      staked[row.symbol] = {
        amount: parseFloat(row.amount),
        stakedAt: parseInt(row.staked_at)
      };
    });

    // Get unstaking holdings and check if any are complete
    const now = Date.now();
    const unstakingResult = await pool.query(
      'SELECT symbol, amount, unstake_complete_at FROM unstaking_holdings WHERE portfolio_id = $1',
      [DEMO_PORTFOLIO_ID]
    );
    const unstaking: { [key: string]: { amount: number; unstakeCompleteAt: number } } = {};

    for (const row of unstakingResult.rows) {
      const unstakeCompleteAt = parseInt(row.unstake_complete_at);

      if (now >= unstakeCompleteAt) {
        // Move back to holdings
        await pool.query(
          `INSERT INTO holdings (portfolio_id, symbol, amount)
           VALUES ($1, $2, $3)
           ON CONFLICT (portfolio_id, symbol)
           DO UPDATE SET amount = holdings.amount + $3, updated_at = CURRENT_TIMESTAMP`,
          [DEMO_PORTFOLIO_ID, row.symbol, row.amount]
        );

        // Remove from unstaking
        await pool.query(
          'DELETE FROM unstaking_holdings WHERE portfolio_id = $1 AND symbol = $2',
          [DEMO_PORTFOLIO_ID, row.symbol]
        );
      } else {
        unstaking[row.symbol] = {
          amount: parseFloat(row.amount),
          unstakeCompleteAt
        };
      }
    }

    return { balance, holdings, staked, unstaking };
  } catch (error) {
    console.error('Error getting portfolio:', error);
    throw error;
  }
}

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
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolio = await getPortfolio();
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Get staking info
app.get('/api/staking-info', (req, res) => {
  res.json(stakingInfo);
});

// Place trade order
app.post('/api/trade', async (req, res) => {
  const { symbol, amount, type } = req.body; // type: 'buy' or 'sell'

  if (!symbol || !amount || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const currentPrice = mockPrices[symbol];
  if (!currentPrice) {
    return res.status(400).json({ error: 'Invalid symbol' });
  }

  const totalCost = currentPrice * amount;

  try {
    const portfolio = await getPortfolio();

    if (type === 'buy') {
      if (portfolio.balance < totalCost) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Update balance
      await pool.query(
        'UPDATE portfolios SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [totalCost, DEMO_PORTFOLIO_ID]
      );

      // Update holdings
      await pool.query(
        `INSERT INTO holdings (portfolio_id, symbol, amount)
         VALUES ($1, $2, $3)
         ON CONFLICT (portfolio_id, symbol)
         DO UPDATE SET amount = holdings.amount + $3, updated_at = CURRENT_TIMESTAMP`,
        [DEMO_PORTFOLIO_ID, symbol, amount]
      );

    } else if (type === 'sell') {
      if ((portfolio.holdings[symbol] || 0) < amount) {
        return res.status(400).json({ error: 'Insufficient holdings' });
      }

      // Update balance
      await pool.query(
        'UPDATE portfolios SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [totalCost, DEMO_PORTFOLIO_ID]
      );

      // Update holdings
      await pool.query(
        'UPDATE holdings SET amount = amount - $1, updated_at = CURRENT_TIMESTAMP WHERE portfolio_id = $2 AND symbol = $3',
        [amount, DEMO_PORTFOLIO_ID, symbol]
      );

    } else {
      return res.status(400).json({ error: 'Invalid trade type' });
    }

    const updatedPortfolio = await getPortfolio();

    res.json({
      success: true,
      portfolio: updatedPortfolio,
      message: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${symbol}`
    });
  } catch (error) {
    console.error('Error placing trade:', error);
    res.status(500).json({ error: 'Failed to place trade' });
  }
});

// Stake crypto
app.post('/api/stake', async (req, res) => {
  const { symbol, amount } = req.body;

  if (!symbol || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!stakingInfo[symbol]) {
    return res.status(400).json({ error: 'Invalid symbol' });
  }

  try {
    const portfolio = await getPortfolio();

    if ((portfolio.holdings[symbol] || 0) < amount) {
      return res.status(400).json({ error: 'Insufficient holdings' });
    }

    // Remove from holdings
    await pool.query(
      'UPDATE holdings SET amount = amount - $1, updated_at = CURRENT_TIMESTAMP WHERE portfolio_id = $2 AND symbol = $3',
      [amount, DEMO_PORTFOLIO_ID, symbol]
    );

    // Add to staked
    const stakedAt = Date.now();
    await pool.query(
      `INSERT INTO staked_holdings (portfolio_id, symbol, amount, staked_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (portfolio_id, symbol)
       DO UPDATE SET amount = staked_holdings.amount + $3, staked_at = $4, updated_at = CURRENT_TIMESTAMP`,
      [DEMO_PORTFOLIO_ID, symbol, amount, stakedAt]
    );

    const updatedPortfolio = await getPortfolio();

    res.json({
      success: true,
      portfolio: updatedPortfolio,
      message: `Successfully staked ${amount} ${symbol}`
    });
  } catch (error) {
    console.error('Error staking:', error);
    res.status(500).json({ error: 'Failed to stake' });
  }
});

// Unstake crypto
app.post('/api/unstake', async (req, res) => {
  const { symbol } = req.body;

  if (!symbol) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const portfolio = await getPortfolio();

    if (!portfolio.staked[symbol] || portfolio.staked[symbol].amount === 0) {
      return res.status(400).json({ error: 'No staked holdings' });
    }

    const stakedAmount = portfolio.staked[symbol].amount;
    const unstakeDays = stakingInfo[symbol].unstakeDays;
    const unstakeCompleteAt = Date.now() + (unstakeDays * 24 * 60 * 60 * 1000);

    // Remove from staked
    await pool.query(
      'DELETE FROM staked_holdings WHERE portfolio_id = $1 AND symbol = $2',
      [DEMO_PORTFOLIO_ID, symbol]
    );

    // Add to unstaking
    await pool.query(
      `INSERT INTO unstaking_holdings (portfolio_id, symbol, amount, unstake_complete_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (portfolio_id, symbol)
       DO UPDATE SET amount = $3, unstake_complete_at = $4, updated_at = CURRENT_TIMESTAMP`,
      [DEMO_PORTFOLIO_ID, symbol, stakedAmount, unstakeCompleteAt]
    );

    const updatedPortfolio = await getPortfolio();

    res.json({
      success: true,
      portfolio: updatedPortfolio,
      unstakeCompleteAt,
      message: `Unstaking ${stakedAmount} ${symbol}. Will be available in ${unstakeDays} day(s)`
    });
  } catch (error) {
    console.error('Error unstaking:', error);
    res.status(500).json({ error: 'Failed to unstake' });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();