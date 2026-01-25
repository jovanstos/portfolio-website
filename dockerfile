# Base setup creation
FROM node:22-bookworm AS base
WORKDIR /app

# Install LLVM and build tools
RUN apt-get update && apt-get install -y \
    clang \
    lld \
    llvm \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Development version setup
FROM base AS development
# Copy the source code
COPY . .
# Expose Vite and backend Express server
EXPOSE 5174 3000
# Run the dev command in package.json
CMD ["npm", "run", "dev"]

# Production build setup
FROM base AS build-stage
COPY . .
RUN npm run build && npm run build-server

# Production version setup
FROM node:22-bookworm-slim AS production
WORKDIR /app

# Production needs the binaries to actually perform the compilation
RUN apt-get update && apt-get install -y \
    clang \
    lld \
    && rm -rf /var/lib/apt/lists/*

# Copy only the compiled code and production dependencies
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/backend_dist ./backend_dist
COPY --from=build-stage /app/package*.json ./
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "run", "start"]