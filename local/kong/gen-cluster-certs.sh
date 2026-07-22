#!/bin/sh
# Generates a TLS root CA plus the full set of certificates the SDX Kong nodes
# need, and stores them on the mounted "tls-certs" volume (mounted here at
# /certs, and mounted into the kong containers at /etc/secrets). This makes
# tls-certs the single source of truth for certs - no host bind mount required.
#
# Layout produced on the volume (== /etc/secrets in the kong containers):
#   ca/ca.{crt,key}              - self-signed root CA (shared cluster CA)
#   sdxkongc/tls.{crt,key}       - kong-sdx-control (control plane) cluster cert
#   sdx-edge-rg0/tls.{crt,key}   - kong-sdx-edge0 (data plane) cluster cert
#   sdx-edge-ca/ca.crt           - root CA copy (KONG_CLUSTER_CA_CERT default)
#   sdx-public-ca/ca.crt         - root CA copy (KONG_*_SSL_TRUSTED_CERTIFICATE)
#   sdx-edge-cluster-cert/tls.*  - default cluster cert (copy of sdxkongc)
#   sdx-edge-server-cert/tls.*   - proxy server cert (KONG_SSL_CERT)
#   sdx-edge-client-cert/tls.*   - upstream client cert (KONG_CLIENT_SSL_CERT)
#   sdx-edge-signing-cert/tls.*  - signing cert (KONG_SIGNING_CERT)
#   kong-nginx-proxy-include/config - nginx proxy include snippet
#
# Idempotent: if the certs already exist on the volume, generation is skipped.
set -e

CERT_DIR="${CERT_DIR:-/certs}"
DAYS="${DAYS:-3650}"
# CN of the control-plane cert. Data planes must use this as
# KONG_CLUSTER_SERVER_NAME and connect to it via KONG_CLUSTER_CONTROL_PLANE.
CONTROL_PLANE_HOST="${CONTROL_PLANE_HOST:-kong-sdx-control}"

if [ -f "$CERT_DIR/ca/ca.crt" ] && \
   [ -f "$CERT_DIR/sdx-edge-cluster-cert/tls.crt" ] && \
   [ -f "$CERT_DIR/sdx-edge-rg0/tls.crt" ]; then
  echo "[tls-cert-gen] certs already present on tls-certs volume; skipping."
  exit 0
fi

mkdir -p "$CERT_DIR/ca"

echo "[tls-cert-gen] generating root CA ..."
openssl genrsa -out "$CERT_DIR/ca/ca.key" 2048
openssl req -x509 -new -nodes -key "$CERT_DIR/ca/ca.key" -sha256 -days "$DAYS" \
  -out "$CERT_DIR/ca/ca.crt" \
  -subj "/O=APS Local/CN=APS SDX Cluster Root CA"

# gen_pair <dir-name> <common-name>
gen_pair() {
  name="$1"
  cn="$2"
  d="$CERT_DIR/$name"
  mkdir -p "$d"
  ext="$(mktemp)"
  printf 'subjectAltName=DNS:%s,DNS:%s.localtest.me,DNS:localhost\nextendedKeyUsage=serverAuth,clientAuth\nbasicConstraints=CA:FALSE\n' \
    "$cn" "$cn" > "$ext"

  echo "[tls-cert-gen] generating key pair '$name' (CN=$cn) ..."
  openssl genrsa -out "$d/tls.key" 2048
  openssl req -new -key "$d/tls.key" -out "$d/tls.csr" -subj "/O=APS Local/CN=$cn"
  openssl x509 -req -in "$d/tls.csr" \
    -CA "$CERT_DIR/ca/ca.crt" -CAkey "$CERT_DIR/ca/ca.key" -CAcreateserial \
    -out "$d/tls.crt" -days "$DAYS" -sha256 -extfile "$ext"
  echo "[tls-cert-gen] generated cert at '$d/tls.crt'"
  rm -f "$d/tls.csr" "$ext"
}

# Cluster identities. The control-plane CN must match the data plane's
# KONG_CLUSTER_SERVER_NAME.
gen_pair "sdx-edge-cluster-cert" "$CONTROL_PLANE_HOST"
gen_pair "sdx-edge-rg0" "sdx-edge-rg0"

# Proxy / upstream / signing certs used by the data plane.
# gen_pair "sdx-edge-server-cert" "sdx-edge"
# gen_pair "sdx-edge-client-cert" "sdx-edge-client"
# gen_pair "sdx-edge-signing-cert" "sdx-edge-signing"

gen_pair "sdx-edge-server-cert" "rg0.dev.servers.sdx"
mkdir "$CERT_DIR/sdx-edge-client-cert"
mkdir "$CERT_DIR/sdx-edge-signing-cert"
cp -p $CERT_DIR/sdx-edge-server-cert/* "$CERT_DIR/sdx-edge-client-cert/."
cp -p $CERT_DIR/sdx-edge-server-cert/* "$CERT_DIR/sdx-edge-signing-cert/."


# CA copies at the paths sdx.Dockerfile expects by default.
mkdir -p "$CERT_DIR/sdx-edge-ca" "$CERT_DIR/sdx-public-ca"
cp "$CERT_DIR/ca/ca.crt" "$CERT_DIR/sdx-edge-ca/ca.crt"
cp "$CERT_DIR/ca/ca.crt" "$CERT_DIR/sdx-public-ca/ca.crt"

# nginx proxy include snippet referenced by KONG_NGINX_PROXY_INCLUDE.
mkdir -p "$CERT_DIR/kong-nginx-proxy-include"
printf 'set $session_storage             shm;\nset $session_secret              1234123412341234;\n' \
  > "$CERT_DIR/kong-nginx-proxy-include/config"

# Make sure the unprivileged kong user (in the kong containers) can read it all.
chmod -R a+rX "$CERT_DIR"

echo "[tls-cert-gen] done. Contents of $CERT_DIR:"
ls -R "$CERT_DIR"
