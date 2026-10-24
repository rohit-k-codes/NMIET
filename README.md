# ⚡ WattWise AI — Autonomous Campus Energy Optimization Agent

APP LIVE LINK : nmiet.vercel.app

> **National Hackathon Project**  
> *Tagline: Detect Waste. Decide Smartly. Save Energy.*

WattWise AI is an autonomous energy intelligence agent designed for university campus facility operations. It ingests hourly electricity telemetry, performs deterministic anomaly detection against empirical baselines, and executes a bounded agentic function-calling cycle with Google GenAI (`gemini-3.8-flash`) to formulate human-in-the-loop remediation action plans.

---

## 🏛️ Project Overview & Architecture

```
                                  [ User Browser ]
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        │                                                                 │
   [ CSV Ingestion ]                                              [ Client Analytics ]
 - Header & schema validation                                   - Mean, median, std dev
 - Negative / non-finite checks                                 - Nighttime / weekend baselines
 - CSV formula injection defense                                - Deterministic anomaly engine
        │                                                                 │
        └────────────────────────────────┬────────────────────────────────┘
                                         │ (Transmits ONLY statistical aggregates)
                                         ▼
                             [ Node.js / Express Backend ]
                           - Helmet security headers
                           - CORS restricted to FRONTEND_ORIGIN
                           - Express rate-limiting (30 req/15m)
                           - 1MB body limit & safe error handler
                                         │
                                         ▼
                       [ Bounded Agentic Function Calling ]
                       - Model: Gemini 3.8 Flash (@google/genai)
                       - Max 4 turns, 15-second timeout boundary
                                         │
         ┌───────────────────────────────┴───────────────────────────────┐
         │                               │                               │
         ▼                               ▼                               ▼
 [ inspect_energy_data ]     [ calculate_savings_scenario ]   [ draft_maintenance_task ]
 Query zone baselines &      Deterministic formulas with      Generate reviewable task cards
 verified empirical waste    user-configured tariff           in session memory (no side effects)
         │                               │                               │
         └───────────────────────────────┬───────────────────────────────┘
                                         ▼
                        [ Action Center & Audit Timeline ]
                        - Human review: Approve / Dismiss
                        - Session-only memory (Zero Database)
                        - Exportable JSON audit & CSV reports
```

---

## 🌟 Key Capabilities & Features

### 1. Overview Dashboard
- **Total Measured Consumption**: Aggregates verified kilowatt-hours (kWh) across facilities.
- **Analyzed Scope**: Counts of valid readings, university zones, and temporal duration.
- **Anomaly Counter**: Identifies quantifiable excess waste over normal baselines.
- **Configurable Scenario Savings**: Real-time energy (kWh) and cost ($) savings based on user tariff.
- **System Metrics**: Real-time client calculation duration (ms) and backend AI latency (ms).

### 2. High-Assurance Data Import
- **Browser-Side Processing**: Raw telemetry is parsed entirely within client memory.
- **Strict Validation**: Flags malformed ISO timestamps, missing columns, non-numeric or negative values, duplicates, and empty files.
- **Zero Raw Data Transmission**: Sends only validated statistical summaries to the server.
- **Untrusted Input Protection**: Input strings are sanitized to prevent prompt injection and formula injection.
- **One-Click Demo Dataset**: Instant loading of an 840-reading, 7-day realistic campus dataset across 5 buildings.

### 3. Real Deterministic Analytics Engine
- **Unoccupied Nighttime Basal Waste (`off_hours_waste`)**: Flags consumption exceeding 45% of daytime mean during 22:00–06:00 when headcount is zero or low.
- **Statistical Peak Surge (`statistical_spike`)**: Flags outliers exceeding Zone Mean + 2.5× Standard Deviation ($\mu + 2.5\sigma$).
- **Weekend Ghost Load (`weekend_ghost_load`)**: Identifies sustained draw on Saturdays and Sundays despite building closures.
- **Empirical Evidence**: Every finding cites its observed value, threshold, and deviation percentage.

### 4. Genuine Agentic Function Calling
- **Official Google GenAI SDK**: Implemented using `@google/genai` with model `gemini-3.8-flash`.
- **Allowlisted Application Tools**:
  - `inspect_energy_data`: Retrieves empirical metrics and anomaly findings for specific zones.
  - `calculate_savings_scenario`: Deterministically calculates potential savings with configured tariffs.
  - `draft_maintenance_task`: Proposes structured maintenance task cards for human operators.
- **Safety Boundaries**: Maximum 4 tool call turns, 15-second timeout, rejection of unknown tools or hallucinated zones.
- **Deterministic Fallback**: If Gemini API is offline, key is unconfigured, or times out, the backend immediately activates a verified deterministic optimization report.

### 5. Human-in-the-Loop Action Center
- **Reviewable Task Cards**: Shows title, zone, urgency, category, estimated savings, effort, confidence, and action steps.
- **Session Memory Only**: Approvals and dismissals are stored in volatile session memory.
- **No Unintended Side Effects**: Clearly labeled; does not dispatch unverified external physical commands to campus equipment.

### 6. Explainable Savings Calculator
- **Deterministic Math**: $\text{Savings (\$) } = \text{Eligible Waste (kWh)} \times \text{Reduction \%} \times \text{Tariff (\$/kWh)}$.
- **Annualized Projections**: Scaled transparently to 365 days based on sample duration.
- **EPA Grid Emission Factor**: Transparently estimates avoided metric tons of $\text{CO}_2\text{e}$ using regional grid intensity ($0.385\text{ kg/kWh}$).

### 7. Performance & Diagnostics Area
- Real-time measurements of processed rows, client computation time, AI latency, tool calls, and error counts.
- Live session audit timeline recording data imports, tool executions, task approvals, and exports.
- Secure export of JSON reports and CSV files with CSV formula injection mitigation.

---

## 🔒 Security Architecture

| Security Requirement | Implementation |
|---|---|
| **Zero Database Footprint** | No Supabase, Firebase, Postgres, or MongoDB. All state resides in volatile memory. |
| **Secret Isolation** | `GEMINI_API_KEY` exists exclusively in the backend `.env`. Never exposed in frontend bundles or responses. |
| **Security Headers** | Express `helmet` enforces Content Security Policy (CSP), frame-guard, and X-Content-Type-Options. |
| **CORS Policy** | Restricted strictly to the configured `FRONTEND_ORIGIN` (`http://localhost:5173`). |
| **Payload Rate Limiting** | AI endpoint limited to 30 requests per 15 minutes via `express-rate-limit`. Body size capped at 1MB. |
| **Tool Execution Sandbox** | Tools are strictly allowlisted; unknown function names and parameters outside Zod schemas are rejected. |
| **CSV Formula Injection Defense** | Cells starting with `=`, `+`, `-`, `@`, `\t`, `\r` are safely prefixed with a single quote (`'`). |
| **Prompt Injection Protection** | Zone and text inputs are sanitized and escaped before inclusion in model prompts. |

---

## 🛠️ Google Technology Used & Rationale

- **Google GenAI JavaScript SDK (`@google/genai`)**: The official, unified SDK for Gemini models.
- **Model: `gemini-3.8-flash`**:
  - High-speed reasoning with 1M token context.
  - Native function calling support for multi-turn tool loops.
  - Rapid response latency (~200–500ms) essential for responsive interactive dashboard workflows.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+` or `v11+`

### Installation

1. Clone or open the repository workspace:
   ```bash
   cd NMIET
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API Key in `.env`:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_MODEL=gemini-3.8-flash
   PORT=3001
   FRONTEND_ORIGIN=http://localhost:5173
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the full stack (Vite frontend on `5173` and Express backend on `3001` concurrently):
```bash
npm run dev
```

Open your browser to:
[http://localhost:5173](http://localhost:5173)

---

## 🧪 Automated Testing & Production Build

### Running the Test Suite
```bash
npm test
```

### Test Coverage Summary (33 / 33 Passing)
- **CSV Parser Suite** (`src/test/csvParser.test.ts`): 8 tests
  - Valid CSV parsing, missing column rejection, malformed timestamp handling, negative kWh validation, duplicate deduplication, and formula injection sanitization.
- **Analytics Engine Suite** (`src/test/analytics.test.ts`): 5 tests
  - Accurate statistical aggregations, time-of-day boundary logic, off-hours waste detection, statistical spike ($2.5\sigma$) detection, and demo dataset verification.
- **Savings Calculator Suite** (`src/test/savingsCalculator.test.ts`): 4 tests
  - Deterministic formula accuracy, input boundary clamping, non-positive tariff flooring, and facility scoping.
- **Security & Tool Sandbox Suite** (`src/test/securityAndTools.test.ts`): 7 tests
  - Rejection of unauthorized tools (`execute_bash_command`, `send_sms_to_facilities`), allowlisted tool execution, rejection of hallucinated zones in `draft_maintenance_task`, and fallback plan synthesis.
- **Backend API Suite** (`src/test/apiRoutes.test.ts`): 5 tests
  - `/api/health`, `/api/demo-data`, `/api/csv-template`, 400 validation error on malformed input, and multi-turn tool loop simulation with mocked Gemini.
- **Frontend Integration Suite** (`src/test/frontend.test.tsx`): 4 tests
  - Header rendering, navigation tab switching, Action Center governance notice, and theme toggling.

### Production Build
```bash
npm run build
```
Generates verified, minified static assets in `dist/`.

---

## 📋 Demonstration Steps for Hackathon Evaluators

1. **One-Click Evaluation**:
   - Open [http://localhost:5173](http://localhost:5173). The 7-day, 5-zone university campus demo dataset (840 readings) loads automatically.
2. **Review Overview Dashboard**:
   - Inspect total measured energy (kWh), detected anomalies, and scenario savings.
   - Observe multi-zone consumption area chart and facility comparison bar chart.
3. **Inspect Anomaly Findings**:
   - Click **Analytics & Findings** in the sidebar.
   - Filter by **Off-Hours Nighttime Waste** to observe the Library HVAC left on manual override at 02:00 AM ($42.5\text{ kWh}$ vs $18.2\text{ kWh}$ baseline).
   - Review the empirical evidence cards citing observed kWh, thresholds, and headcount.
4. **Run Autonomous Agent**:
   - Click **AI Agent Workflow** in the sidebar.
   - Select the mission objective (e.g. *Deep Off-Hours Waste Elimination*) and adjust the electricity tariff slider.
   - Click **Execute Autonomous Agent**.
   - Watch the **Agent Execution Activity Timeline** log the multi-turn tool loop (`inspect_energy_data` $\rightarrow$ `calculate_savings_scenario` $\rightarrow$ `draft_maintenance_task`).
5. **Human-in-the-Loop Action Center**:
   - Click **Action Center** in the sidebar.
   - Review proposed maintenance tasks (e.g. *Nighttime HVAC Setback & Lighting Audit*).
   - Click **Approve Action** or **Dismiss Action**, and enter operator review notes.
   - Observe approved energy savings tally updated dynamically in session memory.
6. **Scenario Modeling**:
   - Click **Savings Calculator** in the sidebar.
   - Drag the target reduction slider to see deterministic math update live without speculative assumptions.
7. **System Diagnostics & Export**:
   - Click **Diagnostics & Audit** to view processed row counts, client calculation time, backend latency, and the immutable session audit timeline.
   - Click **Export Full JSON Audit** or use the header dropdown to export findings and action plans to CSV.

---

## ⚠️ Known Limitations & Scope Boundaries
- **No Physical Equipment Control**: Designed for operational intelligence and human governance. Does not directly actuate building BACnet or Modbus hardware.
- **Session Memory**: In accordance with the zero-database specification, refreshing the page resets in-memory approvals. Users can download complete JSON/CSV reports before ending the session.
- **Submeter Granularity**: Telemetry is evaluated at the facility/zone level. Fine-grained sub-circuit load disaggregation requires separate physical submetering.
