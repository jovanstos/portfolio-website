# Deployment and release handoff

This is the setup for **one Node.js application behind one host HTTPS reverse proxy**. It does not provision DNS, certificates, a database, or a server. Adjust the example deliberately for your actual hosting topology.

No final build, test suite, Docker build, or proxy validation was run after these cleanup/deployment edits, at the owner's request.

## 1. Configure the environment

Keep development and production separate:

- `.env`: local development, copied from `.env.example`.
- `.env.production`: production runtime, copied from `.env.production.example`.
- Both actual files are ignored by Git and excluded from Docker build context. Never commit real credentials.
- The existing `.env` is not overwritten. Production Compose now reads `.env.production` explicitly.

Required production settings:

| Setting | Value / responsibility |
| --- | --- |
| `NODE_ENV` | `production` (also set by the image/Compose) |
| `PORT` | `3000` for the supplied Compose/proxy configuration |
| `CLIENT_ORIGIN` | Exact public HTTPS origin, e.g. `https://jovanstosic.dev`; no trailing slash or path |
| `JWT_SECRET` | Random secret of at least 32 characters; no `dev`, sample secret, or empty value |
| `TRUST_PROXY_HOPS` | `1` for the supplied single host Nginx proxy; change only to match the real topology |
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Existing reachable PostgreSQL database and credentials |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Sending account and Gmail app password, not the ordinary account password |

Generate a secret locally and copy its output to the environment file:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Production startup rejects a short/default secret or non-HTTPS `CLIENT_ORIGIN`. Cookies are always Secure/HttpOnly/SameSite=Lax in production. Anonymous cookies are not accounts, human verification, or bot protection.

`VITE_SOCKET_URL` and `USE_HTTPS` are obsolete. The browser connects to its own origin; changing the host/domain does not require baking a socket URL into the frontend.

The existing database SSL configuration is unchanged, including its certificate-verification policy. Review that separately against your database provider's CA requirements before release.

## 2. Build and launch the app

On the deployment host, fill in `.env.production` first:

```bash
cp .env.production.example .env.production
# Edit .env.production with real values.
docker compose up -d --build
```

Compose explicitly selects the repository's lowercase `dockerfile`, builds frontend/backend together, and uses `npm ci` with the lockfile. The production image runs Node directly as the unprivileged `node` user; Compose's init process handles child-process reaping. Existing Python/LLVM installation steps and scripts are unchanged.

**Port change:** the app is bound to `127.0.0.1:3000`. The former public `80:3000` mapping is removed. Do not expose port 3000 publicly when trusting forwarded headers. A private loopback bind is what makes the single-proxy trust setting meaningful.

If your reverse proxy is another container rather than a host process, use a private Docker network and the app service hostname instead of the host's loopback address. Keep the app inaccessible from untrusted clients and set the correct proxy-hop count.

No SQL migration is required. Back up the existing database as part of your usual deployment procedure; do not recreate tables on an existing database.

## 3. Put HTTPS in front

`deploy/nginx.conf.example` is a host Nginx template, not an already-installed configuration:

1. Point the site's DNS at the host.
2. Obtain a TLS certificate using your existing certificate-management process.
3. Adjust the domain and certificate paths in the template.
4. Install the configuration in your Nginx `http` context (commonly through `sites-enabled`). The `map` block belongs in that context.
5. Validate and reload your proxy when you perform release verification.

The template redirects HTTP to HTTPS, proxies all routes—including `/api` and `/socket.io`—to `127.0.0.1:3000`, preserves WebSocket upgrades, allows 6 MiB request bodies for image-upload overhead, and sets a 180-second proxy timeout.

It overwrites client-supplied `X-Forwarded-For` with the connection address because this template assumes the sole public proxy. If a CDN/load balancer sits in front, first configure trusted real-IP handling for that provider; do not blindly trust an arbitrary forwarded header or simply increase the hop count.

A phone scanning Zipline must reach the same public HTTPS origin. Plain HTTP on a LAN IP does not meet the browser's camera/Web Crypto requirements. HTTPS, camera permission, and clipboard permission are browser/environment requirements, not app installation steps.

## 4. Operate Zipline within its bounds

Deploy **one app process/instance**, not PM2 cluster mode or multiple replicas. Rooms, quota counters, and sessions are in memory; horizontal scaling requires shared coordination that is not implemented here.

Fixed protocol/browser bounds:

- Two devices per room and one room per socket.
- 5 MiB per file: **5,242,880 plaintext bytes**.
- 64 KiB plaintext chunks and 128 KiB maximum Socket.IO message envelope.
- One file transfer at a time per room; receiver-confirmed chunks and final digest validation.
- 16 KiB UTF-8 text and 30 text sends per socket/minute.
- Browser history capped at 100 entries/20 MiB retained file data.
- No automatic session resume; refresh, leave, disconnect, or expiry requires fresh pairing.

Optional server overrides (defaults below):

| Environment variable | Default | Meaning |
| --- | ---: | --- |
| `ZIP_SOCKETS_PER_IP` | 6 | Simultaneous sockets per IP |
| `ZIP_WAITING_PER_IP` | 3 | Waiting rooms per IP |
| `ZIP_ROOMS` | 100 | Global room limit |
| `ZIP_SOCKETS` | 200 | Global socket admission limit |
| `ZIP_CREATIONS_PER_MINUTE` | 5 | Room creations per IP/minute |
| `ZIP_JOINS_PER_MINUTE` | 10 | Join attempts per IP/minute |
| `ZIP_WRONG_ATTEMPTS` | 5 | Incorrect attempts per IP/invitation before cooldown |
| `ZIP_WAITING_MS` | 600000 | Waiting-invitation lifetime |
| `ZIP_IDLE_MS` | 1800000 | Connected-session idle expiry |
| `ZIP_LIFETIME_MS` | 7200000 | Absolute room lifetime |
| `ZIP_BYTE_WINDOW` | 600000 | Byte-quota window and incorrect-attempt cooldown window |
| `ZIP_BYTES_PER_WINDOW` | 20971520 | Admitted plaintext bytes per sending socket **and** IP/window |
| `ZIP_TRANSFER_MS` | 120000 | Total transfer deadline |
| `ZIP_ACK_MS` | 10000 | Server delivery-acknowledgment timeout |

Overrides must be positive integers. Keep `ZIP_ACK_MS` at its default unless you also account for the browser's approximately 11-second request timeout. These overrides are not a way to increase the fixed per-file limit. Quotas charge admission, including cancelled transfers. Shared networks/NAT can hit per-IP limits sooner.

Restarts/redeployments end sessions and reset process-local quotas. Keep server clocks accurate. Operational rejection/timeout counters exist in the application instance; no public metrics endpoint or durable monitoring backend is provided.

### Privacy and abuse boundaries

Zipline relays encrypted content and encrypted file metadata. The server does not receive the AES key or store files/chat history. Browsers hold plaintext in memory for immediate use, so recipients must download files before leaving.

That is **not** anonymity or plaintext content moderation. The relay/proxy/provider can see connection information, timing, and file sizes. New invitations keep their bearer secret in a URL fragment rather than the HTTP request URL; share invitations privately and never log socket payloads or invitation data.

A 5 MiB ceiling and quotas bound resources; they do not identify prohibited content, stop determined distributed abuse, or constitute a legal-compliance program. This remains an experimental personal tool, not audited secure messaging.

The browser WASM worker's five-second timeout does not sandbox the Python compiler. Python scripts, subprocess infrastructure, model training, and their existing security boundaries were intentionally not changed. Evaluate those services independently before treating the whole monolith as hardened for untrusted workloads.

## 5. Release and rollback

Frontend/backend use Zipline protocol v2 and must ship together. Old clients must refresh; existing ephemeral invitations/sessions do not survive a server replacement. Existing portfolio routes and database field names remain compatible.

For subsequent releases:

```bash
docker compose up -d --build
```

Retain the previous release's source/image and environment configuration for rollback. Restore that release and rebuild/recreate the app using your normal deployment process. Rollback also interrupts sharing sessions; no database migration reversal is needed for this change.

Do not include `.env*`, test traces/screenshots, or temporary audit/lint reports in an image or source release. The example environment files are safe placeholders; actual values remain local to the deployment host.

## Owner's verification checklist

Run these when ready; they have **not** been rerun as part of this cleanup:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run build-server
npm audit
```

Then verify your actual deployment:

- Container startup, database access, environment values, certificate/proxy configuration, and HTTPS page loads.
- `/api/session` returns JSON and a Secure/HttpOnly cookie; `/socket.io` can upgrade without cross-origin errors.
- Real phone-to-desktop QR pairing, exact-limit file transfer/download, network interruption, and fresh pairing.
- Camera permission denial/retry/stop and actual SpellCaster tracking on supported hardware.
- Contact delivery through the real SMTP account and reply-to behavior.
- Live Python-backed endpoints.
- Old bookmarks/deep links, mobile layouts/themes, and refreshed clients after redeployment.
- App port 3000 is not exposed publicly and forwarded-header trust matches the real proxy chain.

Automated testing packages and commands have been removed. Deployment still requires manual verification of real SMTP, PostgreSQL, TLS, physical QR scanning, and the unchanged Python services.
