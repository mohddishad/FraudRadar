# 🛡️ FraudRadar — Transaction Fraud-Monitoring Dashboard

FraudRadar is a full-stack financial operations dashboard designed for risk analysts to monitor, evaluate, and investigate simulated transactions in real time.

Instead of relying on opaque black-box AI models, FraudRadar features an **explainable, transparent heuristic rule engine** that evaluates incoming transaction telemetry against banking safety rules, computes a composite risk score (0–100), assigns a risk tier (Low, Medium, High), and provides clear diagnostic reasons for every flag.

---

## 🏗️ Architecture Overview

```mermaid
flowchart LR
    subgraph Browser ["Frontend (React + Vite)"]
        UI["Analyst Dashboard UI<br/>(Tailwind CSS + Recharts)"]
        API_CLIENT["Axios API Client<br/>(api.js)"]
    end

    subgraph NodeServer ["Backend (Node.js + Express)"]
        EXPRESS["Express REST API<br/>(Port 5000)"]
        ENGINE["Transparent Risk Engine<br/>(riskEngine.js)"]
        CONTROLLER["Transaction Controller<br/>(Aggregations & Logic)"]
    end

    subgraph Database ["Database (MongoDB)"]
        MONGO[("MongoDB Database<br/>'fraudradar'")]
    end

    UI --> API_CLIENT
    API_CLIENT -->|HTTP REST: /api/*| EXPRESS
    EXPRESS --> CONTROLLER
    CONTROLLER --> ENGINE
    CONTROLLER <-->|Mongoose ODM| MONGO
```

### How the Frontend, Backend, and Database Connect:
1. **Frontend (React + Vite)** runs on `http://localhost:5173`. When an analyst loads the page, clicks "Seed Demo Data", filters transactions, or creates a transaction, the React components send standard HTTP requests (`GET`, `POST`, `PATCH`) to the Express backend.
2. **Backend (Node.js + Express)** runs on `http://localhost:5000`. It listens for requests, verifies input data, runs our **Transparent Rule Engine** to score the transaction, and executes database queries.
3. **Database (MongoDB)** stores each transaction document permanently (amount, cardholder, risk score, rule-based reasons, and analyst review status). Because data is saved to MongoDB, your **review decisions and notes persist even after you refresh or close the browser tab**.

---

## ⚡ Quick Start (Run in Under 2 Minutes)

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) OR a free **MongoDB Atlas** connection string.

---

### Step 1: Start the Backend Server

Open your terminal in the workspace root and run:

```bash
# 1. Navigate to backend
cd backend

# 2. (Optional if already installed) Install dependencies
npm install

# 3. Start Express server in development mode
npm run dev
```

> **Backend URL**: `http://localhost:5000`  
> **Health Check**: `http://localhost:5000/api/health`

---

### Step 2: Start the Frontend Client

Open a **second terminal window** in the workspace root and run:

```bash
# 1. Navigate to frontend
cd frontend

# 2. (Optional if already installed) Install dependencies
npm install

# 3. Start Vite React development server
npm run dev
```

> **Frontend Dashboard**: Open `http://localhost:5173` in your browser.

---

## 🌐 Connecting to MongoDB Atlas (Cloud)

If you don't have MongoDB installed locally, follow these 4 steps to connect to a free MongoDB Atlas cloud cluster:

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Sandbox cluster** and create a database user (e.g., username `admin`, and create a password).
3. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) for development.
4. Click **Connect** -> **Connect your application (Drivers)**, and copy your connection string:
   ```env
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/fraudradar?retryWrites=true&w=majority
   ```
5. Open `backend/.env` and replace `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://admin:YourPasswordHere@cluster0.mongodb.net/fraudradar?retryWrites=true&w=majority
   ```
6. Restart your backend server (`npm run dev`). Your app will now securely persist all transactions in MongoDB Atlas!

---

## 🛡️ Transparent Heuristic Risk Engine

FraudRadar evaluates transactions using explainable rules:

| Rule Category | Trigger Condition | Points | Reason Displayed to Analyst |
| :--- | :--- | :---: | :--- |
| **High Value** | `amount >= $5,000` | `+35` | "High Value Alert: Amount exceeds $5,000 threshold" |
| **Elevated Charge**| `amount >= $2,000` | `+20` | "Elevated Charge: Amount exceeds $2,000 retail baseline" |
| **Structuring** | `amount >= $500` & even round `$100` | `+10` | "Structuring Pattern: Even round-dollar sum is common in synthetic testing" |
| **High-Risk Industry** | Crypto, Gambling, Wire Transfer, Prepaid | `+25` | "High-Risk Merchant Sector: Category presents high chargeback and liquidity risk" |
| **Moderate-Risk** | Luxury Goods, Jewelry, Electronics | `+15` | "Moderate-Risk Merchant Sector: Category has elevated resale liquidity" |
| **Nocturnal Timing** | Between 01:00 AM and 05:00 AM | `+15` | "Nocturnal Timing: Transaction initiated during off-hours window" |
| **Anonymizer / Proxy**| VPN, Tor exit node, emulator | `+25` | "Network Anonymizer: Request routed through VPN, Tor, or untrusted proxy" |
| **High-Risk Corridor**| Originates from flagged cross-border corridor | `+20` | "High-Risk Corridor: Transaction originated from flagged cross-border location" |
| **Account Velocity** | >= 2 transactions in last 15 minutes | `+30` | "Rapid Velocity Spike: Multiple consecutive transactions within 15 minutes" |

### Composite Risk Tiers:
- **High Risk (70–100)**: Flagged with crimson badge, immediate analyst intervention required.
- **Medium Risk (35–69)**: Flagged with amber badge, secondary inspection advised.
- **Low Risk (0–34)**: Safe consumer baseline parameters.

---

## 📡 REST API Reference

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | Service health status and uptime |
| `GET` | `/api/metrics` | No | Computes live dashboard metrics directly from MongoDB |
| `GET` | `/api/transactions` | No | Query transactions (`search`, `riskLevel`, `status`, `page`, `limit`) |
| `GET` | `/api/transactions/:id` | No | Fetch full details for a single transaction (by ObjectId or reference) |
| `POST` | `/api/transactions` | No | Ingestion/Simulation endpoint; validates & runs risk scoring engine |
| `PATCH` | `/api/transactions/:id/status`| **Yes (Analyst)** | Updates review status (`CONFIRMED_FRAUD`, `DISMISSED`, `PENDING`) |
| `POST` | `/api/seed` | **Yes (Analyst)** | Seeds 18 demo transactions (idempotent, no duplicates) |

> **Analyst Authentication**: Protected endpoints require the `x-analyst-key: <key>` header (configured via `ANALYST_API_KEY` in `backend/.env` and `VITE_ANALYST_KEY` in `frontend/.env`).

---

## 🔒 Security Hardening

- **Analyst Role Authorization**: Status updates and database seeding require valid analyst credentials.
- **Input Validation**: Strict type checks, string bounds, and finite positive numeric validations prevent server crashes.
- **Regex & ReDoS Defense**: Search inputs are sanitized and escaped before pattern compilation.
- **NoSQL Injection Defense**: Query parameters enforce strict allowlists for risk tiers and review statuses.
- **Rate Limiting**: Sliding window rate limits protect against DoS and brute-force flooding.
- **Secure Error Handling**: Mongoose CastErrors and schema internals are caught and masked as clean `400 Bad Request`.
- **Credential Protection**: Environment files (`.env`) are excluded from Git across root, backend, and frontend.

---

## 📁 Project Structure

```
MINI HACKATHON/
├── backend/
│   ├── .env                      # Local server configuration
│   ├── .env.example              # Example environment template
│   ├── package.json
│   └── src/
│       ├── server.js             # Express entry point, CORS, logging & errors
│       ├── config/
│       │   └── db.js             # Mongoose connection & diagnostics
│       ├── models/
│       │   └── Transaction.js    # Mongoose Schema & indexing
│       ├── services/
│       │   └── riskEngine.js     # Transparent heuristic scoring engine
│       ├── controllers/
│       │   └── transactionController.js # Aggregations, CRUD, seed handler
│       ├── routes/
│       │   └── transactionRoutes.js     # REST route definitions
│       └── data/
│           └── seedData.js       # 18 realistic demo transactions
├── frontend/
│   ├── .env                      # Frontend environment (VITE_API_URL)
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js            # Vite + Tailwind CSS v4 setup
│   ├── index.html
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Main state orchestrator & layout
│       ├── index.css             # Theme typography & scrollbars
│       ├── services/
│       │   └── api.js            # Axios client with error handling
│       └── components/
│           ├── Navbar.jsx        # Branding, live status pill & action triggers
│           ├── MetricsBar.jsx    # 5 KPI cards calculated from DB
│           ├── ChartsSection.jsx # Recharts: Sector Volume & Risk Distribution
│           ├── TransactionTable.jsx # Search, risk & status filters, pagination
│           ├── TransactionDetailModal.jsx # Full telemetry & rule diagnostic breakdown
│           ├── NewTransactionModal.jsx    # Simulation form with 4 test presets
│           ├── StatusBadge.jsx   # Status badges (Pending, Fraud, Dismissed)
│           └── RiskBadge.jsx     # Risk tier badges (High, Med, Low)
├── package.json                  # Root runner scripts
└── README.md                     # Documentation
```
