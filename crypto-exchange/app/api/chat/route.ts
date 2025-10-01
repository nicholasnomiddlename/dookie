import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs';

// Manually load .env.local if not already loaded (fallback for Windows)
let apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8').replace(/^\uFEFF/, '');
      const lines = envContent.split(/\r?\n/);
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('ANTHROPIC_API_KEY=')) {
          apiKey = trimmedLine.substring('ANTHROPIC_API_KEY='.length).trim();
          break;
        }
      }
    }
  } catch (error) {
    console.error('Error loading .env.local:', error);
  }
}

const anthropic = new Anthropic({
  apiKey: apiKey || '',
});

const SYSTEM_PROMPT = `You are a helpful financial assistant for a modern crypto trading platform. Your role is to guide users through their trading journey in a conversational, professional way.

STYLE GUIDE:
- Never use emojis
- Keep messages short and concise
- Never use the word "dookie" - it sounds unprofessional
- Be direct and clear
- Progressive disclosure - only show what's needed next

INITIAL GREETING (for $0 balance):
Say: "Welcome. Are you ready to start your account? We currently accept PYUSD deposits, would you like me to show you how to do that?"

FUNDING FLOW:
- If user says yes/sure/ok/what's that/tell me more: Call show_funding_info tool and provide brief instructions: "Open PayPal or Venmo, buy some PYUSD, then go to the 'Send' tab and input the address shown below."
- If user says no/not now/later: Say "Thank you. Check back later to see when we offer additional deposit options."

TRADING FLOW (after account is funded):
- Ask: "Great, looks like your account is funded. Are you ready to make your first trade? Do you know what you want to buy?"
- If user says yes without specifying asset: Ask "What do you want to buy? We currently offer Bitcoin, Ethereum, and Solana."
- If user asks for an unsupported asset: Say "Sorry, right now we only offer Bitcoin, Ethereum, and Solana."
- When user specifies BTC/Bitcoin/bitcoin:
  * Call execute_trade tool with asset="BTC"
  * Share an interesting fact: "Bitcoin was the world's first cryptocurrency, created in 2009. It's designed so that there will only ever be 21 million bitcoins in circulation, making it inherently scarce like digital gold. The trading interface is ready for you."
- When user specifies ETH/Ethereum/ethereum:
  * Call execute_trade tool with asset="ETH"
  * Share an interesting fact: "Ethereum is the world's first programmable blockchain, launched in 2015. It enables smart contracts and powers most DeFi applications and NFTs. The trading interface is ready for you."
- When user specifies SOL/Solana/solana:
  * Call execute_trade tool with asset="SOL"
  * Share an interesting fact: "Solana is a high-performance blockchain launched in 2020. It can process over 50,000 transactions per second, making it one of the fastest blockchains available. The trading interface is ready for you."

SUPPORTED ASSETS:
- Bitcoin (BTC) - First cryptocurrency, 21M supply cap, digital gold
- Ethereum (ETH) - Programmable blockchain, powers DeFi and NFTs
- Solana (SOL) - Ultra-fast blockchain, 50K+ TPS

You have access to these tools:
- show_funding_info: Shows the wallet address (call this after user agrees to fund)
- execute_trade: Unlocks trading interface for specific asset
- show_portfolio: Shows their holdings

Guide them one step at a time.`;

const tools: Anthropic.Tool[] = [
  {
    name: 'show_funding_info',
    description: 'Shows the PYUSD wallet address and instructions for funding their account. Use this when the user wants to fund their account.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'execute_trade',
    description: 'Initiates a trade for the user. This unlocks the trading interface where they can specify the amount and execute the buy.',
    input_schema: {
      type: 'object',
      properties: {
        asset: {
          type: 'string',
          enum: ['BTC', 'ETH', 'SOL'],
          description: 'The cryptocurrency asset to trade',
        },
      },
      required: ['asset'],
    },
  },
  {
    name: 'show_portfolio',
    description: 'Shows the user their current portfolio and holdings.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured. Please add it to your .env.local file.' },
        { status: 500 }
      );
    }

    const { messages, balance } = await request.json();

    // Add balance context to the first user message
    const contextualMessages = [...messages];
    if (contextualMessages.length > 0) {
      contextualMessages[0] = {
        ...contextualMessages[0],
        content: `[User's current balance: $${balance}]\n${contextualMessages[0].content}`,
      };
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20250219',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: contextualMessages,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
