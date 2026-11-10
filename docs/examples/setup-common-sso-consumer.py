#!/usr/bin/env python3
"""Prepare the local-only authorization-code consumer from the Compose admin settings.

Run from the repository root. Credentials and tokens are never printed.
Existing client registration must match this walkthrough; no secret is created.
"""
import json,urllib.request,urllib.parse,subprocess
cfg=json.loads(subprocess.check_output(['docker','compose','config','--format','json'],text=True))['services']['keycloak']['environment']
base='http://127.0.0.1:9081/auth'
form=urllib.parse.urlencode({'client_id':'admin-cli','grant_type':'password','username':cfg['KC_BOOTSTRAP_ADMIN_USERNAME'],'password':cfg['KC_BOOTSTRAP_ADMIN_PASSWORD']}).encode()
with urllib.request.urlopen(urllib.request.Request(base+'/realms/master/protocol/openid-connect/token',data=form)) as r:token=json.load(r)['access_token']
def admin(path,body=None,method=None):
 req=urllib.request.Request(base+'/admin/realms/master/'+path,data=json.dumps(body).encode() if body is not None else None,headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},method=method)
 with urllib.request.urlopen(req) as r:
  data=r.read();return json.loads(data) if data else None
scopes=admin('client-scopes')
scope=next((s for s in scopes if s['name']=='demo.read'),None)
if not scope:
 admin('client-scopes',{'name':'demo.read','description':'Read the walkthrough ping response.','protocol':'openid-connect','attributes':{'include.in.token.scope':'true','display.on.consent.screen':'true'}},'POST')
 scope=next(s for s in admin('client-scopes') if s['name']=='demo.read')
clients=admin('clients?clientId=sdx-demo-consumer')
if not clients:
 admin('clients',{'clientId':'sdx-demo-consumer','name':'Local SDX walkthrough consumer','enabled':True,'protocol':'openid-connect','publicClient':True,'standardFlowEnabled':True,'directAccessGrantsEnabled':False,'serviceAccountsEnabled':False,'redirectUris':['http://127.0.0.1:8765/callback'],'webOrigins':[],'attributes':{'pkce.code.challenge.method':'S256'}},'POST')
 clients=admin('clients?clientId=sdx-demo-consumer')
c=clients[0]
assert c['publicClient'] and c['standardFlowEnabled']
assert c['attributes'].get('pkce.code.challenge.method')=='S256'
assert c['redirectUris']==['http://127.0.0.1:8765/callback']
admin('clients/'+c['id']+'/optional-client-scopes/'+scope['id'],method='PUT')
optional=admin('clients/'+c['id']+'/optional-client-scopes')
assert any(s['name']=='demo.read' for s in optional)
result={k:c.get(k) for k in ['clientId','enabled','publicClient','standardFlowEnabled','directAccessGrantsEnabled','serviceAccountsEnabled','redirectUris','attributes']}
result['optionalScopes']=[s['name'] for s in optional]
print('Consumer OAuth client:',json.dumps(result,indent=2))
