#!/usr/bin/env bash
set -euxo pipefail

ENV_FILE=${1:-vm.env}
source "$ENV_FILE"

gcloud config set project "$PROJECT_ID"

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
  --metadata-from-file startup-script= \
    "
    #!/bin/bash
    EMAIL=${{ secrets.PROD_EMAIL }}
    DOMAIN=${{ secrets.PROD_DOMAIN }}
    ENV=prod
    bash /opt/my-recipes/infra/vm-bootstrap.sh
    "

echo "Create complete!"

# uncomment for running locally
echo "sleeping 90s to ensure bootstrap completes"
sleep 90
echo "ssh-ing..."
gcloud compute ssh cam-cooks-vm --zone us-central1-a
