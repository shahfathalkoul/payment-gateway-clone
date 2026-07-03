# 🚀 PayGateway Ecosystem — Production-Grade Payment Gateway & Settlement Monorepo

[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444?style=for-the-badge&logo=turborepo)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis & BullMQ](https://img.shields.io/badge/Queues-Redis%20%2F%20BullMQ-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)

A complete, highly scalable, production-grade fintech ecosystem inspired by industry leaders like **Stripe** and **Razorpay**. Built from the ground up to demonstrate modern microservices architecture, idempotent distributed accounting, background task scheduling, and secure payment processing.

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client[Customer Checkout UI / Browser] -->|HTTPS| PG[Payment Gateway API :3002]
    Merchant[Merchant Dashboard UI :3000] -->|HTTPS| MS[Merchant Service :3001]
    Merchant -->|HTTPS| PG
    Merchant -->|HTTPS| SS[Settlement Service :3004]

    PG -->|Acquire Request| Bank[Bank Simulator :3003]
    PG -->|Webhook Outbox| Redis[(Redis / BullMQ)]
    SS -->|Daily Cron Job| Redis
    
    MS --> DB[(PostgreSQL Database / Prisma)]
    PG --> DB
    SS --> DB
```

---

## 📦 Monorepo Structure

```text
├── apps/
│   └── merchant-dashboard/     # Full-stack Next.js control panel & hosted checkout page (Port 3000)
├── services/
│   ├── merchant-service/       # Express microservice for merchant onboarding & API keys (Port 3001)
│   ├── payment-gateway/        # Core payment routing engine & webhook dispatcher (Port 3002)
│   ├── bank-simulator/         # Mock acquiring bank with failure injection & network delay simulation (Port 3003)
│   └── settlement-service/     # Automated daily ledger accounting & fee breakdown engine (Port 3004)
└── packages/
    ├── database/               # Shared Prisma ORM client & schema definitions
    ├── shared-types/           # Common TypeScript DTOs, interfaces, and enums
    └── shared-utils/           # Distributed logging, context injection, metrics & idempotency utilities
```

---

## ✨ Key Technical Highlights & Design Patterns

### 1. Idempotent Payment Captures
Prevents accidental double-charging or race conditions when processing payments or network retries by enforcing strict idempotency keys stored and verified in PostgreSQL.

### 2. Transactional Outbox Pattern & Webhook Dispatching
Ensures 100% reliable asynchronous event delivery. Payment state mutations (`PAYMENT_CAPTURED`, `PAYMENT_FAILED`) write events atomically to an outbox table, which are processed by **BullMQ** workers to dispatch signed HMAC webhooks (`x-signature`) to merchant endpoints with automatic retry backoff.

### 3. Double-Entry Financial Ledger
Maintains audit-proof accounting records. When automated daily settlements run, the system calculates gross revenue, deducts the **2% Gateway Processing Fee**, computes the **18% GST Tax Breakdown**, and credits the merchant's net settlement account in a single atomic database transaction.

### 4. Chaos & Failure Injection (Bank Simulator)
The dedicated Bank Simulator service mimics real-world banking anomalies. Developers can inject specific failures (`INSUFFICIENT_BALANCE`, `DECLINED_BY_ISSUER`, `NETWORK_TIMEOUT`) to thoroughly verify resilience and UI fallback states.

---

## 💻 Microservices Overview

| Service | Port | Description | Key Tech |
| :--- | :---: | :--- | :--- |
| **Merchant Dashboard** | `3000` | Frontend control center & live checkout simulator | Next.js 16, TailwindCSS, Shadcn UI |
| **Merchant Service** | `3001` | Onboarding, profiles, and API secret management | Express, TypeScript, Zod |
| **Payment Gateway** | `3002` | High-throughput payment routing & webhook outbox | Express, BullMQ, Redis |
| **Bank Simulator** | `3003` | Mock acquiring network with configurable outcomes | Express, Custom Middlewares |
| **Settlement Service** | `3004` | Automated batch payouts & fee deduction schedules | Node-Cron, Prisma Transactions |

---

## 🛠️ Getting Started Locally

### Prerequisites
* **Node.js** v20+ & **npm** v10+
* **PostgreSQL** running locally on default port `5432`
* **Redis** running locally on default port `6379`

### 1. Clone & Install
```bash
git clone https://github.com/shahfathalkoul/payment-gateway-clone.git
cd payment-gateway-clone
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/payment_gateway?schema=public"
REDIS_HOST="localhost"
REDIS_PORT="6379"
PORT="3000"
JWT_SECRET="super-secret-jwt-key"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

### 3. Database Migration
Sync your local database schema with Prisma:
```bash
npm run db:push
```

### 4. Launch the Ecosystem
Start all 5 microservices concurrently using Turborepo:
```bash
npm run dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to view the live dashboard!

---

## 🧪 Testing the Hosted Checkout Flow

1. Open the **Merchant Dashboard** at `http://localhost:3000`.
2. Click on **Hosted Checkout (Demo)** in the sidebar (or visit `http://localhost:3000/checkout`).
3. Select a payment method (**Card**, **UPI**, or **NetBanking**).
4. Use the **Developer Simulation Outcome** dropdown at the bottom of the form to test various bank responses (`SUCCESS`, `DECLINED`, `INSUFFICIENT_BALANCE`).
5. Click **Pay** to watch the simulated transaction process in real time!

---

## 📄 License
This project is open-sourced under the MIT License. Feel free to use it for portfolio showcases, fintech learning, or architectural templates.
