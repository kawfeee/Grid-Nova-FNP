// =============================================================================
// GridNova REST API Routes
// Conforms to Rules 11, 12, 22, 23, 39, 46, 47, 51 and TRD Sections 25-28
// =============================================================================

import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest, requireRole } from '../middleware/authMiddleware.js';
import { store } from '../data/store.js';
import { tradingService } from '../services/trading/TradingService.js';
import { mockBlockchainService } from '../services/blockchain/BlockchainService.js';
import { geminiService } from '../services/ai/GeminiService.js';
import { createListingSchema, executeTradeSchema, loginSchema, setTimeSchema } from '../validators/index.js';

export const apiRouter = Router();

// =============================================================================
// 1. Authentication & Profiles
// =============================================================================

apiRouter.get('/auth/demo-users', (_req, res) => {
  const all = store.getProfiles();
  const demoAccounts = [
    { ...all[1], tag: 'Citizen A (Surplus Solar Producer)', houseName: 'Solar Pioneer' },
    { ...all[2], tag: 'Citizen B (Deficit Consumer)', houseName: 'Green Villa' },
    { ...all[0], tag: 'Administrator (Grid Supervisor)', houseName: 'Admin Station' },
  ];
  res.json({ success: true, data: demoAccounts });
});

apiRouter.post('/auth/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    return;
  }

  const { email } = parsed.data;
  let user = store.getProfileByEmail(email);
  if (!user) {
    // If not found, create new citizen profile
    user = {
      id: crypto.randomUUID(),
      email,
      full_name: email.split('@')[0],
      role: 'citizen',
      wallet_balance: 5000.0,
      created_at: new Date().toISOString(),
    };
    store.createProfile(user);
  }

  res.json({ success: true, data: { user, token: user.id } });
});

apiRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const house = store.getHouseByOwnerId(user.id);
  const houseEnergyState = house ? store.getHouseEnergyState(house.id) : null;

  res.json({
    success: true,
    data: {
      user,
      house,
      houseEnergyState,
    },
  });
});

// =============================================================================
// 2. Houses & Energy (Smart Meter)
// =============================================================================

apiRouter.get('/houses', (_req, res) => {
  const houses = store.getHouses();
  res.json({ success: true, data: houses });
});

apiRouter.get('/house', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const house = store.getHouseByOwnerId(req.user!.id);
  if (!house) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No house registered for this user' } });
    return;
  }
  res.json({ success: true, data: house });
});

apiRouter.get('/energy/current', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const house = store.getHouseByOwnerId(req.user!.id);
  if (!house) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'House not found' } });
    return;
  }

  const state = store.getHouseEnergyState(house.id);
  res.json({ success: true, data: state });
});

apiRouter.get('/energy/history/:houseId', (req, res) => {
  const readings = store.getReadingsForHouse(req.params.houseId);
  res.json({ success: true, data: readings });
});

// =============================================================================
// 3. Simulation Controls
// =============================================================================

apiRouter.get('/simulation/state', (_req, res) => {
  const state = store.getNeighbourhoodState();
  res.json({ success: true, data: state });
});

apiRouter.post('/simulation/step', async (_req, res) => {
  const updatedState = await store.stepSimulationInterval(1);
  res.json({
    success: true,
    message: `Advanced simulation to ${updatedState.time_label}`,
    data: updatedState,
  });
});

apiRouter.post('/simulation/time', async (req, res) => {
  const parsed = setTimeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Hour must be between 0 and 23' } });
    return;
  }
  store.currentHour = parsed.data.hour;
  const updatedState = await store.stepSimulationInterval(0);
  res.json({ success: true, data: updatedState });
});

apiRouter.post('/simulation/reset', (_req, res) => {
  store.resetToSeed();
  const state = store.getNeighbourhoodState();
  res.json({
    success: true,
    message: 'Simulation reset successfully to initial seeded neighbourhood state',
    data: state,
  });
});

// =============================================================================
// 4. P2P Marketplace Listings
// =============================================================================

apiRouter.get('/listings', (_req, res) => {
  const listings = store.getListings('active');
  res.json({ success: true, data: listings });
});

apiRouter.post('/listings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const parsed = createListingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    return;
  }

  const { energyAmountKwh, pricePerKwh } = parsed.data;
  const user = req.user!;
  const house = store.getHouseByOwnerId(user.id);

  if (!house) {
    res.status(400).json({ success: false, error: { code: 'NO_HOUSE', message: 'You must have a house to sell energy' } });
    return;
  }

  const energyState = store.getHouseEnergyState(house.id);
  if (!energyState) {
    res.status(400).json({ success: false, error: { code: 'NO_ENERGY_DATA', message: 'Unable to calculate surplus' } });
    return;
  }

  // Rule 14 & 46: Verify seller actually has available surplus
  if (energyAmountKwh > energyState.available_to_sell_kwh) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_SURPLUS',
        message: `Requested ${energyAmountKwh} kWh exceeds available surplus (${energyState.available_to_sell_kwh} kWh).`,
      },
    });
    return;
  }

  const listing = store.createListing({
    id: crypto.randomUUID(),
    seller_id: user.id,
    house_id: house.id,
    energy_amount_kwh: energyAmountKwh,
    remaining_energy_kwh: energyAmountKwh,
    price_per_kwh: pricePerKwh,
    status: 'active',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    seller: {
      full_name: user.full_name,
      email: user.email,
    },
    house: {
      house_name: house.house_name,
      address_label: house.address_label,
      solar_capacity_kw: house.solar_capacity_kw,
    },
  });

  res.status(201).json({ success: true, data: listing });
});

// =============================================================================
// 5. Trades & Purchases
// =============================================================================

apiRouter.post('/trades', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = executeTradeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    return;
  }

  try {
    const trade = await tradingService.executeTrade({
      buyerId: req.user!.id,
      listingId: parsed.data.listingId,
      energyKwh: parsed.data.energyKwh,
    });

    res.status(201).json({
      success: true,
      message: 'Trade executed and verified on Mock Blockchain',
      data: trade,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: { code: 'TRADE_FAILED', message: err.message || 'Trade execution failed' },
    });
  }
});

apiRouter.get('/trades', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const trades = user.role === 'admin' ? store.getTrades() : store.getTradesForUser(user.id);
  res.json({ success: true, data: trades });
});

// =============================================================================
// 6. Mock Blockchain Ledger
// =============================================================================

apiRouter.get('/blockchain/transactions', async (_req, res) => {
  const txs = await mockBlockchainService.getAllTransactions();
  res.json({ success: true, data: txs });
});

apiRouter.get('/blockchain/transactions/:hash', async (req, res) => {
  const tx = await mockBlockchainService.getTransaction(req.params.hash);
  if (!tx) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Blockchain transaction not found' } });
    return;
  }
  res.json({ success: true, data: tx });
});

// =============================================================================
// 7. Gemini AI Advisory Services (Rules 21-31, 64)
// =============================================================================

apiRouter.post('/ai/forecast', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const house = store.getHouseByOwnerId(user.id);
  if (!house) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'House not found' } });
    return;
  }

  const state = store.getHouseEnergyState(house.id);
  const forecast = await geminiService.getEnergyForecast({
    userId: user.id,
    houseId: house.id,
    currentGeneration: state?.latest_reading.generation_kwh || 0,
    currentConsumption: state?.latest_reading.consumption_kwh || 2,
    solarCapacityKw: house.solar_capacity_kw,
    timeOfDayHour: store.currentHour,
  });

  res.json({ success: true, data: forecast });
});

apiRouter.post('/ai/trade-recommendation', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const house = store.getHouseByOwnerId(user.id);
  if (!house) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'House not found' } });
    return;
  }

  const state = store.getHouseEnergyState(house.id);
  const nState = store.getNeighbourhoodState();

  const recommendation = await geminiService.getTradeRecommendation({
    userId: user.id,
    houseId: house.id,
    surplusKwh: state?.surplus_kwh || 0,
    deficitKwh: state?.deficit_kwh || 0,
    marketAveragePrice: 6.5,
    neighbourhoodDemandLevel: nState.net_deficit_kwh > nState.net_surplus_kwh ? 'High' : 'Moderate',
  });

  res.json({ success: true, data: recommendation });
});

apiRouter.post('/ai/price-recommendation', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const house = store.getHouseByOwnerId(user.id);
  const nState = store.getNeighbourhoodState();

  const recommendation = await geminiService.getPriceRecommendation({
    houseId: house?.id || 'default',
    currentSupplyKwh: nState.net_surplus_kwh,
    currentDemandKwh: nState.net_deficit_kwh,
    avgMarketPrice: 6.5,
    timeOfDayHour: store.currentHour,
  });

  res.json({ success: true, data: recommendation });
});

apiRouter.get('/ai/neighbourhood-insight', async (_req, res) => {
  const nState = store.getNeighbourhoodState();
  const surplusCount = nState.houses.filter((h) => h.status === 'surplus').length;
  const deficitCount = nState.houses.filter((h) => h.status === 'deficit').length;

  const insight = await geminiService.getNeighbourhoodInsight({
    totalGenerationKwh: nState.total_generation_kwh,
    totalConsumptionKwh: nState.total_consumption_kwh,
    surplusHousesCount: surplusCount,
    deficitHousesCount: deficitCount,
    activeListingsCount: nState.active_listings_count,
  });

  res.json({ success: true, data: insight });
});

// =============================================================================
// 8. Administrator Endpoints (Rule 39 & 59)
// =============================================================================

apiRouter.get('/admin/dashboard', authMiddleware, requireRole('admin'), async (_req, res) => {
  const nState = store.getNeighbourhoodState();
  const allProfiles = store.getProfiles();
  const allTrades = store.getTrades();
  const allTxs = await mockBlockchainService.getAllTransactions();

  res.json({
    success: true,
    data: {
      metrics: {
        totalCitizens: allProfiles.filter((p) => p.role === 'citizen').length,
        totalHouses: nState.houses.length,
        totalGenerationKwh: nState.total_generation_kwh,
        totalConsumptionKwh: nState.total_consumption_kwh,
        netSurplusKwh: nState.net_surplus_kwh,
        netDeficitKwh: nState.net_deficit_kwh,
        activeListingsCount: nState.active_listings_count,
        completedTradesCount: allTrades.filter((t) => t.status === 'completed').length,
        totalTradingVolumeInr: nState.total_trading_volume_inr,
      },
      neighbourhoodState: nState,
      recentTrades: allTrades.slice(0, 10),
      blockchainLedger: allTxs.slice(0, 15),
    },
  });
});
