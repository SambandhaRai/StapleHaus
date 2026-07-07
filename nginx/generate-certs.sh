#!/bin/sh
set -e
CERT_DIR="$(dirname "$0")/certs"
mkdir -p "$CERT_DIR"

if [ -f "$CERT_DIR/nginx-cert.pem" ] && [ -f "$CERT_DIR/nginx-key.pem" ]; then
    echo "nginx certs already exist in $CERT_DIR, skipping"
    exit 0
fi

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/nginx-key.pem" \
    -out "$CERT_DIR/nginx-cert.pem" \
    -subj "/CN=localhost"

echo "Generated self-signed nginx certs in $CERT_DIR"
