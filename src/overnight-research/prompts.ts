/**
 * ML-Optimized Prompts for Perplexity API
 */

export const HOLDINGS_PROMPT = `Analyze these holdings: {TICKERS}

For EACH stock, return ONLY valid JSON:
{
  "analysis_date": "YYYY-MM-DD",
  "stocks": [
    {
      "ticker": "SYMBOL",
      "current_price": 0.00,
      "rsi_14": 0,
      "support_level": 0.00,
      "resistance_level": 0.00,
      "analyst_rating": "Buy/Hold/Sell",
      "outlook": "BULLISH/BEARISH/NEUTRAL",
      "recommendation": "HOLD/ADD/REDUCE/EXIT",
      "key_catalyst": "Brief description"
    }
  ]
}`;

export const WATCHLIST_PROMPT = `Analyze these watchlist stocks for entry: {TICKERS}

Return ONLY valid JSON:
{
  "analysis_date": "YYYY-MM-DD",
  "opportunities": [
    {
      "ticker": "SYMBOL",
      "current_price": 0.00,
      "entry_score": 0,
      "entry_zone": "$X - $Y",
      "stop_loss": 0.00,
      "target_price": 0.00,
      "recommendation": "BUY_NOW/WAIT/AVOID",
      "why_now": "Brief explanation"
    }
  ],
  "top_picks": ["ticker1", "ticker2", "ticker3"]
}`;

export const MARKET_OVERVIEW_PROMPT = `Provide today's market overview for swing traders.

Return ONLY valid JSON:
{
  "date": "YYYY-MM-DD",
  "market_sentiment": "RISK_ON/RISK_OFF/NEUTRAL",
  "vix_level": 0.0,
  "spy_trend": "BULLISH/BEARISH/NEUTRAL",
  "key_levels": {
    "spy_support": 0.00,
    "spy_resistance": 0.00
  },
  "sector_leaders": ["Sector1", "Sector2"],
  "trading_recommendation": "AGGRESSIVE/NORMAL/DEFENSIVE/CASH",
  "summary": "2-3 sentence market summary"
}`;
