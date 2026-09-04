# ⚡ GridNova — AI-Driven Blockchain P2P Renewable Energy Trading

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **"Simple underneath, intelligent on top, impressive in demonstration."**  
> GridNova is a decentralized peer-to-peer (P2P) renewable electricity trading simulation platform that empowers households within a local neighbourhood to monitor clean solar energy generation, compute deterministic surplus/deficit balances, trade surplus electricity through a marketplace, receive AI-driven market intelligence from Google Gemini, and verify transactions via a simulated blockchain consensus ledger.

---

## 1. Core Product & Technical Overview

GridNova enables the complete decentralized energy lifecycle:
```text
Renewable Generation (Rooftop Solar)
       ↓
IoT Smart Meter Simulation (Generation, Load, Battery)
       ↓
Deterministic Energy Balance (Net Energy = Generation - Consumption)
       ↓
Surplus / Deficit Detection
       ↓
P2P Marketplace (Order Books & Dynamic Pricing)
       ↓
Gemini AI Advisory (Trade & Price Forecasting)
       ↓
Simulated Smart Contract Validation (Ownership, Capacity, Balances)
       ↓
Mock Blockchain Verification (PoS-Sim Ledger, Block Numbers, 0x... Hashes)
       ↓
Instant Multi-Household Settlement & Notification
       ↓
Macro Ecosystem Monitoring (Admin Console)
```

---

## 2. System Architecture

```text
                    ┌──────────────────────────────┐
                    │  Citizen / Administrator UI  │
                    │   React 18 + TS + Tailwind   │
                    └──────────────┬───────────────┘
                                   │ REST / Realtime
                                   ▼
                    ┌──────────────────────────────┐
                    │      Node.js / Express       │
                    │    TypeScript & Zod Guard    │
                    └───────┬──────┬───────┬───────┘
                            │      │       │
              ┌─────────────┘      │       └─────────────┐
              ▼                    ▼                     ▼
    ┌──────────────────┐ ┌───────────────────┐ ┌──────────────────┐
    │  Supabase / DB   │ │   Google Gemini   │ │ Simulation Engine│
    │ PostgreSQL + RLS │ │   AI Intelligence │ │ IoT Smart Meter  │
    │ Seeded Accounts  │ │   Advisory Cache  │ │ Mock Blockchain  │
    └──────────────────┘ └───────────────────┘ └──────────────────┘
```

---

## 3. Technology Stack

- **Frontend**: React.js 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6
- **Backend**: Node.js v20+, Express.js, TypeScript, Zod Schema Validation, CORS
- **Database & Auth**: Supabase PostgreSQL, Row Level Security (RLS) policies, with resilient seeded data store
- **Artificial Intelligence**: Google Gemini API (`gemini-1.5-flash`) with structured JSON outputs, advisory caching, and graceful fallback
- **Blockchain**: Mock Blockchain Service simulating smart contract verification, cryptographic `0x...` hashes, sequential blocks, and confirmation lifecycles
- **IoT Layer**: Smart Meter Simulation (`SimulationEnergySource`) with diurnal solar curves and realistic residential consumption profiles

---

## 4. Quick Start & Setup

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **Git**

### Installation

Clone the repository and install all dependencies:
```bash
git clone <repository-url>
cd GRID-NOVA-IMPL

# Install root, backend, and frontend packages
npm run install:all
```

### Running the Application

Start both the backend server and frontend development server concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 5. Pre-Configured Demo Accounts (1-Click Switching)

Per Rule 20 & 60, GridNova includes 8 realistic residential solar nodes with pre-populated demo accounts for immediate evaluation:

| Account | Email | Role | Solar Capacity | Initial State | Primary Function |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Citizen A (Aarav Sharma)** | `citizena@gridnova.local` | `citizen` | 6.0 kW | **+3.8 kWh Surplus** | High solar generator; sells excess electricity |
| **Citizen B (Bhavna Patel)** | `citizenb@gridnova.local` | `citizen` | 2.5 kW | **-2.1 kWh Deficit** | Energy deficit; purchases clean power from neighbours |
| **Administrator** | `admin@gridnova.local` | `admin` | — | **Supervisor** | Oversees microgrid flows, trade volumes, and blockchain ledger |

*Note: Use the top Simulation Header to switch between demo profiles with a single click without typing passwords.*

---

## 6. Simulation Controls (Rule 40, 60, 61)

The persistent top header bar provides instant demonstration tools:
- **Time of Day Clock**: Displays simulated interval (e.g. `14:00 (Afternoon Peak)`).
- **Next Interval**: Steps the microgrid clock forward by 1 hour, recalculating solar irradiance and consumption across all households.
- **Auto Run**: Automatically steps the simulation every 4 seconds.
- **Reset Neighbourhood**: Instantly restores all 8 houses, balances, listings, and trades to pristine initial seed state.

---

## 7. Environment Configuration

Copy `.env.example` to `.env` in the root folder or configure individual services:
```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# Supabase Credentials (Optional for local demo; required for hosted Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini API Key (Optional for demo; enables live AI queries)
GEMINI_API_KEY=your-gemini-api-key-here

# Frontend Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000/api
```

---

## 8. Database Migrations & Supabase Setup

To apply the schema directly to your Supabase PostgreSQL instance:
1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run `supabase/migrations/20260905_initial_schema.sql` to create the 8 core tables, indexes, and Row Level Security policies.
3. Run `supabase/seed.sql` to populate the initial 8 residential solar houses, listings, and ledger records.

---

## 9. Running Tests

Run automated backend unit and integration tests verifying energy math, smart contract validation, and blockchain hash generation:
```bash
npm test
```

---

## 10. End-to-End Demonstration Walkthrough

1. **Sign In as Citizen A (Prosumer)**:
   - Check the **Dashboard** and **Smart Meter** (`/energy`). Notice the **+3.8 kWh Surplus** and active 6 kW solar array.
   - Inspect the **Gemini AI Trade Advisor** recommending listing surplus electricity.
2. **List Energy for Sale (`/sell`)**:
   - Offer 2.0 kWh at ₹6.50/kWh.
   - Click **Publish Energy Listing**.
3. **Switch to Citizen B (Consumer)**:
   - Click **Citizen B** in the top bar.
   - Notice Citizen B is in **Energy Deficit (-2.1 kWh)**.
   - Navigate to **Marketplace** (`/marketplace`). Find Citizen A's listing.
   - Click **Buy Energy**, input 1.5 kWh, and click **Confirm & Buy**.
   - Watch the simulated **Smart Contract validation** and instant **Mock Blockchain confirmation** with block number and `0x...` transaction hash.
4. **Inspect Ledger (`/transactions`)**:
   - Click the transaction hash to inspect block height, timestamp, and verification status.
5. **Switch to Administrator (`/admin`)**:
   - View neighbourhood aggregate gross generation, active listings, gross trading volume in ₹, and Gemini macro intelligence brief.
6. **View Neighbourhood Map (`/neighbourhood`)**:
   - Inspect the live microgrid visualizer showing active power routing between prosumers and consumers.

---

## 11. Transparency & Simulation Disclaimer (Rule 16 & 87)

> **Notice**: Energy generation, smart meter readings, physical power transfer, and blockchain consensus are simulated digitally to demonstrate the decentralized peer-to-peer trading workflow without requiring physical IoT sensors or live mainnet gas fees.

---

## 12. License
MIT License. Developed for GridNova P2P Renewable Energy Platform Demonstration.
