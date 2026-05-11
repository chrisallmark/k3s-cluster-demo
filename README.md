# k3s-cluster-demo

A demo full-stack app (static HTML + Node.js) built to prove load balancing is working on a k3s cluster. The page shows two hostnames — the client pod (injected by nginx at serve time) and the server pod (fetched via JS). Refreshing shows different values as Traefik routes requests across 2 replicas of each service.

## Architecture

```
Browser → Traefik (Host: k3s)
            ├── /api/* → Server Service :1337  (strips /api prefix)
            └── /*     → Client Service :80    (nginx serving static HTML)
```

- **Client**: Plain `index.html` served by nginx. `sub_filter` replaces `__CLIENT_HOSTNAME__` with the pod hostname at serve time. Vanilla `fetch()` calls `http://k3s/api` for the server hostname. No build step — Dockerfile is a direct copy.
- **Server**: Node.js `http` module (no Express). Returns `{ hostname }` on `GET /` and `200` on `GET /health`. No runtime dependencies.

## Prerequisites

```bash
brew install kubectl skaffold k9s
```

Docker must be running. You must also be logged in to whichever registry you use:

```bash
docker login   # for Docker Hub
```

## Setup

`configure.sh` substitutes the `DOCKER_HUB_USERNAME` placeholder in all YAML files.

**Docker Hub:**

```bash
./configure.sh <docker-hub-username>
```

**Private in-cluster registry (blog post 2):**

```bash
./configure.sh k3s:5000
```

The private registry runs on the master node at port 5000. Verify pushed images:

```bash
curl http://k3s:5000/v2/_catalog
```

## Local Development

Run the server outside the cluster:

```bash
cd server && node server.js   # http://localhost:1337
```

The client has no local dev server — `index.html` hardcodes `http://k3s/api` and requires the cluster (or `/etc/hosts` mapping `k3s` to the cluster IP) to function.

## Deploy

Check you are connected to your cluster:

```bash
kubectl get nodes
```

Build, push, and deploy with Skaffold. Hot-syncs `*.js` changes into the server container:

```bash
skaffold dev
```

The client requires a full image rebuild on source changes.

## Cleanup

```bash
kubectl delete -f infra/
```
