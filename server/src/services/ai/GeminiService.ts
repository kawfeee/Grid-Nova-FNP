// =============================================================================
// GridNova Gemini AI Service
// Conforms to Rules 21 - 31, 64, 80, 81, 82 and TRD Sections 17 - 24
// =============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIInsight,
  EnergyForecastResult,
  InsightType,
  NeighbourhoodInsightResult,
  PriceRecommendationResult,
  TradeRecommendationResult,
} from '../../types/index.js';

export interface AIService {
  getEnergyForecast(params: {
    userId: string;
    houseId: string;
    currentGeneration: number;
    currentConsumption: number;
    solarCapacityKw: number;
    timeOfDayHour: number;
  }): Promise<EnergyForecastResult>;

  getTradeRecommendation(params: {
    userId: string;
    houseId: string;
    surplusKwh: number;
    deficitKwh: number;
    marketAveragePrice: number;
    neighbourhoodDemandLevel: string;
  }): Promise<TradeRecommendationResult>;

  getPriceRecommendation(params: {
    houseId: string;
    currentSupplyKwh: number;
    currentDemandKwh: number;
    avgMarketPrice: number;
    timeOfDayHour: number;
  }): Promise<PriceRecommendationResult>;

  getNeighbourhoodInsight(params: {
    totalGenerationKwh: number;
    totalConsumptionKwh: number;
    surplusHousesCount: number;
    deficitHousesCount: number;
    activeListingsCount: number;
  }): Promise<NeighbourhoodInsightResult>;
}

export class GeminiAIService implements AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private cache: Map<string, AIInsight<unknown>> = new Map();
  private readonly CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes cache (Rule 27 & 28)

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (err) {
        console.warn('[GeminiAIService] Could not initialize Gemini SDK:', err);
      }
    } else {
      console.info('[GeminiAIService] No valid GEMINI_API_KEY provided. Running in resilient simulation mode.');
    }
  }

  private getCacheKey(type: InsightType, identifier: string): string {
    return `${type}:${identifier}`;
  }

  private getFromCache<T>(type: InsightType, identifier: string): T | null {
    const key = this.getCacheKey(type, identifier);
    const cached = this.cache.get(key);
    if (!cached) return null;

    const expiresAt = new Date(cached.expires_at).getTime();
    if (Date.now() > expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.result as T;
  }

  private setInCache<T>(type: InsightType, identifier: string, result: T): void {
    const key = this.getCacheKey(type, identifier);
    const insight: AIInsight<T> = {
      id: crypto.randomUUID(),
      insight_type: type,
      input_snapshot: {},
      result,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + this.CACHE_TTL_MS).toISOString(),
    };
    this.cache.set(key, insight as AIInsight<unknown>);
  }

  /**
   * Helper to execute Gemini with fallback
   */
  private async executeGeminiPrompt<T>(prompt: string, fallback: T): Promise<T> {
    if (!this.genAI) {
      return fallback;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as T;
    } catch (error) {
      console.warn('[GeminiAIService] Error calling Gemini API. Falling back to local advisory engine:', error);
      return fallback;
    }
  }

  /**
   * AI Feature 1: Energy Forecast (TRD Section 18)
   */
  public async getEnergyForecast(params: {
    userId: string;
    houseId: string;
    currentGeneration: number;
    currentConsumption: number;
    solarCapacityKw: number;
    timeOfDayHour: number;
  }): Promise<EnergyForecastResult> {
    const cached = this.getFromCache<EnergyForecastResult>('energy_forecast', params.houseId);
    if (cached) return cached;

    // Deterministic base heuristic for fallback
    const isDay = params.timeOfDayHour >= 8 && params.timeOfDayHour <= 17;
    const fallbackPredictedGen = isDay
      ? Math.round(params.solarCapacityKw * 0.7 * 100) / 100
      : Math.round(params.solarCapacityKw * 0.1 * 100) / 100;
    const fallbackPredictedCon = Math.round((2.0 + (params.timeOfDayHour >= 18 ? 1.5 : 0)) * 100) / 100;
    const fallbackSurplus = Math.round((fallbackPredictedGen - fallbackPredictedCon) * 100) / 100;

    const fallback: EnergyForecastResult = {
      predicted_generation_kwh: fallbackPredictedGen,
      predicted_consumption_kwh: fallbackPredictedCon,
      expected_surplus_kwh: fallbackSurplus,
      confidence: 0.85,
      reasoning: isDay
        ? `Solar irradiance is strong at ${params.timeOfDayHour}:00. Solar generation expected to exceed household baseline consumption.`
        : `Solar generation drops during evening/night hours (${params.timeOfDayHour}:00). Expected deficit unless drawing from battery or community grid.`,
    };

    const prompt = `You are the GridNova renewable energy forecasting engine.
Predict next-hour solar generation, consumption, and surplus for a residential house:
- Solar Capacity: ${params.solarCapacityKw} kW
- Current Generation: ${params.currentGeneration} kWh
- Current Consumption: ${params.currentConsumption} kWh
- Time of Day (Hour 0-23): ${params.timeOfDayHour}
Return strict JSON with fields:
{
  "predicted_generation_kwh": number,
  "predicted_consumption_kwh": number,
  "expected_surplus_kwh": number,
  "confidence": number,
  "reasoning": string
}`;

    const result = await this.executeGeminiPrompt(prompt, fallback);
    this.setInCache('energy_forecast', params.houseId, result);
    return result;
  }

  /**
   * AI Feature 2: Trade Recommendation (TRD Section 19)
   */
  public async getTradeRecommendation(params: {
    userId: string;
    houseId: string;
    surplusKwh: number;
    deficitKwh: number;
    marketAveragePrice: number;
    neighbourhoodDemandLevel: string;
  }): Promise<TradeRecommendationResult> {
    const cached = this.getFromCache<TradeRecommendationResult>('trade_recommendation', params.houseId);
    if (cached) return cached;

    const hasSurplus = params.surplusKwh > 0.5;
    const hasDeficit = params.deficitKwh > 0.5;

    let fallback: TradeRecommendationResult;
    if (hasSurplus) {
      const sellAmount = Math.round(params.surplusKwh * 0.75 * 10) / 10;
      fallback = {
        recommendation: 'sell',
        recommended_amount_kwh: sellAmount,
        recommended_price_per_kwh: Math.round((params.marketAveragePrice + 0.2) * 100) / 100,
        confidence: 0.88,
        reason: `You have ${params.surplusKwh} kWh surplus energy. Local demand is ${params.neighbourhoodDemandLevel}. Recommend listing ${sellAmount} kWh to optimize earnings.`,
      };
    } else if (hasDeficit) {
      const buyAmount = Math.round(params.deficitKwh * 10) / 10;
      fallback = {
        recommendation: 'buy',
        recommended_amount_kwh: buyAmount,
        recommended_price_per_kwh: params.marketAveragePrice,
        confidence: 0.9,
        reason: `Your household has a deficit of ${params.deficitKwh} kWh. Purchasing directly from neighbouring solar houses will save costs compared to main grid tariffs.`,
      };
    } else {
      fallback = {
        recommendation: 'hold',
        recommended_amount_kwh: 0,
        recommended_price_per_kwh: params.marketAveragePrice,
        confidence: 0.82,
        reason: 'Your household energy balance is currently stable. Maintain battery charge and monitor grid fluctuations.',
      };
    }

    const prompt = `You are GridNova AI trading advisor.
Advise this citizen on whether to buy, sell, or hold electricity in the P2P community market:
- Current Surplus: ${params.surplusKwh} kWh
- Current Deficit: ${params.deficitKwh} kWh
- Average Market Price: ₹${params.marketAveragePrice}/kWh
- Community Demand Level: ${params.neighbourhoodDemandLevel}
Return strict JSON:
{
  "recommendation": "sell" | "buy" | "hold",
  "recommended_amount_kwh": number,
  "recommended_price_per_kwh": number,
  "confidence": number,
  "reason": string
}`;

    const result = await this.executeGeminiPrompt(prompt, fallback);
    this.setInCache('trade_recommendation', params.houseId, result);
    return result;
  }

  /**
   * AI Feature 3: Dynamic Price Recommendation (TRD Section 20)
   */
  public async getPriceRecommendation(params: {
    houseId: string;
    currentSupplyKwh: number;
    currentDemandKwh: number;
    avgMarketPrice: number;
    timeOfDayHour: number;
  }): Promise<PriceRecommendationResult> {
    const cached = this.getFromCache<PriceRecommendationResult>('price_recommendation', params.houseId);
    if (cached) return cached;

    // Supply-Demand elasticity heuristic
    const ratio = params.currentDemandKwh / (params.currentSupplyKwh || 1);
    let price = params.avgMarketPrice;
    let reason = 'Market conditions are balanced.';

    if (ratio > 1.2) {
      price = Math.round((params.avgMarketPrice * 1.12) * 100) / 100;
      reason = 'Local demand exceeds solar supply. A slight premium of ₹' + price + '/kWh is optimal for sellers.';
    } else if (ratio < 0.8) {
      price = Math.round((params.avgMarketPrice * 0.94) * 100) / 100;
      reason = 'Abundant solar surplus in neighbourhood. A competitive price of ₹' + price + '/kWh ensures quick order fulfillment.';
    }

    const fallback: PriceRecommendationResult = {
      recommended_price_per_kwh: price,
      confidence: 0.87,
      reason,
    };

    const prompt = `You are GridNova Dynamic Pricing Optimizer.
Recommend the optimal electricity selling price in ₹/kWh:
- Total Community Supply: ${params.currentSupplyKwh} kWh
- Total Community Demand: ${params.currentDemandKwh} kWh
- Current Average Listing Price: ₹${params.avgMarketPrice}/kWh
- Hour: ${params.timeOfDayHour}
Return strict JSON:
{
  "recommended_price_per_kwh": number,
  "confidence": number,
  "reason": string
}`;

    const result = await this.executeGeminiPrompt(prompt, fallback);
    this.setInCache('price_recommendation', params.houseId, result);
    return result;
  }

  /**
   * AI Feature 4: Administrator Neighbourhood Insights (TRD Section 21)
   */
  public async getNeighbourhoodInsight(params: {
    totalGenerationKwh: number;
    totalConsumptionKwh: number;
    surplusHousesCount: number;
    deficitHousesCount: number;
    activeListingsCount: number;
  }): Promise<NeighbourhoodInsightResult> {
    const cached = this.getFromCache<NeighbourhoodInsightResult>('neighbourhood_insight', 'admin_global');
    if (cached) return cached;

    const net = params.totalGenerationKwh - params.totalConsumptionKwh;
    const isNetSurplus = net >= 0;

    const fallback: NeighbourhoodInsightResult = {
      headline: isNetSurplus
        ? 'High Renewable Self-Sufficiency Across Neighbourhood'
        : 'Community Energy Deficit - Battery Discharge & Peaking Active',
      summary: `Total generation is ${params.totalGenerationKwh} kWh against consumption of ${params.totalConsumptionKwh} kWh. ${params.surplusHousesCount} households are feeding surplus solar into the P2P market.`,
      key_findings: [
        `${params.surplusHousesCount} houses with surplus solar generation`,
        `${params.deficitHousesCount} houses currently needing local energy`,
        `${params.activeListingsCount} active listings in marketplace`,
        `Net neighbourhood balance: ${net > 0 ? '+' : ''}${Math.round(net * 10) / 10} kWh`,
      ],
      recommended_actions: [
        'Prioritize matching deficit houses with nearby lowest-latency solar prosumers.',
        'Encourage battery storage retention for evening baseload requirements.',
      ],
    };

    const prompt = `You are GridNova Administrator Intelligence Advisor.
Analyze this neighbourhood microgrid snapshot and provide an executive summary:
- Total Solar Generation: ${params.totalGenerationKwh} kWh
- Total Household Consumption: ${params.totalConsumptionKwh} kWh
- Surplus Houses Count: ${params.surplusHousesCount}
- Deficit Houses Count: ${params.deficitHousesCount}
- Active Marketplace Listings: ${params.activeListingsCount}
Return strict JSON:
{
  "headline": string,
  "summary": string,
  "key_findings": string[],
  "recommended_actions": string[]
}`;

    const result = await this.executeGeminiPrompt(prompt, fallback);
    this.setInCache('neighbourhood_insight', 'admin_global', result);
    return result;
  }
}

export const geminiService = new GeminiAIService();
