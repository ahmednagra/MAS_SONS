#!/usr/bin/env bash
# M.A.S & SONS — one-click deploy to https://mas-sons.step-now.de (the step-now.de VPS).
#
#   bash /root/mas_sons/scripts/deploy.sh
#
# Brand-new server (nothing cloned yet) — fetch this one file and run it; it clones the repo itself:
#   curl -fsSL https://raw.githubusercontent.com/ahmednagra/MAS_SONS/main/scripts/deploy.sh -o /root/mas-deploy.sh
#   bash /root/mas-deploy.sh
# Whichever copy you start, after the clone/pull the run always continues with the repo's own
# scripts/deploy.sh at origin/main — a stale copy can never deploy with outdated steps.
#
# Flow: preflight → TLS/DNS → stop frontend + backend → git pull → env files → database
#       (create role/db if missing) → backend deps → migrations → seeders/dictionaries →
#       start backend (health-checked) → build + start frontend (health-checked) → nginx → smoke test.
#
# Shares the box with step-now.de but never touches it: own ports (8100/3100, loopback only), own
# database + role, own systemd units, own nginx vhost. Every step is idempotent — re-run after any
# failure. Secrets live in /etc/mas-sons/deploy.env and Backend/.env (both generated on first run,
# root-only, never in git). Full log: /var/log/mas-sons-deploy.log
set -Eeuo pipefail

# Fingerprint of the copy being executed, taken before any pull can change files (step 5 compares
# it with the repo's script). Empty when piped into bash — that always hands over to the repo copy.
RUNNING_SHA=""
[ -f "$0" ] && RUNNING_SHA=$(sha256sum "$0" | cut -d' ' -f1)

DOMAIN="mas-sons.step-now.de"
APP_DIR="/root/mas_sons"
REPO_URL="https://github.com/ahmednagra/MAS_SONS.git"
BRANCH="${MAS_BRANCH:-main}"
BACKEND_DIR="$APP_DIR/Backend"
FRONTEND_DIR="$APP_DIR/Frontend"
BACKEND_PORT=8100
FRONTEND_PORT=3100
CONF_DIR="/etc/mas-sons"
DEPLOY_ENV="$CONF_DIR/deploy.env"
HTPASSWD="/etc/nginx/mas-sons.htpasswd"
NGINX_SITE="/etc/nginx/sites-available/$DOMAIN"
NGINX_LINK="/etc/nginx/sites-enabled/$DOMAIN"
WEBROOT="/var/www/certbot"
LOG="/var/log/mas-sons-deploy.log"
LOCK="/run/mas-sons-deploy.lock"

STEP="init"
SERVICES_STOPPED=0
# Survives the self re-exec after a pull, so first-run passwords are still printed at the end.
FIRST_RUN_SECRETS="${MAS_FIRST_RUN_SECRETS:-0}"
step() { STEP="$1"; echo; echo "==> [$(date +%H:%M:%S)] $1"; }
info() { echo "    $*"; }
die()  { echo "    !! $*" >&2; exit 1; }

on_error() {
  local code=$? line=$1
  echo >&2
  echo "!! DEPLOY FAILED during: $STEP (line $line, exit $code)" >&2
  [ "$SERVICES_STOPPED" = "1" ] && echo "!! The demo is DOWN until the next successful deploy. step-now.de is not affected." >&2
  echo "!! Fix the cause above, then re-run: bash $APP_DIR/scripts/deploy.sh   (log: $LOG)" >&2
  exit "$code"
}
trap 'on_error $LINENO' ERR

# Read KEY from a dotenv file (last occurrence wins; surrounding quotes stripped). Never echoes values.
env_get() { local v; v=$(grep -E "^$1=" "$2" 2>/dev/null | tail -n1 | cut -d= -f2-) || true; v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"; printf '%s' "$v"; }
gen_secret() { openssl rand -hex "${1:-32}"; }
pg() { runuser -u postgres -- psql -X -q -v ON_ERROR_STOP=1 "$@"; }
http_code() { curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$@" || true; }

wait_http() {  # $1=url $2=seconds $3=accepted codes regex
  local i code
  for i in $(seq 1 "$2"); do
    code=$(http_code "$1")
    if [[ "$code" =~ ^($3)$ ]]; then info "ready: $1 → HTTP $code after ${i}s"; return 0; fi
    sleep 1
  done
  info "not ready after $2s: $1 (last HTTP $code)"; return 1
}

# ─────────────────────────────────────────────────────────────────────────────────────────────
# 0. Root, single run, log
# ─────────────────────────────────────────────────────────────────────────────────────────────
[ "$(id -u)" = "0" ] || { echo "Run as root: sudo bash $0" >&2; exit 1; }
if [ "${MAS_DEPLOY_REEXEC:-0}" != "1" ]; then
  exec 9>"$LOCK"
  flock -n 9 || { echo "Another M.A.S & SONS deploy is already running." >&2; exit 1; }
  exec > >(tee -a "$LOG") 2>&1
  echo; echo "################ deploy started $(date -Is) ################"
fi

# ─────────────────────────────────────────────────────────────────────────────────────────────
# 1. Preflight — everything that can fail without downtime fails HERE, before anything stops
# ─────────────────────────────────────────────────────────────────────────────────────────────
step "1/12 Preflight: packages, runtimes, memory, disk"
missing=()
for pkg in git curl openssl nginx certbot; do command -v "$pkg" >/dev/null 2>&1 || missing+=("$pkg"); done
python3 -c "import venv, ensurepip" >/dev/null 2>&1 || missing+=("python3-venv")
command -v psql >/dev/null 2>&1 || missing+=("postgresql")
if [ ${#missing[@]} -gt 0 ]; then
  info "installing: ${missing[*]}"
  DEBIAN_FRONTEND=noninteractive apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${missing[@]}"
fi
systemctl is-active --quiet postgresql || systemctl start postgresql

python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)' \
  || die "Python >= 3.11 required (found $(python3 --version 2>&1))"
command -v node >/dev/null 2>&1 || die "Node.js not found. Next.js 16 needs Node >= 20.9 (install from NodeSource)."
node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>20||(a===20&&b>=9)?0:1)' \
  || die "Node >= 20.9 required by Next.js 16 (found $(node -v)). Upgrade Node, then re-run."
info "python $(python3 --version | cut -d' ' -f2), node $(node -v), npm $(npm -v)"

# The Next 16 build peaks well above idle; on a 4 GB box shared with step-now.de, swap keeps a
# build from triggering the OOM killer against the live site.
if [ -z "$(swapon --show --noheadings 2>/dev/null)" ]; then
  info "no swap — creating a 2 GB /swapfile"
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
  chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
free_mb=$(df -Pm / | awk 'NR==2{print $4}')
[ "$free_mb" -ge 2048 ] || die "only ${free_mb} MB free on / — need at least 2 GB for a build"
info "swap $(swapon --show=SIZE --noheadings | head -n1 | tr -d ' '), ${free_mb} MB free disk"

# ─────────────────────────────────────────────────────────────────────────────────────────────
step "2/12 Deploy config ($DEPLOY_ENV)"
# Server-only settings that must survive git resets: preview password, demo admin, certbot email.
mkdir -p "$CONF_DIR" && chmod 700 "$CONF_DIR"
if [ ! -f "$DEPLOY_ENV" ]; then
  umask 077
  cat > "$DEPLOY_ENV" <<EOF
# M.A.S & SONS deploy settings — generated $(date -Is). Root-only. Edit, then re-run deploy.sh.
# Browser password prompt for the whole site (HTTP basic auth):
BASIC_AUTH_USER=client
BASIC_AUTH_PASSWORD=$(gen_secret 9)
# Staff admin account inside the app (/login → /admin). Created once; never reset by later deploys.
DEMO_ADMIN_EMAIL=admin@$DOMAIN
DEMO_ADMIN_PASSWORD=$(gen_secret 9)
# Optional: Let's Encrypt expiry notices.
CERTBOT_EMAIL=
EOF
  umask 022
  FIRST_RUN_SECRETS=1
  info "created with generated passwords (shown once at the end)"
fi
BASIC_AUTH_USER=$(env_get BASIC_AUTH_USER "$DEPLOY_ENV")
BASIC_AUTH_PASSWORD=$(env_get BASIC_AUTH_PASSWORD "$DEPLOY_ENV")
DEMO_ADMIN_EMAIL=$(env_get DEMO_ADMIN_EMAIL "$DEPLOY_ENV")
DEMO_ADMIN_PASSWORD=$(env_get DEMO_ADMIN_PASSWORD "$DEPLOY_ENV")
CERTBOT_EMAIL=$(env_get CERTBOT_EMAIL "$DEPLOY_ENV")
[ -n "$BASIC_AUTH_USER" ] && [ -n "$BASIC_AUTH_PASSWORD" ] || die "BASIC_AUTH_USER / BASIC_AUTH_PASSWORD empty in $DEPLOY_ENV"

# ─────────────────────────────────────────────────────────────────────────────────────────────
step "3/12 DNS + TLS certificate for $DOMAIN"
mkdir -p "$WEBROOT"
if [ ! -s "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  server_ips=$(hostname -I 2>/dev/null || true)
  dns_ip=$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}' || true)
  if [ -z "$dns_ip" ] || ! grep -Fqw -- "$dns_ip" <<<"$server_ips"; then
    die "DNS: $DOMAIN resolves to '${dns_ip:-nothing}', not this server ($server_ips).
       Add an A record  mas-sons  →  $(awk '{print $1}' <<<"$server_ips")  where step-now.de's DNS is
       managed (Google Cloud DNS), wait a few minutes, re-run."
  fi
  info "no certificate yet — serving the ACME challenge over HTTP and requesting one"
  cat > "$NGINX_SITE" <<EOF
# Temporary bootstrap vhost (deploy.sh) — replaced by the full config once the certificate exists.
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    location /.well-known/acme-challenge/ { root $WEBROOT; }
    location / { return 503; }
}
EOF
  ln -sf "$NGINX_SITE" "$NGINX_LINK"
  nginx -t && systemctl reload nginx
  email_args=(--register-unsafely-without-email)
  [ -n "$CERTBOT_EMAIL" ] && email_args=(-m "$CERTBOT_EMAIL")
  certbot certonly --webroot -w "$WEBROOT" -d "$DOMAIN" --non-interactive --agree-tos "${email_args[@]}"
fi
info "certificate present: /etc/letsencrypt/live/$DOMAIN"

# ─────────────────────────────────────────────────────────────────────────────────────────────
# 2. Stop → pull
# ─────────────────────────────────────────────────────────────────────────────────────────────
step "4/12 Stop frontend, then backend"
SERVICES_STOPPED=1
systemctl stop mas-frontend.service 2>/dev/null || true
systemctl stop mas-backend.service 2>/dev/null || true
info "stopped (demo offline until step 10)"

step "5/12 Git clone / pull ($BRANCH)"
REPO_SCRIPT="$APP_DIR/scripts/deploy.sh"
if [ "${MAS_DEPLOY_REEXEC:-0}" = "1" ]; then
  info "already pulled — continuing with the repo's deploy.sh"
else
  if [ ! -d "$APP_DIR/.git" ]; then
    # A leftover non-git folder (e.g. a manual copy) is moved aside, never deleted.
    if [ -e "$APP_DIR" ]; then
      aside="$APP_DIR.pre-clone-$(date +%Y%m%d%H%M%S)"
      mv "$APP_DIR" "$aside"; info "$APP_DIR was not a git checkout — moved to $aside"
    fi
    info "cloning $REPO_URL ($BRANCH) into $APP_DIR"
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  else
    git -C "$APP_DIR" remote set-url origin "$REPO_URL"
    git -C "$APP_DIR" fetch --prune origin "$BRANCH"
    # The server is a deploy target, not a workspace: tracked files always match origin. Ignored
    # files (Backend/.env, Frontend/.env.production.local, Backend/storage uploads, logs) survive.
    git -C "$APP_DIR" checkout -q -B "$BRANCH" "origin/$BRANCH"
    git -C "$APP_DIR" reset -q --hard "origin/$BRANCH"
  fi
  [ -f "$REPO_SCRIPT" ] || die "origin/$BRANCH has no scripts/deploy.sh — commit and push the deploy files first"
  # Hand over to the repo's own script unless this run already IS that exact content (started
  # from the checkout and unchanged by the pull). Covers a downloaded/copied/piped first run too.
  if [ "$RUNNING_SHA" != "$(sha256sum "$REPO_SCRIPT" | cut -d' ' -f1)" ]; then
    info "continuing with $REPO_SCRIPT from $(git -C "$APP_DIR" log -1 --format=%h)"
    export MAS_DEPLOY_REEXEC=1 MAS_FIRST_RUN_SECRETS="$FIRST_RUN_SECRETS"
    exec bash "$REPO_SCRIPT" "$@"
  fi
fi
info "at $(git -C "$APP_DIR" log -1 --format='%h %s')"

# ─────────────────────────────────────────────────────────────────────────────────────────────
# 3. Environment files
# ─────────────────────────────────────────────────────────────────────────────────────────────
step "6/12 Environment files"
BENV="$BACKEND_DIR/.env"
FENV="$FRONTEND_DIR/.env.production.local"
if [ ! -f "$BENV" ]; then
  umask 077
  sed -e "s|@@DB_PASSWORD@@|$(gen_secret 24)|" \
      -e "s|@@SECRET_KEY@@|$(gen_secret 32)|" \
      -e "s|@@INTERNAL_JOBS_SERVICE_TOKEN@@|$(gen_secret 32)|" \
      "$APP_DIR/deploy/env/backend.env.production.template" > "$BENV"
  umask 022
  info "created Backend/.env with generated secrets"
fi
[ -f "$FENV" ] || { cp "$APP_DIR/deploy/env/frontend.env.production.template" "$FENV"; info "created Frontend/.env.production.local"; }
chmod 600 "$BENV"

for key in SECRET_KEY DB_USERNAME DB_PASSWORD DB_NAME DB_HOST DB_PORT; do
  [ -n "$(env_get "$key" "$BENV")" ] || die "$key is empty in Backend/.env"
done
[ "$(env_get ENVIRONMENT "$BENV")" != "development" ] || die "Backend/.env has ENVIRONMENT=development — cookies would not be Secure; set production"
for key in API_BASE_URL NEXT_PUBLIC_SITE_URL; do
  [ -n "$(env_get "$key" "$FENV")" ] || die "$key is empty in Frontend/.env.production.local"
done
DB_USER=$(env_get DB_USERNAME "$BENV"); DB_PASS=$(env_get DB_PASSWORD "$BENV")
DB_NAME=$(env_get DB_NAME "$BENV");     DB_HOST=$(env_get DB_HOST "$BENV"); DB_PORT=$(env_get DB_PORT "$BENV")
info "backend env ok (db $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME), frontend env ok"

# ─────────────────────────────────────────────────────────────────────────────────────────────
# 4. Database — create role/database if missing, own everything, verify as the app role
# ─────────────────────────────────────────────────────────────────────────────────────────────
step "7/12 Database"
[[ "$DB_USER" =~ ^[a-z_][a-z0-9_]*$ && "$DB_NAME" =~ ^[a-z_][a-z0-9_]*$ ]] \
  || die "DB_USERNAME / DB_NAME must be lowercase letters, digits, underscores"
[ "$DB_USER" != "postgres" ] && [ "$DB_USER" != "stepnow" ] && [ "$DB_NAME" != "stepnow" ] \
  || die "refusing to share step-now's database or the postgres superuser — use a dedicated role/db"
if [[ "$DB_HOST" =~ ^(127\.0\.0\.1|localhost|::1)$ ]]; then
  # Password goes through a psql variable on stdin (:'pw' quotes it) — never on the command line.
  if [ "$(pg -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'")" = "1" ]; then
    printf "ALTER ROLE \"%s\" WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD :'pw';\n" "$DB_USER" \
      | pg -d postgres -v pw="$DB_PASS"
    info "role $DB_USER exists — password synced with Backend/.env"
  else
    printf "CREATE ROLE \"%s\" WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD :'pw';\n" "$DB_USER" \
      | pg -d postgres -v pw="$DB_PASS"
    info "role $DB_USER created"
  fi
  if [ "$(pg -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'")" != "1" ]; then
    pg -d postgres -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\" ENCODING 'UTF8' TEMPLATE template0;"
    info "database $DB_NAME created"
  fi
  # PostgreSQL 15+: a non-owner cannot CREATE in schema public — own the database and the schema.
  pg -d postgres -c "ALTER DATABASE \"$DB_NAME\" OWNER TO \"$DB_USER\"; REVOKE ALL ON DATABASE \"$DB_NAME\" FROM PUBLIC; GRANT ALL ON DATABASE \"$DB_NAME\" TO \"$DB_USER\";"
  pg -d "$DB_NAME" -c "ALTER SCHEMA public OWNER TO \"$DB_USER\"; CREATE EXTENSION IF NOT EXISTS citext;"
  # Tables left behind by a restore run as postgres would block create_all/ALTER — hand them over.
  pg -d "$DB_NAME" -c "DO \$\$ DECLARE t text; BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tableowner <> '$DB_USER' LOOP
      EXECUTE format('ALTER TABLE public.%I OWNER TO %I', t, '$DB_USER');
    END LOOP; END \$\$;"
else
  info "DB_HOST=$DB_HOST is remote — not creating anything, only verifying access"
fi
PGPASSWORD="$DB_PASS" psql -X -q -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc \
  "SELECT has_schema_privilege(current_user, 'public', 'CREATE')" | grep -qx t \
  || die "role $DB_USER cannot connect to $DB_NAME or cannot create in schema public"
info "verified: $DB_USER connects to $DB_NAME and can create tables"

# ─────────────────────────────────────────────────────────────────────────────────────────────
# 5. Backend: deps → migrations → seeders → start
# ─────────────────────────────────────────────────────────────────────────────────────────────
step "8/12 Backend dependencies, migrations, seeders"
cd "$BACKEND_DIR"
[ -x .venv/bin/python ] && .venv/bin/python -c "import sys" 2>/dev/null || { rm -rf .venv; python3 -m venv .venv; }
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt
mkdir -p storage/uploads logs
info "migrations (schema + monthly partitions)"
.venv/bin/python -m scripts.migrate_db
info "seeders (dictionaries + demo admin)"
DEMO_ADMIN_EMAIL="$DEMO_ADMIN_EMAIL" DEMO_ADMIN_PASSWORD="$DEMO_ADMIN_PASSWORD" .venv/bin/python -m scripts.seed_db

step "9/12 Install services, start backend"
cp "$APP_DIR/deploy/systemd/mas-backend.service"     /etc/systemd/system/
cp "$APP_DIR/deploy/systemd/mas-frontend.service"    /etc/systemd/system/
cp "$APP_DIR/deploy/systemd/mas-maintenance.service" /etc/systemd/system/
cp "$APP_DIR/deploy/systemd/mas-maintenance.timer"   /etc/systemd/system/
systemctl daemon-reload
systemctl enable -q mas-backend.service mas-frontend.service
systemctl enable -q --now mas-maintenance.timer
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  if ss -ltnH "( sport = :$port )" | grep -q .; then
    die "port $port is already in use by another process: $(ss -ltnpH "( sport = :$port )" | head -n1)"
  fi
done
systemctl start mas-backend.service
wait_http "http://127.0.0.1:$BACKEND_PORT/health/ready" 60 "200" \
  || { journalctl -u mas-backend -n 60 --no-pager; die "backend did not become healthy"; }
code=$(http_code "http://127.0.0.1:$BACKEND_PORT/api/v0/destinations")
info "API sample /api/v0/destinations → HTTP $code"

# ─────────────────────────────────────────────────────────────────────────────────────────────
# 6. Frontend: install → build (against the running backend) → start
# ─────────────────────────────────────────────────────────────────────────────────────────────
step "10/12 Frontend build + start"
cd "$FRONTEND_DIR"
npm ci --no-audit --no-fund --loglevel=error
rm -rf .next
# Low priority + bounded heap: step-now.de keeps serving while this compiles on the shared vCPU.
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=1536" NEXT_TELEMETRY_DISABLED=1 \
  nice -n 10 npm run build
systemctl start mas-frontend.service
wait_http "http://127.0.0.1:$FRONTEND_PORT/" 60 "200|307|308" \
  || { journalctl -u mas-frontend -n 60 --no-pager; die "frontend did not become healthy"; }
SERVICES_STOPPED=0

# ─────────────────────────────────────────────────────────────────────────────────────────────
# 7. nginx (password + vhost), then smoke test from outside
# ─────────────────────────────────────────────────────────────────────────────────────────────
step "11/12 nginx: password file + vhost"
hash=$(printf '%s' "$BASIC_AUTH_PASSWORD" | openssl passwd -apr1 -stdin)
printf '%s:%s\n' "$BASIC_AUTH_USER" "$hash" > "$HTPASSWD.tmp"
chown root:www-data "$HTPASSWD.tmp" && chmod 640 "$HTPASSWD.tmp" && mv "$HTPASSWD.tmp" "$HTPASSWD"
prev=""
[ -f "$NGINX_SITE" ] && prev=$(mktemp) && cp "$NGINX_SITE" "$prev"
cp "$APP_DIR/deploy/nginx/$DOMAIN.conf" "$NGINX_SITE"
ln -sf "$NGINX_SITE" "$NGINX_LINK"
if ! nginx -t 2>&1; then
  # Never leave a broken vhost enabled — it would also block step-now's next nginx reload.
  if [ -n "$prev" ]; then cp "$prev" "$NGINX_SITE"; else rm -f "$NGINX_LINK"; fi
  die "nginx config test failed — previous vhost restored, nginx not reloaded"
fi
systemctl reload nginx
[ -n "$prev" ] && rm -f "$prev"

step "12/12 Smoke test"
fail=0
check() { local want=$1; shift; local got; got=$(http_code "$@"); if [[ "$got" =~ ^($want)$ ]]; then info "ok   $got  ${*: -1}"; else info "FAIL $got (want $want)  ${*: -1}"; fail=1; fi; }
check "401"         "https://$DOMAIN/"
check "200|307|308" -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASSWORD" "https://$DOMAIN/"
check "200|307|308" -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASSWORD" "https://$DOMAIN/stock"
check "200"         "https://$DOMAIN/robots.txt"
nb=$(http_code "https://step-now.de/")
[ "$nb" = "200" ] && info "ok   200  https://step-now.de/ (neighbour untouched)" || info "WARN https://step-now.de/ answered HTTP $nb — check the step-now services (not caused by this deploy's ports/db)"
[ "$fail" = "0" ] || die "smoke test failed — services are running; check: journalctl -u mas-frontend -u mas-backend -n 80"

echo
echo "################ deploy OK $(date -Is) ################"
echo "  URL:            https://$DOMAIN"
echo "  Site password:  user '$BASIC_AUTH_USER' (password in $DEPLOY_ENV)"
echo "  Demo admin:     $DEMO_ADMIN_EMAIL at https://$DOMAIN/login (password in $DEPLOY_ENV)"
if [ "$FIRST_RUN_SECRETS" = "1" ]; then
  echo "  First run — generated credentials (also saved in $DEPLOY_ENV):"
  echo "    site password: $BASIC_AUTH_PASSWORD"
  echo "    admin password: $DEMO_ADMIN_PASSWORD"
fi
echo "  Logs:           journalctl -u mas-backend -u mas-frontend -f"
