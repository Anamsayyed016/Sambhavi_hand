# Sambhavi Handloom — Production Deployment

Zero-downtime **blue-green** deployment for Sambhavi only.  
**AFTIONIX is isolated** and must never be modified by this pipeline.

---

## Architecture

| Item | Value |
|---|---|
| App | Sambhavi Handloom |
| Domain | https://sambhaviheritagereimagined.com |
| www | https://www.sambhaviheritagereimagined.com |
| Repo | https://github.com/Anamsayyed016/Sambhavi_hand |
| Branch | `main` |
| Server | Hostinger VPS (Ubuntu 24.04) |
| App root | `/var/www/sambhavi-handloom` |
| Node | 22.x |
| pnpm | 11.20.0 |
| Process manager | PM2 |
| Web server | Nginx |

### Ports (critical)

| Service | Port |
|---|---|
| **AFTIONIX** | **3000** (do not touch) |
| Sambhavi blue | **3001** |
| Sambhavi green | **3002** |

Only one Sambhavi color receives public traffic at a time.

---

## Directory layout

```
/var/www/sambhavi-handloom/
  repo/                 # git mirror (fetch + checkout exact SHA)
  releases/<commit>/    # immutable release builds
  current -> releases/<active-sha>
  shared/
    .env                # production secrets (NOT in git)
    active-port         # 3001 or 3002
    previous-port
    current-release
    previous-release
  deploy/               # also present inside each release
```

---

## GitHub Secrets

Configure in GitHub → Settings → Secrets and variables → Actions:

| Secret | Description |
|---|---|
| `HOSTINGER_HOST` | VPS IP or hostname (e.g. `200.97.164.86`) |
| `HOSTINGER_USER` | SSH user (usually `root`) |
| `HOSTINGER_SSH_KEY` | Private SSH key (full PEM) |
| `HOSTINGER_PORT` | SSH port (optional, default `22`) |

Never commit these values.

---

## One-time server setup

SSH to Hostinger, then:

```bash
# After the CI/CD commit is on the server (or clone manually once):
cd /var/www/sambhavi-handloom
# If you already have a flat checkout with deploy/ scripts:
bash deploy/scripts/setup-server.sh
```

Then **edit only the Sambhavi Nginx site** so `location /` uses the upstream:

```nginx
include /etc/nginx/snippets/sambhavi-upstream.conf;

location / {
    proxy_pass http://sambhavi_backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

**Do not edit** `/etc/nginx/sites-available/aftionix.tech` (or its enabled symlink).

Validate and reload:

```bash
nginx -t && systemctl reload nginx
```

Fill production env (do not overwrite blindly if already set):

```bash
nano /var/www/sambhavi-handloom/shared/.env
```

Currently relevant:

```
DATABASE_URL=
```

---

## Automatic deploy flow

On every push to `main`:

1. GitHub Actions installs pnpm 11.20.0 + Node 22  
2. `pnpm install --frozen-lockfile`  
3. `prisma generate` + `pnpm build` (gate — failure stops deploy)  
4. SSH to Hostinger  
5. `deploy.sh <GITHUB_SHA>`:
   - Extract exact commit into `releases/<sha>`
   - Link `shared/.env`
   - Install + build inside the release (never in the live tree)
   - Start inactive color on 3001 or 3002
   - Health-check `http://127.0.0.1:<new-port>/`
   - Update `/etc/nginx/snippets/sambhavi-upstream.conf`
   - `nginx -t` then `systemctl reload nginx`
   - Verify public HTTPS returns 200
   - Stop previous Sambhavi PM2 process only
   - Keep last 3 releases

Concurrency: group `sambhavi-production`, `cancel-in-progress: false`.

---

## PM2 process names

| Name | Port |
|---|---|
| `sambhavi-blue` | 3001 |
| `sambhavi-green` | 3002 |

Legacy name `sambhavi-handloom` is removed by deploy after a successful cutover.

**Forbidden:** `pm2 restart all`, `pm2 delete all`, `pm2 reload all`.

---

## Health checks

- Local: `GET http://127.0.0.1:<port>/` → 200/301/302/308  
- Public: `GET https://sambhaviheritagereimagined.com` → 200  
- Retries: 5 × ~3s  

Script: `deploy/scripts/healthcheck.sh`

---

## Rollback

```bash
bash /var/www/sambhavi-handloom/current/deploy/scripts/rollback.sh
# or
bash /var/www/sambhavi-handloom/repo/deploy/scripts/rollback.sh
```

Rollback:

1. Health-checks previous port  
2. Points Nginx upstream back  
3. `nginx -t` + reload  
4. Verifies public URL  
5. Stops the failed color  

No rebuild required if the previous PM2 process is still available.

---

## Database migrations

If `DATABASE_URL` is set in `shared/.env` and migrations exist:

```bash
pnpm exec prisma migrate deploy
```

runs **inside the new release before traffic switch**.

Never:

- `prisma migrate reset`
- AFTIONIX database credentials

---

## Logs

```bash
pm2 list
pm2 logs sambhavi-blue
pm2 logs sambhavi-green
journalctl -u nginx -n 50 --no-pager
tail -n 100 /var/log/nginx/error.log
```

GitHub Actions logs: repository → Actions tab.

---

## Manual verification checklist

```bash
pm2 list
curl -I http://127.0.0.1:3001
curl -I http://127.0.0.1:3002
curl -I https://sambhaviheritagereimagined.com
curl -I https://www.sambhaviheritagereimagined.com
# Confirm AFTIONIX still on 3000 / its own domain
curl -I http://127.0.0.1:3000
nginx -t
```

---

## Standalone output

**Not enabled.** Production uses classic `next start` with full release `node_modules` + `.next` + `public` to avoid asset path issues. Revisit only if a future scan proves standalone is beneficial.
