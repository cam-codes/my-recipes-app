#!/usr/bin/env bash
set -euxo pipefail

: "${EMAIL:?Missing EMAIL}"
: "${STAGING_DOMAIN:?Missing STAGING_DOMAIN}"
: "${PROD_DOMAIN:?Missing PROD_DOMAIN}"

sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF
{
    email $EMAIL
}

$STAGING_DOMAIN {
    reverse_proxy 127.0.0.1:3001
    encode gzip
    log {
        output file /var/log/caddy/staging-access.log
        format json
    }
}

$PROD_DOMAIN {
    reverse_proxy 127.0.0.1:3000
    encode gzip
    log {
        output file /var/log/caddy/prod-access.log
        format json
    }
}
EOF

sudo systemctl reload caddy
