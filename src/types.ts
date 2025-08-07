import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export interface DocSection {
  path: string;
  title: string;
  category?: string;
}

export interface CacheEntry {
  content: CallToolResult;
  timestamp: number;
}

export interface SearchResult {
  path: string;
  title: string;
  snippet: string;
  category?: string;
}