import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs';

// Manually load .env.local if not already loaded
let apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.log('⚠️  API key not found in env, trying to load .env.local manually');
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    console.log('Looking for .env.local at:', envPath);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
      if (match) {
        apiKey = match[1].trim();
        console.log('✓ Loaded API key from .env.local');
      }
    } else {
      console.log('✗ .env.local file not found at:', envPath);
    }
  } catch (error) {
    console.error('Error loading .env.local:', error);
  }
}

console.log('API Key check:', apiKey ? `Found (length: ${apiKey.length})` : 'NOT FOUND');

if (!apiKey) {
  console.error('⚠️  ANTHROPIC_API_KEY is not set in environment variables');
  console.error('⚠️  Make sure .env.local exists in the crypto-exchange directory');
}

const anthropic = new Anthropic({
  apiKey: apiKey || '',
});

const SYSTEM_PROMPT = `You are a helpful financial assistant for dookie, a modern crypto trading platform. Your role is to guide users through their trading journey in a conversational, friendly way.

When the user first arrives, check their balance. If it's $0, warmly let them know they need to fund their account and that you currently only accept PYUSD (PayPal USD stablecoin). Explain briefly how to fund.

You have access to these tools to help users:
- show_funding_info: Shows the wallet address and funding instructions
- execute_trade: Helps them buy crypto assets (BTC, ETH, SOL)
- show_portfolio: Shows their holdings

Be conversational and guide them step by step. Don't overwhelm them with options - focus on what they need next.`;

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
      model: 'claude-3-5-sonnet-20241022',
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
