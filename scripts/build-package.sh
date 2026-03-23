#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"
BUILD_DIR="${DIST_DIR}/build"
TAG_NAME="${1:-${GITHUB_REF_NAME:-}}"

cd "${ROOT_DIR}"

if ! command -v glib-compile-schemas >/dev/null 2>&1; then
  echo "glib-compile-schemas is required to build the extension package." >&2
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "zip is required to build the extension package." >&2
  exit 1
fi

UUID="$(awk -F'"' '/"uuid"[[:space:]]*:/ { print $4; exit }' metadata.json)"

if [[ -z "${UUID}" ]]; then
  echo "Unable to read extension uuid from metadata.json" >&2
  exit 1
fi

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}" "${DIST_DIR}"
trap 'rm -rf "${BUILD_DIR}"' EXIT

FILES=(
  "metadata.json"
  "extension.js"
  "prefs.js"
  "stylesheet.css"
  "LICENSE"
  "README.md"
)

for file in "${FILES[@]}"; do
  if [[ -f "${file}" ]]; then
    cp "${file}" "${BUILD_DIR}/"
  fi
done

if [[ -d schemas ]]; then
  mkdir -p "${BUILD_DIR}/schemas"
  cp schemas/*.xml "${BUILD_DIR}/schemas/"
  glib-compile-schemas "${BUILD_DIR}/schemas"
fi

ARCHIVE_NAME="${UUID}.zip"
if [[ -n "${TAG_NAME}" ]]; then
  SAFE_TAG="${TAG_NAME//\//-}"
  ARCHIVE_NAME="${UUID}-${SAFE_TAG}.zip"
fi

rm -f "${DIST_DIR}/${ARCHIVE_NAME}"

(
  cd "${BUILD_DIR}"
  zip -qr "${DIST_DIR}/${ARCHIVE_NAME}" .
)

echo "Created ${DIST_DIR}/${ARCHIVE_NAME}"
