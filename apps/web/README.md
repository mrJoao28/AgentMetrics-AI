# AgentMetrics web

Professional, restrained Next.js dashboard foundation for AgentMetrics AI.

## Run

```bash
cd apps/web
npm install
npm run dev
```

## Deploy to Vercel

Import the GitHub repository and set **Root Directory** to `apps/web`.
Framework preset: Next.js. No environment variables are required for this
static demo shell.

**Important:** The initial dashboard contains clearly labeled illustrative
metrics. It is not connected to the Python evaluation engine yet.
The next feature will add a FastAPI service and real dataset-driven metrics.

## Design principles

- Dark graphite surfaces, minimal accent colors, restrained typography
- Dense readable data tables and honest metric labels
- Keyboard-friendly native navigation, responsive layouts
- No fabricated production benchmarks
