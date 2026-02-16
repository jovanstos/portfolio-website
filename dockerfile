# Base setup creation
FROM node:22-bookworm AS base
WORKDIR /app

# Allow pip to install globally in Debian Bookworm (Node 22)
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Install LLVM, Python, and build tools
RUN apt-get update && apt-get install -y \
    clang \
    lld \
    llvm \
    llvm-dev \
    build-essential \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install python libraries
RUN pip install llvmlite tensorflow

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Development version setup
# FROM base AS development
# # Copy the source code
# COPY . .
# # Expose Vite and backend Express server
# EXPOSE 5174 3000
# # Run the dev command in package.json
# CMD ["npm", "run", "dev"]

# Production build setup
FROM base AS build-stage
COPY . .
RUN npm run build && npm run build-server

# Production version setup
FROM node:22-bookworm-slim AS production
WORKDIR /app

# Re-declare the pip env var for production stage
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Production needs Python and LLVM runtime libraries
# Python/Pip must be reinstalled here because this stage starts fresh from 'slim'
RUN apt-get update && apt-get install -y \
    clang \
    lld \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install llvmlite for production runtime
RUN pip install llvmlite tensorflow

# Copy only the compiled code and production dependencies
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/backend_dist ./backend_dist
COPY --from=build-stage /app/package*.json ./
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "run", "start"]