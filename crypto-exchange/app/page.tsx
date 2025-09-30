'use client';

import { useState } from 'react';
import Trading from './components/Trading';
import Portfolio from './components/Portfolio';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'trading' | 'portfolio'>('trading');

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0f1419' }}>
      <header className="border-b" style={{ backgroundColor: '#1a2332', borderColor: '#2a3547' }}>
        <div className="max-w-[1440px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-serif" style={{ color: '#d4af37' }}>
              d<span className="text-4xl" style={{ color: '#d4af37' }}>∞</span>kie
            </h1>
            <p className="text-sm text-gray-400 font-sans italic hidden md:block">
              The successful investment of effort and resources resulting in prosperity
            </p>
          </div>
        </div>
      </header>

      <nav className="border-b" style={{ backgroundColor: '#1a2332', borderColor: '#2a3547' }}>
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('trading')}
              className="py-4 px-2 font-sans font-medium border-b-2 transition-all"
              style={{
                borderColor: activeTab === 'trading' ? '#d4af37' : 'transparent',
                color: activeTab === 'trading' ? '#d4af37' : '#737373'
              }}
            >
              Trading
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className="py-4 px-2 font-sans font-medium border-b-2 transition-all"
              style={{
                borderColor: activeTab === 'portfolio' ? '#d4af37' : 'transparent',
                color: activeTab === 'portfolio' ? '#d4af37' : '#737373'
              }}
            >
              Portfolio
            </button>
          </div>
        </div>
      </nav>

      <main className="py-8">
        {activeTab === 'trading' ? <Trading /> : <Portfolio />}
      </main>

      <footer className="border-t mt-16 py-6" style={{ backgroundColor: '#1a2332', borderColor: '#2a3547' }}>
        <div className="max-w-[1440px] mx-auto px-4 text-center text-sm text-gray-500 font-sans">
          <p>A state of enduring abundance achieved through wise action and focus.</p>
        </div>
      </footer>
    </div>
  );
}