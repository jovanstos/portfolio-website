# Jovan Stosic Portfolio Website

## Usage & Copyright

This repository is intended strictly for showcase purposes.

#### Ownership & Rights

All code and design assets within this repository are the property of Jovan Stosic.

### Restrictions

- No Repurposing: I do not grant permission for this code, design, or any associated assets to be repurposed, redistributed, or used as a template for other personal or commercial websites.

- No Unauthorized Use: Please do not download, clone, or fork this repository with the intent of claiming the work as your own or using it for your own personal site.

I kindly ask that you respect the integrity of this work. If you find the code helpful for learning, I encourage you to use it as inspiration to build something unique of your own rather than copying this implementation. Thank you!

---

## Description

A monolithic portfolio website with multiple live projects and services embedded within it. The backend is a single Express.js server that handles REST APIs, real-time Socket.io connections, Python subprocess execution, and static file serving in production.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query |
| Backend | Express.js, Socket.io, JWT, Nodemailer |
| Database | PostgreSQL |
| Other | Python, Docker |

## Commands

### Local Development (Docker)

```bash
# Start dev environment (hot reload)
docker compose -f docker-compose.dev.yml up

# Simulate production build locally
docker compose up
```

### Without Docker

```bash
# Install dependencies
npm install

# Run frontend dev server (port 5174)
npm run dev

# Run backend dev server (port 3000)
npm run dev-server

# Build for production
npm run build

# Preview production build
npm run preview
```

> The frontend proxies `/api` requests to `localhost:3000` in dev, so both servers need to be running.

## Project Structure

```
src/               # React frontend
  pages/           # Route-level page components
  components/      # Shared UI components
  cards/           # Project card components (Large, Medium, Small)
  api/             # Axios API client functions
  hooks/           # Custom React hooks
  types/           # TypeScript type definitions
  zipline/         # Encrypted file/message sharing app
  chimp_converter/ # Image format converter
  spell-caster/    # Hand gesture recognition game
  jovanlang/       # Custom programming language IDE
  pim/             # Predictive investment model game
backend/           # Express.js server
  routes/          # API route handlers
  database/        # PostgreSQL connection pool
  jwt/             # JWT sign/verify utilities
  sockets/         # Socket.io room logic
  utils/           # Python subprocess runner
python/            # Python services (compiler, ML model)
sql/               # Database schemas
```
