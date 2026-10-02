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

## The Site

A personal portfolio and collection of working experiments in one monolith. The space aesthetic, spinning rocket navigation, and starburst intro are intentional. The intro plays once per tab, supports Skip/Replay, and respects reduced motion.

The Express server serves the production frontend, REST APIs, and Socket.IO. PostgreSQL holds project descriptions/articles. The existing Python compiler and prediction services remain separate concerns inside the same deployment.

| Layer    | Technologies                                                 |
| -------- | ------------------------------------------------------------ |
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query     |
| Backend  | Express, Socket.IO, anonymous JWT cookies, Nodemailer, Sharp |
| Database | PostgreSQL                                                   |
| Demos    | Web Crypto, Web Workers, locally bundled Monaco, MediaPipe   |
| Runtime  | Node.js 22, Python/LLVM, Docker                              |

## Local setup

Use Node.js 22 (current LTS patch) and the committed lockfile. Native development also needs the existing Python/LLVM dependencies for those services; Docker installs them using the existing image setup.

```bash
cp .env.example .env
# Fill in JWT_SECRET, your existing PostgreSQL credentials, and mail credentials.
npm ci
```

Generate a secret and put the result in `JWT_SECRET`:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

### Native development

In separate terminals:

```bash
npm run dev-server  # API/socket server: localhost:3000
npm run dev         # Frontend: localhost:5174
```

Open `http://localhost:5174`. Vite proxies both `/api` and `/socket.io`; **both servers must run**. Zipline always uses the current origin. The old `VITE_SOCKET_URL` and `USE_HTTPS` settings are no longer used.

### Docker development

```bash
docker compose -f docker-compose.dev.yml up --build
```

This uses `.env`, exposes ports 5174/3000, and mounts the source for hot reload. Use a database hostname reachable from the container: `localhost` means the container itself, not the host. Docker Desktop commonly supports `host.docker.internal` for a host database.

Camera, clipboard, and Web Crypto features require a secure browser context. Localhost is suitable for desktop development; testing from a phone via a plain HTTP LAN address is not. Use an HTTPS development endpoint for real device-to-device testing.

## Production deployment

**Production now requires HTTPS through a reverse proxy, an exact public `CLIENT_ORIGIN`, and a random `JWT_SECRET` of at least 32 characters.** Secure cookies are always enabled in production.

See [DEPLOYMENT.md](DEPLOYMENT.md) for setup, proxy configuration, limits, and the release checklist.

```bash
cp .env.production.example .env.production
# Fill in real secrets/credentials and confirm your public HTTPS origin.
docker compose up -d --build
```

The production app binds to **127.0.0.1:3000**, not public HTTP port 80. The host reverse proxy terminates HTTPS and forwards HTTP/WebSocket traffic to that port. An adaptable Nginx template is in `deploy/nginx.conf.example`.

Use one application instance: Zipline rooms and quotas are process-local. Deploy frontend/backend together; restarts end active sharing sessions. No database schema migration is introduced.

### Native builds

```bash
npm run build         # dist/
npm run build-server  # backend_dist/
# Set the production environment before starting:
npm start
```

Both build steps are needed. `npm run preview` is a frontend preview, not the production server; live tools also need a backend with `CLIENT_ORIGIN` matching the preview origin (normally `http://localhost:4173`).

## Live tools and limits

- **Zipline:** opening the page creates a private invitation. Scan its QR on another device, copy the pairing link, or enter its eight-character code. Two devices, 5 MiB per file, acknowledged encrypted delivery, progress, cancellation, and explicit reconnect-by-pairing. Content and keys stay in browser memory; there is no persistent chat history or server file store.
- **Chimp Converter:** PNG/JPEG/WebP/GIF, up to 5 MiB and 25 megapixels. Animated GIF input converts its first frame. Conversion happens on the server; downloads are explicit.
- **PIM:** fresh game sessions, immediate trade/accounting updates, Restart, and exactly 26 simulated weeks. Experimental predictions become available after ten feature snapshots; Python/model formats are unchanged.
- **JovanLang:** the editor is served locally, and WASM runs in a terminable worker. Execution is capped at five seconds and output at 1,000 lines/256 KiB. This protects the browser UI; it does **not** sandbox the unchanged server-side compiler.
- **SpellCaster:** camera/model initialization starts only on request. Stop/leave releases camera and tracking resources. Model/WASM assets still load from external providers.

Encryption does not provide anonymity, content moderation, or a guarantee against misuse. The relay sees connection information and file sizes. The site is an experimental personal tool, not an audited secure messaging service. See the deployment notes for abuse/resource defaults and remaining security boundaries.

## Checks to run before release

```bash
npm run lint
npm run typecheck
npm run build
npm run build-server
npm audit
```

Automated testing packages and commands have been removed. Real HTTPS phone pairing, camera tracking, SMTP delivery, database connectivity, and your proxy/container setup still need environment-specific checks.

**The final verification run after cleanup/deployment changes was intentionally left to the owner.** These instructions describe how to verify; they are not a claim that the latest deployment configuration has been exercised.

## Project structure

```text
src/
  pages/           Portfolio routes
  components/      Navigation, intro, theme, dialogs, recovery UI
  api/             API clients and project routing registry
  cards/           Shared project-card presentation
  zipline/         Browser-owned encrypted sharing sessions
  chimp_converter/ Image converter
  jovanlang/       Local Monaco editor and WASM execution worker
  spell-caster/    Camera tracking and spell effects
  pim/             Game session, market simulation, charts
backend/
  app.ts           Injectable HTTP/socket application
  server.ts        Production/development entrypoint
  shared/          Browser/server protocol and validation contracts
  routes/          API handlers
  sockets/         Authorized, bounded Zipline relay
  database/        Existing PostgreSQL connection
  utils/           Existing Python subprocess runner
python/            Existing scripts/models (unchanged)
sql/               Existing database schemas
deploy/            HTTPS reverse-proxy template
```
