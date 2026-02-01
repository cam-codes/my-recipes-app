#!/usr/bin/env bash
set -euxo pipefail

ENV_FILE=${1:-vm.env}
source "$ENV_FILE"

# Make a temp startup script that includes secrets
TMP_SCRIPT=$(mktemp)
cat > "$TMP_SCRIPT" <<EOF
#!/bin/bash
set -euxo pipefail
EMAIL="${EMAIL:?EMAIL env required}"
STAGING_DOMAIN="${STAGING_DOMAIN:?STAGING_DOMAIN env required}"
PROD_DOMAIN="${PROD_DOMAIN:?PROD_DOMAIN env required}"
STAGING_SSH_PUB="${STAGING_SSH_PUB:?Missing STAGING_SSH_PUB}"
PROD_SSH_PUB="${PROD_SSH_PUB:?Missing PROD_SSH_PUB}"
ENV="${ENV:-staging}"
EOF

# Append the actual bootstrap script contents
cat infra/vm-bootstrap.sh >> "$TMP_SCRIPT"

# Enable required APIs (idempotent)
gcloud services enable compute.googleapis.com

# Create VM
gcloud compute instances create "$VM_NAME" \
  --zone="$ZONE" \
  --machine-type="$MACHINE_TYPE" \
  --image-family="$IMAGE_FAMILY" \
  --image-project="$IMAGE_PROJECT" \
  --boot-disk-size="${DISK_SIZE}GB" \
  --boot-disk-type=pd-balanced \
  --tags=http-server,https-server \
  --metadata-from-file startup-script="$TMP_SCRIPT"

# Clean up temp file
rm -f "$TMP_SCRIPT"

echo "Create complete!"
