# Studio AlWaleed — Full Stack Platform

A full-stack photography studio platform with an AI-powered CRM, Moyasar payment integration, and automated customer lifecycle management. Built with React (frontend), Node.js/Express (backend), Supabase (two separate projects), and n8n for workflow automation.

---

## Architecture Overview

```
                    ┌─────────────────────────────────┐
                    │         alwaleed.pro             │
                    │   React Frontend + Express API   │
                    │        (Docker via Traefik)      │
                    └────────────┬────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
     ┌────────▼───────┐ ┌────────▼───────┐ ┌───────▼────────┐
     │  alwaleed-app  │ │   CRM Project  │ │    Moyasar     │
     │  Supabase DB   │ │  Supabase DB   │ │ Payment Gateway│
     │ (orders/photos)│ │(customers/CRM) │ │   (invoices)   │
     └────────────────┘ └────────────────┘ └────────────────┘
              │
     ┌────────▼───────┐
     │  n8n.alwaleed  │
     │  .pro (n8n)    │
     │ Telegram bot + │
     │ AI Sales Agent │
     └────────────────┘
```

---

## Environment Variables

All variables live in `/root/alwaleed-project/.env` on the VPS. The following must be set:

### Application
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://alwaleed.pro
BACKEND_URL=https://alwaleed.pro
```

### Supabase — Website/App Project (sfraqqkmzzdtcynyyebj)
Handles orders, cart, photos, print orders.
```env
SUPABASE_URL=https://sfraqqkmzzdtcynyyebj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_URL=https://sfraqqkmzzdtcynyyebj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Supabase — CRM Project (bgyffyrwnyhwtwcjwqug)
Handles customers, lifecycle stages, conversations, knowledge base.
```env
CRM_SUPABASE_URL=https://bgyffyrwnyhwtwcjwqug.supabase.co
CRM_SUPABASE_SERVICE_ROLE_KEY=your_crm_service_role_key_here
```

### Payment — Moyasar
```env
MOYASAR_SECRET_KEY=sk_live_your_key_here
PAYMENT_PROVIDER=moyasar
```

### Other Services
```env
CLOUD_PRINTER_KEY=your_cloudprinter_api_key
VITE_API_URL=https://alwaleed.pro
```

### Infrastructure (docker-compose / Traefik)
```env
DOMAIN_NAME=alwaleed.pro
SUBDOMAIN=n8n
SSL_EMAIL=your_ssl_email_here
COMPOSE_PROJECT_NAME=alwaleed-backend
GENERIC_TIMEZONE=Asia/Riyadh
```

> ⚠️ Never commit `.env` to version control. All secrets are injected at runtime via Docker Compose.

---

## Infrastructure

- **Server**: Ubuntu 24.04 VPS (Hostinger), IP `148.230.107.19`
- **Reverse proxy**: Traefik (handles SSL via Let's Encrypt, routes `alwaleed.pro` → app, `n8n.alwaleed.pro` → n8n)
- **Deployment**: Docker Compose (`/root/alwaleed-project/docker-compose.yml`)
- **Project name**: Always pinned to `alwaleed-backend` via `COMPOSE_PROJECT_NAME` to prevent Docker network mismatches on rebuild

### Docker Services
| Service | Container | Port |
|---|---|---|
| App (frontend + backend) | `alwaleed-app` | 3000 (internal) |
| n8n | `alwaleed-backend-n8n-1` | 5678 (internal) |
| Traefik | `alwaleed-backend-traefik-1` | 80, 443 (public) |

### Deploy / Rebuild
```bash
cd /root/alwaleed-project
docker compose up -d --build alwaleed-app   # rebuild app only
docker compose up -d --build                # rebuild everything
```

> ⚠️ Always run `docker compose` from `/root/alwaleed-project`, never from `/root` or any other directory, to avoid project-name mismatches.

---

## Payment System

### Provider-Independent Architecture
Payment logic is split into two layers:

- `server/lib/payment-providers/index.js` — selects the active provider based on `PAYMENT_PROVIDER` env var
- `server/lib/payment-providers/moyasar.js` — Moyasar-specific implementation

To add a new payment gateway in future: create `server/lib/payment-providers/<name>.js` implementing `createPayment()`, `getPaymentStatus()`, and `getPaymentIdFromWebhookBody()`, then add it to `index.js`.

### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/moyasar/create-payment` | Create Moyasar invoice, return checkout URL |
| POST | `/api/moyasar/webhook` | Receive Moyasar payment status callback |
| GET | `/api/moyasar/order-status/:orderNumber` | Poll order status (used by frontend after redirect) |

### Payment Flow
1. Customer fills booking form → `BookingDialog.jsx` fires n8n webhook (CRM lead created)
2. Customer clicks Pay → `PaymentOptions.jsx` calls `/api/moyasar/create-payment`
3. Customer redirected to Moyasar hosted checkout
4. On payment: Moyasar calls `/api/moyasar/webhook` (server-to-server, verified by re-fetching from Moyasar API)
5. Webhook updates order status, clears cart, submits CloudPrinter jobs, marks photos paid
6. Frontend polls `/api/moyasar/order-status/:orderNumber` every 2.5s for up to 100s then shows result

> Note: Moyasar's invoice callback only fires on successful payment (`paid`). Expired invoices do not trigger a callback — the frontend handles this gracefully via the polling timeout.

---

## CRM & Lifecycle Stages

### Two Supabase Projects
- **App project** (`sfraqqkmzzdtcynyyebj`): `orders`, `cart_items`, `photos`, `print_orders`
- **CRM project** (`bgyffyrwnyhwtwcjwqug`): `customers`, `conversations`, `knowledge_base`, `manual_quote_requests`, pricing tables

### Website Customer Lifecycle
Website leads advance through CRM stages automatically:

| Event | Stage |
|---|---|
| Booking form submitted | `contacted` + `qualified` (simultaneously) |
| Payment link generated | `payment_pending` |
| Payment confirmed (webhook) | `paid` + `booked` (simultaneously) |

Stages only move forward (never backward). Each stage stamps a `{stage}_at` timestamp in the `customers` table.

### Telegram Customer Lifecycle
Managed by the `Telegram Sales Agent` n8n workflow. All 9 stages apply (contacted → qualified → quotation_sent → payment_pending → paid → booked → completed → returning_customer).

---

## n8n Workflows

Hosted at `n8n.alwaleed.pro`. Three main workflows:

| Workflow | Trigger | Purpose |
|---|---|---|
| `Telegram Sales Agent` | Telegram messages | AI agent, CRM stage management, pricing |
| `Website Booking Webhook` | `POST /webhook/alwaleed-booking-orders` | Creates CRM lead from website form |
| `Moyasar Payment Webhook` | `POST /webhook/moyasar-callback` | Handles Telegram-side payment confirmation |

### n8n Supabase Credential
All Supabase HTTP Request nodes use a **Custom Auth** credential (`Supabase CRM Service Role`) that sends both required headers:
```json
{
  "headers": {
    "apikey": "<service_role_key>",
    "Authorization": "Bearer <service_role_key>"
  }
}
```
> ⚠️ n8n's built-in "Header Auth" type only sends one header. Using it alone with Supabase RLS enabled will silently fail on writes. Always use Custom Auth for Supabase nodes.

---

## Security

### RLS Status
- **App project**: All tables have RLS enabled with user-scoped policies (`auth.jwt() ->> 'email' = user_email`)
- **CRM project**: All 26 tables have RLS enabled. n8n uses `service_role` key which bypasses RLS by design

### Key Management
- n8n credentials: stored in n8n's encrypted credential vault
- Backend secrets: stored in `/root/alwaleed-project/.env`, injected via Docker Compose environment block
- Never hardcode secrets in node parameters — use credentials or env vars only

---

## Google Sheets Integration

The `Studio AlWaleed Database` Google Sheet (ID: `<sheet_id>`) syncs customer stage changes from n8n.

### Important: OAuth Token Expiry
The Google Sheets OAuth token expires every 7 days if the Google Cloud OAuth consent screen is in **Testing** mode. To fix permanently:
1. Go to [Google Cloud Console](https://console.cloud.google.com) → the project used for n8n's Google Sheets OAuth
2. OAuth consent screen → change from **Testing** to **Production/Published**
3. Reconnect the `Google Sheets account 3` credential in n8n once after this change
4. Tokens will auto-refresh indefinitely going forward

---

## Project Structure (current)

```
alwaleed-project/
├── server/
│   ├── app.js                          # Express app, route registration
│   ├── lib/
│   │   ├── supabase.js                 # App Supabase client (sfraqqkmzzdtcynyyebj)
│   │   ├── crm-supabase.js             # CRM Supabase client (bgyffyrwnyhwtwcjwqug)
│   │   ├── crm-stage.js                # Forward-only CRM stage advancement logic
│   │   └── payment-providers/
│   │       ├── index.js                # Provider selector (reads PAYMENT_PROVIDER env var)
│   │       └── moyasar.js              # Moyasar-specific implementation
│   └── routes/
│       ├── moyasar.js                  # Payment routes (create, webhook, status)
│       ├── photos.js
│       ├── cart.js
│       ├── orders.js
│       ├── cloudprinter.js
│       └── upload.js
├── src/                                # React frontend
│   ├── components/
│   │   ├── PaymentOptions.jsx          # Payment method selection + Moyasar redirect
│   │   ├── BookingDialog.jsx           # Booking form (fires n8n webhook on submit)
│   │   └── ...
│   ├── pages/
│   │   ├── PaymentStatus.jsx           # Polls order-status after payment redirect
│   │   └── ...
├── docker-compose.yml                  # Production deployment config
├── Dockerfile                          # Multi-stage build (frontend + backend)
└── .env                                # Secrets (not committed)
```

---

## Milestone History

| Milestone | Summary |
|---|---|
| M1 | Initial setup, Docker deployment, Traefik SSL |
| M2 | Telegram AI sales agent, n8n CRM workflows |
| M3 | Supabase schema, pricing engine, knowledge base |
| M4 | Moyasar migration (replacing Paylink), website CRM automation, RLS security hardening, provider-independent payment layer |
| M5 | Admin Telegram notifications, customer email notifications (Resend), payment retry, order lifecycle automation, error monitoring |
