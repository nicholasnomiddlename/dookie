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
    <div className="max-w-[1440px] mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Price List */}
        <div className="bg-[#1a2332] rounded border border-[#2a3547] p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 font-serif">Market Prices</h2>
          <div className="space-y-3">
            {Object.entries(prices).map(([symbol, price]) => (
              <div
                key={symbol}
                className={`p-4 cursor-pointer transition-all ${
                  selectedCrypto === symbol
                    ? 'border-2 border-[#d4af37]'
                    : 'border border-[#2a3547] hover:border-[#d4af37]/50'
                }`}
                style={{
                  backgroundColor: selectedCrypto === symbol ? '#2a3547' : '#1a2332'
                }}
                onClick={() => setSelectedCrypto(symbol)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold font-sans text-gray-100">{symbol}</div>
                    <div className="text-sm text-gray-400 font-sans">{cryptoNames[symbol]}</div>
                  </div>
                  <div className="text-lg font-mono text-gray-100">
                    ${price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Form */}
        <div className="bg-[#1a2332] rounded border border-[#2a3547] p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 font-serif">Place Order</h2>

          <form onSubmit={handleTrade} className="space-y-6">
            <div>
              <label className="block text-sm font-sans font-medium mb-2 text-gray-300">Cryptocurrency</label>
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full bg-[#0f1419] border-2 border-[#2a3547] rounded px-4 py-3 focus:outline-none text-gray-100 font-sans"
                style={{ borderColor: '#2a3547' }}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = '#2a3547'}
              >
                {Object.keys(prices).map(symbol => (
                  <option key={symbol} value={symbol} className="bg-[#0f1419]">
                    {symbol} - {cryptoNames[symbol]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2 text-gray-300">Trade Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTradeType('buy')}
                  className="flex-1 py-3 font-sans font-medium transition-all"
                  style={{
                    backgroundColor: tradeType === 'buy' ? '#00C853' : '#0f1419',
                    color: tradeType === 'buy' ? '#0f1419' : '#737373',
                    border: '2px solid',
                    borderColor: tradeType === 'buy' ? '#00C853' : '#2a3547'
                  }}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType('sell')}
                  className="flex-1 py-3 font-sans font-medium transition-all"
                  style={{
                    backgroundColor: tradeType === 'sell' ? '#D32F2F' : '#0f1419',
                    color: tradeType === 'sell' ? '#ffffff' : '#737373',
                    border: '2px solid',
                    borderColor: tradeType === 'sell' ? '#D32F2F' : '#2a3547'
                  }}
                >
                  Sell
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2 text-gray-300">Amount</label>
              <input
                type="number"
                step="0.00000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0f1419] border-2 border-[#2a3547] rounded px-4 py-3 focus:outline-none text-gray-100 font-mono"
                style={{ borderColor: '#2a3547' }}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = '#2a3547'}
                required
              />
              {prices[selectedCrypto] && amount && (
                <div className="mt-2 text-sm text-gray-400 font-sans">
                  Total: ${(parseFloat(amount) * prices[selectedCrypto]).toFixed(2)} USD
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-sans font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: tradeType === 'buy' ? '#00C853' : '#D32F2F',
                color: '#ffffff'
              }}
            >
              {loading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedCrypto}`}
            </button>

            {message && (
              <div
                className="p-4 rounded font-sans"
                style={{
                  backgroundColor: message.startsWith('Error') ? '#D32F2F' : '#00C853',
                  color: '#ffffff'
                }}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}