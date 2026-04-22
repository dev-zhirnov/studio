# CLAUDE.md

> **The primary reference is [`AGENTS.md`](./AGENTS.md)** — read it first for architecture, commands, conventions, and the GitHub setup. This file only documents Claude-specific tooling notes and how to reach the production server.

## Production server

- The site is hosted on a self-managed Linux box reachable via the SSH alias **`coolify`** (the actual machine hostname is `speech`). Just `ssh coolify` — the host is already wired up in the user's `~/.ssh/config`.
- SSH keys live in the standard macOS location (`~/.ssh/`). The exact key filename and any other access secrets are kept out of git — see "Secrets" below.
- The server runs **Coolify** (`ghcr.io/coollabsio/coolify`), which manages a fleet of Docker containers via its own auto-generated compose files (with **Caddy** labels, not Traefik). The repo's local `docker-compose.yml` is for reference / non-Coolify deploys; in production, Coolify is the source of truth for routing and env vars. Several `scribeflow-*` containers (Grafana / Prometheus / exporters) also live here — they belong to a different project; don't touch them.
- Sibling projects on the same host include `speech-dev`, `gitlab-eogckggc8sgk08gc8goo0cws`, `vpn-portal`, `vpn-panel`, etc. Always confirm a container belongs to *this* project before restarting or inspecting it.

### Finding this project's container

Coolify gives containers opaque hash-based names, so don't grep for `zhirnov` or `studio` — use the Coolify labels instead:

```bash
ssh coolify 'sudo docker ps --filter "label=coolify.projectName=studio" \
  --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"'
```

At time of writing this resolves to a container named `ogcwkso8wsscc0w0ggkw0www-*` (Coolify project **`studio`**, application **`brave-badger-ogcwkso8wsscc0w0ggkw0www`**, application id `3`), routed by Caddy/Traefik to `zhirnov.studio` and `www.zhirnov.studio` on port 3000. The hash prefix can change if the application is recreated in Coolify, so prefer the label filter above to identify it.

To check logs / restart:

```bash
ssh coolify 'sudo docker logs --tail 200 <container-name>'
ssh coolify 'sudo docker restart <container-name>'
```

For anything bigger (env var changes, redeploy, domain changes) — go through the Coolify web UI rather than touching containers by hand.

## Secrets

Anything sensitive (specific SSH key filenames, Coolify admin URL/login, `REVALIDATE_SECRET`, WordPress admin credentials, etc.) lives in **`CLAUDE.local.md`**, which is gitignored. Read it at the start of a session if it exists:

```bash
cat CLAUDE.local.md 2>/dev/null || echo "No CLAUDE.local.md — you don't have access to this machine's secrets, ask the user."
```

If the file is missing, you do not have credentials for this environment — say so and ask the user rather than guessing.
