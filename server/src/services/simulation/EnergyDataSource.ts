// =============================================================================
// GridNova Energy Simulation Engine
// Conforms to Rules 13, 14, 15, 17, 18, 19 and TRD Sections 8, 9, 11
// =============================================================================

import { EnergyReading, House } from '../../types/index.js';

export interface EnergyDataSource {
  getReading(house: House, timeOfDayHour: number, weatherFactor?: number): Promise<EnergyReading>;
}

export class SimulationEnergySource implements EnergyDataSource {
  /**
   * Deterministic time-of-day solar factor (0.0 to 1.0)
   * Hour 0-5: 0.0 (Night)
   * Hour 6-7: 0.1 - 0.3 (Dawn)
   * Hour 8-11: 0.4 - 0.85 (Morning ramp)
   * Hour 12-14: 0.95 - 1.0 (Peak Solar Noon)
   * Hour 15-17: 0.75 - 0.3 (Late Afternoon descent)
   * Hour 18-19: 0.15 - 0.02 (Dusk)
   * Hour 20-23: 0.0 (Night)
   */
  public getSolarIrradianceFactor(hour: number): number {
    if (hour < 6 || hour > 19) return 0.0;
    // Bell-shaped curve centered at 13:00 (1:00 PM)
    const normalized = (hour - 6) / 13; // 0 to 1 between 6am and 7pm
    const curve = Math.sin(normalized * Math.PI);
    return Math.max(0, Math.min(1, Math.pow(curve, 1.3)));
  }

  /**
   * Realistic household consumption profile based on time of day
   * Morning rush (7-9am): 2.5 - 4.5 kWh
   * Day (10am-5pm): 1.0 - 2.5 kWh
   * Evening peak (6-10pm): 3.0 - 5.0 kWh
   * Night (11pm-6am): 0.5 - 1.2 kWh (base loads like fridge, standby)
   */
  public getHouseholdBaseConsumption(hour: number): number {
    if (hour >= 7 && hour <= 9) {
      return 2.5 + Math.random() * 1.5; // morning peak
    } else if (hour >= 18 && hour <= 22) {
      return 3.0 + Math.random() * 2.0; // evening peak
    } else if (hour >= 10 && hour <= 17) {
      return 1.2 + Math.random() * 1.3; // daytime
    } else {
      return 0.6 + Math.random() * 0.6; // night baseload
    }
  }

  public async getReading(
    house: House,
    timeOfDayHour: number,
    weatherFactor: number = 0.95 // 1.0 = clear sky, 0.5 = overcast
  ): Promise<EnergyReading> {
    const solarFactor = this.getSolarIrradianceFactor(timeOfDayHour);
    
    // Solar generation: capacity_kw * solarFactor * weatherFactor + slight natural variance
    const variance = 0.92 + Math.random() * 0.16; // +/- 8%
    const rawGen = house.solar_capacity_kw * solarFactor * weatherFactor * variance;
    const generation_kwh = Math.round(Math.max(0, rawGen) * 100) / 100;

    // Household consumption: scaled slightly by house size
    const consumption_kwh = Math.round(this.getHouseholdBaseConsumption(timeOfDayHour) * 100) / 100;

    // Rule 13 & 14: Net Energy = Generation - Consumption (Deterministic application code)
    const net_energy_kwh = Math.round((generation_kwh - consumption_kwh) * 100) / 100;

    // Battery simulation logic
    let battery_charge_kwh = 0;
    let battery_discharge_kwh = 0;

    if (net_energy_kwh > 0 && house.battery_level_kwh < house.battery_capacity_kwh) {
      // Store some surplus in battery (e.g. 30% of surplus up to available capacity)
      const space = house.battery_capacity_kwh - house.battery_level_kwh;
      battery_charge_kwh = Math.round(Math.min(space, net_energy_kwh * 0.3) * 100) / 100;
    } else if (net_energy_kwh < 0 && house.battery_level_kwh > 0) {
      // Discharge battery to cover part of deficit
      battery_discharge_kwh = Math.round(Math.min(house.battery_level_kwh, Math.abs(net_energy_kwh) * 0.4) * 100) / 100;
    }

    return {
      id: crypto.randomUUID(),
      house_id: house.id,
      generation_kwh,
      consumption_kwh,
      battery_charge_kwh,
      battery_discharge_kwh,
      net_energy_kwh,
      recorded_at: new Date().toISOString(),
      source: 'simulation',
    };
  }
}

export const simulationEnergySource = new SimulationEnergySource();
