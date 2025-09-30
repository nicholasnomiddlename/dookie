'use client';

import { useState, useEffect } from 'react';

interface Prices {
  [key: string]: number;
}

export default function Trading() {
  const [prices, setPrices] = useState<Prices>({});
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000); // Update prices every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/prices`);
      const data = await response.json();
      setPrices(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedCrypto,
          amount: parseFloat(amount),
          type: tradeType
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setAmount('');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error placing trade');
      console.error('Error:', error);
    } finally {
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Price List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Market Prices</h2>
          <div className="space-y-3">
            {Object.entries(prices).map(([symbol, price]) => (
              <div
                key={symbol}
                className={`p-4 rounded cursor-pointer transition-colors ${
                  selectedCrypto === symbol
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedCrypto(symbol)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">{symbol}</div>
                    <div className="text-sm text-gray-400">{cryptoNames[symbol]}</div>
                  </div>
                  <div className="text-lg font-mono">
                    ${price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Place Order</h2>

          <form onSubmit={handleTrade} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cryptocurrency</label>
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                {Object.keys(prices).map(symbol => (
                  <option key={symbol} value={symbol}>
                    {symbol} - {cryptoNames[symbol]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trade Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 py-2 rounded font-medium transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 py-2 rounded font-medium transition-colors ${
                    tradeType === 'sell'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                step="0.00000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                required
              />
              {prices[selectedCrypto] && amount && (
                <div className="mt-2 text-sm text-gray-400">
                  Total: ${(parseFloat(amount) * prices[selectedCrypto]).toFixed(2)} USD
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded font-bold transition-colors ${
                tradeType === 'buy'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedCrypto}`}
            </button>

            {message && (
              <div className={`p-3 rounded ${
                message.startsWith('Error') ? 'bg-red-600' : 'bg-green-600'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}