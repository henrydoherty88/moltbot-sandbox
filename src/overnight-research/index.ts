/**
 * Overnight Research Module - Runs daily at 5 AM ET
 */
import { HOLDINGS_PROMPT, WATCHLIST_PROMPT, MARKET_OVERVIEW_PROMPT } from './prompts';

export const HOLDINGS = [
  { ticker: 'SPY', shares: 1.395, entryPrice: 457.95, sector: 'ETF', thesis: 'S&P 500 index' },
  { ticker: 'PHO', shares: 6.453, entryPrice: 51.58, sector: 'ETF', thesis: 'Water infrastructure' },
  { ticker: 'VB', shares: 1.485, entryPrice: 183.50, sector: 'ETF', thesis: 'Small-cap value' },
  { ticker: 'LMND', shares: 3.0, entryPrice: 39.28, sector: 'Tech', thesis: 'InsurTech disruptor' },
  { ticker: 'DUOL', shares: 1.524, entryPrice: 164.04, sector: 'Consumer', thesis: 'Language learning' },
  { ticker: 'ORCL', shares: 0.928, entryPrice: 201.52, sector: 'Tech', thesis: 'Cloud infrastructure' },
  { ticker: 'SHOP', shares: 1.115, entryPrice: 143.53, sector: 'Tech', thesis: 'E-commerce platform' },
  { ticker: 'VGT', shares: 0.149, entryPrice: 692.41, sector: 'ETF', thesis: 'Tech sector ETF' },
  { ticker: 'VOO', shares: 0.171, entryPrice: 587.60, sector: 'ETF', thesis: 'Vanguard S&P 500' },
  { ticker: 'NVDA', shares: 0.395, entryPrice: 177.31, sector: 'Tech', thesis: 'AI chip leader' },
  { ticker: 'SOFI', shares: 1.229, entryPrice: 16.27, sector: 'Financials', thesis: 'Digital banking' },
  { ticker: 'META', shares: 0.029, entryPrice: 660.62, sector: 'Tech', thesis: 'Social media + AI' },
  { ticker: 'TSM', shares: 0.059, entryPrice: 286.93, sector: 'Tech', thesis: 'Semiconductor foundry' }
];

export const WATCHLIST = [
  { ticker: 'PYPL', name: 'PayPal' }, { ticker: 'NKE', name: 'Nike' },
  { ticker: 'UBER', name: 'Uber' }, { ticker: 'NFLX', name: 'Netflix' },
  { ticker: 'DIS', name: 'Disney' }, { ticker: 'WMT', name: 'Walmart' },
  { ticker: 'PLTR', name: 'Palantir' }, { ticker: 'GOOGL', name: 'Alphabet' },
  { ticker: 'TSLA', name: 'Tesla' }, { ticker: 'CRWD', name: 'CrowdStrike' },
  { ticker: 'DE', name: 'Deere' }, { ticker: 'GNPX', name: 'Genprex' },
  { ticker: 'MSOS', name: 'Cannabis ETF' }, { ticker: 'YOU', name: 'Clear Security' }
];

export interface ResearchResult { holdings: any; watchlist: any; marketOverview: any; timestamp: string; }

async function callPerplexity(prompt: string, apiKey: string): Promise<any> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'You are a stock research analyst. Respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1, max_tokens: 4000
    })
  });
  if (!response.ok) throw new Error(`Perplexity error: ${response.status}`);
  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  const content = data.choices[0]?.message?.content || '';
  try {
    const match = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
    return match ? JSON.parse(match[1]) : JSON.parse(content);
  } catch { return { raw: content }; }
}

export async function runOvernightResearch(apiKey: string): Promise<ResearchResult> {
  console.log('[Research] Starting...');
  const [holdings, watchlist, market] = await Promise.all([
    callPerplexity(HOLDINGS_PROMPT.replace('{TICKERS}', HOLDINGS.map(h => h.ticker).join(', ')), apiKey),
    callPerplexity(WATCHLIST_PROMPT.replace('{TICKERS}', WATCHLIST.map(w => w.ticker).join(', ')), apiKey),
    callPerplexity(MARKET_OVERVIEW_PROMPT, apiKey)
  ]);
  console.log('[Research] Complete');
  return { holdings, watchlist, marketOverview: market, timestamp: new Date().toISOString() };
}

export function formatReportAsMarkdown(result: ResearchResult): string {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return `# Daily Research Report\n**${date}**\n\n## Market\n${JSON.stringify(result.marketOverview, null, 2)}\n\n## Holdings (13)\n${JSON.stringify(result.holdings, null, 2)}\n\n## Watchlist (14)\n${JSON.stringify(result.watchlist, null, 2)}`;
}
