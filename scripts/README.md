# Scripts Directory

Utility scripts for the MCP Suite monorepo.

## Development Scripts

### `cleanup-ports.sh` 🧹

Kills processes on ports 3000 and 1420.

**Use when:** You get "EADDRINUSE" errors.

**Usage:**

```bash
./scripts/cleanup-ports.sh
# or via package.json
bun run cleanup-ports
```

**What it does:**

1. Checks if ports 3000 and 1420 are in use
2. Sends SIGTERM (graceful shutdown) to processes
3. Waits 5 seconds for graceful shutdown
4. Sends SIGKILL if processes don't respond
5. Reports success/failure for each port

---

### `health-check.sh`

Verifies all services are running correctly.

**Checks:**

- ✅ Web backend (port 3000)
- ✅ Vite dev server (port 1420)
- ✅ API endpoint functionality

**Usage:**

```bash
./scripts/health-check.sh
# or via package.json
bun run health-check
```

---

## Troubleshooting

### "EADDRINUSE: address already in use"

```bash
bun run cleanup-ports
```

### Old processes keep hanging around

```bash
# Kill all node/bun processes
pkill -f "node\|bun"

# Or use cleanup script
bun run cleanup-ports
```

---

## Quick Reference

| Command                 | What it does                      |
| ----------------------- | --------------------------------- |
| `bun run cleanup-ports` | Kill processes on ports 3000/1420 |
| `bun run health-check`  | Verify all services are healthy   |
