'use client';

import { useState, useEffect, useRef } from 'react';

// Animation classes
const ANIMATION_CLASSES = {
  messageSlideLeft: 'animate-slideInLeft',
  messageSlideRight: 'animate-slideInRight',
  cardReveal: 'animate-cardReveal',
  buttonHover: 'transition-all duration-150 hover:brightness-110',
  buttonPress: 'active:scale-98',
  inputFocus: 'transition-all duration-120 focus:border-[#d4af37]',
};

// Dookie definitions for background
const dookieDefinitions = [
  { word: 'dookie', pronunciation: '/ Latin, noun /', definition: 'The successful investment of effort and resources resulting in prosperity.' },
  { word: 'dookie', pronunciation: '/ Latin, noun /', definition: 'A state of enduring abundance achieved through wise action and focus.' },
  { word: 'dookie', pronunciation: '/ Latin, noun /', definition: 'The art of transforming patience into tangible wealth.' },
  { word: 'dookie', pronunciation: '/ Latin, noun /', definition: 'Strategic discipline yielding compound returns over time.' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UIState {
  showBalance: boolean;
  showFundingInfo: boolean;
  showTrading: boolean;
  showPortfolio: boolean;
  selectedAsset?: string;
  depositAddress?: string;
  balanceCompact: boolean; // Compact mode after funding
  showDepositAddressCard: boolean; // Show deposit address in top-right
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [holdings, setHoldings] = useState<{ [key: string]: number }>({});
  const [tradeAmount, setTradeAmount] = useState('');
  const [fundingLoading, setFundingLoading] = useState(false);
  const [uiState, setUIState] = useState<UIState>({
    showBalance: false,
    showFundingInfo: false,
    showTrading: false,
    showPortfolio: false,
    balanceCompact: false,
    showDepositAddressCard: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Random definition for background - use useState to avoid hydration mismatch
  const [backgroundDef] = useState(() =>
    dookieDefinitions[Math.floor(Math.random() * dookieDefinitions.length)]
  );

  // Initial greeting when component mounts
  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
            balance,
          }),
        });

        const data = await response.json();

        if (data.content) {
          const assistantMessage = data.content.find((c: any) => c.type === 'text');
          if (assistantMessage) {
            setMessages([{ role: 'assistant', content: assistantMessage.text }]);
          }

          // Check for tool use
          handleToolUse(data.content);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        setMessages([{ role: 'assistant', content: 'Welcome to dookie! There was an error connecting. Please refresh the page.' }]);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToolUse = (content: any[]) => {
    content.forEach((item: any) => {
      if (item.type === 'tool_use') {
        switch (item.name) {
          case 'show_funding_info':
            setUIState((prev) => ({
              ...prev,
              showBalance: true,
              showFundingInfo: true,
              depositAddress: '0xDOOK...IE420',
              showDepositAddressCard: true, // Show address card in top-right
            }));
            break;
          case 'execute_trade':
            setUIState((prev) => ({
              ...prev,
              showBalance: true,
              showTrading: true,
              selectedAsset: item.input.asset,
            }));
            break;
          case 'show_portfolio':
            setUIState((prev) => ({
              ...prev,
              showBalance: true,
              showPortfolio: true,
            }));
            break;
        }
      }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          balance,
        }),
      });

      const data = await response.json();

      if (data.content) {
        const assistantMessage = data.content.find((c: any) => c.type === 'text');
        if (assistantMessage) {
          setMessages([...newMessages, { role: 'assistant', content: assistantMessage.text }]);
        }

        // Handle tool use
        handleToolUse(data.content);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    const asset = uiState.selectedAsset || 'BTC';
    if (!tradeAmount) return;

    const amount = parseFloat(tradeAmount);
    const cost = amount * 50000; // Simplified pricing

    if (cost > balance) {
      alert('Insufficient balance');
      return;
    }

    setHoldings({
      ...holdings,
      [asset]: (holdings[asset] || 0) + amount,
    });
    setBalance(balance - cost);
    setTradeAmount('');
    setUIState((prev) => ({ ...prev, showPortfolio: true }));

    // Add confirmation message
    setMessages([
      ...messages,
      {
        role: 'assistant' as const,
        content: `Great! I've placed your order for ${amount} ${asset}. You can see your holdings below.`
      }
    ]);
  };

  const handleSimulateFunding = async () => {
    setFundingLoading(true);

    // Simulate 7-second funding process
    await new Promise(resolve => setTimeout(resolve, 7000));

    setBalance(6000);
    setFundingLoading(false);

    // Hide funding info, shrink balance to compact mode in top-left
    setUIState((prev) => ({
      ...prev,
      showBalance: true,
      showFundingInfo: false,
      balanceCompact: true,
    }));

    // Add assistant message about successful funding
    const newMessages = [
      ...messages,
      {
        role: 'assistant' as const,
        content: 'Great, looks like your account is funded. Are you ready to make your first trade? Do you know what you want to buy?'
      }
    ];
    setMessages(newMessages);
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

      {/* Fixed Top-Left: Compact Balance Card (appears after funding) */}
      {uiState.showBalance && uiState.balanceCompact && (
        <div className="fixed top-4 left-4 z-30 animate-scale-down-pulse-left">
          <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-4 shadow-lg">
            <div className="text-xs text-gray-400 mb-1 font-sans">Balance</div>
            <div className="text-2xl font-bold font-serif" style={{ color: '#00C853' }}>
              ${balance.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Top-Right: Deposit Address Card */}
      {uiState.showDepositAddressCard && uiState.depositAddress && !uiState.showFundingInfo && (
        <div className="fixed top-4 right-4 z-30 animate-scale-down-pulse-right">
          <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-4 shadow-lg max-w-xs">
            <div className="text-xs text-gray-400 mb-2 font-sans">Deposit Address</div>
            <div className="bg-[#0f1419] p-2 rounded border border-[#2a3547]">
              <code className="text-gray-300 font-mono text-xs break-all">{uiState.depositAddress}</code>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen pt-20">
        {/* Logo/Header - minimal */}
        <h1 className="text-4xl font-bold font-serif mb-16" style={{ color: '#d4af37' }}>
          d<span className="text-5xl" style={{ color: '#d4af37' }}>∞</span>kie
        </h1>

        {/* Conversation Box */}
        <div className="w-full max-w-2xl px-4 mb-8">
          <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] shadow-lg">
            {/* Messages */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {messages.length === 0 && loading && (
                <div className="text-gray-400 font-sans">Starting conversation...</div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'} ${
                    msg.role === 'user' ? ANIMATION_CLASSES.messageSlideRight : ANIMATION_CLASSES.messageSlideLeft
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg font-sans ${
                      msg.role === 'user'
                        ? 'bg-[#d4af37] text-[#0f1419]'
                        : 'bg-[#0f1419] text-gray-200 border border-[#2a3547]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && messages.length > 0 && (
                <div className="flex items-center gap-2 text-gray-400 font-sans text-sm">
                  <div className="flex gap-1">
                    <span className="animate-pulse-dot" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-pulse-dot" style={{ animationDelay: '166ms' }}>.</span>
                    <span className="animate-pulse-dot" style={{ animationDelay: '332ms' }}>.</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#2a3547]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 bg-[#0f1419] border-2 border-[#2a3547] rounded px-4 py-3 focus:outline-none text-gray-100 font-sans transition-all duration-[120ms] ease-in-out focus:border-[#d4af37] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 font-sans font-medium transition-all duration-[120ms] ease-in-out hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100"
                  style={{ backgroundColor: '#d4af37', color: '#0f1419' }}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Funding Info - appears when AI triggers it */}
        {uiState.showFundingInfo && (
          <div className="w-full max-w-2xl px-4 mb-8 animate-cardReveal">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-6 shadow-lg">
              <h3 className="text-lg font-bold font-serif mb-4" style={{ color: '#d4af37' }}>
                Fund Your Account
              </h3>

              <div className="mb-4">
                <h4 className="text-sm font-sans font-semibold mb-3 text-gray-300">
                  How to send PYUSD via PayPal/Venmo:
                </h4>
                <ol className="space-y-2 text-sm font-sans text-gray-300 ml-4">
                  <li className="flex">
                    <span className="font-semibold mr-2 text-[#d4af37]">1.</span>
                    <span>Open the crypto section in your PayPal or Venmo app</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-2 text-[#d4af37]">2.</span>
                    <span>Select PYUSD to send</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-2 text-[#d4af37]">3.</span>
                    <span>Input the wallet address shown below</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-2 text-[#d4af37]">4.</span>
                    <span>Review and confirm transaction details</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-2 text-[#d4af37]">5.</span>
                    <span>Send the transaction</span>
                  </li>
                </ol>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-sans font-semibold mb-2 text-gray-400">
                  Deposit Address:
                </h4>
                <div className="bg-[#0f1419] p-4 rounded border border-[#2a3547]">
                  <code className="text-gray-300 font-mono text-sm break-all">{uiState.depositAddress}</code>
                </div>
              </div>

              <button
                onClick={handleSimulateFunding}
                disabled={fundingLoading}
                className="w-full py-2 px-4 text-sm font-sans font-medium border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0f1419] transition-all duration-[120ms] ease-in-out active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#d4af37]"
              >
                {fundingLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-infinity-spin" style={{ color: '#d4af37', fontSize: '20px' }}>∞</span>
                    <span>Processing...</span>
                  </span>
                ) : (
                  'Simulate Funding ($6,000)'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Balance Section - appears after funding, then animates to top-left */}
        {uiState.showBalance && !uiState.balanceCompact && (
          <div className="w-full max-w-2xl px-4 mb-8 animate-cardReveal">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-6 shadow-lg">
              <div className="text-sm text-gray-400 mb-2 font-sans">Balance</div>
              <div className="text-3xl font-bold font-serif" style={{ color: '#00C853' }}>
                ${balance.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Trade Interface - appears when AI triggers it */}
        {uiState.showTrading && (
          <div className="w-full max-w-2xl px-4 mb-8 animate-cardReveal">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-6 shadow-lg">
              <h3 className="text-xl font-bold font-serif mb-6">Place Your Trade</h3>

              {/* Asset Selector */}
              <div className="mb-4">
                <label className="block text-sm font-sans font-medium mb-2 text-gray-300">
                  Select Asset
                </label>
                <select
                  value={uiState.selectedAsset || 'BTC'}
                  onChange={(e) => setUIState((prev) => ({ ...prev, selectedAsset: e.target.value }))}
                  className="w-full bg-[#0f1419] border-2 border-[#2a3547] rounded px-4 py-3 focus:outline-none text-gray-100 font-sans transition-all duration-[120ms] ease-in-out focus:border-[#d4af37]"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="SOL">Solana (SOL)</option>
                </select>
              </div>

              {/* Current Price Display */}
              <div className="mb-4 p-3 bg-[#0f1419] border border-[#2a3547] rounded">
                <div className="text-sm text-gray-400 font-sans mb-1">Current Price</div>
                <div className="text-2xl font-bold font-mono" style={{ color: '#d4af37' }}>
                  $50,000.00
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-sans font-medium mb-2 text-gray-300">
                  Amount to Buy
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0f1419] border-2 border-[#2a3547] rounded px-4 py-3 focus:outline-none text-gray-100 font-mono transition-all duration-[120ms] ease-in-out focus:border-[#d4af37]"
                />
                {tradeAmount && (
                  <div className="mt-2 text-sm text-gray-400 font-sans">
                    Total Cost: ${(parseFloat(tradeAmount) * 50000).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Buy Button */}
              <button
                onClick={handleBuy}
                disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                className="w-full py-3 font-sans font-bold transition-all duration-[120ms] ease-in-out hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100"
                style={{ backgroundColor: '#00C853', color: '#ffffff' }}
              >
                Buy {uiState.selectedAsset || 'BTC'}
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Section - appears after trade */}
        {uiState.showPortfolio && Object.keys(holdings).length > 0 && (
          <div className="w-full max-w-2xl px-4 animate-cardReveal">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-6 shadow-lg">
              <h3 className="text-xl font-bold font-serif mb-4">Your Portfolio</h3>
              <div className="space-y-3">
                {Object.entries(holdings).map(([asset, amount]) => (
                  <div
                    key={asset}
                    className="flex justify-between items-center py-3 px-4 bg-[#0f1419] border border-[#2a3547] rounded"
                  >
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