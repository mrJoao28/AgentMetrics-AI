<div align="center">

# ◈ AgentMetrics AI

### Evaluate AI agents with evidence, not intuition.

**An open-source evaluation toolkit for reproducible AI-agent benchmarks.**  
Run labeled datasets, measure exact-match accuracy, latency and cost, and explore the results in a modern web dashboard.

[![MIT License](https://img.shields.io/badge/license-MIT-765CF6?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](pyproject.toml)
[![Next.js](https://img.shields.io/badge/Next.js-15-111111?style=for-the-badge&logo=nextdotjs)](apps/web/package.json)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?style=for-the-badge&logo=fastapi&logoColor=white)](src/agentmetrics/api.py)

**[Explore live dashboard](https://web-mrjoao28s-projects.vercel.app)** · **[API health](https://agentmetrics-api.onrender.com/health)** · **[Getting started](#-quick-start)** · **[Architecture](#-architecture)**

</div>

---

> [!IMPORTANT]
> **Public demo ≠ production benchmark.** The overview cards and charts use illustrative numbers. The interactive demo scenarios use synthetic records, but their displayed evaluation results are calculated by the actual Python engine. Never cite demo metrics as measured agent performance.

## ✨ Why AgentMetrics?

Evaluating an AI agent requires more than a convincing response. AgentMetrics provides a repeatable workflow for labeled examples, comparable metrics and transparent methodology.

| Capability | What it does | Status |
|:--|:--|:--|
| **Evaluation engine** | Compares expected and predicted outputs | ✅ Available |
| **Latency & cost** | Aggregates response times and reported USD costs | ✅ Available |
| **Interactive dashboard** | Runs evaluations via the Python API | ✅ Available |
| **JSONL import** | Imports up to 10,000 records / 2 MB in the web UI | ✅ Available |
| **Synthetic scenarios** | Lets visitors explore three labeled sample workloads | ✅ Available |
| **Bootstrap statistics** | Paired bootstrap utility in Python | 🧪 Library utility |
| **Persistent history** | Supabase dataset and evaluation-run storage helpers | 🧩 Backend utility; UI integration pending |
| **Agent comparisons & trends** | Weighted per-agent metrics and chronological run trends | 🧩 Library utility; UI integration pending |
| **Report export** | JSON/CSV export and SHA-256 reproducibility manifest helpers | 🧩 Library utility; UI integration pending |
| **Authentication & workspaces** | Supabase Auth and workspace membership helpers | 🧩 Library utility; UI integration pending |
| **95% confidence intervals** | Wilson interval utility for binary exact-match accuracy | 🧩 Library utility; dashboard integration pending |
| **Semantic evaluation** | LLM-as-judge / meaning-aware scoring | 🗓️ Planned |

## 🖥️ Explore the demo

**[Open the interactive dashboard →](https://web-mrjoao28s-projects.vercel.app)**

Try the preloaded scenarios without creating an account:

| Scenario | Synthetic examples | What it illustrates |
|:--|--:|:--|
| Customer support | 50 | Expected vs. predicted support responses |
| Ticket classification | 80 | Category agreement |
| Document extraction | 60 | Structured-field agreement |

Select a scenario and run the evaluation. The browser calls a Next.js server route, which forwards the request to the FastAPI service. You can also upload your own JSONL file.

> [!NOTE]
> The demo scenarios are **synthetic**. They do not call real AI agents or independently verify model quality. The current evaluator uses **normalized exact string matching**, not semantic correctness.

## 🏗️ Architecture

```mermaid
flowchart LR
    U["Browser / Dashboard"] --> W["Next.js 15"]
    W --> P["/api/evaluate<br/>Server-side proxy"]
    P --> A["FastAPI<br/>POST /v1/evaluate"]
    A --> E["Python evaluation engine"]
    E --> R["Accuracy · Latency · Cost"]
    R --> U
    D["JSONL dataset"] --> W
    C["Python CLI"] --> E
```

| Layer | Technology | Responsibility |
|:--|:--|:--|
| Web | Next.js, React, TypeScript | Dashboard and JSONL upload |
| API proxy | Next.js route handler | Server-side backend connection |
| API | FastAPI, Pydantic | Input validation and HTTP evaluation |
| Core | Python | Deterministic metrics and statistics |
| Deployment | Vercel + Render | Web frontend and Python service |

**Data flow:** your imported records are sent to the evaluation API for processing. The repository now includes Supabase-backed persistence helpers, but they are not yet wired into the public dashboard; the public demo does not automatically save evaluation history. Avoid uploading sensitive or confidential data to the public demo.

### Supabase-backed modules (integration in progress)

The codebase includes workspace-scoped dataset/run persistence (`evaluation-store.ts`), per-agent comparisons and trends (`run-analytics.ts`), JSON/CSV report export and SHA-256 manifests (`reproducibility.ts`), Supabase Auth/workspace helpers (`workspaces.ts`), and Wilson 95% confidence intervals (`confidence-interval.ts`). These modules were merged in PRs #12–#16, but **do not yet constitute a complete end-to-end dashboard feature**.

To configure the Supabase client for development, add these to `apps/web/.env.local` alongside the API URL:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Use a publishable/anon key only; never expose a Supabase service-role or secret key through `NEXT_PUBLIC_`. Database tables, row-level security policies, authentication flows, workspace permissions, and UI integration must be validated against your own Supabase project before production use.

## 🚀 Quick start

### Requirements

- Python **3.10+**
- Node.js and npm (for the web dashboard)
- Git

### 1. Clone and install the Python package

```bash
git clone https://github.com/mrJoao28/AgentMetrics-AI.git
cd AgentMetrics-AI
python -m venv .venv
```

Activate the environment:

```bash
# macOS / Linux
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
```

Then install:

```bash
python -m pip install -e ".[dev]"
```

### 2. Evaluate the included dataset

```bash
agentmetrics data/demo.jsonl
```

The CLI prints a JSON summary containing `count`, `exact_match_accuracy`, `mean_latency_ms` and `total_cost_usd`.

### 3. Start the API

```bash
uvicorn agentmetrics.api:app --reload --port 8000
```

API docs: **http://127.0.0.1:8000/docs**  
Health check: **http://127.0.0.1:8000/health**

### 4. Start the dashboard

Create `apps/web/.env.local`:

```dotenv
AGENTMETRICS_API_URL=http://127.0.0.1:8000
```

In a second terminal:

```bash
cd apps/web
npm install
npm run dev
```

Open **http://localhost:3000**. The environment variable is server-side: do **not** prefix it with `NEXT_PUBLIC_`.

## 🔌 API reference

### `POST /v1/evaluate`

Send one to 10,000 labeled records.

```bash
curl -X POST http://127.0.0.1:8000/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{"records":[{"expected":"approved","predicted":"approved","latency_ms":120,"cost_usd":0.001},{"expected":"denied","predicted":"approved","latency_ms":180,"cost_usd":0.002}]}'
```

Example response:

```json
{
  "count": 2,
  "exact_match_accuracy": 0.5,
  "mean_latency_ms": 150.0,
  "total_cost_usd": 0.003
}
```

| Field | Definition |
|:--|:--|
| `count` | Number of evaluated records |
| `exact_match_accuracy` | Fraction of normalized strings that match |
| `mean_latency_ms` | Arithmetic mean of recorded latency in milliseconds |
| `total_cost_usd` | Sum of user-provided per-record costs |

**Methodology:** exact match ignores leading/trailing whitespace and letter case. It does **not** assess semantic similarity, precision, recall, safety or hallucinations. Latency and cost are **supplied by the dataset**, not independently measured by the API.

### JSONL input

Each non-empty line must be one JSON object:

```jsonl
{"expected":"yes","predicted":"yes","latency_ms":120,"cost_usd":0.001}
{"expected":"no","predicted":"yes","latency_ms":210,"cost_usd":0.002}
```

`expected` and `predicted` are strings. `latency_ms` must be a non-negative finite number; `cost_usd` is optional and defaults to zero.

## 🧪 Development & quality

```bash
# From repository root
python -m pytest
python -m ruff check .

# From apps/web
npm run lint
npm run build
```

We aim for deterministic tests, reviewable feature branches, clear assumptions and reproducible datasets. See [live evaluation integration notes](docs/live-evaluation.md) for the proxy and deployment details.

## 🗺️ Roadmap

- [x] Python evaluation engine and CLI
- [x] FastAPI evaluation endpoint
- [x] Next.js dashboard with JSONL import
- [x] Interactive synthetic demo scenarios
- [x] MIT open-source license
- [x] Persistent dataset/run storage helpers (UI integration pending)
- [x] Per-agent comparison and run-trend utilities (UI integration pending)
- [x] Wilson 95% confidence interval utility (dashboard display pending)
- [x] JSON/CSV report and reproducibility-manifest utilities (UI integration pending)
- [x] Supabase authentication and workspace helper modules (end-to-end flows pending)
- [ ] Wire these modules into dashboard workflows and validate end-to-end behavior
- [ ] Semantic evaluation / LLM-as-judge

Checked items above indicate **code merged into `main`**, not production-ready user-facing features.

## 🤝 Contributing

Contributions are welcome. Please open an issue describing the proposed change, create a focused feature branch, add or update tests where relevant, and submit a pull request with reproduction and validation steps. Never commit API keys, private prompts or sensitive datasets.

## 🔐 Responsible use

- Do not upload confidential customer data to the public demo.
- Do not present synthetic examples as measured production performance.
- Review evaluation methodology before making model-selection decisions.
- Protect the API before exposing it to untrusted, high-volume traffic.

## 📄 License & author

Licensed under the **[MIT License](LICENSE)**.

Created and maintained by **[João Felipe Azevedo](https://github.com/mrJoao28)**.

<div align="center">

**Build benchmarks people can understand, reproduce and trust.**

[Dashboard](https://web-mrjoao28s-projects.vercel.app) · [Source code](https://github.com/mrJoao28/AgentMetrics-AI) · [License](LICENSE)

</div>
