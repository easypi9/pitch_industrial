# Pitch Industrial (Protected)

Investor pitch site with HTTP Basic Auth protection.

## 1. Run locally

```bash
cd "/Users/macbook/Pitch Industrial"
export PITCH_USER="investor"
export PITCH_PASS="your-strong-password"
export PORT=8080
npm start
```

Open: `http://localhost:8080`

You will be prompted for login/password.

## 2. Access control model

- Protection is server-side (HTTP Basic Auth), not client-side imitation.
- Credentials are configured through env vars:
  - `PITCH_USER`
  - `PITCH_PASS`
- Share the URL only with people who should have access.
- Rotate password by changing env var and restarting server.

## 3. Deploy from repository

This is a Node server, so use any host that runs Node apps (Render, Railway, Fly.io, VPS).

Set environment variables in hosting settings:

- `PITCH_USER`
- `PITCH_PASS`
- `PORT` (if required by platform)

Start command:

```bash
npm start
```

Health endpoint (no auth):

- `/healthz`

## 4. Create and push repository

```bash
git init
git add .
git commit -m "Add protected pitch with basic auth"
# replace with your repository URL:
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

## 5. Audio file path

The embedded podcast is loaded from:

- `audio/pitch-podcast.m4a`

