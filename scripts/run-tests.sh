#!/usr/bin/env bash
# run-tests.sh – Helper script for running k6 / Taurus tests locally.
#
# Usage:
#   ./scripts/run-tests.sh [profile]
#
# Profiles:
#   smoke    – Quick sanity check (1 VU, 30 s)    [default]
#   load     – Normal load test (10 VUs, 3 min)
#   stress   – Stress test (ramp to 50 VUs)
#   taurus   – Run via Taurus (hello-world.yml)
#   curve    – Run load-curve test via Taurus

set -euo pipefail

PROFILE="${1:-smoke}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

require_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "ERROR: '$1' is not installed or not in PATH." >&2
    exit 1
  fi
}

mkdir -p "${ROOT_DIR}/reports"

case "$PROFILE" in
  smoke)
    require_cmd k6
    echo "==> Running smoke test (1 VU, 30s)..."
    k6 run --vus 1 --duration 30s "${ROOT_DIR}/k6-tests/hello-world.js"
    ;;
  load)
    require_cmd k6
    echo "==> Running load test (10 VUs, 3m)..."
    k6 run --vus 10 --duration 3m "${ROOT_DIR}/k6-tests/hello-world.js"
    ;;
  stress)
    require_cmd k6
    echo "==> Running stress test (ramp to 50 VUs)..."
    # Stage format: <duration>:<target_vus>  (ramp up → sustain → ramp down)
    k6 run --stage 1m:10,2m:50,1m:0 "${ROOT_DIR}/k6-tests/hello-world.js"
    ;;
  taurus)
    require_cmd bzt
    echo "==> Running Taurus hello-world test..."
    bzt "${ROOT_DIR}/taurus-tests/hello-world.yml"
    ;;
  curve)
    require_cmd bzt
    echo "==> Running Taurus load-curve test..."
    bzt "${ROOT_DIR}/taurus-tests/loadcurve.yml"
    ;;
  *)
    echo "Unknown profile: $PROFILE"
    echo "Available profiles: smoke | load | stress | taurus | curve"
    exit 1
    ;;
esac

echo "==> Done. Reports saved to ${ROOT_DIR}/reports/"
