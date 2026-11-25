# Deploying on Render

The website and the API run together in **one Render Web Service**: `scripts/render-start.mjs` starts the API privately on `127.0.0.1:4000` and the website on Render's `$PORT`. The website forwards `/api` and `/uploads` to the API, as it does locally. The database is a managed PostgreSQL (Neon or Render Postgres), and uploaded images and CVs are stored on a Render **persistent disk**.

```
Browser ──https──▶ Render ──▶ website (Angular SSR, $PORT) ──▶ API (127.0.0.1:4000) ──▶ PostgreSQL (Neon / Render)
                                                                  └──▶ /var/data/uploads (persistent disk)
```

## Costs and why the free plan is not enough

| Item | Plan | Approx. cost |
|---|---|---|
| Web Service | **Starter** (512 MB, always on) | $7 / month |
| Persistent disk for uploads | 1 GB | $0.25 / month |
| Database | Neon Free (0.5 GB) — or Render Postgres Basic | $0 (Neon) / ~$6 (Render) |

The **Free** web plan can be used for a quick demo only. It has no persistent disk, so every uploaded image and CV disappears whenever the service restarts. It also sleeps after 15 minutes without visitors, and the next visit then takes about a minute. It has no Shell or Pre-Deploy Command either. Render's free Postgres is deleted after 30 days.

## Step 1: Put the code on GitHub

The local repository has no commits yet.

1. On github.com, click **New repository**. Name it, for example, `spine-advisory-website`, choose **Private**, and **don't** add a README, .gitignore or licence. Click **Create repository**.
2. In PowerShell:

   ```powershell
   cd C:\Users\spine\OneDrive\Desktop\SpineWebsite\spine-advisory-website
   git add .
   git status            # backend/.env must NOT appear in the list (it is ignored)
   git commit -m "Spine Advisory website with Admin Panel"
   git branch -M main
   git remote add origin https://github.com/<your-account>/spine-advisory-website.git
   git push -u origin main
   ```

   If `backend/.env` appears under `git status`, stop and run `git rm --cached backend/.env` before committing. It contains the database password.

## Step 2: Create the database

### Option A: Neon (free, recommended)

1. Go to console.neon.tech, then **New project**. Name it `spine-advisory`, use Postgres **17**, and choose region **AWS Asia Pacific (Singapore)**, the one closest to India. Click **Create**.
2. On the project dashboard, click **Connect**. Select database `neondb` (or create `spine_advisory` under **Databases**) and **switch off "Connection pooling"**. Copy the connection string. It looks like:
   `postgresql://neondb_owner:xxxxx@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
3. Keep this string private. You will paste it into Render as `DATABASE_URL`.

### Option B: Render Postgres (paid)

1. In Render, click **New**, then **Postgres**. Name it `spine-advisory-db`, region **Singapore**, plan **Basic-256mb**. Click **Create Database**.
2. When it is *Available*, copy the **Internal Database URL**. With this option, set `DATABASE_SSL=false` in Step 3.

## Step 3: Create the Web Service

1. In dashboard.render.com, click **New**, then **Web Service**. Connect GitHub when asked, then pick the `spine-advisory-website` repository.
2. Fill in:

   | Field | Value |
   |---|---|
   | Name | `spine-advisory`. The address becomes `https://spine-advisory.onrender.com`; Render shows the exact one, so use it below. |
   | Region | **Singapore** (same as the database) |
   | Branch | `main` |
   | Root Directory | *(leave empty)* |
   | Runtime / Language | **Node** |
   | Build Command | `npm run render:build` |
   | Start Command | `node scripts/render-start.mjs` |
   | Instance Type | **Starter** |

3. Under **Environment Variables**, add the following. **Add from .env** lets you paste them all at once.

   ```
   NODE_VERSION=24
   NODE_ENV=production
   DATABASE_URL=<connection string from Step 2>
   DATABASE_SSL=true
   PUBLIC_SITE_URL=https://spine-advisory.onrender.com
   NG_ALLOWED_HOSTS=spine-advisory.onrender.com
   UPLOAD_DIR=/var/data/uploads
   VISITOR_HASH_SECRET=<long random text>
   NOTIFY_ENQUIRIES_TO=info@spineadvisory.com
   NOTIFY_APPLICATIONS_TO=info@spineadvisory.com
   ```

   - Generate `VISITOR_HASH_SECRET` with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `NG_ALLOWED_HOSTS` is the host name only, without `https://`. The site refuses requests for any other host name.
   - Don't set `PORT`, `API_INTERNAL_URL` or `TRUST_PROXY`. Render and `render-start.mjs` set them.
   - `UPLOAD_DIR=/var/data/uploads` only works with the persistent disk below. Without a disk (Free plan), leave it out; if it is set anyway, the API logs a warning and uses its own `backend/uploads` folder, which is emptied on every restart.
   - First deployment: also add `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (see Step 4). Remove them once you have signed in.
   - Email (Forgot Password and notification emails) can be added now or later: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`. Without them, emails are only written to the log.

4. Open **Advanced** and set:
   - **Health Check Path**: `/api/health`. This checks the website, the API and the database together.
   - **Pre-Deploy Command**: optional. `scripts/render-start.mjs` applies migrations (and, on an empty database, loads the content) every time the service starts, so this also works on the Free plan, which has no Pre-Deploy Command.
   - **Disk**: click **Add Disk**. Name it `uploads`, set Mount Path to `/var/data` and Size to `1` GB.
   - **Auto-Deploy**: *On Commit* (each `git push` to `main` deploys).
5. Click **Create Web Service**. The first build takes about 5–10 minutes. Watch the **Logs** tab. It is done when it shows `Your service is live`.

## Step 4: Load the website content and create the admin (first deployment only)

This now happens automatically: on start, `scripts/render-start.mjs` runs `npm run db:seed`, which loads the content into an empty database and creates the `admin` account from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (Step 3). The log shows `Seeded website content →` and `Created the administrator account`. On later starts it prints `Website content already present` and changes nothing. If you did not set `SEED_ADMIN_PASSWORD`, a random password is printed in the log once; sign in with it and change it.

To run it by hand instead (paid plans only):

1. On the service page, open the **Shell** tab.
2. Run the command below, replacing the password with your own. It must be at least 12 characters, with upper-case and lower-case letters and a number.

   ```bash
   SEED_ADMIN_EMAIL='you@yourcompany.com' SEED_ADMIN_PASSWORD='Your-Strong-Passw0rd' npm --prefix backend run db:seed
   ```

   `SEED_ADMIN_EMAIL` is where Forgot Password links are sent, so use a real mailbox you check.

   This loads all website content, including the team photos (Sumit Chaturvedi's included), and creates the single administrator with username **admin**. It is safe to run again: it never overwrites existing content.
3. Open `https://spine-advisory.onrender.com`, then go to `/admin/login` and sign in as `admin`.

## Step 5: Check that everything works

1. **Pages**: open Home, About → Team, Services, Careers and Contact.
2. **Uploads survive a restart**: in the Admin Panel, upload an image (Website Content → Media library). Then in Render, click **Manual Deploy → Deploy latest commit**. After the deploy, the image must still be there.
3. **Forms**: send a test enquiry from Contact. It must appear under **Enquiry Management**.
4. **Visitor IP in the Audit Log**: this is used for the login lockout and rate limits.
   1. Sign out, then try one wrong password.
   2. Sign in again, then open **Audit Log**. The *Failed sign-in* entry should show your own public IP. Search "what is my ip" to compare.
   3. If it shows an internal address such as `10.x.x.x`, add `API_TRUST_PROXY=3` in Render → Environment and save; Render redeploys. Repeat the test.
5. Delete the test enquiry and image afterwards.

## Step 6: Your own domain (optional)

1. In the service, go to **Settings → Custom Domains → Add Custom Domain**. Enter `spineadvisory.com`; Render adds `www` too.
2. At your domain registrar, create the DNS records Render shows: an `A` record for the root domain and a `CNAME` for `www`. Wait until Render shows **Verified** and **Certificate Issued**.
3. Change the environment variables, then save. Render redeploys.

   ```
   PUBLIC_SITE_URL=https://spineadvisory.com
   NG_ALLOWED_HOSTS=spineadvisory.com,www.spineadvisory.com,spine-advisory.onrender.com
   ```

## Updating the site later

Commit and push to `main`. Render builds, runs the migrations (Pre-Deploy Command) and switches over only when `/api/health` responds.

```powershell
git add .
git commit -m "Describe the change"
git push
```

## Backups

- **Database**: Neon keeps a restore history (Branches → Restore). Render Postgres paid plans have daily backups.
- **Uploads**: Render snapshots the disk daily and keeps 7 days. To restore, go to the service → **Disks** → **Snapshots**.

## Troubleshooting

| Symptom (Logs tab) | Fix |
|---|---|
| `Invalid environment configuration … DATABASE_URL` | Set `DATABASE_URL` under Environment. |
| `password authentication failed` / `ENOTFOUND` | The connection string is wrong or incomplete. Copy it again from Neon (Connect). |
| `self-signed certificate` | Render Postgres internal URL: set `DATABASE_SSL=false`. |
| Page shows *"URL with hostname … is not allowed"* | Add that host name to `NG_ALLOWED_HOSTS`. |
| Signing in does nothing / logs out at once | `PUBLIC_SITE_URL` must be exactly the address in the browser, with `https://`. |
| `[render-start] API stopped …` | Read the lines just above it; usually a database setting. |
| Site shows "undefined" in the tab title and an empty header | The database has tables but no content. Check the log for `Seeded website content →`; if `[render-start] Database preparation failed` appears, read the error above it. |
| `WARNING: UPLOAD_DIR "/var/data/uploads" is not writable` | No disk is attached. Remove `UPLOAD_DIR`, or add the disk (Step 3). |
| Build fails with `tsc: not found` or `ng: not found` | Build Command must be `npm run render:build`, which installs build tools with `--include=dev`. |
| Lost admin password and no email set up | Shell: `npm --prefix backend run admin:create -- --username admin` prints a new password. |
