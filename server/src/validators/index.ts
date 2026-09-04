// =============================================================================
// GridNova Zod Validation Schemas
// Conforms to Rule 46 and TRD Section 43
// =============================================================================

import { z } from 'zod';

export const createListingSchema = z.object({
  energyAmountKwh: z.number().positive('Energy amount must be greater than 0 kWh'),
  pricePerKwh: z.number().positive('Price must be greater than ₹0/kWh'),
});

export const executeTradeSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  energyKwh: z.number().positive('Energy amount must be greater than 0 kWh'),
});

export const setTimeSchema = z.object({
  hour: z.number().min(0).max(23),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
});
