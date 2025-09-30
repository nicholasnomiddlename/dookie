-- Dookie Exchange Database Schema

-- Users table (for future multi-user support)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio table
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Holdings table
CREATE TABLE IF NOT EXISTS holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(portfolio_id, symbol)
);

-- Staked holdings table
CREATE TABLE IF NOT EXISTS staked_holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) DEFAULT 0,
    staked_at BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(portfolio_id, symbol)
);

-- Unstaking holdings table
CREATE TABLE IF NOT EXISTS unstaking_holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) DEFAULT 0,
    unstake_complete_at BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(portfolio_id, symbol)
);

-- Create default demo user and portfolio
INSERT INTO users (id, username, email)
VALUES (1, 'demo', 'demo@dookie.exchange')
ON CONFLICT (username) DO NOTHING;

INSERT INTO portfolios (id, user_id, balance)
VALUES (1, 1, 10000.00)
ON CONFLICT DO NOTHING;

-- Insert default holdings
INSERT INTO holdings (portfolio_id, symbol, amount) VALUES
    (1, 'BTC', 0.5),
    (1, 'ETH', 2.0),
    (1, 'BNB', 10.0),
    (1, 'SOL', 50.0),
    (1, 'XRP', 1000.0)
ON CONFLICT (portfolio_id, symbol) DO NOTHING;
