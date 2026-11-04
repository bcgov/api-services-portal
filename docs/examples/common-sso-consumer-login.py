#!/usr/bin/env python3
"""Local authorization-code + PKCE login; never print codes or tokens.

Run from the repository root after setup-common-sso-consumer.py.
Open http://127.0.0.1:8765/ in the browser, then complete the local login.
"""
import base64
import hashlib
import json
import os
from pathlib import Path
import secrets
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import Request, urlopen

ISSUER = 'http://keycloak.localtest.me:9081/auth/realms/master'
REDIRECT_URI = 'http://127.0.0.1:8765/callback'
CLIENT_ID = 'sdx-demo-consumer'
OUTPUT = Path(os.environ.get('SDX_CONSUMER_TOKEN_FILE',
                             str(Path(os.environ.get('TMPDIR', '/tmp')) / 'sdx-consumer-token.json')))
verifier = secrets.token_urlsafe(64)
challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b'=').decode()
state = secrets.token_urlsafe(32)
authorize_url = ISSUER + '/protocol/openid-connect/auth?' + urlencode({
    'client_id': CLIENT_ID, 'redirect_uri': REDIRECT_URI,
    'response_type': 'code', 'scope': 'openid demo.read',
    'code_challenge': challenge, 'code_challenge_method': 'S256', 'state': state,
})
complete = False

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass  # Callback URLs contain authorization codes; do not log them.

    def respond(self, status, body):
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.end_headers()
        self.wfile.write(body.encode())

    def do_GET(self):
        global complete
        parsed = urlsplit(self.path)
        if parsed.path == '/':
            from html import escape
            self.respond(200, '<!doctype html><title>SDX consumer login</title>'
                         '<h1>SDX consumer authorization-code login</h1>'
                         '<p>Client: <strong>sdx-demo-consumer</strong>. '
                         'Local Keycloak, PKCE S256, scope demo.read.</p>'
                         '<p>This login does not use the Partner API management client.</p>'
                         f'<p><a href="{escape(authorize_url, quote=True)}">Sign in to local Keycloak</a></p>')
            return
        if parsed.path != '/callback':
            self.respond(404, 'Not found')
            return
        query = parse_qs(parsed.query)
        if not secrets.compare_digest(query.get('state', [''])[0], state):
            self.respond(400, '<h1>Login failed</h1><p>State mismatch. Restart the login helper.</p>')
            return
        if 'error' in query or 'code' not in query:
            self.respond(400, '<h1>Login failed</h1><p>Authorization was not completed.</p>')
            return
        try:
            form = urlencode({'grant_type': 'authorization_code', 'client_id': CLIENT_ID,
                              'redirect_uri': REDIRECT_URI, 'code': query['code'][0],
                              'code_verifier': verifier}).encode()
            request = Request('http://127.0.0.1:9081/auth/realms/master/protocol/openid-connect/token', data=form)
            with urlopen(request, timeout=15) as response:
                token = json.load(response)
            access_token = token['access_token']
            fd = os.open(OUTPUT, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
            os.fchmod(fd, 0o600)
            with os.fdopen(fd, 'w') as handle:
                json.dump({'access_token': access_token, 'obtained_at': int(time.time()),
                           'expires_in': token.get('expires_in'), 'scope': token.get('scope')}, handle)
            # Display metadata only. This decode is not signature/authorization validation.
            payload = access_token.split('.')[1]
            claims = json.loads(base64.urlsafe_b64decode(payload + '=' * (-len(payload) % 4)))
            print('Login completed; token saved to restricted local file:', OUTPUT, flush=True)
            print('Token metadata (not signature verification):',
                  json.dumps({key: claims.get(key) for key in ['iss', 'aud', 'azp', 'scope']}), flush=True)
            self.respond(200, '<!doctype html><title>SDX consumer login complete</title>'
                         '<h1>Consumer login completed</h1>'
                         '<p>Authorization code exchanged using PKCE S256.</p>'
                         '<p>The resource token was saved locally without displaying it. '
                         'Return to the chat to continue the SDX service test.</p>')
            complete = True
        except Exception as error:
            print('Token acquisition failed:', type(error).__name__, flush=True)
            self.respond(502, '<h1>Token acquisition failed</h1><p>Restart the helper and try again.</p>')

if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', 8765), Handler)
    server.timeout = 1
    print('Open http://127.0.0.1:8765/ and sign in using the existing local test user.', flush=True)
    print('Waiting up to 15 minutes; token values and callback URLs will not be logged.', flush=True)
    deadline = time.monotonic() + 900
    try:
        while not complete and time.monotonic() < deadline:
            server.handle_request()
    finally:
        server.server_close()
    if not complete:
        raise SystemExit('Login timed out. Rerun the helper to obtain a fresh authorization request.')
