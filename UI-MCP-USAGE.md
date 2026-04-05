# UI & MCP integration (this repo)

End-to-end setup for **Cursor** (workspace = repo root), **Git Bash** on Windows, **shadcn MCP**, **Supabase MCP**, **registries**, and **Claude Code** (Magic).

---

## What lives where

| Piece | Location |
|--------|-----------|
| **Cursor / project MCP** (when you open `wanderly.ai`) | **`.mcp.json`** at repo root — `shadcn` uses `"cwd": "wanderlytrip-ai"` so it reads `components.json` |
| **MCP if you only open `wanderlytrip-ai` as the folder** | `wanderlytrip-ai/.mcp.json` (same servers; no extra `cwd`) |
| **Component registries** (React Bits, etc.) | `wanderlytrip-ai/components.json` → `"registries"` — edit in the editor, **never paste JSON into the shell** |
| **Magic (21st)** | **Claude Code** only: `claude mcp add ...` (see below) |

After changing **root** `.mcp.json`, **fully restart Cursor** so MCP reloads.

---

## Security

- Replace `YOUR_SUPABASE_PERSONAL_ACCESS_TOKEN` in `.mcp.json` with a real [Supabase access token](https://supabase.com/dashboard/account/tokens), or use whatever auth flow Cursor shows for that server (`/mcp` / OAuth where applicable).
- Do **not** commit real API keys. Rotate any key that was pasted into chat or history.

---

## 1. Git Bash (already your choice)

This repo sets **Git Bash** as the default integrated terminal on Windows via `.vscode/settings.json`.

Use Bash for `npm`, `npx`, and **`claude mcp add`**: argument passing matches the docs, and **`npx -y`** does not hit the PowerShell `-y` bug.

---

## 2. Registries (`components.json`)

`wanderlytrip-ai/components.json` includes **@react-bits**. To add another registry, merge into `"registries"` in that file (not in the terminal).

---

## 3. Refresh shadcn MCP (optional)

From repo root in **Git Bash**:

```bash
cd wanderlytrip-ai && npx shadcn@latest mcp init --client claude
```

That updates **`wanderlytrip-ai/.mcp.json`**. Copy any new `shadcn` block into **root** `.mcp.json` if the CLI changed it, and keep on the root `shadcn` entry:

```json
"cwd": "wanderlytrip-ai"
```

So Cursor always runs the server against the Next app folder.

---

## 4. Dev server

From repo root:

```bash
npm run dev
```

Or:

```bash
cd wanderlytrip-ai && npm run dev
```

Only run **one** `next dev` at a time.

---

## 5. Magic MCP — Claude Code (Git Bash)

```bash
claude mcp add --transport stdio --scope user --env API_KEY="YOUR_21ST_MAGIC_API_KEY" magic -- npx -y @21st-dev/magic@latest
```

Manage:

```bash
claude mcp list
claude mcp get magic
```

In Claude Code: **`/mcp`**.

---

## 6. Verify

- **Cursor:** MCP panel shows **shadcn** and **supabase**; shadcn tools see your registries (after token / auth for Supabase).
- **App:** `npm run dev` → open the printed localhost URL.
- **Claude Code:** `claude mcp list` includes **magic** after you add it.

---

## PowerShell (only if you must)

Do **not** paste JSON into PowerShell. For `claude mcp add`, prefer **`npx --yes`** instead of **`npx -y`**, or use **`claude --% ...`** (see older notes in git history if needed).
