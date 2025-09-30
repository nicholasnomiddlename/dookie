'use client';

import { useState, useEffect } from 'react';

interface Portfolio {
  balance: number;
  holdings: {
    [key: string]: number;
  };
  staked: {
    [key: string]: { amount: number; stakedAt: number };
  };
  unstaking: {
    [key: string]: { amount: number; unstakeCompleteAt: number };
  };
}

interface Prices {
  [key: string]: number;
}

interface StakingInfo {
  [key: string]: { apy: number; unstakeDays: number };
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [prices, setPrices] = useState<Prices>({});
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update current time every second for countdown timers
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, pricesRes, stakingRes] = await Promise.all([
        fetch(`${API_URL}/api/portfolio`),
        fetch(`${API_URL}/api/prices`),
        fetch(`${API_URL}/api/staking-info`)
      ]);

      const portfolioData = await portfolioRes.json();
      const pricesData = await pricesRes.json();
      const stakingData = await stakingRes.json();

      setPortfolio(portfolioData);
      setPrices(pricesData);
      setStakingInfo(stakingData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleStake = async (symbol: string, amount: number) => {
    try {
      const res = await fetch(`${API_URL}/api/stake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, amount })
      });
      const data = await res.json();
      if (data.success) {
        setPortfolio(data.portfolio);
      } else {
        alert(data.error || 'Failed to stake');
      }
    } catch (error) {
      console.error('Error staking:', error);
      alert('Failed to stake');
    }
  };

  const handleUnstake = async (symbol: string) => {
    try {
      const res = await fetch(`${API_URL}/api/unstake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      const data = await res.json();
      if (data.success) {
        setPortfolio(data.portfolio);
      } else {
        alert(data.error || 'Failed to unstake');
      }
    } catch (error) {
      console.error('Error unstaking:', error);
      alert('Failed to unstake');
    }
  };

  const cryptoNames: { [key: string]: string } = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    BNB: 'Binance Coin',
    SOL: 'Solana',
    XRP: 'Ripple'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Loading portfolio...</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error loading portfolio</div>
      </div>
    );
  }

  const formatTimeRemaining = (timestampMs: number) => {
    const remaining = timestampMs - currentTime;
    if (remaining <= 0) return 'Completing...';

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const totalCryptoValue = Object.entries(portfolio.holdings).reduce(
    (sum, [symbol, amount]) => {
      const price = prices[symbol] || 0;
      return sum + (amount * price);
    },
    0
  );

  const totalStakedValue = Object.entries(portfolio.staked || {}).reduce(
    (sum, [symbol, data]) => {
      const price = prices[symbol] || 0;
      return sum + (data.amount * price);
    },
    0
  );

  const totalUnstakingValue = Object.entries(portfolio.unstaking || {}).reduce(
    (sum, [symbol, data]) => {
      const price = prices[symbol] || 0;
      return sum + (data.amount * price);
    },
    0
  );

  const totalValue = portfolio.balance + totalCryptoValue + totalStakedValue + totalUnstakingValue;

  // Combine all assets (regular, staked, and unstaking) for display
  const allSymbols = new Set([
    ...Object.keys(portfolio.holdings),
    ...Object.keys(portfolio.staked || {}),
    ...Object.keys(portfolio.unstaking || {})
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Value Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Total Portfolio Value</div>
          <div className="text-3xl font-bold text-green-500">
            ${totalValue.toFixed(2)}
          </div>
        </div>

        {/* Cash Balance Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Cash Balance</div>
          <div className="text-3xl font-bold">
            ${portfolio.balance.toFixed(2)}
          </div>
        </div>

        {/* Crypto Value Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Crypto Holdings Value</div>
          <div className="text-3xl font-bold text-blue-500">
            ${totalCryptoValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Holdings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">Asset</th>
                <th className="text-right py-3 px-4">Amount</th>
                <th className="text-right py-3 px-4">Price</th>
                <th className="text-right py-3 px-4">Value</th>
                <th className="text-right py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(allSymbols).map((symbol) => {
                const regularAmount = portfolio.holdings[symbol] || 0;
                const stakedData = portfolio.staked?.[symbol];
                const unstakingData = portfolio.unstaking?.[symbol];
                const price = prices[symbol] || 0;
                const info = stakingInfo[symbol];

                // Skip if no holdings at all
                if (regularAmount === 0 && !stakedData && !unstakingData) return null;

                return (
                  <tr key={symbol} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-4 px-4">
                      <div className="font-bold">{symbol}</div>
                      <div className="text-sm text-gray-400">{cryptoNames[symbol]}</div>
                    </td>
                    <td className="text-right py-4 px-4 font-mono">
                      <div>
                        {regularAmount > 0 && (
                          <div>{regularAmount.toFixed(8)}</div>
                        )}
                        {stakedData && (
                          <div className="text-purple-400">
                            {stakedData.amount.toFixed(8)} <span className="text-xs">STAKED</span>
                          </div>
                        )}
                        {unstakingData && (
                          <div className="text-yellow-400">
                            {unstakingData.amount.toFixed(8)} <span className="text-xs">UNSTAKING</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-4 px-4 font-mono">
                      ${price.toFixed(2)}
                    </td>
                    <td className="text-right py-4 px-4 font-mono font-bold">
                      ${((regularAmount + (stakedData?.amount || 0) + (unstakingData?.amount || 0)) * price).toFixed(2)}
                    </td>
                    <td className="text-right py-4 px-4 text-sm">
                      {stakedData && info && (
                        <div className="text-purple-400">
                          Earning {info.apy}% APY
                        </div>
                      )}
                      {unstakingData && info && (
                        <div className="text-yellow-400">
                          Unlocks in: {formatTimeRemaining(unstakingData.unstakeCompleteAt)}
                        </div>
                      )}
                      {!stakedData && !unstakingData && regularAmount > 0 && (
                        <div className="text-gray-500">Available</div>
                      )}
                    </td>
                    <td className="text-right py-4 px-4">
                      {stakedData ? (
                        <button
                          onClick={() => handleUnstake(symbol)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Unstake
                        </button>
                      ) : unstakingData ? (
                        <div className="text-xs text-gray-400">
                          ETA: {info?.unstakeDays}d
                        </div>
                      ) : regularAmount > 0 && info ? (
                        <button
                          onClick={() => handleStake(symbol, regularAmount)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Stake to Earn {info.apy}% APY
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {allSymbols.size === 0 && (
            <div className="text-center py-8 text-gray-400">
              No holdings yet. Start trading to build your portfolio!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}