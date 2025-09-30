'use client';

import { useState, useEffect } from 'react';

interface Portfolio {
  balance: number;
  holdings: {
    [key: string]: number;
  };
}

interface Prices {
  [key: string]: number;
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [prices, setPrices] = useState<Prices>({});
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, pricesRes] = await Promise.all([
        fetch(`${API_URL}/api/portfolio`),
        fetch(`${API_URL}/api/prices`)
      ]);

      const portfolioData = await portfolioRes.json();
      const pricesData = await pricesRes.json();

      setPortfolio(portfolioData);
      setPrices(pricesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
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

  const totalCryptoValue = Object.entries(portfolio.holdings).reduce(
    (sum, [symbol, amount]) => {
      const price = prices[symbol] || 0;
      return sum + (amount * price);
    },
    0
  );

  const totalValue = portfolio.balance + totalCryptoValue;

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
                <th className="text-right py-3 px-4">% of Portfolio</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(portfolio.holdings)
                .filter(([_, amount]) => amount > 0)
                .map(([symbol, amount]) => {
                  const price = prices[symbol] || 0;
                  const value = amount * price;
                  const percentage = (value / totalValue) * 100;

                  return (
                    <tr key={symbol} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-4 px-4">
                        <div className="font-bold">{symbol}</div>
                        <div className="text-sm text-gray-400">{cryptoNames[symbol]}</div>
                      </td>
                      <td className="text-right py-4 px-4 font-mono">
                        {amount.toFixed(8)}
                      </td>
                      <td className="text-right py-4 px-4 font-mono">
                        ${price.toFixed(2)}
                      </td>
                      <td className="text-right py-4 px-4 font-mono font-bold">
                        ${value.toFixed(2)}
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {Object.values(portfolio.holdings).every(amount => amount === 0) && (
            <div className="text-center py-8 text-gray-400">
              No holdings yet. Start trading to build your portfolio!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}