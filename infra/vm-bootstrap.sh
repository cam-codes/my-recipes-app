#!/bin/bash
set -uxo pipefail

# ---------------------------
# Environment variables
# ---------------------------
EMAIL="${EMAIL:?EMAIL environment variable required}"
STAGING_DOMAIN="${STAGING_DOMAIN:?Missing STAGING_DOMAIN}"
PROD_DOMAIN="${PROD_DOMAIN:?Missing PROD_DOMAIN}"
STAGING_SSH_PUB="${STAGING_SSH_PUB:?Missing STAGING_SSH_PUB}"
PROD_SSH_PUB="${PROD_SSH_PUB:?Missing PROD_SSH_PUB}"

# ---------------------------
# Base system
# ---------------------------
sudo apt update
sudo apt install -y --no-install-recommends \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  ufw \
  fail2ban

# ---------------------------
# Add Caddy repo
# ---------------------------
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt \
  | sudo tee /etc/apt/sources.list.d/caddy.list

# ---------------------------
# Add Docker repo
# ---------------------------
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list

# Single update for both new repos
sudo apt-get update

# Install caddy and docker
sudo apt install -y caddy
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

# Enable/start caddy/docker
sudo systemctl enable caddy docker
sudo systemctl start docker
sudo systemctl start caddy

# ---------------------------
# Users
# ---------------------------
for USER in staging prod; do
  PUB_KEY_VAR="${USER^^}_SSH_PUB"   # STAGING_SSH_PUB / PROD_SSH_PUB
  PUB_KEY="${!PUB_KEY_VAR:-}"       # value of STAGING_SSH_PUB / PROD_SSH_PUB

  # create user (if it doesnt already exist)
  if ! id "$USER" &>/dev/null; then
    sudo adduser --disabled-password --gecos "" "$USER"
    sudo usermod -aG sudo,docker "$USER"
  fi

  # create .ssh directory
  SSH_DIR="/home/$USER/.ssh"
  sudo mkdir -p "$SSH_DIR"
  sudo chown "$USER:$USER" "$SSH_DIR"
  sudo chmod 700 "$SSH_DIR"

  # add public key if not already present
  AUTH_KEYS="$SSH_DIR/authorized_keys"
  if ! echo "$PUB_KEY" | sudo grep -q -F -x -f - "$AUTH_KEYS" 2>/dev/null; then
    echo "$PUB_KEY" | sudo tee -a "$AUTH_KEYS" >/dev/null
    sudo chown "$USER:$USER" "$AUTH_KEYS"
    sudo chmod 600 "$AUTH_KEYS"
  fi

  # add password-less sudo for deploy users
  sudo tee /etc/sudoers.d/$USER > /dev/null <<EOF
$USER ALL=(ALL) NOPASSWD:ALL
EOF

  sudo chmod 440 /etc/sudoers.d/$USER
done

# ---------------------------
# Persistent data disk mount
# ---------------------------
# Create separate directories per environment
sudo mkdir -p /data/recipes/staging /data/recipes/prod/

# Set ownership
sudo chown -R staging:staging /data/recipes/staging
sudo chown -R prod:prod /data/recipes/prod

# ---------------------------
# App directories
# ---------------------------
sudo mkdir -p /opt/my-recipes/{staging,prod}
sudo chown -R staging:staging /opt/my-recipes/staging
sudo chown -R prod:prod /opt/my-recipes/prod

# ---------------------------
# Firewall settings
# ---------------------------
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# ---------------------------
# Fail2Ban (SSH protection)
# ---------------------------
# Create minimal jail config (idempotent overwrite is fine)
sudo tee /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled = true
port = ssh
maxretry = 5
findtime = 10m
bantime = 1h
EOF

# Enable + start fail2ban
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# ---------------------------
# Caddy setup
# ---------------------------
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF
{
    email $EMAIL
}

$STAGING_DOMAIN {
    # Proxy API requests to backend (strips /api prefix)
    handle_path /api/* {
        reverse_proxy http://127.0.0.1:3001
    }

    # Send everything else → frontend container
    reverse_proxy 127.0.0.1:3001

    encode gzip

    log {
        output file /var/log/caddy/staging-access.log
        format json
    }
}

$PROD_DOMAIN {
    handle_path /api/* {
        reverse_proxy http://127.0.0.1:3000  # prod backend port
    }

    reverse_proxy 127.0.0.1:3000

    encode gzip

    log {
        output file /var/log/caddy/prod-access.log
        format json
    }
}
EOF

sudo systemctl reload caddy

# ---------------------------
# Validation
# ---------------------------
echo "Bootstrap complete. Validating..."
docker --version
docker compose version
caddy version
sudo ufw status
systemctl status fail2ban --no-pager
id prod
id staging

echo "Validation complete..."
echo "Check logs for proper install."
echo "  First, SSH with: gcloud compute ssh cam-cooks-vm --zone us-central1-a"
echo "  Then, get logs with: sudo journalctl -u google-startup-scripts.service --no-pager"
echo "If unsuccessful, delete VM with gcloud compute instances delete cam-cooks-vm --zone us-central1-a "
echo "  and recreate with: ./infra/create-vm.sh ./infra/env.staging"
echo "Reboot recommended"
