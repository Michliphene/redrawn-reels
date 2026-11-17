# Sourced by the pipeline scripts. On a local machine: loads .env (ELEVENLABS_API_KEY, REMOTION_GL…)
# and the project's Python venv (.venv) if they exist. In the cloud neither exists and nothing changes.
if [ -f .env ]; then set -a; . ./.env; set +a; fi
if [ -z "${VIRTUAL_ENV:-}" ] && [ -f .venv/bin/activate ]; then . .venv/bin/activate; fi
