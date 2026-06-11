# oneteam-onegoal

Modern SaaS workspace for AI-powered customer meeting intelligence.

**Prepare Faster • Align Better • Win Together**

## What Is Included

- Dashboard metrics, engagement analytics, meeting frequency, product interest, opportunity trends, recent activity, and uploaded transcripts generated from local SQLite data.
- 100 seeded public-company account profiles with account intelligence and Oracle opportunities.
- Meeting calendar with all 12 months, historical notes before June 12, 2026, and AI Gist prep for future meetings.
- Synthetic 2026 meeting data seeded into SQLite for dashboard trends and calendar history.
- AI Gist for executive-ready customer meeting preparation.
- Separate pages for Home, Dashboard, Accounts, Meetings, and AI Gist.
- Oracle-branded top navigation and centered responsive page layout.
- Customer timeline, shared account context, collaboration views, and dashboard analytics.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Node.js
- Local SQLite via Node `node:sqlite`
- OCI Generative AI chat via `~/.oci/config`

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3500/
```

Verify production build:

```bash
npm run build
```

On first build or first server request, the app creates and seeds:

```text
data/oneteam-onegoal.sqlite
```

The local database stores accounts, meetings, transcripts, activity feed, team spaces, product interest, and timeline events.

## OCI GenAI Chat

The floating AI chat uses OCI Generative AI. It reads OCI credentials the same way the OCI CLI does:

```text
~/.oci/config
```

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required values:

```text
OCI_CONFIG_PROFILE=DEFAULT
OCI_REGION=us-chicago-1
OCI_COMPARTMENT_ID=ocid1.tenancy.oc1..
```

The selected profile in `~/.oci/config` should include `user`, `tenancy`, `fingerprint`, `region`, and `key_file`.

## Deploy On OCI Compute

These steps assume an OCI Compute VM running Oracle Linux or Ubuntu.

### 1. Install Server Prerequisites

SSH into the OCI server:

```bash
ssh opc@YOUR_SERVER_PUBLIC_IP
```

For Oracle Linux:

```bash
sudo dnf update -y
sudo dnf install -y git nginx
```

For Ubuntu:

```bash
sudo apt update
sudo apt install -y git nginx
```

Install Node.js 22 LTS or newer. The app uses Node's built-in `node:sqlite` module, so use Node `22.5.0` or newer. One simple option is `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
node --version
npm --version
```

### 2. Get The Code On The Server

Preferred Git workflow:

```bash
cd ~
git clone YOUR_GIT_REPO_URL oneteam-onegoal
cd oneteam-onegoal
```

If you upload a zip or folder instead:

```bash
cd ~
unzip oneteam-onegoal.zip
cd oneteam-onegoal
```

Do not upload `node_modules` or `.next`; they should be created on the server.

The SQLite database is created automatically at:

```text
data/oneteam-onegoal.sqlite
```

If you already have production data, upload the `data/oneteam-onegoal.sqlite*` files too.

### 3. Install And Build

```bash
npm ci
npm run build
```

You may see this Node warning during build or startup:

```text
ExperimentalWarning: SQLite is an experimental feature
```

That warning comes from Node's built-in SQLite module and does not stop the app from running.

### 4. Run With PM2

Install PM2:

```bash
sudo npm install -g pm2
```

Start the app on port `3500`:

```bash
pm2 start npm --name oneteam-onegoal -- start
pm2 save
pm2 startup
```

After `pm2 startup`, PM2 prints one `sudo ...` command. Run that command so the app starts automatically after reboot.

Check status:

```bash
pm2 status
pm2 logs oneteam-onegoal
```

### 5. Configure Nginx Reverse Proxy

Create an Nginx config:

```bash
sudo vi /etc/nginx/conf.d/oneteam-onegoal.conf
```

Paste this, replacing `YOUR_DOMAIN_OR_PUBLIC_IP`:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_PUBLIC_IP;

    location / {
        proxy_pass http://127.0.0.1:3500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Test and restart Nginx:

```bash
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

Open:

```text
http://YOUR_DOMAIN_OR_PUBLIC_IP/dashboard
```

### 6. OCI Networking Checklist

In the OCI Console, make sure the Compute instance can receive web traffic:

- VCN security list or network security group allows inbound TCP `80`.
- If using HTTPS, allow inbound TCP `443`.
- You usually do not need to expose port `3500` publicly when using Nginx.

On the VM firewall, allow HTTP if firewalld is enabled:

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

For Ubuntu with UFW:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### 7. Updating The App Later

From the server project directory:

```bash
git pull
npm ci
npm run build
pm2 restart oneteam-onegoal
```

If CSS or assets ever look stale, restart the app:

```bash
pm2 restart oneteam-onegoal
```

## Local SQLite Database

The app reads its operational data from SQLite:

```text
data/oneteam-onegoal.sqlite
```

The database is automatically initialized from the seed data in `lib/data.ts` if it is empty.

Tables:

- `accounts`
- `meetings`
- `transcripts`
- `activity_feed`
- `team_spaces`
- `product_interest`
- `timeline_events`

Back up the database:

```bash
mkdir -p backups
cp data/oneteam-onegoal.sqlite* backups/
```

Restore the database:

```bash
pm2 stop oneteam-onegoal
cp backups/oneteam-onegoal.sqlite* data/
pm2 start oneteam-onegoal
```

## Useful Routes

- `/`
- `/dashboard`
- `/accounts`
- `/meetings`
- `/brief` AI Gist

## Notes

- This app uses a local SQLite database seeded from `lib/data.ts`.
- No external database or environment variables are required for the current prototype.
- For production HTTPS, attach a domain name and use Certbot or an OCI Load Balancer certificate.
