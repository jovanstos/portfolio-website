# ── Stage 1: heavy system deps (Python, LLVM) ──────────────────────────────
# This layer is cached. It only reruns when the apt/pip installs change.
FROM node:22-bookworm AS base
WORKDIR /app
ENV PIP_BREAK_SYSTEM_PACKAGES=1
RUN apt-get update && apt-get install -y \
    clang \
    lld \
    llvm \
    llvm-dev \
    build-essential \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
RUN pip install llvmlite tensorflow

# ── Stage 2: npm install (all deps, for dev + build) ───────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm install

# ── Stage 3: development ────────────────────────────────────────────────────
FROM deps AS development
COPY . .
EXPOSE 5174 3000
CMD ["sh", "-c", "npm run dev & npm run dev-server"]

# ── Stage 4: build the frontend + backend ──────────────────────────────────
FROM deps AS builder
COPY . .
RUN npm run build && npm run build-server

# ── Stage 5: production runtime ────────────────────────────────────────────
# Inherits system deps from base (Python/LLVM needed at runtime).
# Installs only production npm deps — no dev bloat.
FROM base AS production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend_dist ./backend_dist
COPY --from=builder /app/python ./python
EXPOSE 3000
CMD ["npm", "run", "start"]
