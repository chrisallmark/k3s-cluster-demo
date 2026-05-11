# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A demo full-stack app (React + Express) that backs two blog posts about running a k3s cluster on Raspberry Pi hardware. The app's sole purpose is to prove load balancing is working: the server returns its own pod `HOSTNAME`, and refreshing the page shows different pod names as Traefik routes across 2 replicas.

## Cluster Topology

Four Raspberry Pi 4 (4 GB) nodes with static IPs, named via local `/etc/hosts`:

```
192.168.0.100  k3s-0  k3s    ← master (also the registry node)
192.168.0.101  k3s-1
192.168.0.102  k3s-2
192.168.0.103  k3s-3
```

The `k3s` hostname used in `infra/ingress-route.yaml` resolves to the master node. kubectl is configured locally at `~/.kube/config` pointing to `https://k3s-0:6443`.

## Initial Setup

`configure.sh` does a find-and-replace of the `DOCKER_HUB_USERNAME` placeholder across all `*.yaml` files.

**Docker Hub (default):**

```bash
./configure.sh <docker-hub-username>
docker login
```

**Private registry (blog post 2):** pass the registry hostname instead:

```bash
./configure.sh k3s:5000
```

The private registry runs in-cluster on the master node (port 5000). To verify images pushed to it:

```bash
curl http://k3s:5000/v2/_catalog
```

## Development Workflow

```bash
skaffold dev
```

Skaffold builds images (tagged by `sha256` digest — immutable), pushes to the configured registry, applies `/infra/` manifests, and hot-syncs `*.js` changes into the server container (`node --watch` restarts on each sync). The client requires a full image rebuild on source changes — the Dockerfile is a simple copy with no build step.

To run the server locally outside k3s:

```bash
cd server && node server.js   # port 1337
```

The client has no local dev server — `index.html` hardcodes `http://k3s/api`, so it only works correctly in-cluster (or if `/etc/hosts` maps `k3s` to the cluster IP).

There are no test or lint scripts.

## Architecture

```
Browser → Traefik (Host: k3s)
            ├── /api/* → Server Service :1337  (StripPrefix middleware removes /api)
            └── /*     → Client Service :80    (nginx serving static HTML)
```

The page displays two hostnames: the client pod hostname (injected by nginx at serve time) and the server pod hostname (fetched via JS at page load). Refreshing shows different values as Traefik load-balances across replicas of each service.

- **Client** (`/client`): Plain static `index.html` served by `nginx:alpine` on port 80. No build step — the Dockerfile copies `index.html`, `favicon.ico`, and `nginx.conf` directly. `nginx.conf` uses `sub_filter` to replace the `__CLIENT_HOSTNAME__` placeholder with nginx's `$hostname` variable (the pod hostname) at serve time. Sets aggressive `no-cache` headers so each reload fetches fresh content. The page uses vanilla `fetch()` to call `http://k3s/api` (hardcoded) and renders the server pod hostname. No npm/pnpm involved.
- **Server** (`/server`): Plain Node.js `http` module server (no Express). Entry point is `server.js`. Returns `{ hostname: process.env.HOSTNAME }` on `GET /`, `200` on `GET /health`, and serves `favicon.ico`. Uses `node --watch` for Skaffold hot-sync (no nodemon). No runtime dependencies — `package.json` contains only the `start` script.
- **Infra** (`/infra`): Traefik `IngressRoute` CRD (`traefik.io/v1alpha1`, not standard `Ingress`) — locks routing to Traefik, which k3s ships with by default. Each service runs 2 replicas with liveness and readiness probes on the health/root paths.
- **Runtime**: Server Dockerfile uses `node:25.9.0-alpine`. Client Dockerfile uses `nginx:alpine`.

## Useful Tools

```bash
brew install k9s      # terminal UI for cluster — launch with k9s, :pod to list pods
brew install kubectl
brew install skaffold
```
