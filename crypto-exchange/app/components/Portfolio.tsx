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
    <div className="max-w-[1440px] mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Value Card */}
        <div className="bg-[#1a2332] rounded border border-[#2a3547] p-6 shadow-sm">
          <div className="text-sm text-gray-400 mb-2 font-sans">Total Portfolio Value</div>
          <div className="text-3xl font-bold font-serif" style={{ color: '#00C853' }}>
            ${totalValue.toFixed(2)}
          </div>
        </div>

        {/* Cash Balance Card */}
        <div className="bg-[#1a2332] rounded border border-[#2a3547] p-6 shadow-sm">
          <div className="text-sm text-gray-400 mb-2 font-sans">Cash Balance</div>
          <div className="text-3xl font-bold font-serif text-gray-100">
            ${portfolio.balance.toFixed(2)}
          </div>
        </div>

        {/* Crypto Value Card */}
        <div className="bg-[#1a2332] rounded border border-[#2a3547] p-6 shadow-sm">
          <div className="text-sm text-gray-400 mb-2 font-sans">Crypto Holdings Value</div>
          <div className="text-3xl font-bold font-serif" style={{ color: '#d4af37' }}>
            ${totalCryptoValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-[#1a2332] rounded border border-[#2a3547] p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 font-serif">Your Holdings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3547]">
                <th className="text-left py-4 px-4 font-sans text-sm text-gray-400 font-normal">Asset</th>
                <th className="text-right py-4 px-4 font-sans text-sm text-gray-400 font-normal">Amount</th>
                <th className="text-right py-4 px-4 font-sans text-sm text-gray-400 font-normal">Price</th>
                <th className="text-right py-4 px-4 font-sans text-sm text-gray-400 font-normal">Value</th>
                <th className="text-right py-4 px-4 font-sans text-sm text-gray-400 font-normal">Status</th>
                <th className="text-right py-4 px-4 font-sans text-sm text-gray-400 font-normal">Action</th>
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
                  <tr key={symbol} className="border-b border-[#2a3547] hover:bg-[#0f1419] transition-all duration-[120ms] ease-in-out">
                    <td className="py-5 px-4">
                      <div className="font-bold font-sans text-gray-100">{symbol}</div>
                      <div className="text-sm text-gray-400 font-sans">{cryptoNames[symbol]}</div>
                    </td>
                    <td className="text-right py-5 px-4 font-mono text-sm">
                      <div>
                        {regularAmount > 0 && (
                          <div className="text-gray-100">{regularAmount.toFixed(8)}</div>
                        )}
                        {stakedData && (
                          <div style={{ color: '#d4af37' }}>
                            {stakedData.amount.toFixed(8)} <span className="text-xs font-sans">STAKED</span>
                          </div>
                        )}
                        {unstakingData && (
                          <div style={{ color: '#F9A825' }}>
                            {unstakingData.amount.toFixed(8)} <span className="text-xs font-sans">UNSTAKING</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-5 px-4 font-mono text-sm text-gray-300">
                      ${price.toFixed(2)}
                    </td>
                    <td className="text-right py-5 px-4 font-mono text-base font-bold text-gray-100">
                      ${((regularAmount + (stakedData?.amount || 0) + (unstakingData?.amount || 0)) * price).toFixed(2)}
                    </td>
                    <td className="text-right py-5 px-4 text-sm font-sans">
                      {stakedData && info && (
                        <div style={{ color: '#d4af37' }}>
                          Earning {info.apy}% APY
                        </div>
                      )}
                      {unstakingData && info && (
                        <div style={{ color: '#F9A825' }}>
                          Unlocks in: {formatTimeRemaining(unstakingData.unstakeCompleteAt)}
                        </div>
                      )}
                      {!stakedData && !unstakingData && regularAmount > 0 && (
                        <div className="text-gray-500">Available</div>
                      )}
                    </td>
                    <td className="text-right py-5 px-4">
                      {stakedData ? (
                        <button
                          onClick={() => handleUnstake(symbol)}
                          className="font-sans text-sm px-4 py-2 border-2 text-gray-100 hover:bg-[#2a3547] transition-all duration-[120ms] ease-in-out active:scale-[0.98]"
                          style={{ borderColor: '#F9A825', backgroundColor: 'transparent' }}
                        >
                          Unstake
                        </button>
                      ) : unstakingData ? (
                        <div className="text-xs text-gray-400 font-sans">
                          ETA: {info?.unstakeDays}d
                        </div>
                      ) : regularAmount > 0 && info ? (
                        <button
                          onClick={() => handleStake(symbol, regularAmount)}
                          className="font-sans text-sm px-4 py-2 text-[#0f1419] transition-all duration-[120ms] ease-in-out hover:brightness-110 active:scale-[0.98] font-medium"
                          style={{ backgroundColor: '#d4af37' }}
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