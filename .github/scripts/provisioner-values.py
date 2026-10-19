#!/usr/bin/env python3
"""Render Silver provisioner Helm values; reject missing partner trust settings."""
import json
import os
import sys
from urllib.parse import urlparse

PARTNER_SETTINGS = (
    'PARTNER_JWT_ISSUER',
    'PARTNER_JWT_AUDIENCE',
    'PARTNER_JWT_JWKS_URL',
    'PARTNER_JWT_REQUIRED_SCOPE',
)


def render(settings):
    missing = [name for name in PARTNER_SETTINGS if not settings.get(name, '').strip()]
    if missing:
        raise ValueError('Missing GitHub Actions repository variables: ' + ', '.join(missing))
    partner = {name: settings[name].strip() for name in PARTNER_SETTINGS}
    jwks = urlparse(partner['PARTNER_JWT_JWKS_URL'])
    if jwks.scheme != 'https' or not jwks.hostname or jwks.username or jwks.password:
        raise ValueError('PARTNER_JWT_JWKS_URL must be an HTTPS URL without credentials')
    if len(partner['PARTNER_JWT_REQUIRED_SCOPE'].split()) != 1:
        raise ValueError('PARTNER_JWT_REQUIRED_SCOPE must identify one OAuth scope')
    uid = int(settings['RUNNING_UID_GID'])
    if uid <= 0:
        raise ValueError('RUNNING_UID_GID must be positive')
    return {
        'podAnnotations': {'sha': settings['GITHUB_SHA']},
        'replicaCount': 1,
        'rollingUpdate': {'maxUnavailable': '50%', 'maxSurge': '50%'},
        'image': {
            'repository': 'ghcr.io/bcgov/api-services-portal/provisioner-svc',
            'tag': settings['DEPLOY_ID'], 'pullPolicy': 'Always',
        },
        'imagePullSecrets': [{'name': 'dev-github-read-packages-creds'}],
        'podSecurityContext': {'fsGroup': uid},
        'securityContext': {'runAsUser': uid},
        'containerPort': 3000,
        'extraPorts': [{'name': 'partner', 'port': 3001}],
        'ingress': {'enabled': False},
        'serviceAccount': {'create': False, 'name': 'asp-service-account'},
        'env': {name: {'value': value} for name, value in {
            'TZ': 'America/Los_Angeles', 'PORT': '3000', 'PARTNER_PORT': '3001', **partner,
        }.items()},
        # Partner listen starts last; require it before considering rollout ready.
        'startupProbe': {'tcpSocket': {'port': 'partner'}, 'periodSeconds': 5, 'failureThreshold': 30},
        'readinessProbe': {'tcpSocket': {'port': 'partner'}, 'periodSeconds': 5, 'timeoutSeconds': 2},
        'livenessProbe': {'tcpSocket': {'port': 'http'}, 'periodSeconds': 10, 'timeoutSeconds': 2},
    }


if __name__ == '__main__':
    try:
        values = render(os.environ)
    except (ValueError, KeyError) as error:
        print(f'::error::{error}', file=sys.stderr)
        sys.exit(1)
    json.dump(values, sys.stdout, indent=2)
    print()
