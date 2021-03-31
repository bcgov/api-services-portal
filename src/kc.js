//import KcAdminClient from 'keycloak-admin';

const KcAdminClient = require('keycloak-admin').default;

const fetch = require('node-fetch')

const config = {
}

async function doit() {
    const kcAdminClient = new KcAdminClient(config);

    await kcAdminClient.auth({
        grantType: 'client_credentials',
        clientId: 'ADM',
        clientSecret: '7a4f5f4f-df84-4524-b0f3-9f7c53b5b3bd'
    });

    // const res = await kcAdminClient.clients.find({clientId:"DE8398521611406C-6F984240"})
    // console.log(JSON.stringify(res, null, 4))

    // const res = await kcAdminClient.clients.listRoles({id:'8876e278-b533-464f-8e51-5b432f3d75e5'})

    // console.log(JSON.stringify(res, null, 4))

    // await kcAdminClient.clients.delRole({id:'8876e278-b533-464f-8e51-5b432f3d75e5', roleName: "blah"})

    // const result  = await kcAdminClient.clients.createRole({id:'8876e278-b533-464f-8e51-5b432f3d75e5', name: "blah"})
    // console.log(JSON.stringify(result, null, 4))

    const result  = await kcAdminClient.clientScopes.listDefaultOptionalClientScopes()
    console.log(JSON.stringify(result, null, 4))
    const scopeToId = result.reduce(function(map, obj) {
        map[obj.name] = obj.id;
        return map;
    }, {});

    const result1  = await kcAdminClient.clients.listOptionalClientScopes({id:'88913504-fc63-4c94-a15f-6688705c1677'})
    console.log(JSON.stringify(result1, null, 4))

    console.log(scopeToId['PatientRecord.Read'])
    const result2  = await kcAdminClient.clients.addOptionalClientScope({id:'88913504-fc63-4c94-a15f-6688705c1677', clientScopeId: scopeToId['PatientRecord.Read']})
    console.log(JSON.stringify(result2, null, 4))

    // const result2  = await kcAdminClient.clients.getServiceAccountUser({id:'8876e278-b533-464f-8e51-5b432f3d75e5'})
    // console.log(JSON.stringify(result2, null, 4))

    // const result3  = await kcAdminClient.users.listRoleMappings({id:result2.id})
    // console.log(JSON.stringify(result3, null, 4))

    // const users = await kcAdminClient.users.find();
    // console.log(JSON.stringify(users, null, 4))
}

async function old_way () {
    const issuer = "https://dev.oidc.gov.bc.ca/auth/realms/xtmke7ky"
    const body = {
        grant_type: 'client_credentials',
        client_id: 'ADM',
        client_secret: '7a4f5f4f-df84-4524-b0f3-9f7c53b5b3bd',
        scope: 'profile'
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', 'ADM');
    params.append('client_secret', '7a4f5f4f-df84-4524-b0f3-9f7c53b5b3bd');

    console.log("GET KEYCLOAK SESSION " + JSON.stringify(body, null, 4))
    const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
        method: 'post',
        body:    params,
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    })
    .then(res => res.json())
    console.log(JSON.stringify(response, null, 3));

    const clientId = "07289A68D5DA4BA1-6F984240"
    const accessToken = response.access_token
    const vars = { enabled: true, clientId: clientId}
    
    const headers = { 
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': '',
    }
    accessToken != null && (headers['Authorization'] = 'bearer ' + accessToken)

    console.log("UPDATING " + `${issuer}/clients-registrations/default/${clientId}`)

    console.log(JSON.stringify(vars, null, 4))

    const re = await fetch(`${issuer}/clients-registrations/default/${clientId}`, {
        method: 'put',
        body:    JSON.stringify(vars),
        headers: headers
    })
    .then(res => res.json())
    console.log(JSON.stringify(re, null, 3));

}

doit().catch (err => {
    console.log(err)
})
//old_way()