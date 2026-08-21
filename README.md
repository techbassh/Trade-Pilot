# TradePilot 🧭
> **See. Decide. Trade.**

TradePilot is a production-quality, personal trading terminal built for a single **Zerodha / Kite Connect v3** account. It is engineered with Next.js App Router, TypeScript, Tailwind CSS, TradingView Lightweight Charts, and real-time Server-Sent Events (SSE) bridging Kite's WebSocket feed.

---

## ⚡ Key Features

- **Dark Fintech Aesthetic**: Sleek, high-density, professional UI with green/red P&L indicators, smooth charts, and responsive layouts.
- **Zero Client Credential Leakage**: Neither `KITE_API_SECRET` nor `access_token` are ever exposed to browser JavaScript or client bundles. All Kite operations execute strictly server-side.
- **Encrypted Session Management**: Tamper-proof, encrypted HTTP-only session cookies powered by `iron-session`.
- **TradingView Lightweight Charts**: Interactive Candlestick and Volume charts with timeframe controls (`1D`, `1W`, `1M`, `1Y`) and real-time LTP ticker updates.
- **Order Execution with Explicit Confirmation**: Place regular `MARKET` and `LIMIT` orders (`CNC` Delivery and `MIS` Intraday) with a dedicated modal confirmation safeguard before submission.
- **Real-Time Market Data & Order Updates**: Server-side WebSocket connection manager that parses binary Kite Ticker packets and streams normalized events via Server-Sent Events (SSE).
- **Portfolio & Margin Cockpit**: Live tracking of Holdings, Day & Net Positions, Used Margins, Available Cash, and Collateral.
- **Order Book & Cancellation**: Today's order list with execution status badges and one-click cancellation with confirmation.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (Strict type checking)
- **Styling**: Tailwind CSS (Custom fintech dark theme palette)
- **Icons**: `lucide-react`
- **Charts**: TradingView `lightweight-charts`
- **Validation**: `zod` (Server-side request validation)
- **Session Security**: `iron-session` (AES-256 encrypted cookies)
- **Live Feed**: Native `ws` (Server-side Kite Ticker) + Server-Sent Events (SSE to Browser)

---

## 📋 Prerequisites

1. **Node.js**: Version `18.17.0` or later (tested on Node v20+ / v24+).
2. **Zerodha Trading Account**: An active Zerodha account.
3. **Kite Connect Developer App**: A registered app on the [Zerodha Developer Console](https://kite.trade/).

---

## ⚙️ Setting Up Kite Connect App

1. Log in to [Kite Connect Developer Console](https://kite.trade/).
2. Create a new App (or use an existing one):
   - **App Name**: `TradePilot`
   - **Redirect URL**: `http://localhost:3000/api/kite/callback` (or your production domain callback)
   - **Postback URL**: Optional for single-user (leave empty or set to `http://localhost:3000/api/kite/postback`)
3. Note down your **API Key** and **API Secret**.

---

## 🔐 Environment Configuration

Create a `.env.local` file in the root of the project (refer to `.env.example`):

```bash
cp .env.example .env.local
```

Populate the required variables:

```env
# Zerodha Kite Connect API Credentials
KITE_API_KEY=your_kite_api_key_here
KITE_API_SECRET=your_kite_api_secret_here

# Redirect callback URL (must match exactly what is in Kite Developer Console)
KITE_REDIRECT_URL=http://localhost:3000/api/kite/callback

# Public URL of TradePilot
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 32+ character passphrase for encrypting session cookies
# Generate one via: openssl rand -base64 32
SESSION_SECRET=a_very_secure_and_long_random_session_secret_passphrase_for_tradepilot_32bytes
```

> [!WARNING]
> **Never prefix `KITE_API_SECRET` or `SESSION_SECRET` with `NEXT_PUBLIC_`.** Server-side secrets must never be exposed to the client.

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open TradePilot**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🔄 How Authentication Works

TradePilot implements the official **Kite Connect v3** authentication flow:

```
[Browser]                          [TradePilot Server]                     [Zerodha Kite]
    |                                       |                                    |
    |---- 1. Clicks "Login with Zerodha" -->|                                    |
    |                                       |---- 2. Redirects to Kite Login --->|
    |<--- 3. Redirected to Zerodha UI ------|                                    |
    |                                       |                                    |
    |================ User enters Zerodha credentials / 2FA =====================|
    |                                       |                                    |
    |---- 4. Zerodha redirects with ?request_token=... ------------------------->|
    |                                       |                                    |
    |                                       |-- 5. Calculates SHA256 Checksum:   |
    |                                       |      SHA256(key + token + secret)  |
    |                                       |                                    |
    |                                       |-- 6. POST /session/token --------->|
    |                                       |<-- 7. Receives access_token -------|
    |                                       |                                    |
    |                                       |-- 8. Encrypts session cookie       |
    |<--- 9. Redirects to /dashboard -------|                                    |
```

- When the session expires (daily at 06:00 AM IST per Zerodha policy), the server returns `401 KITE_AUTH_EXPIRED` and seamlessly prompts re-authentication.

---

## 📡 Live Market Data & WebSocket Architecture

TradePilot uses a **Single Server-Side Connection Manager (`StreamHub`)**:
- Connects directly to `wss://ws.kite.trade?api_key=...&access_token=...`.
- Efficiently parses incoming binary Kite ticker packets for **LTP**, **Quote**, and **Full Depth** modes.
- Distributes normalized events (`LiveQuoteEvent`, `LiveOrderEvent`) to connected browser instances using **Server-Sent Events (SSE)** via `GET /api/kite/stream`.
- Eliminates client-side credential exposure and keeps WebSocket connections centralized.

---

## 🛡️ Security Best Practices

1. **Explicit Order Confirmation**: Every order requires affirmative confirmation via modal dialog showing Side, Symbol, Quantity, Order Type, Product, and Estimated Value.
2. **Server-Side Rate Limiter**: Order endpoints are protected by an in-memory rate limiter to avoid bursting or accidental order duplication.
3. **Input Sanitization with Zod**: Every API route validates input parameters strictly (e.g. quantity must be a positive integer, order types restricted to supported options).
4. **Opaque Sessions**: The client receives only an opaque, encrypted cookie with `httpOnly: true`, `sameSite: 'lax'`, and `secure: true` in production.

---

## 🌐 Production Deployment & Static IP Requirement

> [!IMPORTANT]
> **Static Public IP Requirement for Order Placement**:
> In accordance with Zerodha Kite Connect policies, live order placement requests (`POST /api/kite/orders`) originating from production servers require registering the server's **static public IP** in the Zerodha Developer Console under your Kite app settings.
> 
> Ensure your hosting environment (AWS EC2 Elastic IP, GCP Static IP, DigitalOcean Droplet, etc.) is configured with a fixed egress IP and added to your Kite App configuration.

### Building for Production:

```bash
npm run build
npm start
```

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| **`TOKEN_EXCHANGE_FAILED` / Invalid Checksum** | `KITE_API_KEY` or `KITE_API_SECRET` mismatch, or request token expired. | Verify credentials in `.env.local` and ensure system clock is synchronized. |
| **`HISTORICAL_DATA_UNAVAILABLE` on Chart** | Your Kite Connect app does not have the Historical Data add-on subscription. | Kite historical candles require an optional add-on in the Zerodha Developer Console. Live prices and order execution remain fully functional. |
| **Order placement rejected (403)** | Static IP not whitelisted or trading market closed. | Check if the host public IP is configured in Zerodha App settings. |
| **`KITE_AUTH_EXPIRED`** | Daily token reset by Zerodha (at 6:00 AM IST) or invalid session. | Click "Login with Zerodha" to obtain a fresh session token for the trading day. |

---

## 📄 License
MIT © TradePilot. Built for personal trading terminal cockpit use.
