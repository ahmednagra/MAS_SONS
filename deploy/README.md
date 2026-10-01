# Deploy — mas-sons.step-now.de (client preview)

Runs on the step-now.de VPS next to StepNow, fully separate: own ports (backend `127.0.0.1:8100`,
frontend `127.0.0.1:3100`), own PostgreSQL role + database (`mas_sons`), own systemd units, own nginx
vhost. The whole site is behind a browser password prompt and marked `noindex`.

## One-time prerequisite (DNS)

step-now.de's DNS is hosted at **Google Cloud DNS**, not Hostinger. Add:

| Type | Name | Value |
|---|---|---|
| A | `mas-sons` | `76.13.136.150` |

## Deploy

```bash
# every deploy — one command; clones the repo itself on a fresh server, pulls main otherwise
bash /root/mas_sons/scripts/deploy.sh

# brand-new server where nothing is cloned yet: fetch just the script, run it (it clones the rest)
curl -fsSL https://raw.githubusercontent.com/ahmednagra/MAS_SONS/main/scripts/deploy.sh -o /root/mas-deploy.sh
bash /root/mas-deploy.sh
```

Whichever copy is started, after the clone/pull the run continues with the repo's own
`scripts/deploy.sh` at `origin/main`, so a stale or downloaded copy never deploys with old steps.

Deploys `origin/main`. Commit and push first — the server copy is reset to `origin/main` every run.
Override the branch with `MAS_BRANCH=feature-x bash /root/mas_sons/scripts/deploy.sh`.

### What it does

1. **Preflight** — installs missing packages (git, nginx, certbot, python3-venv, postgresql), checks
   Python ≥ 3.11 and Node ≥ 20.9, adds 2 GB swap if none, checks free disk.
2. **Deploy config** — `/etc/mas-sons/deploy.env` (root-only): site password, demo admin, certbot email.
   Generated with random passwords on the first run; printed once at the end.
3. **DNS + TLS** — verifies the A record points here, then gets a Let's Encrypt certificate (renewed
   automatically by certbot's timer through the port-80 vhost).
4. **Stop** frontend, then backend.
5. **Git pull** — `fetch` + `reset --hard origin/main`. If `deploy.sh` itself changed, the new version
   is re-run immediately. Ignored files (`.env`, uploads, logs) are kept.
6. **Env files** — creates `Backend/.env` (generated secrets) and `Frontend/.env.production.local` from
   `deploy/env/*.template` if missing; validates required keys. Never overwrites existing files.
7. **Database** — creates the role and database if missing, syncs the role password with
   `Backend/.env`, makes the role own the database + `public` schema, installs `citext`, verifies the
   app role can connect and create tables. Refuses to use `postgres` or StepNow's database.
8. **Backend** — venv + `pip install`, **migrations** (`python -m scripts.migrate_db`: schema +
   monthly partitions), **seeders/dictionaries** (`python -m scripts.seed_db`: units, features, images,
   destinations, demo admin).
9. **Start backend** — waits for `/health/ready`.
10. **Frontend** — `npm ci`, clean `next build` (against the running backend), start, health check.
11. **nginx** — writes the password file, installs the vhost, `nginx -t` (restores the previous vhost
    on failure so a bad config can never block StepNow's reloads), reload.
12. **Smoke test** — 401 without password, 200 with it, `/stock`, `robots.txt`; checks step-now.de
    still answers.

Any failure stops the script with the failing step named; re-running is always safe.

## Day to day

```bash
nano /etc/mas-sons/deploy.env && bash /root/mas_sons/scripts/deploy.sh   # change site password
journalctl -u mas-backend -u mas-frontend -f                             # logs
systemctl restart mas-backend mas-frontend                               # restart without deploying
```

`mas-maintenance.timer` runs `scripts.migrate_db` daily so next month's partitions always exist.

## Removing the demo

```bash
systemctl disable --now mas-frontend mas-backend mas-maintenance.timer
rm -f /etc/systemd/system/mas-*.{service,timer} /etc/nginx/sites-enabled/mas-sons.step-now.de && systemctl reload nginx
runuser -u postgres -- psql -c 'DROP DATABASE mas_sons;' -c 'DROP ROLE mas_sons;'
certbot delete --cert-name mas-sons.step-now.de
```
