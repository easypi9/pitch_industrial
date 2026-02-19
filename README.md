# Pitch Industrial (Protected)

Investor pitch site with server-side HTTP Basic Auth.

## Local Run

```bash
cd "/Users/macbook/Pitch Industrial"
export PITCH_USER="investor"
export PITCH_PASS="your-strong-password"
export PORT=8080
npm start
```

Open: `http://localhost:8080`

## Auth Variables

Required:
- `PITCH_USER`
- `PITCH_PASS`

Optional (for zero-downtime rotation):
- `PITCH_USER_NEXT`
- `PITCH_PASS_NEXT`

The server accepts either the primary pair or the temporary NEXT pair.

## Deploy Option 1: Render (Blueprint)

Blueprint file is already included: `render.yaml`.

Render import link:
- https://dashboard.render.com/blueprint/new?repo=https://github.com/easypi9/pitch_industrial

Set these env vars in Render before first deploy:
- `PITCH_USER`
- `PITCH_PASS`
- optionally `PITCH_USER_NEXT`, `PITCH_PASS_NEXT`

Notes:
- Runtime: Node
- Start command: `npm start`
- Health check path: `/healthz`

## Deploy Option 2: Railway

Railway config is included: `railway.json`.

Steps:
1. Create new project from repo `easypi9/pitch_industrial`
2. In Variables, set:
- `PITCH_USER`
- `PITCH_PASS`
- optionally `PITCH_USER_NEXT`, `PITCH_PASS_NEXT`
3. Deploy (start command is `npm start`)

## Recommended Credential Policy

Use a unique login and long random password per investor cohort.

Example generation commands:

```bash
# login suffix (8 hex chars)
python3 - <<'PY'
import secrets
print(f"investor-{secrets.token_hex(4)}")
PY

# 24-char strong password
python3 - <<'PY'
import secrets, string
alphabet = string.ascii_letters + string.digits + "!@#$%^&*-_"
print(''.join(secrets.choice(alphabet) for _ in range(24)))
PY
```

Rotation workflow:
1. Put new pair into `PITCH_USER_NEXT` and `PITCH_PASS_NEXT`
2. Share new pair with allowed recipients
3. After transition, move NEXT pair to primary (`PITCH_USER`/`PITCH_PASS`)
4. Clear NEXT vars and redeploy

## Audio File

Embedded podcast file path:
- `audio/pitch-podcast.m4a`

