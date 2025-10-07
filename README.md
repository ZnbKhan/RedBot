# RedBot — Vite React + Tailwind + Express Scaffold

## Quickstart (local)

1. **Frontend**

```bash
cd frontend
npm install
npm run dev
```

2. **Server**

```bash
cd server
npm install
cp .env.example .env
# add OPENAI_API_KEY to .env
npm run dev
```

3. Open `http://localhost:5173` in your browser. The frontend proxies `/api` to `http://localhost:3001`.

---

## Notes
- Replace the example OpenAI model with whichever model you have access to.
- The server session store is in-memory for demo only. Replace with a DB (Redis/Postgres) for production.
- Keep API keys out of git. Use environment variables and secrets in your deployment provider.
