'use client';

import { useState, useEffect, useRef } from 'react';

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
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [holdings, setHoldings] = useState<{ [key: string]: number }>({});
  const [tradeAmount, setTradeAmount] = useState('');
  const [uiState, setUIState] = useState<UIState>({
    showBalance: false,
    showFundingInfo: false,
    showTrading: false,
    showPortfolio: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Random definition for background
  const backgroundDef = dookieDefinitions[Math.floor(Math.random() * dookieDefinitions.length)];

  // Initial greeting when component mounts
  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      try {
        console.log('Initializing chat with balance:', balance);
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
            balance,
          }),
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.content) {
          const assistantMessage = data.content.find((c: any) => c.type === 'text');
          if (assistantMessage) {
            console.log('Setting assistant message:', assistantMessage.text);
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
    if (!uiState.selectedAsset || !tradeAmount) return;

    const amount = parseFloat(tradeAmount);
    setHoldings({
      ...holdings,
      [uiState.selectedAsset]: (holdings[uiState.selectedAsset] || 0) + amount,
    });
    setBalance(balance - amount * 50000); // Simplified pricing
    setTradeAmount('');
    setUIState((prev) => ({ ...prev, showPortfolio: true }));
  };

  const handleSimulateFunding = () => {
    setBalance(6000);
    setUIState((prev) => ({ ...prev, showBalance: true }));
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
                  className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
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
                <div className="text-gray-400 font-sans text-sm">Thinking...</div>
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
                  className="flex-1 bg-[#0f1419] border-2 border-[#2a3547] rounded px-4 py-3 focus:outline-none text-gray-100 font-sans focus:border-[#d4af37] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 font-sans font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="w-full max-w-2xl px-4 mb-8">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-6 shadow-lg">
              <h3 className="text-lg font-bold font-serif mb-3" style={{ color: '#d4af37' }}>
                Deposit Address
              </h3>
              <div className="bg-[#0f1419] p-4 rounded border border-[#2a3547] mb-4">
                <code className="text-gray-300 font-mono text-sm">{uiState.depositAddress}</code>
              </div>
              <button
                onClick={handleSimulateFunding}
                className="w-full py-2 px-4 text-sm font-sans font-medium border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0f1419] transition-all"
              >
                Simulate Funding ($6,000)
              </button>
            </div>
          </div>
        )}

        {/* Balance Section - appears after funding */}
        {uiState.showBalance && (
          <div className="w-full max-w-2xl px-4 mb-8">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-6 shadow-lg">
              <div className="text-sm text-gray-400 mb-2 font-sans">Balance</div>
              <div className="text-3xl font-bold font-serif" style={{ color: '#00C853' }}>
                ${balance.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Trade Interface - appears when AI triggers it */}
        {uiState.showTrading && uiState.selectedAsset && (
          <div className="w-full max-w-2xl px-4 mb-8">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3547] p-6 shadow-lg">
              <h3 className="text-xl font-bold font-serif mb-4">Trade {uiState.selectedAsset}</h3>
              <div className="mb-4">
                <label className="block text-sm font-sans font-medium mb-2 text-gray-300">
                  Amount
                </label>
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
                Buy {uiState.selectedAsset}
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Section - appears after trade */}
        {uiState.showPortfolio && Object.keys(holdings).length > 0 && (
          <div className="w-full max-w-2xl px-4">
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