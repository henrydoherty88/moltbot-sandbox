/**
 * Overnight Research Module - Runs daily at 5 AM ET
 * Now writes formatted reports to Notion automatically
 */
import { HOLDINGS_PROMPT, WATCHLIST_PROMPT, MARKET_OVERVIEW_PROMPT } from './prompts';

const NOTION_DATABASE_ID = 'ddca3636-396b-42ce-81c8-fe9e67db84d7';

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
  { ticker: 'AMZN', name: 'Amazon' }, { ticker: 'AMD', name: 'AMD' }
];

export interface ResearchResult {
  holdings: any;
  watchlist: any;
  marketOverview: any;
  timestamp: string;
  notionUrl?: string;
}

async function callPerplexity(prompt: string, apiKey: string): Promise<any> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'You are a stock research analyst. Respond with valid JSON only.' },
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

/**
 * Write formatted research report to Notion
 */
async function writeToNotion(
  notionApiKey: string,
  result: ResearchResult,
  date: string
): Promise<{ success: boolean; url?: string; error?: string }> {

  const market = result.marketOverview || {};
  const sentiment = market.market_sentiment || 'NEUTRAL';
  const vix = market.vix_level || 'N/A';
  const tradingRec = market.trading_recommendation || 'NORMAL';
  const summary = market.summary || '';

  const actions: string[] = [];

  if (result.watchlist?.opportunities) {
    for (const opp of result.watchlist.opportunities) {
      if (opp.recommendation === 'BUY_NOW') {
        actions.push(`BUY ${opp.ticker} @ $${opp.current_price} → $${opp.target_price}: ${opp.why_now?.substring(0, 50) || 'Strong entry'}`);
      }
    }
  }

  if (result.holdings?.stocks) {
    for (const stock of result.holdings.stocks) {
      if (stock.recommendation === 'ADD') {
        actions.push(`ADD ${stock.ticker}: ${stock.key_catalyst?.substring(0, 50) || 'Bullish setup'}`);
      }
    }
  }

  const title = `Research ${date} - ${sentiment}`;
  const emoji = sentiment === 'RISK_ON' ? '🟢' : sentiment === 'RISK_OFF' ? '🔴' : '🟡';

  const children: any[] = [
    {
      object: "block",
      type: "callout",
      callout: {
        rich_text: [{ type: "text", text: { content: `${sentiment} | VIX: ${vix} | Mode: ${tradingRec}` } }],
        icon: { emoji }
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: [{ type: "text", text: { content: summary || 'No summary available.' } }] }
    },
    { object: "block", type: "divider", divider: {} },
    { object: "block", type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "Action Items" } }] } },
  ];

  if (actions.length > 0) {
    for (const action of actions.slice(0, 10)) {
      children.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: [{ type: "text", text: { content: action } }] }
      });
    }
  } else {
    children.push({
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: [{ type: "text", text: { content: "No immediate action items today. Hold current positions." } }] }
    });
  }

  const fullReport = JSON.stringify({ market: result.marketOverview, holdings: result.holdings, watchlist: result.watchlist }, null, 2);
  children.push(
    { object: "block", type: "divider", divider: {} },
    { object: "block", type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "Full Report" } }] } },
    { object: "block", type: "code", code: { rich_text: [{ type: "text", text: { content: fullReport.substring(0, 1900) } }], language: "json" } }
  );

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          "Name": { title: [{ text: { content: title } }] },
          "Date": { date: { start: date } },
          "Holdings Analyzed": { number: HOLDINGS.length },
          "Key Actions": { rich_text: [{ text: { content: actions.slice(0, 3).join(', ').substring(0, 100) || 'No actions' } }] }
        },
        children
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Notion API: ${response.status} - ${errorText}` };
    }

    const pageResult = await response.json() as { url: string };
    return { success: true, url: pageResult.url };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function runOvernightResearch(apiKey: string, notionApiKey?: string): Promise<ResearchResult> {
  console.log('[Research] Starting overnight research...');
  const today = new Date().toISOString().split('T')[0];

  const [holdings, watchlist, market] = await Promise.all([
    callPerplexity(HOLDINGS_PROMPT.replace('{TICKERS}', HOLDINGS.map(h => h.ticker).join(', ')), apiKey),
    callPerplexity(WATCHLIST_PROMPT.replace('{TICKERS}', WATCHLIST.map(w => w.ticker).join(', ')), apiKey),
    callPerplexity(MARKET_OVERVIEW_PROMPT, apiKey)
  ]);

  const result: ResearchResult = {
    holdings,
    watchlist,
    marketOverview: market,
    timestamp: new Date().toISOString()
  };

  if (notionApiKey) {
    console.log('[Research] Writing to Notion...');
    const notionResult = await writeToNotion(notionApiKey, result, today);
    if (notionResult.success) {
      result.notionUrl = notionResult.url;
      console.log('[Research] Notion page created:', notionResult.url);
    } else {
      console.error('[Research] Notion write failed:', notionResult.error);
    }
  }

  console.log('[Research] Complete');
  return result;
}

export function formatReportAsMarkdown(result: ResearchResult): string {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  let report = `# Daily Research Report\n**${date}**\n\n## Market\n${JSON.stringify(result.marketOverview, null, 2)}\n\n## Holdings (${HOLDINGS.length})\n${JSON.stringify(result.holdings, null, 2)}\n\n## Watchlist (${WATCHLIST.length})\n${JSON.stringify(result.watchlist, null, 2)}`;

  if (result.notionUrl) {
    report += `\n\n---\n📝 [View in Notion](${result.notionUrl})`;
  }

  return report;
}
