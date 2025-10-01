'use client';

import { useState } from 'react';

// Dookie definitions for background
const dookieDefinitions = [
  { word: 'dookie', pronunciation: '/ Latin, noun /', definition: 'The successful investment of effort and resources resulting in prosperity.' },
  { word: 'dookie', pronunciation: '/ Latin, noun /', definition: 'A state of enduring abundance achieved through wise action and focus.' },
  { word: 'dookie', pronunciation: '/ Latin, noun /', definition: 'The art of transforming patience into tangible wealth.' },
  { word: 'dookie', pronunciation: '/ Latin, noun /', definition: 'Strategic discipline yielding compound returns over time.' },
];

type FlowStep = 'funding' | 'funded' | 'trade-prompt' | 'trading' | 'portfolio';

export default function Home() {
  const [step, setStep] = useState<FlowStep>('funding');
  const [balance, setBalance] = useState(0);
  const [holdings, setHoldings] = useState<{ [key: string]: number }>({});
  const [selectedAsset, setSelectedAsset] = useState('');
  const [tradeAmount, setTradeAmount] = useState('');

  // Random definition for background
  const backgroundDef = dookieDefinitions[Math.floor(Math.random() * dookieDefinitions.length)];

  const handleFund = () => {
    setBalance(6000);
    setStep('funded');
  };

  const handleTradePrompt = () => {
    setStep('trade-prompt');
  };

  const handleSelectAsset = (asset: string) => {
    setSelectedAsset(asset);
    setStep('trading');
  };

  const handleBuy = () => {
    if (!selectedAsset || !tradeAmount) return;

    const amount = parseFloat(tradeAmount);
    setHoldings({
      ...holdings,
      [selectedAsset]: (holdings[selectedAsset] || 0) + amount
    });
    setBalance(balance - (amount * 50000)); // Simplified pricing
    setTradeAmount('');
    setStep('portfolio');
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ backgroundColor: '#0f1419' }}>
      {/* Background definition - faded */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="text-center" style={{ opacity: 0.03 }}>
          <div className="text-6xl font-serif italic mb-4" style={{ color: '#d4af37' }}>
            {backgroundDef.word}
          </div>
          <div className="text-2xl text-gray-500 mb-8">{backgroundDef.pronunciation}</div>
          <div className="text-3xl text-gray-400 max-w-3xl mx-auto px-8">
            {backgroundDef.definition}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen pt-20">
        {/* Logo/Header - minimal */}
        <h1 className="text-4xl font-bold font-serif mb-16" style={{ color: '#d4af37' }}>
          d<span className="text-5xl" style={{ color: '#d4af37' }}>∞</span>kie
        </h1>

        {/* Dialogue Box */}
        <div className="w-full max-w-2xl px-4 mb-8">
          <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-8 shadow-lg">
            {step === 'funding' && (
              <>
                <p className="text-xl text-gray-200 mb-6 font-sans">
                  How would you like to fund your account?
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleFund}
                    className="w-full py-3 px-6 bg-[#0f1419] border-2 border-[#2a3547] text-gray-300 font-sans font-medium hover:border-[#d4af37] transition-all text-left"
                  >
                    Bank Account
                  </button>
                  <button
                    onClick={handleFund}
                    className="w-full py-3 px-6 bg-[#0f1419] border-2 border-[#2a3547] text-gray-300 font-sans font-medium hover:border-[#d4af37] transition-all text-left"
                  >
                    Stablecoin (PYUSD)
                  </button>
                  <button
                    onClick={handleFund}
                    className="w-full py-3 px-6 bg-[#0f1419] border-2 border-[#2a3547] text-gray-300 font-sans font-medium hover:border-[#d4af37] transition-all text-left"
                  >
                    Credit Card
                  </button>
                </div>
              </>
            )}

            {step === 'funded' && (
              <>
                <p className="text-xl text-gray-200 mb-4 font-sans">
                  Great! Send PYUSD to this address:
                </p>
                <div className="bg-[#0f1419] p-4 rounded border border-[#2a3547] mb-6">
                  <code className="text-gray-300 font-mono text-sm">0xDOOK...IE420</code>
                </div>
                <p className="text-sm text-gray-400 mb-6 font-sans">
                  (Simulating funding with $6,000...)
                </p>
                <button
                  onClick={handleTradePrompt}
                  className="w-full py-3 font-sans font-medium"
                  style={{ backgroundColor: '#d4af37', color: '#0f1419' }}
                >
                  Continue
                </button>
              </>
            )}

            {step === 'trade-prompt' && (
              <>
                <p className="text-xl text-gray-200 mb-6 font-sans">
                  You're all set! What would you like to trade?
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleSelectAsset('BTC')}
                    className="w-full py-3 px-6 bg-[#0f1419] border-2 border-[#2a3547] text-gray-300 font-sans font-medium hover:border-[#d4af37] transition-all text-left"
                  >
                    Bitcoin (BTC)
                  </button>
                  <button
                    onClick={() => handleSelectAsset('ETH')}
                    className="w-full py-3 px-6 bg-[#0f1419] border-2 border-[#2a3547] text-gray-300 font-sans font-medium hover:border-[#d4af37] transition-all text-left"
                  >
                    Ethereum (ETH)
                  </button>
                  <button
                    onClick={() => handleSelectAsset('SOL')}
                    className="w-full py-3 px-6 bg-[#0f1419] border-2 border-[#2a3547] text-gray-300 font-sans font-medium hover:border-[#d4af37] transition-all text-left"
                  >
                    Solana (SOL)
                  </button>
                </div>
              </>
            )}

            {(step === 'trading' || step === 'portfolio') && (
              <>
                <p className="text-xl text-gray-200 mb-6 font-sans">
                  What would you like to do next?
                </p>
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="w-full bg-[#0f1419] border-2 border-[#2a3547] rounded px-4 py-3 focus:outline-none text-gray-100 font-sans focus:border-[#d4af37]"
                />
              </>
            )}
          </div>
        </div>

        {/* Balance Section - appears after funding */}
        {(step === 'funded' || step === 'trade-prompt' || step === 'trading' || step === 'portfolio') && (
          <div className="w-full max-w-2xl px-4 mb-8">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-6 shadow-lg">
              <div className="text-sm text-gray-400 mb-2 font-sans">Balance</div>
              <div className="text-3xl font-bold font-serif" style={{ color: '#00C853' }}>
                ${balance.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Trade Interface - appears after selecting asset */}
        {(step === 'trading' || step === 'portfolio') && (
          <div className="w-full max-w-2xl px-4 mb-8">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-6 shadow-lg">
              <h3 className="text-xl font-bold font-serif mb-4">Trade {selectedAsset}</h3>
              <div className="mb-4">
                <label className="block text-sm font-sans font-medium mb-2 text-gray-300">Amount</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0f1419] border-2 border-[#2a3547] rounded px-4 py-3 focus:outline-none text-gray-100 font-mono focus:border-[#d4af37]"
                />
              </div>
              <button
                onClick={handleBuy}
                disabled={!tradeAmount}
                className="w-full py-3 font-sans font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#00C853', color: '#ffffff' }}
              >
                Buy {selectedAsset}
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Section - appears after trade */}
        {step === 'portfolio' && (
          <div className="w-full max-w-2xl px-4">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-6 shadow-lg">
              <h3 className="text-xl font-bold font-serif mb-4">Your Portfolio</h3>
              <div className="space-y-3">
                {Object.entries(holdings).map(([asset, amount]) => (
                  <div key={asset} className="flex justify-between items-center py-3 px-4 bg-[#0f1419] border border-[#2a3547] rounded">
                    <div>
                      <div className="font-bold font-sans text-gray-100">{asset}</div>
                      <div className="text-sm text-gray-400 font-mono">{amount.toFixed(8)}</div>
                    </div>
                    <div className="text-lg font-mono" style={{ color: '#d4af37' }}>
                      ${(amount * 50000).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}