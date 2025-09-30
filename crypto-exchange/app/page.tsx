'use client';

import { useState } from 'react';
import Trading from './components/Trading';
import Portfolio from './components/Portfolio';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'trading' | 'portfolio'>('trading');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Crypto Exchange</h1>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('trading')}
              className={`py-3 px-6 font-medium border-b-2 transition-colors ${
                activeTab === 'trading'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Trading
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-3 px-6 font-medium border-b-2 transition-colors ${
                activeTab === 'portfolio'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Portfolio
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'trading' ? <Trading /> : <Portfolio />}
      </main>
    </div>
  );
}