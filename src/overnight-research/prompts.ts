/**
 * ML-Optimized Prompts for Perplexity API
 * Updated: 2026-02-04 - Fixed placeholder value issue
 */

export const HOLDINGS_PROMPT = `You are a stock research analyst. Search for CURRENT real-time data on these holdings: {TICKERS}

IMPORTANT: Look up ACTUAL current prices and technical indicators. Do NOT return placeholder zeros.

For EACH stock, return ONLY valid JSON with REAL current values:
{
  "analysis_date": "YYYY-MM-DD",
  "stocks": [
    {
      "ticker": "SYMBOL",
      "current_price": <ACTUAL_PRICE_FROM_SEARCH>,
      "rsi_14": <ACTUAL_RSI_OR_ESTIMATE>,
      "support_level": <CALCULATED_SUPPORT>,
      "resistance_level": <CALCULATED_RESISTANCE>,
      "analyst_rating": "Buy/Hold/Sell",
      "outlook": "BULLISH/BEARISH/NEUTRAL",
      "recommendation": "HOLD/ADD/REDUCE/EXIT",
      "key_catalyst": "Brief description of recent news or catalyst"
    }
  ]
}

Search for each ticker's current price, recent performance, and analyst sentiment. Every field must have a real value, not zero.`;

export const WATCHLIST_PROMPT = `You are a stock research analyst. Search for CURRENT real-time data on these watchlist stocks: {TICKERS}

IMPORTANT: Look up ACTUAL current prices. Do NOT return placeholder zeros.

Return ONLY valid JSON with REAL current values:
{
  "analysis_date": "YYYY-MM-DD",
  "opportunities": [
    {
      "ticker": "SYMBOL",
      "current_price": <ACTUAL_PRICE_FROM_SEARCH>,
      "entry_score": <1-100_SCORE>,
      "entry_zone": "$X - $Y",
      "stop_loss": <CALCULATED_STOP>,
      "target_price": <CALCULATED_TARGET>,
      "recommendation": "BUY_NOW/WAIT/AVOID",
      "why_now": "Brief explanation with specific catalyst or technical setup"
    }
  ],
  "top_picks": ["ticker1", "ticker2", "ticker3"]
}

Search for each ticker's current price, recent news, and technical setup. Rank opportunities by entry_score (100 = best opportunity).`;

export const MARKET_OVERVIEW_PROMPT = `You are a market analyst. Search for TODAY's current market conditions for swing traders.

IMPORTANT: Look up ACTUAL current VIX level, S&P 500 price, and market data. Do NOT return placeholder zeros.

Return ONLY valid JSON with REAL current values:
{
  "date": "YYYY-MM-DD",
  "market_sentiment": "RISK_ON/RISK_OFF/NEUTRAL",
  "vix_level": <ACTUAL_VIX_LEVEL>,
  "spy_trend": "BULLISH/BEARISH/NEUTRAL",
  "key_levels": {
    "spy_support": <ACTUAL_SUPPORT_LEVEL>,
    "spy_resistance": <ACTUAL_RESISTANCE_LEVEL>
  },
  "sector_leaders": ["Sector1", "Sector2"],
  "sector_laggards": ["Sector1", "Sector2"],
  "trading_recommendation": "AGGRESSIVE/NORMAL/DEFENSIVE/CASH",
  "summary": "2-3 sentence market summary with specific data points"
}

Search for current S&P 500 level, VIX, sector performance, and any breaking market news.`;
