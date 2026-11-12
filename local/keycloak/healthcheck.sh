#!/usr/bin/bash
# Readiness is on the management port. http-management-relative-path=/ keeps it at /health/ready.
exec 3<>/dev/tcp/127.0.0.1/9000 || exit 1
printf 'GET /health/ready HTTP/1.0\r\nHost: localhost\r\nConnection: close\r\n\r\n' >&3
response=$(cat <&3) || exit 1
exec 3<&-
exec 3>&-
printf '%s\n' "$response" | sed -n '1p' | grep -q ' 200 ' || exit 1
printf '%s\n' "$response" | grep -q 'UP' || exit 1
